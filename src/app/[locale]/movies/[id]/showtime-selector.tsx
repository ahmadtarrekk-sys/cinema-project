"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/routing";
import { MapPin, Film, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prisma } from "@prisma/client";

// Define a type for the data structure we are passing
type ShowtimeWithRelations = Prisma.ShowtimeGetPayload<{
  include: { hall: { include: { cinema: true } } }
}>;

interface ShowtimeSelectorProps {
  showtimes: ShowtimeWithRelations[];
  isArabic: boolean;
}

export function ShowtimeSelector({ showtimes, isArabic }: ShowtimeSelectorProps) {
  // Extract unique dates from showtimes (ignoring time)
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    showtimes.forEach((st) => {
      const date = new Date(st.startTime);
      // Create a local date string (YYYY-MM-DD) for grouping safely
      dates.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`
      );
    });
    return Array.from(dates).sort();
  }, [showtimes]);

  const [selectedDate, setSelectedDate] = useState<string | null>(
    uniqueDates.length > 0 ? uniqueDates[0] : null
  );

  const filteredShowtimes = useMemo(() => {
    if (!selectedDate) return [];
    return showtimes.filter((st) => {
      const date = new Date(st.startTime);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
      return dateStr === selectedDate;
    });
  }, [showtimes, selectedDate]);

  // Group filtered showtimes by Cinema
  const cinemasWithShowtimes = useMemo(() => {
    const cinemaIds = Array.from(
      new Set(filteredShowtimes.map((st) => st.hall.cinema.id))
    );
    return cinemaIds.map((cinemaId) => {
      const showtimesForCinema = filteredShowtimes.filter(
        (st) => st.hall.cinema.id === cinemaId
      );
      return {
        cinema: showtimesForCinema[0].hall.cinema,
        showtimes: showtimesForCinema,
      };
    });
  }, [filteredShowtimes]);

  if (showtimes.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-cinema-surface py-24 text-center">
        <Film className="h-12 w-12 text-white/20" />
        <h3 className="mt-4 text-lg font-medium text-white">
          No showtimes currently available
        </h3>
        <p className="mt-2 text-muted-foreground">
          Check back later for updated schedules.
        </p>
      </div>
    );
  }

  // Format date for tabs
  const formatDateTab = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const isTomorrow =
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();

    if (isToday) return isArabic ? "اليوم" : "Today";
    if (isTomorrow) return isArabic ? "غداً" : "Tomorrow";

    return new Intl.DateTimeFormat(isArabic ? "ar" : "en", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  return (
    <div className="mt-8 space-y-8" id="showtimes">
      {/* Date Selector Tabs */}
      <div className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="flex gap-2 min-w-max">
          {uniqueDates.map((dateStr) => {
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-gold text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                    : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                {formatDateTab(dateStr)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Showtimes by Cinema */}
      <div className="space-y-8">
        {cinemasWithShowtimes.length > 0 ? (
          cinemasWithShowtimes.map(({ cinema, showtimes: cShowtimes }) => (
            <div
              key={cinema.id}
              className="rounded-2xl border border-white/5 bg-cinema-surface p-6 sm:p-8 transition-colors hover:border-white/10"
            >
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold shadow-inner shadow-gold/20">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isArabic ? cinema.nameAr : cinema.nameEn}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {cinema.location}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {cShowtimes.map((st) => (
                  <Link key={st.id} href={`/book/${st.id}`} className="block">
                    <Button
                      variant="outline"
                      className="h-16 w-full flex-col gap-1 border-white/10 hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all relative overflow-hidden group"
                    >
                      <span className="text-lg font-bold text-white group-hover:text-gold transition-colors">
                        {new Intl.DateTimeFormat("en", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true
                        }).format(new Date(st.startTime))}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {isArabic ? st.hall.nameAr : st.hall.nameEn}
                      </span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-cinema-surface py-16 text-center">
            <p className="text-muted-foreground">
              No showtimes available for the selected date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
