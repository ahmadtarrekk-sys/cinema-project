"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, ChevronRight, Film } from "lucide-react";

interface CinemaData {
  id: string;
  name: string;
  value: number;
  movies: { title: string; revenue: number }[];
}

export function CinemaRevenueDetails({ data }: { data: CinemaData[] }) {
  const [selectedCinema, setSelectedCinema] = useState<CinemaData | null>(null);

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">Cinema Performance Breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((cinema) => (
          <button
            key={cinema.id}
            onClick={() => setSelectedCinema(cinema)}
            className="group flex flex-col items-start rounded-xl border border-border bg-cinema-surface/50 p-6 backdrop-blur-xl hover:bg-foreground/5 transition-all text-left shadow-lg hover:shadow-xl"
          >
            <div className="flex w-full items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gold/10 text-gold group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-6 w-6" />
              </div>
              <ChevronRight className="h-6 w-6 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <div className="font-bold text-xl text-white line-clamp-1 mb-1">{cinema.name}</div>
            <div className="text-2xl font-display font-bold text-gold">
              {formatCurrency(cinema.value)}
            </div>
            <div className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
              <Film className="h-4 w-4" />
              {cinema.movies.length} movies generating revenue
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selectedCinema} onOpenChange={(open) => !open && setSelectedCinema(null)}>
        <DialogContent className="bg-zinc-950 border-border text-white max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-gold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedCinema?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 flex-1 overflow-y-auto pr-2 pb-4 space-y-4">
            <div className="bg-foreground/5 p-5 rounded-lg flex justify-between items-center shadow-inner">
              <span className="text-muted-foreground font-medium">Gross Revenue</span>
              <span className="text-2xl font-bold text-foreground">{formatCurrency(selectedCinema?.value || 0)}</span>
            </div>
            
            <div className="pt-4">
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase border-b border-border pb-3 mb-4">
                Revenue by Movie
              </h3>
              
              {selectedCinema?.movies.length === 0 ? (
                <div className="text-center py-8 bg-black/20 rounded-lg border border-border">
                  <Film className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No revenue data available.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCinema?.movies.map((movie, index) => (
                    <div key={index} className="flex justify-between items-center p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3 shrink min-w-0 pr-4">
                        <div className="bg-blue-500/10 p-2 rounded-md text-blue-400 shrink-0">
                          <Film className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm truncate">{movie.title}</span>
                      </div>
                      <span className="font-bold text-foreground shrink-0">
                        {formatCurrency(movie.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
