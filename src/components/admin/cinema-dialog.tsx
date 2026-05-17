"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createOrUpdateCinema } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";

export function CinemaDialog({ cinema }: { cinema?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!cinema;

  const [formData, setFormData] = useState({
    nameEn: cinema?.nameEn || "",
    nameAr: cinema?.nameAr || "",
    location: cinema?.location || "",
    contact: cinema?.contact || "",
    imageUrl: cinema?.imageUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const payload = { ...formData };
      if (isEditing) (payload as any).id = cinema.id;
      
      const res = await createOrUpdateCinema(payload);
      if (res.success) {
        toast.success(`Cinema ${isEditing ? "updated" : "added"} successfully.`);
        setIsOpen(false);
      } else {
        toast.error(res.error || "Failed to save cinema.");
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
          <Plus className="h-4 w-4 mr-2" /> Add Cinema
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-cinema-surface border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center bg-background/80 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-foreground">{isEditing ? "Edit Cinema" : "Add Cinema"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">English Name</label>
                  <Input name="nameEn" value={formData.nameEn} onChange={handleChange} required className="bg-foreground/5 border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Arabic Name</label>
                  <Input name="nameAr" value={formData.nameAr} onChange={handleChange} required className="bg-foreground/5 border-border" dir="rtl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Location Address</label>
                  <Input name="location" value={formData.location} onChange={handleChange} required className="bg-foreground/5 border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Contact (Optional)</label>
                  <Input name="contact" value={formData.contact} onChange={handleChange} className="bg-foreground/5 border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Image URL (Optional)</label>
                  <Input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="bg-foreground/5 border-border" placeholder="https://images.unsplash.com/photo-..." />
                  <p className="text-xs text-muted-foreground">High-quality image of the cinema building or interior.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-cinema-surface py-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-border">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-gold text-black hover:bg-gold-light">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Create Cinema"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
