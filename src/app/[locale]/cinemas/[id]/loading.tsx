import { MapPin } from "lucide-react";

export default function CinemaDetailsLoading() {
  return (
    <div className="min-h-screen pb-24">
      {/* Hero Backdrop Skeleton */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-zinc-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-32 flex justify-between items-end pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 mb-4 h-7 w-32 animate-pulse" />
            
            <div className="h-12 w-96 bg-zinc-800 rounded-md animate-pulse" />
            <div className="mt-4 h-6 w-48 bg-zinc-800 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Showtimes Section Skeleton */}
        <div className="mt-16">
          <div className="border-b border-white/10 pb-4">
             <div className="h-9 w-48 bg-zinc-800 rounded-md animate-pulse" />
          </div>
          <div className="mt-8 space-y-8">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-cinema-surface p-6 sm:p-8 flex flex-col md:flex-row gap-8">
                   <div className="w-32 shrink-0 md:w-40 relative aspect-[2/3] rounded-xl bg-zinc-800 animate-pulse" />

                   <div className="flex-1">
                     <div className="mb-6 space-y-2">
                        <div className="h-8 w-64 bg-zinc-800 rounded-md animate-pulse" />
                        <div className="h-4 w-32 bg-zinc-800 rounded-md animate-pulse" />
                     </div>

                     <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                       {[...Array(4)].map((_, j) => (
                         <div key={j} className="h-14 w-full rounded-md bg-zinc-800 border border-white/10 animate-pulse" />
                       ))}
                     </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
