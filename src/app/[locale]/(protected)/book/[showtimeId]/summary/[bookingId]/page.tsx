import { notFound } from "next/navigation";
import { getBookingDetails } from "@/lib/actions/bookings";
import { getLocale } from "next-intl/server";
import { format as formatDt } from "date-fns";
import Image from "next/image";
import { Calendar, Clock, MapPin, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

interface BookingSummaryPageProps {
  params: { showtimeId: string; bookingId: string; locale: string };
}

export default async function BookingSummaryPage({ params }: BookingSummaryPageProps) {
  const { bookingId } = await params;
  const locale = await getLocale();
  const isArabic = locale === "ar";
  
  const { data: booking, success } = await getBookingDetails(bookingId);

  if (!success || !booking) {
    notFound();
  }

  const { showtime, tickets } = booking;
  const { movie, hall } = showtime;
  const cinema = hall.cinema;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 mt-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-display font-medium text-foreground">Review Your Booking</h1>
        <p className="mt-2 text-muted-foreground">Almost there! Review your tickets below.</p>
      </div>

      <div className="mb-8 relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-border shadow-2xl">
        <Image 
          src="/images/booking-bg.png" 
          alt="Cinematic theater view" 
          fill 
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-4 left-6 sm:bottom-6 sm:left-8">
          <div className="inline-flex items-center rounded-full bg-gold/20 px-3 py-1 text-sm font-medium text-gold backdrop-blur-md border border-gold/30">
            Booking Step 3 of 4
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/80 overflow-hidden backdrop-blur-xl">
        {/* Top Section: Movie Info */}
        <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 bg-foreground/5 border-b border-border">
          <div className="relative h-36 w-24 sm:h-48 sm:w-32 flex-shrink-0 overflow-hidden rounded-md border border-border shadow-xl">
            <Image
              src={movie.posterUrl}
              alt={isArabic ? movie.titleAr : movie.titleEn}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-foreground">
              {isArabic ? movie.titleAr : movie.titleEn}
            </h2>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                <span className="font-medium text-foreground/80">
                  {isArabic ? cinema.nameAr : cinema.nameEn}
                </span>
                <span className="mx-1">•</span>
                <span>{isArabic ? hall.nameAr : hall.nameEn}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold" />
                <span>{formatDt(showtime.startTime, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold" />
                <span>{formatDt(showtime.startTime, "h:mm a")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Tickets */}
        <div className="p-6 sm:p-8 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TicketIcon className="h-5 w-5 text-gold" />
            Tickets ({tickets.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tickets.map((ticket: any) => (
              <div key={ticket.id} className="flex justify-between items-center rounded-lg border border-border bg-foreground/5 p-4">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    Row <span className="text-gold">{ticket.seat.row}</span> | Seat <span className="text-gold">{ticket.seat.column}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">
                    {ticket.seat.type}
                  </div>
                </div>
                <div className="font-medium text-foreground">
                  EGP {ticket.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Total & Action */}
        <div className="p-6 sm:p-8 bg-foreground/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
            <div className="text-3xl font-bold text-gold">EGP {booking.totalAmount.toFixed(2)}</div>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="w-full sm:w-auto border-border">
              Cancel
            </Button>
            <Link href={`/book/${showtime.id}/summary/${booking.id}/concessions`} className="w-full sm:w-auto">
              <Button className="w-full bg-gold text-black hover:bg-gold-light font-semibold">
                Proceed to Concessions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
