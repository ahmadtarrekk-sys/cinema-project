import { prisma } from "@/lib/prisma";
import { format as formatDt } from "date-fns";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteMovieButton } from "@/components/admin/delete-movie-button";
import { MovieDialog } from "@/components/admin/movie-dialog";
import Image from "next/image";

export default async function AdminMoviesPage() {
  const movies = await prisma.movie.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Movies</h1>
          <p className="text-muted-foreground">Add, update, or remove movies from the catalog.</p>
        </div>
        <MovieDialog />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Movie</th>
                <th className="px-6 py-4 font-medium">Genre</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Release Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {movies.map(movie => (
                <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-8 relative rounded overflow-hidden bg-zinc-900 flex-shrink-0">
                        {movie.posterUrl && (
                          <Image src={movie.posterUrl} alt={movie.titleEn} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{movie.titleEn}</div>
                        <div className="text-xs text-muted-foreground">{movie.rating}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/80">{movie.genre}</td>
                  <td className="px-6 py-4 text-white/80">{movie.durationMin} min</td>
                  <td className="px-6 py-4 text-white/80">{formatDt(new Date(movie.releaseDate), "MMM d, yyyy")}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <MovieDialog movie={movie} />
                      <DeleteMovieButton id={movie.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {movies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No movies found. Add one to get started.
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
