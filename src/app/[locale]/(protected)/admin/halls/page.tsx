import { prisma } from "@/lib/prisma";
import { HallDialog } from "@/components/admin/hall-dialog";
import { DeleteHallButton } from "@/components/admin/delete-hall-button";

export default async function AdminHallsPage() {
  const halls = await prisma.hall.findMany({
    include: { cinema: true },
    orderBy: { cinema: { nameEn: 'asc' } }
  });

  const cinemas = await prisma.cinema.findMany({ select: { id: true, nameEn: true } });

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Halls</h1>
          <p className="text-muted-foreground">Add new screening rooms to cinemas.</p>
        </div>
        <HallDialog cinemas={cinemas} />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Cinema</th>
                <th className="px-6 py-4 font-medium">Hall Name</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Capacity</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {halls.map(hall => (
                <tr key={hall.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{hall.cinema.nameEn}</td>
                  <td className="px-6 py-4 text-white/80">{hall.nameEn}</td>
                  <td className="px-6 py-4 text-white/80">{hall.type}</td>
                  <td className="px-6 py-4 text-white/80">{hall.capacity} Seats</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <HallDialog cinemas={cinemas} hall={hall} />
                       <DeleteHallButton id={hall.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {halls.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No halls found.
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
