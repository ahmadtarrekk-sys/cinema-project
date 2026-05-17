"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/** Maximum seats a user can select in a single booking */
const MAX_SEATS_PER_BOOKING = 5;

export async function createBooking(data: {
  showtimeId: string;
  seatIds: string[];
  totalAmount: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // ── Validate seat count ──
    if (data.seatIds.length === 0) {
      return { success: false, error: "No seats selected." };
    }
    if (data.seatIds.length > MAX_SEATS_PER_BOOKING) {
      return { success: false, error: `You can select up to ${MAX_SEATS_PER_BOOKING} seats per booking.` };
    }

    const userExists = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!userExists) {
      return { success: false, error: "Session invalid. Please log out and log back in." };
    }

    // 1. Double check that seats are not already CONFIRMED by another booking
    const existingTickets = await prisma.ticket.findMany({
      where: {
        showtimeId: data.showtimeId,
        seatId: { in: data.seatIds },
        booking: { status: "CONFIRMED" }
      }
    });

    if (existingTickets.length > 0) {
      return { success: false, error: "One or more seats are already booked permanently." };
    }

    // 1.5. Verify that the user currently holds the lock for all requested seats in MongoDB
    for (const seatId of data.seatIds) {
      const lock = await prisma.seatHold.findUnique({
        where: { showtimeId_seatId: { showtimeId: data.showtimeId, seatId } }
      });
      
      if (!lock || lock.userId !== session.user.id || lock.expiresAt <= new Date()) {
        return { 
          success: false, 
          error: "Seat reservation expired or held by someone else. Please refresh and select seats again." 
        };
      }
    }

    // 2. Fetch seat details to compute ticket prices accurately on the server
    const showtime = await prisma.showtime.findUnique({
      where: { id: data.showtimeId },
      include: { hall: { include: { seats: true } } }
    });

    if (!showtime) return { success: false, error: "Showtime not found" };

    const seatsToBook = showtime.hall.seats.filter(s => data.seatIds.includes(s.id));

    // All bookings start as DRAFT until payment is completed
    
    // 3. Create the booking and its tickets in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Clean up stale DRAFT/CANCELLED tickets for these seats to avoid unique constraint violation
      await tx.ticket.deleteMany({
        where: {
          showtimeId: data.showtimeId,
          seatId: { in: data.seatIds },
          booking: { status: { in: ["DRAFT", "CANCELLED"] } }
        }
      });

      // Also clean up the orphaned DRAFT/CANCELLED bookings for this user on this showtime
      await tx.booking.deleteMany({
        where: {
          userId: session.user.id,
          showtimeId: data.showtimeId,
          status: { in: ["DRAFT", "CANCELLED"] },
          tickets: { none: {} } // Only delete bookings with no remaining tickets
        }
      });

      const b = await tx.booking.create({
        data: {
          userId: session.user.id,
          showtimeId: data.showtimeId,
          totalAmount: data.totalAmount,
          status: "DRAFT",
          tickets: {
            create: seatsToBook.map(seat => {
              // Calculate tier
              let tier = "Normal";
              if (seat.type === "VIP") {
                tier = "VIP";
              } else if (seat.type === "PREMIUM") {
                tier = "Premium";
              }

              // Calculate price based on tier
              let price = 180;
              if (tier === "VIP") price = 350;
              if (tier === "Premium") price = 250;

              return {
                showtimeId: data.showtimeId,
                seatId: seat.id,
                price: price
              };
            })
          }
        }
      });
      
      return b;
    });

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

export async function getBookingDetails(id: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        showtime: {
          include: {
            movie: true,
            hall: { include: { cinema: true } }
          }
        },
        tickets: {
          include: { seat: true }
        }
      }
    });

    if (!booking) return { success: false, error: "Booking not found" };
    
    // Authorization check
    const session = await auth();
    if (booking.userId !== session?.user?.id && session?.user?.role !== "ADMIN") {
       return { success: false, error: "Unauthorized" };
    }

    return { success: true, data: booking };
  } catch (error) {
    console.error("Failed to fetch booking details:", error);
    return { success: false, error: "Failed to fetch booking details" };
  }
}
