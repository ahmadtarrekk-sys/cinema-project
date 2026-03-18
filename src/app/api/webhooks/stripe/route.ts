import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" as any }) 
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!stripe) {
    return new NextResponse("Stripe not configured", { status: 500 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return new NextResponse("Missing signature or secret", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      try {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED" },
        });
        
        // At this point we can also create records for payments via prisma, or emit an email success
        console.log(`Booking ${bookingId} confirmed via Stripe.`);
      } catch (err) {
        console.error("Error updating booking status:", err);
        return new NextResponse("Failed to update booking", { status: 500 });
      }
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
