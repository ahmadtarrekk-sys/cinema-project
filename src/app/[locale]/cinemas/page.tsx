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
  
  const CURATED_FALLBACKS = [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470229722913-7c092b19e735?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507676184212-d0330a156f97?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=800&auto=format&fit=crop"
  ];

  const getFallbackImage = (id: string) => {
    // Simple hash function to deterministically pick an image
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % CURATED_FALLBACKS.length;
    return CURATED_FALLBACKS[index];
  };
  
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
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-cinema-surface transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_30px_-5px_oklch(0.82_0.12_75/0.2)] card-interactive"
          >
            {/* Image header */}
            <div className="relative h-56 w-full bg-muted overflow-hidden">
              <Image 
                src={cinema.imageUrl || getFallbackImage(cinema.id)}
                alt={cinema.nameEn}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0,rgba(0,0,0,0.6)_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-cinema-surface via-cinema-surface/40 to-transparent" />
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
                <div className="flex items-center gap-1.5 text-muted-foreground bg-foreground/5 px-3 py-1.5 rounded-full border border-border">
                  <MonitorPlay className="h-4 w-4 text-gold/80" />
                  {cinema.halls.length} Halls
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground bg-foreground/5 px-3 py-1.5 rounded-full border border-border">
                  <Users className="h-4 w-4 text-gold/80" />
                  Premium Seating
                </div>
              </div>

              {/* Dynamic space */}
              <div className="flex-1" />

              <div className="mt-8">
                <Link href={`/cinemas/${cinema.id}`} className="block w-full">
                  <Button className="w-full bg-foreground/5 hover:bg-gold hover:text-black border border-border group-hover:border-gold/30 transition-all font-semibold rounded-lg btn-glow">
                    View Showtimes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {cinemas.length === 0 && (
          <div className="col-span-full py-24 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
            No cinemas found. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
