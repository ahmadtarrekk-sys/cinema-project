"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Loader2, X, Ban, Save } from "lucide-react";
import { toast } from "sonner";
import { createOrUpdateHall } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";

export function HallDialog({ cinemas, hall }: { cinemas: any[], hall?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!hall;

  const [formData, setFormData] = useState({
    cinemaId: hall?.cinemaId || cinemas[0]?.id || "",
    nameEn: hall?.nameEn || "",
    nameAr: hall?.nameAr || "",
    type: hall?.type || "STANDARD",
    capacity: hall?.capacity || 80,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const payload = { ...formData };
      if (isEditing) (payload as any).id = hall.id;
      
      const res = await createOrUpdateHall(payload);
      if (res.success) {
        toast.success(`Hall ${isEditing ? "updated" : "added"} successfully.`);
        setIsOpen(false);
      } else {
        toast.error(res.error || "Failed to save hall.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      {isEditing ? (
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground hover:bg-foreground/10"
          onClick={() => setIsOpen(true)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(true)} className="bg-gold text-black hover:bg-gold-light font-semibold">
          <Plus className="h-4 w-4 mr-2" /> Add Hall
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-cinema-surface border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center bg-background/80 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-foreground">{isEditing ? "Edit Hall" : "Add Hall"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="gap-1.5 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /> Close</Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Cinema</label>
                  <select 
                    name="cinemaId" 
                    value={formData.cinemaId} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-foreground/5 border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold appearance-none text-foreground [&>option]:bg-muted"
                  >
                    {cinemas.map((c) => (
                      <option key={c.id} value={c.id}>{c.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">English Name</label>
                  <Input name="nameEn" value={formData.nameEn} onChange={handleChange} required className="bg-foreground/5 border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Arabic Name</label>
                  <Input name="nameAr" value={formData.nameAr} onChange={handleChange} required className="bg-foreground/5 border-border" dir="rtl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Type</label>
                    <select 
                      name="type" 
                      value={formData.type} 
                      onChange={handleChange} 
                      required 
                      className="w-full bg-foreground/5 border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold appearance-none text-foreground [&>option]:bg-muted"
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="IMAX">IMAX</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Capacity</label>
                    <Input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required className="bg-foreground/5 border-border" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-cinema-surface py-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-border gap-1.5">
                  <Ban className="h-4 w-4" /> Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-gold text-black hover:bg-gold-light gap-1.5">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isEditing ? "Save Changes" : "Create Hall"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
