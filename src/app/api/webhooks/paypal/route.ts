import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    console.log(`Received PayPal Webhook: ${event.event_type}`);

    // If payment fails or gets denied asynchronously
    if (event.event_type === "PAYMENT.CAPTURE.DENIED" || event.event_type === "PAYMENT.CAPTURE.DECLINED") {
      const resource = event.resource;
      // In PayPal, resource.custom_id or metadata from create-order is needed to find booking.
      // Usually, reference_id refers to the booking ID we mapped.
      const bookingId = resource?.purchase_units?.[0]?.reference_id;

      if (bookingId) {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (booking && booking.status === "DRAFT") {
          // Wipe Draft
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "CANCELLED" }
          });
          
          // Free Seats
          const tickets = await prisma.ticket.findMany({ where: { bookingId } });
          const seatIds = tickets.map(t => t.seatId);

          await prisma.seatHold.deleteMany({
            where: { showtimeId: booking.showtimeId, seatId: { in: seatIds } }
          });
          
          // Note: Real-time socket broadcast requires emitting from the Node socket server,
          // but since Webhook hits Next.js, we don't have direct access to Socket.io here.
          // However, clients polling or users attempting to grab it will find it available.
          // Alternatively, we could fetch our own socket or just let it be.
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("PayPal Webhook Error:", err.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
