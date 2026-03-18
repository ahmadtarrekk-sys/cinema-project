"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createBookingDraft(data: {
  showtimeId: string;
  seatIds: string[];
  totalAmount: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Double check that seats are not already booked for this showtime
    const existingTickets = await prisma.ticket.findMany({
      where: {
        showtimeId: data.showtimeId,
        seatId: { in: data.seatIds }
      }
    });

    if (existingTickets.length > 0) {
      return { success: false, error: "One or more seats are already booked." };
    }

    // 2. Fetch seat details to compute ticket prices accurately on the server
    const showtime = await prisma.showtime.findUnique({
      where: { id: data.showtimeId },
      include: { hall: { include: { seats: true } } }
    });

    if (!showtime) return { success: false, error: "Showtime not found" };

    const seatsToBook = showtime.hall.seats.filter(s => data.seatIds.includes(s.id));
    
    // 3. Create the booking and its tickets in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create helper to get seat tier
      const FIRST_PREMIUM_ROWS = 3;
      const hallRows = Array.from(new Set(showtime.hall.seats.map(s => s.row))).sort();
      
      const b = await tx.booking.create({
        data: {
          userId: session.user.id,
          showtimeId: data.showtimeId,
          totalAmount: data.totalAmount, // Assuming the client sends the correct total including fees for now. Re-calculating tickets below.
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

              // Calculate price based on tier (hardcoded as requested)
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
    console.error("Failed to create booking draft:", error);
    return { success: false, error: "Failed to create booking draft" };
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
