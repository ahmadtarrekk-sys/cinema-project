import { prisma } from "@/lib/prisma";
import { format as formatDt } from "date-fns";
import { ShowtimeDialog } from "@/components/admin/showtime-dialog";
import { DeleteShowtimeButton } from "@/components/admin/delete-showtime-button";

export default async function AdminShowtimesPage() {
  const showtimes = await prisma.showtime.findMany({
    include: {
      movie: true,
      hall: { include: { cinema: true } },
      _count: { select: { bookings: true, tickets: true } }
    },
    orderBy: { startTime: 'desc' }
  });

  const movies = await prisma.movie.findMany({ select: { id: true, titleEn: true } });
  const cinemas = await prisma.cinema.findMany({
    include: { halls: { select: { id: true, nameEn: true, type: true } } },
    orderBy: { nameEn: 'asc' }
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Showtimes</h1>
          <p className="text-muted-foreground">Schedule movie screenings across cinemas.</p>
        </div>
        <ShowtimeDialog movies={movies} cinemas={cinemas} />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Movie</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">Base Price</th>
                <th className="px-6 py-4 font-medium">Tickets Sold</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {showtimes.map(st => (
                <tr key={st.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{st.movie.titleEn}</td>
                  <td className="px-6 py-4">
                    <div className="text-white/80">{st.hall.cinema.nameEn}</div>
                    <div className="text-xs text-muted-foreground">{st.hall.nameEn} ({st.hall.type})</div>
                  </td>
                  <td className="px-6 py-4 text-white/80">
                    {formatDt(new Date(st.startTime), "MMM d, yyyy h:mm a")}
                  </td>
                  <td className="px-6 py-4 text-green-400">EGP {st.basePrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-white/80">{st._count.tickets}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <ShowtimeDialog movies={movies} cinemas={cinemas} showtime={st} />
                       <DeleteShowtimeButton id={st.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {showtimes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No showtimes found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
