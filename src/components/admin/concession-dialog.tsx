"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Loader2, X, Ban, Save } from "lucide-react";
import { toast } from "sonner";
import { createOrUpdateConcession } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";

const DEFAULT_FORM = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  price: 5.0,
  imageUrl: "",
  category: "SNACK",
};

export function ConcessionDialog({ item }: { item?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!item;

  const initialForm = item
    ? {
        nameEn: item.nameEn || "",
        nameAr: item.nameAr || "",
        descriptionEn: item.descriptionEn || "",
        descriptionAr: item.descriptionAr || "",
        price: item.price ?? 5.0,
        imageUrl: item.imageUrl || "",
        category: item.category || "SNACK",
      }
    : DEFAULT_FORM;

  const [formData, setFormData] = useState(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      // Build payload with proper types
      const payload: any = {
        nameEn: formData.nameEn.trim(),
        nameAr: formData.nameAr.trim(),
        descriptionEn: formData.descriptionEn.trim(),
        descriptionAr: formData.descriptionAr.trim(),
        price: typeof formData.price === "string" ? parseFloat(formData.price) : formData.price,
        imageUrl: formData.imageUrl.trim() || null,
        category: formData.category,
      };

      // Validate price
      if (isNaN(payload.price) || payload.price <= 0) {
        toast.error("Please enter a valid price.");
        setIsPending(false);
        return;
      }

      if (isEditing) payload.id = item.id;
      
      const res = await createOrUpdateConcession(payload);
      if (res.success) {
        toast.success(`Item ${isEditing ? "updated" : "added"} successfully.`);
        // Reset form for new items
        if (!isEditing) {
          setFormData({ ...DEFAULT_FORM });
        }
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

  const handleOpen = () => {
    // Reset form to initial values when opening
    if (!isEditing) {
      setFormData({ ...DEFAULT_FORM });
    } else {
      setFormData(initialForm);
    }
    setIsOpen(true);
  };

  return (
    <>
      {isEditing ? (
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground hover:bg-foreground/10"
          onClick={handleOpen}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={handleOpen} className="bg-gold text-black hover:bg-gold-light font-semibold">
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-cinema-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center bg-background/80 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-foreground">{isEditing ? "Edit Item" : "Add Item"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="gap-1.5 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /> Close</Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">English Name</label>
                  <Input name="nameEn" value={formData.nameEn} onChange={handleChange} required className="bg-foreground/5 border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Arabic Name</label>
                  <Input name="nameAr" value={formData.nameAr} onChange={handleChange} required className="bg-foreground/5 border-border" dir="rtl" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">English Description</label>
                  <textarea 
                    name="descriptionEn" 
                    value={formData.descriptionEn} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-foreground/5 border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold min-h-[80px]" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Arabic Description</label>
                  <textarea 
                    name="descriptionAr" 
                    value={formData.descriptionAr} 
                    onChange={handleChange} 
                    required 
                    dir="rtl"
                    className="w-full bg-foreground/5 border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold min-h-[80px]" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-foreground/5 border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold appearance-none text-foreground [&>option]:bg-muted"
                  >
                    <option value="SNACK">Snack</option>
                    <option value="DRINK">Drink</option>
                    <option value="COMBO">Combo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Price (EGP)</label>
                  <Input type="number" step="0.01" min="0.01" name="price" value={formData.price} onChange={handleChange} required className="bg-foreground/5 border-border" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Image URL</label>
                  <Input 
                    name="imageUrl" 
                    value={formData.imageUrl} 
                    onChange={handleChange} 
                    placeholder="https://images.unsplash.com/..."
                    className="bg-foreground/5 border-border" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Use a direct image URL (ending in .jpg, .png, .webp). Pinterest links or page URLs won&apos;t work.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-cinema-surface py-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-border gap-1.5">
                  <Ban className="h-4 w-4" /> Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-gold text-black hover:bg-gold-light gap-1.5">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
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
