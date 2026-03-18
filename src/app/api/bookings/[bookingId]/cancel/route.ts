import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { showtime: true, tickets: true }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    // Cancellation rule: Check if it's too late to cancel (e.g., within 2 hours of showtime)
    const showtime = booking.showtime;
    const isPast = new Date(showtime.startTime) < new Date();
    const hoursDifference = (new Date(showtime.startTime).getTime() - Date.now()) / (1000 * 60 * 60);

    if (isPast || hoursDifference <= 2) {
      return NextResponse.json({ error: "Too late to cancel this booking. Cancellations are only allowed up to 2 hours before the showtime." }, { status: 400 });
    }

    // Cancel booking: update status and free up the seats by removing tickets
    await prisma.$transaction([
      prisma.ticket.deleteMany({ where: { bookingId } }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" }
      })
    ]);

    // Optional: emit socket event if we want real-time map updates on cancellation
    // import("@/lib/socket").then(({ getSocket }) => {
    //   booking.tickets.forEach(t => {
    //     getSocket().emit("seatReleased", { showtimeId: showtime.id, seatId: t.seatId, userId: session.user.id });
    //   });
    // });

    return NextResponse.json({ success: true, message: "Booking cancelled successfully." });
  } catch (error) {
    console.error("Cancellation error:", error);
    return NextResponse.json({ error: "Failed to process cancellation." }, { status: 500 });
  }
}
