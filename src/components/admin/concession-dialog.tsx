"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createOrUpdateConcession } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";

export function ConcessionDialog({ item }: { item?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!item;

  const [formData, setFormData] = useState({
    nameEn: item?.nameEn || "",
    nameAr: item?.nameAr || "",
    descriptionEn: item?.descriptionEn || "",
    descriptionAr: item?.descriptionAr || "",
    price: item?.price || 5.0,
    imageUrl: item?.imageUrl || "",
    category: item?.category || "SNACK",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const payload = { ...formData };
      if (isEditing) (payload as any).id = item.id;
      
      const res = await createOrUpdateConcession(payload);
      if (res.success) {
        toast.success(`Item ${isEditing ? "updated" : "added"} successfully.`);
        setIsOpen(false);
      } else {
        toast.error(res.error || "Failed to save item.");
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
          className="text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => setIsOpen(true)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(true)} className="bg-gold text-black hover:bg-gold-light font-semibold">
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-cinema-surface border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white">{isEditing ? "Edit Item" : "Add Item"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">English Name</label>
                  <Input name="nameEn" value={formData.nameEn} onChange={handleChange} required className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Arabic Name</label>
                  <Input name="nameAr" value={formData.nameAr} onChange={handleChange} required className="bg-white/5 border-white/10" dir="rtl" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-white">English Description</label>
                  <textarea 
                    name="descriptionEn" 
                    value={formData.descriptionEn} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold min-h-[80px]" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-white">Arabic Description</label>
                  <textarea 
                    name="descriptionAr" 
                    value={formData.descriptionAr} 
                    onChange={handleChange} 
                    required 
                    dir="rtl"
                    className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold min-h-[80px]" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Category</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold appearance-none text-white [&>option]:bg-zinc-900"
                  >
                    <option value="SNACK">Snack</option>
                    <option value="DRINK">Drink</option>
                    <option value="COMBO">Combo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Price (EGP)</label>
                  <Input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="bg-white/5 border-white/10" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-white">Image URL</label>
                  <Input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="bg-white/5 border-white/10" />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-cinema-surface py-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-white/10">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-gold text-black hover:bg-gold-light">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Create Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
