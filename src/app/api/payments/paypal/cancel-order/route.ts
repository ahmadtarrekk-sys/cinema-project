import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.userId !== session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    if (booking.status === "DRAFT") {
      // Free seats globally by wiping SeatHolds and Tickets
      const tickets = await prisma.ticket.findMany({ where: { bookingId } });
      const seatIds = tickets.map(t => t.seatId);

      await prisma.seatHold.deleteMany({
        where: { showtimeId: booking.showtimeId, seatId: { in: seatIds } }
      });

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" }
      });

      return NextResponse.json({ 
        success: true, 
        releasedSeats: seatIds, 
        showtimeId: booking.showtimeId,
      });
    }

    return NextResponse.json({ error: "Cannot cancel non-draft booking" }, { status: 400 });
  } catch (err: any) {
    console.error("PAYPAL_CANCEL_ERROR:", err.message);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

