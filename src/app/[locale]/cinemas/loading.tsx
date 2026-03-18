import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from "next-intl/server";

export default async function CinemasLoading() {
  const t = await getTranslations("Navigation");

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("cinemas")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground line-clamp-2">
          Find your nearest Lumière cinema and explore premium viewing formats.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-cinema-surface">
            <Skeleton className="h-48 w-full bg-zinc-800" />
            <div className="p-6 pt-0">
              <Skeleton className="mb-4 h-12 w-12 -translate-y-6 rounded-xl bg-zinc-800" />
              <Skeleton className="h-6 w-2/3 bg-zinc-800" />
              <Skeleton className="mt-2 h-4 w-full bg-zinc-800" />
              <div className="mt-6 flex gap-4">
                <Skeleton className="h-8 w-24 rounded-full bg-zinc-800" />
                <Skeleton className="h-8 w-32 rounded-full bg-zinc-800" />
              </div>
              <div className="mt-8">
                <Skeleton className="h-10 w-full rounded-lg bg-zinc-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
