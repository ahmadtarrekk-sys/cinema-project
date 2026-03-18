import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, Calendar, Star, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { ShowtimeSelector } from "./showtime-selector";

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
          <ShowtimeSelector showtimes={movie.showtimes} isArabic={isArabic} />
        </div>
      </div>
    </div>
  );
}
