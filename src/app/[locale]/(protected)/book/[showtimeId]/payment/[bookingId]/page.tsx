import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { PaymentClient } from "@/components/booking/payment-client";

export default async function PaymentPage({ params }: { params: { bookingId: string, showtimeId: string } }) {
  const { bookingId, showtimeId } = await params;
  const locale = await getLocale();
  const isArabic = locale === "ar";

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: { include: { cinema: true } }
        }
      },
      concessions: {
        include: { concessionItem: true }
      }
    }
  });

  if (!booking) {
    notFound();
  }

  // Check if stripe is potentially configured
  const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;

  return (
    <div className="relative min-h-screen bg-payment bg-blend-overlay bg-background/80">
      <div className="absolute inset-0 overlay-scrim pointer-events-none" />
      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 mt-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-medium text-foreground">Complete Payment</h1>
          <p className="mt-2 text-muted-foreground">Securely process your booking.</p>
        </div>

        <PaymentClient 
          booking={booking} 
          isArabic={isArabic} 
          stripeEnabled={stripeEnabled}
        />
      </div>
    </div>
  );
}
