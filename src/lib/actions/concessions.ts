"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function addConcessionsToBooking(data: {
  bookingId: string;
  items: { concessionItemId: string; quantity: number; subtotal: number }[];
  concessionsTotal: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      select: { userId: true, totalAmount: true }
    });

    if (!booking) return { success: false, error: "Booking not found" };
    if (booking.userId !== session.user.id) return { success: false, error: "Unauthorized" };

    await prisma.$transaction(async (tx) => {
      // Clear existing concessions if any to replace with new selection
      await tx.bookingConcession.deleteMany({
         where: { bookingId: data.bookingId }
      });

      if (data.items.length > 0) {
        await tx.bookingConcession.createMany({
          data: data.items.map(item => ({
            bookingId: data.bookingId,
            concessionItemId: item.concessionItemId,
            quantity: item.quantity,
            subtotal: item.subtotal
          }))
        });
      }

      // Update total price to include concessions
      await tx.booking.update({
        where: { id: data.bookingId },
        data: {
          totalAmount: booking.totalAmount + data.concessionsTotal
        }
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to add concessions:", error);
    return { success: false, error: "Failed to update booking with concessions" };
  }
}
