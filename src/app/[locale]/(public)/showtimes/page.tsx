import { prisma } from "@/lib/prisma";
import { format as formatDt } from "date-fns";
import { Clock, MapPin, Film, Calendar } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface ShowtimesPageProps {
  searchParams: Promise<{ date?: string }>;
  params: Promise<{ locale: string }>;
}

export default async function GlobalShowtimesPage({ searchParams, params }: ShowtimesPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const isArabic = resolvedParams.locale === "ar";
  
  // Parse date or default to today
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let selectedDate = new Date(today);
  if (resolvedSearchParams.date) {
    const parsed = new Date(resolvedSearchParams.date);
    if (!isNaN(parsed.getTime())) {
      selectedDate = parsed;
      selectedDate.setHours(0,0,0,0);
    }
  }

  const nextDay = new Date(selectedDate);
  nextDay.setDate(selectedDate.getDate() + 1);

  // Fetch all showtimes for the selected date
  const showtimes = await prisma.showtime.findMany({
    where: {
      startTime: {
        gte: selectedDate,
        lt: nextDay
      }
    },
    include: {
      movie: true,
      hall: {
        include: { cinema: true }
      }
    },
    orderBy: [
      { movie: { titleEn: 'asc' } },
      { startTime: 'asc' }
    ]
  });

  // Group showtimes by movie
  type GroupedShowtimes = {
    [movieId: string]: {
      movie: any;
      showings: any[];
    };
  };

  const groupedByMovie = showtimes.reduce((acc: GroupedShowtimes, st) => {
    if (!acc[st.movie.id]) {
      acc[st.movie.id] = {
        movie: st.movie,
        showings: []
      };
    }
    acc[st.movie.id].showings.push(st);
    return acc;
  }, {});

  const moviesWithShowtimes = Object.values(groupedByMovie);

  // Generate date options for the picker (Today + 6 days = 1 week)
  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  return (
    <div className="min-h-screen pt-24 pb-24">
      {/* Background */}
      <div className="fixed inset-0 min-h-screen bg-zinc-950 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">Showtimes</h1>
            <p className="text-muted-foreground text-lg">Browse daily movie schedules across all cinemas.</p>
          </div>
        </div>

        {/* Date Picker (Horizontal Scroll) */}
        <div className="mb-10 w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="flex gap-3 min-w-max">
            {dateOptions.map((date) => {
              const dateStr = formatDt(date, "yyyy-MM-dd");
              const isSelected = selectedDate.getTime() === date.getTime();
              
              return (
                <Link key={dateStr} href={`/showtimes?date=${dateStr}`}>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className={`h-auto min-w-24 flex-col gap-1 rounded-2xl py-3 px-4 transition-all ${
                      isSelected 
                        ? "bg-gold text-black hover:bg-gold-light border-gold shadow-[0_0_20px_rgba(234,179,8,0.3)]" 
                        : "bg-cinema-surface border-white/5 text-muted-foreground hover:border-gold/30 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                      {formatDt(date, "EEE")}
                    </span>
                    <span className="text-2xl font-bold">
                      {formatDt(date, "dd")}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatDt(date, "MMM")}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Schedule Timetable */}
        <div className="space-y-8">
          {moviesWithShowtimes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-cinema-surface py-24 text-center">
               <Calendar className="h-16 w-16 text-white/10 mb-6" />
               <h3 className="text-2xl font-semibold text-white mb-2">No Showtimes Found</h3>
               <p className="text-muted-foreground">There are no screenings scheduled for this date.</p>
            </div>
          ) : (
            moviesWithShowtimes.map(({ movie, showings }) => {
              const title = isArabic ? movie.titleAr || movie.titleEn : movie.titleEn;
              const desc = isArabic ? movie.descriptionAr || movie.descriptionEn : movie.descriptionEn;
              
              return (
                <div key={movie.id} className="overflow-hidden rounded-3xl border border-white/5 bg-cinema-surface shadow-xl">
                  <div className="grid md:grid-cols-[300px_1fr]">
                    
                    {/* Movie Info Sidebar */}
                    <div className="relative p-6 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 flex flex-col md:flex-row md:items-start gap-4">
                       <Link href={`/movies/${movie.id}`} className="shrink-0 block group">
                         {movie.posterUrl ? (
                            <img 
                              src={movie.posterUrl} 
                              alt={title} 
                              className="w-24 md:w-full aspect-[2/3] object-cover rounded-xl shadow-lg border border-white/10 group-hover:border-gold/50 transition-colors"
                            />
                         ) : (
                            <div className="w-24 md:w-full aspect-[2/3] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center group-hover:border-gold/50 transition-colors">
                              <Film className="w-8 h-8 text-white/20" />
                            </div>
                         )}
                       </Link>
                       <div className="flex-1 min-w-0">
                         <Link href={`/movies/${movie.id}`} className="hover:underline hover:text-gold block">
                           <h2 className="text-xl md:text-2xl font-bold text-white mb-1 truncate md:whitespace-normal leading-tight">{title}</h2>
                         </Link>
                         <p className="text-sm text-gold font-medium mb-2">{movie.genre}</p>
                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {movie.durationMin}m</span>
                           {movie.rating && <span className="border border-white/20 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-white/60">{movie.rating}</span>}
                         </div>
                       </div>
                    </div>

                    {/* Showtimes List */}
                    <div className="p-6 md:p-8">
                       <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-6 opacity-60">Schedule</h3>
                       <div className="space-y-6">
                         {showings.map(st => {
                            const cinemaName = isArabic ? st.hall.cinema.nameAr || st.hall.cinema.nameEn : st.hall.cinema.nameEn;
                            const hallName = isArabic ? st.hall.nameAr || st.hall.nameEn : st.hall.nameEn;
                            
                            return (
                               <div key={st.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                 <div className="flex items-start sm:items-center gap-4">
                                   <div className="shrink-0 bg-gold/10 text-gold font-bold text-lg md:text-xl py-2 px-4 rounded-lg border border-gold/20 text-center min-w-[100px]">
                                     {formatDt(st.startTime, "h:mm a")}
                                   </div>
                                   <div>
                                     <div className="flex items-center gap-1.5 text-white font-medium mb-1 truncate">
                                       <MapPin className="w-4 h-4 text-white/50 shrink-0" />
                                       <span className="truncate">{cinemaName}</span>
                                     </div>
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground pl-5.5">
                                       <span>{hallName}</span>
                                       <span className="w-1 h-1 rounded-full bg-white/20" />
                                       <span className="text-gold opacity-80">{st.hall.type}</span>
                                     </div>
                                   </div>
                                 </div>
                                 
                                 <Link href={`/book/${st.id}`} className="shrink-0">
                                   <Button className="w-full sm:w-auto bg-white/10 text-white hover:bg-gold hover:text-black font-semibold ring-1 ring-white/20 hover:ring-transparent transition-all">
                                     Book Ticket
                                   </Button>
                                 </Link>
                               </div>
                            )
                         })}
                       </div>
                    </div>

                  </div>
                </div>
              )
            })
          )}
        </div>
        
      </div>
    </div>
  );
}
