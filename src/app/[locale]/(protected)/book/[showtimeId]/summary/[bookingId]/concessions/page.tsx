import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ConcessionsClient } from "@/components/booking/concessions-client";
import { getLocale } from "next-intl/server";

export default async function ConcessionsPage({ params }: { params: { bookingId: string, showtimeId: string } }) {
  const { bookingId, showtimeId } = await params;
  const locale = await getLocale();
  const isArabic = locale === "ar";

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) {
    notFound();
  }

  // Fetch all concessions to display
  const items = await prisma.concessionItem.findMany({
    orderBy: { category: "asc" }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-16">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-display font-medium text-white">Enhance Your Experience</h1>
        <p className="mt-2 text-muted-foreground">Pre-order snacks and drinks to skip the line.</p>
      </div>

      <div className="mb-10 relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <img 
          src="/images/auth-bg.png" 
          alt="Delicious cinema snacks and drinks" 
          className="w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
           <h2 className="text-3xl sm:text-4xl font-display font-bold text-white drop-shadow-lg mb-2">
             Premium Concessions
           </h2>
           <div className="inline-flex items-center rounded-full bg-gold/20 px-3 py-1 text-sm font-medium text-gold backdrop-blur-md border border-gold/30">
            Final Step Before Payment
          </div>
        </div>
      </div>

      <ConcessionsClient 
        items={items} 
        bookingId={bookingId} 
        showtimeId={showtimeId} 
        isArabic={isArabic} 
        baseTotal={booking.totalAmount}
      />
    </div>
  );
}
