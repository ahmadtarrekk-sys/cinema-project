import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { MovieCard } from "@/components/movie/movie-card";

export default async function MoviesPage() {
  const t = await getTranslations("Movies");
  
  const movies = await prisma.movie.findMany({
    orderBy: { releaseDate: "desc" }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground line-clamp-2">
          {t("subtitle")}
        </p>
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
  );
}
