import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Clock, Calendar, Star, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import type { Movie } from "@prisma/client";

interface MovieCardProps {
  movie: Movie;
  showBookButton?: boolean;
}

export function MovieCard({ movie, showBookButton = true }: MovieCardProps) {
  const t = useTranslations("Movies");
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const title = isArabic ? movie.titleAr : movie.titleEn;
  
  // Format release date if present
  const releaseYear = movie.releaseDate 
    ? new Date(movie.releaseDate).getFullYear() 
    : null;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-cinema-surface transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_30px_-5px_oklch(0.82_0.12_75/0.2)] card-interactive">
      {/* Poster Container */}
      <Link href={`/movies/${movie.id}`} className="relative aspect-[2/3] w-full overflow-hidden block bg-muted/20">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <Film className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
        
        {/* Top Badges */}
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          {movie.genre && (
            <Badge variant="secondary" className="bg-black/50 backdrop-blur-md border-border text-xs">
              {movie.genre}
            </Badge>
          )}
          
          {movie.rating && (
            <Badge className="bg-gold/90 text-black hover:bg-gold px-1.5 flex gap-1 items-center">
              <Star className="h-3 w-3 fill-black" />
              <span>{movie.rating}</span>
            </Badge>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/movies/${movie.id}`} className="group-hover:text-gold transition-colors">
          <h3 className="font-display text-lg font-bold leading-tight text-foreground line-clamp-1">
            {title}
          </h3>
        </Link>
        
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {movie.durationMin && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{t("duration", { mins: movie.durationMin })}</span>
            </div>
          )}
          {releaseYear && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{releaseYear}</span>
            </div>
          )}
        </div>

        {/* Dynamic empty flex space to push button to bottom */}
        <div className="flex-1" />

        {showBookButton && (
          <div className="mt-4 pt-4 border-t border-border">
            <Link href={`/movies/${movie.id}?booking=true`} className="w-full block">
              <Button 
                className="w-full bg-foreground/5 hover:bg-gold hover:text-black hover:scale-[1.02] transition-all border border-border group-hover:border-gold/30 btn-glow"
                variant="secondary"
              >
                {t("book")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
