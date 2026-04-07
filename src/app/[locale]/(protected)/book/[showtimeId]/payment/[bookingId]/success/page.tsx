import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { CheckCircle, Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format as formatDt } from "date-fns";
import { getLocale } from "next-intl/server";
import { CopyBookingIdButton } from "@/components/booking/copy-booking-id-button";

export default async function PaymentSuccessPage({ params }: { params: { bookingId: string } }) {
  const { bookingId } = await params;
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
      tickets: {
        include: {
          seat: true
        }
      }
    }
  });

  if (!booking) {
    notFound();
  }

  const { showtime, tickets } = booking;
  const { movie, hall } = showtime;
  const cinema = hall.cinema;

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.82_0.12_75/5%),transparent)]" />
      
      <div className="relative w-full max-w-lg text-center mt-12 mb-8">
        
        <div className="mb-8 relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/movies-bg.png" 
            alt="Success Celebration" 
            className="w-full h-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-green-500/20 p-3 mb-2 relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-75" />
              <CheckCircle className="h-8 w-8 text-green-500 relative z-10" />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white mb-1 drop-shadow-lg">
              Booking Confirmed!
            </h1>
            <p className="text-white/80 text-sm font-medium drop-shadow-md">
              Your payment was successful and your seats are reserved.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-cinema-surface/50 p-6 backdrop-blur-xl text-left shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-4">
             {isArabic ? movie.titleAr : movie.titleEn}
          </h2>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gold" />
              <div>
                <div className="font-medium text-white">{isArabic ? cinema.nameAr : cinema.nameEn}</div>
                <div className="text-xs">{isArabic ? hall.nameAr : hall.nameEn}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gold" />
              <div>
                <div className="font-medium text-white">{formatDt(new Date(showtime.startTime), "EEEE, MMMM d, yyyy")}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gold" />
              <div>
                <div className="font-medium text-white">{formatDt(new Date(showtime.startTime), "h:mm a")}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
              <Ticket className="h-5 w-5 text-gold" />
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">{tickets.length} Tickets</div>
                  <div className="text-xs text-white/70 mb-1">
                    Seats: {tickets.map((t: any) => `${t.seat.row}${t.seat.column}`).join(", ")}
                  </div>
                  <div className="text-xs flex flex-col sm:flex-row sm:items-center mt-2 gap-1">
                    <span className="text-white/70">Booking ID:</span> 
                    <span className="font-mono text-gold break-all text-[10px] sm:text-xs bg-white/5 py-0.5 px-1.5 rounded select-all cursor-text">{booking.id.toUpperCase()}</span>
                    <CopyBookingIdButton bookingId={booking.id} />
                  </div>
                </div>
                {/* QR Code integration using external API to avoid new dependencies */}
                <div className="bg-white p-2 rounded-lg ml-4">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img 
                     src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${booking.id}`} 
                     alt="Booking QR Code"
                     className="w-16 h-16 sm:w-20 sm:h-20"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/profile">
            <Button className="w-full sm:w-auto bg-gold text-black hover:bg-gold-light font-semibold">
              View My Bookings
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto border-white/10">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
