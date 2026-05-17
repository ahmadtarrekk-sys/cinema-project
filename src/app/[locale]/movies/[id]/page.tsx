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
    <div 
      className="min-h-screen pb-24 relative"
      style={{
        backgroundImage: "url('/images/custom-movie-details-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Gradient overlay — image visible in center, text areas readable */}
      <div className="absolute inset-0 overlay-hero pointer-events-none" />

      {/* Hero Backdrop Padding/Spacing (Invisible but keeps layout structure) */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        {movie.trailerUrl && (
          // Placeholder for real trailer component
          <div className="absolute inset-0 bg-muted/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-48 flex flex-col gap-8 md:flex-row md:gap-12">
          {/* Poster */}
          <div className="w-48 shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-2xl md:w-72">
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
                <Film className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Details — wrapped in card for guaranteed readability */}
          <div className="flex flex-col justify-end pb-4 pt-8 md:pb-8">
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-2xl p-6 sm:p-8 shadow-lg">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                {title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {movie.rating && (
                  <Badge className="bg-gold px-2.5 text-black hover:bg-gold-light">
                    <Star className="mr-1 h-3.5 w-3.5 fill-black" />
                    {movie.rating}/10
                  </Badge>
                )}
                {movie.genre && (
                  <div className="flex items-center rounded-full border border-border bg-foreground/5 px-3 py-1 text-foreground font-medium">
                    {movie.genre}
                  </div>
                )}
                {movie.durationMin && (
                  <div className="flex items-center gap-1.5 rounded-full border border-border bg-foreground/5 px-3 py-1 font-medium">
                    <Clock className="h-4 w-4" />
                    {t("duration", { mins: movie.durationMin })}
                  </div>
                )}
                {releaseYear && (
                  <div className="flex items-center gap-1.5 rounded-full border border-border bg-foreground/5 px-3 py-1 font-medium">
                    <Calendar className="h-4 w-4" />
                    {releaseYear}
                  </div>
                )}
              </div>

              <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
                {description || "No description available."}
              </p>
            </div>
          </div>
        </div>

        {/* Showtimes Section */}
        <div className="mt-16 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            Available Showtimes
          </h2>
          <ShowtimeSelector showtimes={movie.showtimes} isArabic={isArabic} />
        </div>
      </div>
    </div>
  );
}
