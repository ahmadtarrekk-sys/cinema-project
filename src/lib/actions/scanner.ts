"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function validateBooking(bookingId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Only ADMIN and STAFF can validate tickets
    if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
      return { success: false, error: "Permission denied. Only staff can scan tickets." };
    }

    if (!bookingId) {
      return { success: false, error: "Missing booking ID." };
    }

    // Robust extraction: Extract the 24 hex characters, ignoring whitespace or URL wrapping
    const match = bookingId.match(/[a-f0-9]{24}/i);
    if (!match) {
      return { success: false, error: "Invalid booking ID format." };
    }
    
    const cleanBookingId = match[0];

    const booking = await prisma.booking.findUnique({
      where: { id: cleanBookingId },
      include: {
        user: { select: { name: true, email: true } },
        tickets: {
          include: {
            seat: true,
          },
        },
        showtime: {
          include: {
            movie: true,
            hall: {
              include: { cinema: true },
            },
          },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found." };
    }

    if (booking.status !== "CONFIRMED") {
      return { success: false, error: `Booking is ${booking.status}. Only CONFIRMED bookings are valid.` };
    }

    // Check if the showtime is not too old (12 hour window)
    const showtimeDate = new Date(booking.showtime.startTime);
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    if (showtimeDate < twelveHoursAgo) {
      return { success: false, error: "This showtime has already passed (over 12 hours ago)." };
    }

    return {
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        customerName: booking.user.name,
        customerEmail: booking.user.email,
        movieTitle: booking.showtime.movie.titleEn,
        movieTitleAr: booking.showtime.movie.titleAr,
        cinemaName: booking.showtime.hall.cinema.nameEn,
        hallName: booking.showtime.hall.nameEn,
        showtime: booking.showtime.startTime,
        seats: booking.tickets.map((t) => ({
          row: t.seat.row,
          column: t.seat.column,
          type: t.seat.type,
        })),
        totalAmount: booking.totalAmount,
        ticketCount: booking.tickets.length,
      },
    };
  } catch (error) {
    console.error("Scanner Validation Error:", error);
    return { success: false, error: "Failed to validate booking." };
  }
}
