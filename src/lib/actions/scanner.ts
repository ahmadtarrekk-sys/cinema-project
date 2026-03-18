"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function validateBooking(rawBookingId: string) {
  const session = await auth();
  
  // Ensure only STAFF or ADMIN can validate bookings
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return { success: false, error: "Unauthorized role for ticket validation." };
  }

  const bookingId = rawBookingId.trim();

  // Basic MongoDB ObjectId format validation (24 hex characters)
  if (!/^[0-9a-fA-F]{24}$/.test(bookingId)) {
    return { success: false, error: "Invalid Ticket ID format. Please ensure you scanned a valid Aurora Cinema QR code." };
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { name: true, email: true } },
        showtime: {
          include: {
            movie: { select: { titleEn: true, titleAr: true } },
            hall: { include: { cinema: { select: { nameEn: true, nameAr: true } } } },
          },
        },
        tickets: {
          include: { seat: true },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Authentication failed. Booking not found." };
    }

    if (booking.status !== "CONFIRMED") {
      return { success: false, error: `Invalid Ticket. Booking Status is ${booking.status}` };
    }

    // You could also add a validation to check if the showtime is today, if it already passed, etc.
    const showtimeDate = new Date(booking.showtime.startTime);
    const now = new Date();
    
    // Very rudimentary check: If the showtime was more than 12 hours ago, reject it
    if (now.getTime() - showtimeDate.getTime() > 12 * 60 * 60 * 1000) {
      return { success: false, error: "Ticket expired. This showtime occurred in the past." };
    }

    return { success: true, booking };
  } catch (error) {
    console.error("Scanner Validation Error:", error);
    return { success: false, error: "Invalid QR Code format or Database error." };
  }
}
