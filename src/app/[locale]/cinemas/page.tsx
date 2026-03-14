import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { useLocale } from "next-intl";
import { MapPin, MonitorPlay, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CinemasPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CinemasPage({ params }: CinemasPageProps) {
  const t = await getTranslations("Navigation");
  const locale = (await params).locale;
  const isArabic = locale === 'ar';
  
  const cinemas = await prisma.cinema.findMany({
    include: {
      halls: {
        select: { id: true }
      }
    },
    orderBy: { nameEn: "asc" }
  });

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
        {cinemas.map((cinema) => (
          <div 
            key={cinema.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-cinema-surface transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_30px_-5px_oklch(0.82_0.12_75/0.2)]"
          >
            {/* Image header */}
            <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0,transparent_100%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MonitorPlay className="h-16 w-16 text-white/10 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-cinema-surface to-transparent" />
            </div>

            <div className="flex flex-1 flex-col p-6 pt-0 relative z-10">
              <div className="mb-4 inline-flex h-12 w-12 -translate-y-6 items-center justify-center rounded-xl bg-gold/10 text-gold shadow-lg backdrop-blur-md border border-gold/20">
                <MapPin className="h-6 w-6" />
              </div>
              
              <h2 className="font-display text-2xl font-bold text-foreground">
                {isArabic ? cinema.nameAr : cinema.nameEn}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground flex items-start gap-2 h-10">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
                <span className="line-clamp-2">{cinema.location}</span>
              </p>

              <div className="mt-6 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-zinc-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <MonitorPlay className="h-4 w-4 text-gold/80" />
                  {cinema.halls.length} Halls
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <Users className="h-4 w-4 text-gold/80" />
                  Premium Seating
                </div>
              </div>

              {/* Dynamic space */}
              <div className="flex-1" />

              <div className="mt-8">
                <Link href={`/cinemas/${cinema.id}`} className="block w-full">
                  <Button className="w-full bg-white/5 hover:bg-gold hover:text-black border border-white/10 group-hover:border-gold/30 transition-all font-semibold rounded-lg">
                    View Showtimes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {cinemas.length === 0 && (
          <div className="col-span-full py-24 text-center text-muted-foreground border border-dashed border-white/10 rounded-2xl">
            No cinemas found. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
