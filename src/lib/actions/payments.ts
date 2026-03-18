"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Stripe from "stripe";

// Initialize Stripe if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" as any }) 
  : null;

/**
 * MOCK PAYMENT FALLBACK
 * Processes the payment and updates the booking status instantly.
 */
export async function processPaymentMock(bookingId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) return { success: false, error: "Booking not found" };
    if (booking.userId !== session.user.id) return { success: false, error: "Unauthorized" };
    if (booking.status !== "DRAFT") return { success: false, error: "Booking is not in a valid state for payment" };

    // Update the booking status to CONFIRMED
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" }
    });

    return { success: true };
  } catch (error) {
    console.error("Mock payment failed:", error);
    return { success: false, error: "Payment processing failed" };
  }
}

/**
 * STRIPE PAYMENTS
 * Creates a Stripe Checkout Session for the booking.
 */
export async function createStripeCheckoutSession(bookingId: string) {
  try {
    if (!stripe) return { success: false, error: "Stripe is not configured" };

    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        showtime: { include: { movie: true } }
      }
    });

    if (!booking) return { success: false, error: "Booking not found" };
    if (booking.userId !== session.user.id) return { success: false, error: "Unauthorized" };
    if (booking.status !== "DRAFT") return { success: false, error: "Booking is not in a valid state for payment" };

    // Determine base URL dynamically or from env
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    
    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: {
              name: `Cinema Booking: ${booking.showtime.movie.titleEn}`,
              description: `Booking ID: ${booking.id}`,
            },
            unit_amount: Math.round(booking.totalAmount * 100), // convert to piasters
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/en/book/${booking.showtimeId}/payment/${booking.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/en/book/${booking.showtimeId}/payment/${booking.id}/cancel`,
      metadata: {
        bookingId: booking.id,
      },
    });

    return { success: true, url: checkoutSession.url };
  } catch (error) {
    console.error("Stripe checkout failed:", error);
    return { success: false, error: "Failed to create checkout session" };
  }
}
