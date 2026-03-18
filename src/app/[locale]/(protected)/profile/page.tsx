import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { User, Mail, Calendar, LogOut, Ticket, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { format as formatDt } from "date-fns";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";
import { CopyBookingIdButton } from "@/components/booking/copy-booking-id-button";
import { Link } from "@/i18n/routing";

export default async function ProfilePage() {
  const session = await auth();
  const t = await getTranslations("Navigation");

  if (!session?.user?.id) {
    redirect("/login");
  }

  const isArabic = false; // We can get this from next-intl/server but for now false to simplify or assume en

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: { include: { cinema: true } }
        }
      },
      tickets: { include: { seat: true } }
    },
    orderBy: {
      showtime: { startTime: 'desc' }
    }
  });

  return (
    <div className="relative min-h-screen bg-profile bg-blend-overlay bg-background/80">
      <div className="absolute inset-0 bg-background/50 pointer-events-none" />
      <div className="relative mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t("profile")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            View and manage your Lumière account details.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-cinema-surface/50 p-6 backdrop-blur-xl sm:p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gold/10 text-3xl font-bold text-gold ring-1 ring-gold/20">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{session.user.name}</h2>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {session.user.email}
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/10">
                  {session.user.role === "ADMIN" ? "Admin" : "Member"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-gold" />
            My Bookings
          </h2>

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-cinema-surface/50 p-12 text-center backdrop-blur-xl">
              <Ticket className="h-12 w-12 text-gold/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white">No active bookings</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't booked any movies yet. Your history will appear here.
              </p>
              <Link href="/movies" className="mt-6 inline-block">
                <Button className="bg-gold text-black hover:bg-gold-light font-semibold">
                  Browse Movies
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => {
                const { showtime, tickets } = booking;
                const { movie, hall } = showtime;
                const isPast = new Date(showtime.startTime) < new Date();
                // Can cancel up to 2 hours before showtime
                const canCancel = !isPast && (new Date(showtime.startTime).getTime() - Date.now() > 2 * 60 * 60 * 1000);

                return (
                  <div key={booking.id} className="rounded-xl border border-white/10 bg-black/40 p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                    <div className="w-24 h-36 flex-shrink-0 relative overflow-hidden rounded-md bg-zinc-900">
                      {movie.posterUrl && (
                        <Image src={movie.posterUrl} alt={movie.titleEn} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{isArabic ? movie.titleAr : movie.titleEn}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-gold" />
                            <span>{isArabic ? hall.cinema.nameAr : hall.cinema.nameEn} • {isArabic ? hall.nameAr : hall.nameEn}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-gold" />
                            <span>{formatDt(new Date(showtime.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm text-muted-foreground">Total Paid</div>
                          <div className="text-lg font-semibold text-gold">EGP {booking.totalAmount.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium text-white mb-1">{tickets.length} Tickets</div>
                          <div className="text-xs text-muted-foreground">
                            Seats: {tickets.map(t => `${t.seat.row}${t.seat.column}`).join(", ")}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex flex-col sm:flex-row sm:items-center items-start gap-1">
                            <span>Booking ID:</span> 
                            <span className="font-mono text-gold break-all text-[10px] sm:text-xs bg-white/5 py-0.5 px-1.5 rounded select-all cursor-text">{booking.id.toUpperCase()}</span>
                            <CopyBookingIdButton bookingId={booking.id} />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isPast ? (
                            <span className="px-3 py-1 rounded-full bg-white/5 text-muted-foreground text-xs font-medium border border-white/10">
                              Past Show
                            </span>
                          ) : (
                            <>
                              <Link href={`/book/${showtime.id}/payment/${booking.id}/success`}>
                                 <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                                   View Ticket
                                 </Button>
                              </Link>
                              {canCancel ? (
                                <CancelBookingButton bookingId={booking.id} />
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                                  Too late to cancel
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
