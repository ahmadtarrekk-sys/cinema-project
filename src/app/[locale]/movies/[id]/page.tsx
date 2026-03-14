import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, Calendar, Star, Film, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";

interface MoviePageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function MovieDetailsPage({ params }: MoviePageProps) {
  const { id } = await params;
  const t = await getTranslations("Movies");

  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      showtimes: {
        where: { startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
        include: { hall: { include: { cinema: true } } },
      },
    },
  });

  if (!movie) {
    notFound();
  }

  const isArabic = (await params).locale === 'ar';
  const title = isArabic ? movie.titleAr : movie.titleEn;
  const description = isArabic ? movie.descriptionAr : movie.descriptionEn;

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null;

  // Group showtimes by Cinema for display
  const cinemasWithShowtimes = Array.from(
    new Set(movie.showtimes.map((st) => st.hall.cinema.id))
  ).map((cinemaId) => {
    const cinema = movie.showtimes.find((st) => st.hall.cinema.id === cinemaId)!
      .hall.cinema;
    const showtimes = movie.showtimes.filter(
      (st) => st.hall.cinema.id === cinemaId
    );
    return { cinema, showtimes };
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Backdrop */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-zinc-950">
        {movie.trailerUrl ? (
          // Placeholder for real trailer/backdrop component
          <div className="absolute inset-0 bg-zinc-800" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-zinc-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-48 flex flex-col gap-8 md:flex-row md:gap-12">
          {/* Poster */}
          <div className="w-48 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl md:w-72">
            {movie.posterUrl ? (
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={movie.posterUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center">
                <Film className="h-16 w-16 text-white/20" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-end pb-4 pt-8 md:pb-8">
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              {title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {movie.rating && (
                <Badge className="bg-gold px-2.5 text-black hover:bg-gold-light">
                  <Star className="mr-1 h-3.5 w-3.5 fill-black" />
                  {movie.rating}/10
                </Badge>
              )}
              {movie.genre && (
                <div className="flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white">
                  {movie.genre}
                </div>
              )}
              {movie.durationMin && (
                <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <Clock className="h-4 w-4" />
                  {t("duration", { mins: movie.durationMin })}
                </div>
              )}
              {releaseYear && (
                <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <Calendar className="h-4 w-4" />
                  {releaseYear}
                </div>
              )}
            </div>

            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-zinc-300">
              {description || "No description available."}
            </p>
          </div>
        </div>

        {/* Showtimes Section */}
        <div className="mt-24">
          <h2 className="font-display text-3xl font-bold text-white">
            Available Showtimes
          </h2>
          <div className="mt-8 space-y-8">
            {cinemasWithShowtimes.length > 0 ? (
              cinemasWithShowtimes.map(({ cinema, showtimes }) => (
                <div
                  key={cinema.id}
                  className="rounded-2xl border border-white/5 bg-cinema-surface p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {isArabic ? cinema.nameAr : cinema.nameEn}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {cinema.location}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-cinema-surface py-24 text-center">
                <Film className="h-12 w-12 text-white/20" />
                <h3 className="mt-4 text-lg font-medium text-white">
                  No showtimes currently available
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Check back later for updated schedules.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
