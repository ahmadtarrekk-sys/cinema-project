import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from "next-intl/server";

export default async function MoviesLoading() {
  const t = await getTranslations("Movies");

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
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-cinema-surface">
            <Skeleton className="aspect-[2/3] w-full bg-zinc-800" />
            <div className="flex flex-1 flex-col p-4">
              <Skeleton className="h-5 w-3/4 mb-2 bg-zinc-800" />
              <Skeleton className="h-3 w-1/2 bg-zinc-800" />
              <div className="flex-1" />
              <div className="mt-4 pt-4 border-t border-white/5">
                <Skeleton className="h-9 w-full bg-zinc-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
