import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { MovieCard } from "@/components/movie/movie-card";
import { Search, Filter } from "lucide-react";

interface MoviesPageProps {
  searchParams: Promise<{ query?: string; genre?: string }>;
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const t = await getTranslations("Movies");
  const { query, genre } = await searchParams;
  
  const movies = await prisma.movie.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { titleEn: { contains: query, mode: "insensitive" } },
            { titleAr: { contains: query, mode: "insensitive" } },
            { descriptionEn: { contains: query, mode: "insensitive" } },
          ]
        } : {},
        genre ? { genre: { equals: genre, mode: "insensitive" } } : {}
      ]
    },
    orderBy: { releaseDate: "desc" }
  });

  // Get unique genres for filter (mock implementation, you can query db instead)
  const allMovies = await prisma.movie.findMany({ select: { genre: true }});
  const genres = Array.from(new Set(allMovies.map(m => m.genre).filter(Boolean)));

  return (
    <div className="relative min-h-screen bg-movies bg-blend-overlay bg-background/80">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground line-clamp-2">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex w-full max-w-sm flex-col relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <form action="/movies" method="GET">
              <input
                name="query"
                defaultValue={query}
                placeholder={t("search")}
                className="w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              {genre && <input type="hidden" name="genre" value={genre} />}
            </form>
          </div>
        </div>

        {/* Category Chips */}
        <div className="mb-12 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="flex gap-2 min-w-max">
            <a
              href={query ? `/movies?query=${query}` : `/movies`}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                !genre 
                  ? "bg-gold text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]" 
                  : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
              }`}
            >
              {t("filter_all")}
            </a>
            {genres.map(g => {
               const isSelected = genre === g;
               let href = `/movies?genre=${encodeURIComponent(g)}`;
               if (query) href += `&query=${encodeURIComponent(query)}`;
               
               return (
                <a
                  key={g}
                  href={href}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    isSelected 
                      ? "bg-gold text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]" 
                      : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {g}
                </a>
               )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-8">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        
        {movies.length === 0 && (
          <div className="py-24 text-center text-muted-foreground">{t("no_results")}</div>
        )}
      </div>
    </div>
  );
}
