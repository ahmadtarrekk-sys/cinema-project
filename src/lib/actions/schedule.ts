import { prisma } from "@/lib/prisma";

/** How many days ahead to always keep scheduled */
const ROLLING_WINDOW_DAYS = 7;

/** Default showtime slots (hour of the day, 24h format) */
const DEFAULT_SLOTS = [
  { hour: 13, minute: 0 },  // 1:00 PM
  { hour: 16, minute: 0 },  // 4:00 PM
  { hour: 19, minute: 0 },  // 7:00 PM
  { hour: 22, minute: 0 },  // 10:00 PM
];

/**
 * Generates a rolling schedule for the cinema.
 *
 * Rules:
 * - Always ensures showtimes exist for Today through Today + ROLLING_WINDOW_DAYS.
 * - NEVER deletes or expires past showtimes — all historical data is preserved.
 * - If a template day is found (any day with existing showtimes), it clones that
 *   pattern to any missing future days.
 * - If NO template exists at all (fresh DB or very old data), it auto-generates
 *   showtimes from all available movies and halls as a self-healing mechanism.
 * - Designed to be called by a daily cron OR on server startup.
 */
export async function generateRollingSchedule() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalCreated = 0;
    const messages: string[] = [];

    // ── Step 1: Find a template day to clone from ──────────────────────
    // Search from the most recent days first (today+ROLLING_WINDOW backward 90 days)
    let templateShowtimes: {
      movieId: string;
      hallId: string;
      startTime: Date;
      basePrice: number;
    }[] = [];
    let foundTemplateDate: Date | null = null;

    const searchStart = new Date(today);
    searchStart.setDate(today.getDate() + ROLLING_WINDOW_DAYS);

    for (let i = 0; i < 90; i++) {
      const candidate = new Date(searchStart);
      candidate.setDate(searchStart.getDate() - i);

      const dayStart = new Date(candidate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(candidate);
      dayEnd.setHours(23, 59, 59, 999);

      const showtimes = await prisma.showtime.findMany({
        where: { startTime: { gte: dayStart, lt: dayEnd } },
        select: { movieId: true, hallId: true, startTime: true, basePrice: true },
      });

      if (showtimes.length > 0) {
        templateShowtimes = showtimes;
        foundTemplateDate = dayStart;
        break;
      }
    }

    // ── Step 2: Self-heal — if no template found, build one from scratch ─
    if (templateShowtimes.length === 0 || !foundTemplateDate) {
      messages.push("No existing template found — generating fresh showtimes from available movies & halls.");

      const freshResult = await generateFromScratch(today, ROLLING_WINDOW_DAYS);
      if (freshResult.success) {
        return {
          success: true,
          message: `Self-healed: ${freshResult.message}`,
          clonedCount: freshResult.createdCount,
        };
      }
      return {
        success: false,
        message: freshResult.message,
        clonedCount: 0,
      };
    }

    messages.push(
      `Using template from ${foundTemplateDate.toISOString().split("T")[0]} (${templateShowtimes.length} showtimes).`
    );

    // ── Step 3: Ensure every day from Today → Today+ROLLING_WINDOW has data ─
    for (let dayOffset = 0; dayOffset <= ROLLING_WINDOW_DAYS; dayOffset++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + dayOffset);

      const startOfTarget = new Date(targetDate);
      startOfTarget.setHours(0, 0, 0, 0);
      const endOfTarget = new Date(targetDate);
      endOfTarget.setHours(23, 59, 59, 999);

      // Skip if this day already has showtimes
      const existingCount = await prisma.showtime.count({
        where: { startTime: { gte: startOfTarget, lt: endOfTarget } },
      });

      if (existingCount > 0) {
        messages.push(
          `Day +${dayOffset} (${targetDate.toISOString().split("T")[0]}): already has ${existingCount} showtimes.`
        );
        continue;
      }

      // Clone from template, shifting dates
      const diffMs = startOfTarget.getTime() - foundTemplateDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      const newShowtimes = templateShowtimes.map((st) => {
        const newStart = new Date(st.startTime);
        newStart.setDate(newStart.getDate() + diffDays);
        return {
          movieId: st.movieId,
          hallId: st.hallId,
          startTime: newStart,
          basePrice: st.basePrice,
        };
      });

      const result = await prisma.showtime.createMany({ data: newShowtimes });
      totalCreated += result.count;
      messages.push(
        `Day +${dayOffset} (${targetDate.toISOString().split("T")[0]}): cloned ${result.count} showtimes.`
      );
    }

    return {
      success: true,
      message: messages.join(" | "),
      clonedCount: totalCreated,
    };
  } catch (error: any) {
    console.error("Error generating rolling schedule:", error);
    return {
      success: false,
      message: "Internal Server Error",
      error: error.message,
    };
  }
}

/**
 * Generates showtimes from scratch using all movies and halls in the database.
 * Used as a self-healing fallback when no template day exists.
 */
async function generateFromScratch(startDate: Date, windowDays: number) {
  try {
    const movies = await prisma.movie.findMany({ select: { id: true } });
    const halls = await prisma.hall.findMany({
      select: { id: true, type: true },
    });

    if (movies.length === 0) {
      return { success: false, message: "No movies in database to schedule.", createdCount: 0 };
    }
    if (halls.length === 0) {
      return { success: false, message: "No halls in database to schedule.", createdCount: 0 };
    }

    const showtimeData: {
      movieId: string;
      hallId: string;
      startTime: Date;
      basePrice: number;
    }[] = [];

    for (let dayOffset = 0; dayOffset <= windowDays; dayOffset++) {
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + dayOffset);

      // Check if this day already has showtimes
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      const existing = await prisma.showtime.count({
        where: { startTime: { gte: dayStart, lt: dayEnd } },
      });

      if (existing > 0) continue;

      for (const movie of movies) {
        for (const slot of DEFAULT_SLOTS) {
          // Pick a hall — round-robin across halls
          const hallIndex =
            (movies.indexOf(movie) + slot.hour) % halls.length;
          const hall = halls[hallIndex];

          const startTime = new Date(targetDate);
          startTime.setHours(slot.hour, slot.minute, 0, 0);

          let basePrice = 180;
          if (hall.type === "IMAX") basePrice = 220;
          if (hall.type === "VIP") basePrice = 300;

          showtimeData.push({
            movieId: movie.id,
            hallId: hall.id,
            startTime,
            basePrice,
          });
        }
      }
    }

    if (showtimeData.length === 0) {
      return {
        success: true,
        message: "All days already have showtimes.",
        createdCount: 0,
      };
    }

    const result = await prisma.showtime.createMany({ data: showtimeData });

    return {
      success: true,
      message: `Generated ${result.count} showtimes for ${windowDays + 1} days from scratch.`,
      createdCount: result.count,
    };
  } catch (error: any) {
    console.error("Error generating from scratch:", error);
    return {
      success: false,
      message: error.message,
      createdCount: 0,
    };
  }
}
