"use server";

import { prisma } from "@/lib/prisma";
import { RESERVATION_HOLD_MINUTES } from "@/lib/utils";

export async function getShowtimeDetails(id: string) {
  try {
    // 1. Clean up expired DRAFT bookings for this showtime (frees seats)
    const expiryTime = new Date(Date.now() - RESERVATION_HOLD_MINUTES * 60 * 1000);
    
    const expiredBookings = await prisma.booking.findMany({
      where: {
        showtimeId: id,
        status: "DRAFT",
        createdAt: { lt: expiryTime }
      },
      select: { id: true }
    });

    if (expiredBookings.length > 0) {
      await prisma.booking.deleteMany({
        where: { id: { in: expiredBookings.map(b => b.id) } }
      });
    }

    // 2. Fetch the showtime with its tickets and hall details
    const showtime = await prisma.showtime.findUnique({
      where: { id },
      include: {
        movie: true,
        tickets: { 
          where: { booking: { status: "CONFIRMED" } },
          select: { seatId: true } 
        },
        hall: {
          include: { 
            cinema: true,
            seats: { orderBy: [{ row: "asc" }, { column: "asc" }] }
          }
        }
      }
    });
    if (!showtime) return { success: false, error: "Showtime not found" };
    return { success: true, data: showtime };
  } catch (error) {
    console.error("Error fetching showtime details:", error);
    return { success: false, error: "Failed to fetch showtime details" };
  }
}
