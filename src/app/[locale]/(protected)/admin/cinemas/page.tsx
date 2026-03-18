import { prisma } from "@/lib/prisma";
import { format as formatDt } from "date-fns";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteCinemaButton } from "@/components/admin/delete-cinema-button";
import { CinemaDialog } from "@/components/admin/cinema-dialog";

export default async function AdminCinemasPage() {
  const cinemas = await prisma.cinema.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Cinemas</h1>
          <p className="text-muted-foreground">Add, update, or remove physical cinema locations.</p>
        </div>
        <CinemaDialog />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Name (En / Ar)</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {cinemas.map(cinema => (
                <tr key={cinema.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{cinema.nameEn}</div>
                    <div className="text-xs text-muted-foreground" dir="rtl">{cinema.nameAr}</div>
                  </td>
                  <td className="px-6 py-4 text-white/80">{cinema.location}</td>
                  <td className="px-6 py-4 text-white/80">{cinema.contact || "-"}</td>
                  <td className="px-6 py-4 text-white/80">{formatDt(new Date(cinema.createdAt), "MMM d, yyyy")}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <CinemaDialog cinema={cinema} />
                       <DeleteCinemaButton id={cinema.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {cinemas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No cinemas found. Add one to get started.
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
