import { prisma } from "@/lib/prisma";
import { ConcessionDialog } from "@/components/admin/concession-dialog";
import { DeleteConcessionButton } from "@/components/admin/delete-concession-button";
import { SafeImage } from "@/components/ui/safe-image";

export default async function AdminConcessionsPage() {
  const concessions = await prisma.concessionItem.findMany({
    orderBy: { category: 'asc' }
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Concessions</h1>
          <p className="text-muted-foreground">Add, update, or remove snacks, drinks, and combos.</p>
        </div>
        <ConcessionDialog />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-muted-foreground border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {concessions.map(item => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 relative rounded-md overflow-hidden bg-zinc-900 flex-shrink-0">
                        {item.imageUrl && (
                          <SafeImage
                            src={item.imageUrl}
                            alt={item.nameEn}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{item.nameEn}</div>
                        <div className="text-xs text-muted-foreground" dir="rtl">{item.nameAr}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/10">
                       {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-green-400">EGP {item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <ConcessionDialog item={item} />
                       <DeleteConcessionButton id={item.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {concessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No items found. Add one to get started.
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
