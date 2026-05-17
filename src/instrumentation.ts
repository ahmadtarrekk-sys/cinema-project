/**
 * Next.js Instrumentation Hook
 *
 * Runs once when the server starts. We use it to automatically trigger
 * the rolling schedule generator so showtimes are always populated,
 * eliminating the need for manual intervention in development.
 */
export async function onRequestError() {
  // Required export — no-op
}

export async function register() {
  // Only run on the server (not edge runtime)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Delay slightly to let Prisma initialise
    setTimeout(async () => {
      try {
        const { generateRollingSchedule } = await import(
          "@/lib/actions/schedule"
        );
        console.log("[Scheduler] Auto-generating rolling schedule on startup…");
        const result = await generateRollingSchedule();
        if (result.success) {
          console.log(
            `[Scheduler] ✓ Schedule ready — ${result.clonedCount} new showtimes created.`
          );
        } else {
          console.warn("[Scheduler] ⚠ Schedule generation issue:", result.message);
        }
      } catch (err) {
        console.error("[Scheduler] Failed to auto-generate schedule:", err);
      }
    }, 3000);
  }
}
