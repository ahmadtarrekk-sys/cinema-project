import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

interface CinemaPageProps {
  params: Promise<{ id: string }>;
}

export default async function CinemaDetailsPage({ params }: CinemaPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const isArabic = locale === "ar";

  const cinema = await prisma.cinema.findUnique({
    where: { id },
    include: { halls: true },
  });

  if (!cinema) {
    notFound();
  }

  const showtimes = await prisma.showtime.findMany({
    where: {
      hall: { cinemaId: id },
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: "asc" },
    include: {
      movie: true,
      hall: true,
    },
  });

  const title = isArabic ? cinema.nameAr : cinema.nameEn;

  // Group showtimes by Movie
  const moviesWithShowtimes = Array.from(
    new Set(showtimes.map((st) => st.movie.id))
  ).map((movieId) => {
    const movie = showtimes.find((st) => st.movie.id === movieId)!.movie;
    const movieShowtimes = showtimes.filter((st) => st.movie.id === movieId);
    return { movie, showtimes: movieShowtimes };
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Backdrop */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-zinc-800" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-32 flex justify-between items-end pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 mb-4">
              <MapPin className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-gold">{cinema.location}</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-zinc-300">
              {cinema.halls.length} Halls • Premium Seating
            </p>
          </div>
        </div>

        {/* Showtimes Section */}
        <div className="mt-16">
          <h2 className="font-display text-3xl font-bold text-white border-b border-white/10 pb-4">
            Now Showing
          </h2>
          <div className="mt-8 space-y-8">
            {moviesWithShowtimes.length > 0 ? (
              moviesWithShowtimes.map(({ movie, showtimes }) => (
                <div
                  key={movie.id}
                  className="rounded-2xl border border-white/5 bg-cinema-surface p-6 sm:p-8 flex flex-col md:flex-row gap-8"
                >
                  <div className="w-32 shrink-0 md:w-40 relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
                    {movie.posterUrl ? (
                      <Image
                        src={movie.posterUrl}
                        alt={isArabic ? movie.titleAr : movie.titleEn}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Film className="h-8 w-8 text-white/20" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white">
                        {isArabic ? movie.titleAr : movie.titleEn}
                      </h3>
                      {movie.genre && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {movie.genre}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {showtimes.map((st) => (
                        <Link key={st.id} href={`/book/${st.id}`} className="block">
                          <Button
                            variant="outline"
                            className="h-14 w-full flex-col gap-0.5 border-white/10 hover:border-gold hover:bg-gold/10"
                          >
                            <span className="text-base font-semibold text-white">
                              {new Intl.DateTimeFormat("en", {
                                hour: "numeric",
                                minute: "2-digit",
                              }).format(st.startTime)}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              {isArabic ? st.hall.nameAr : st.hall.nameEn}
                            </span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-cinema-surface py-24 text-center">
                <Film className="h-12 w-12 text-white/20" />
                <h3 className="mt-4 text-lg font-medium text-white">
                  No showtimes currently available
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Check back later for updated movie schedules at this cinema.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
