"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createOrUpdateMovie } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";

export function MovieDialog({ movie }: { movie?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!movie;

  const [formData, setFormData] = useState({
    titleEn: movie?.titleEn || "",
    titleAr: movie?.titleAr || "",
    descriptionEn: movie?.descriptionEn || "",
    descriptionAr: movie?.descriptionAr || "",
    durationMin: movie?.durationMin || 120,
    genre: movie?.genre || "",
    posterUrl: movie?.posterUrl || "",
    trailerUrl: movie?.trailerUrl || "",
    releaseDate: movie?.releaseDate ? new Date(movie?.releaseDate).toISOString().split('T')[0] : "",
    rating: movie?.rating || "PG-13",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const payload = { ...formData };
      if (isEditing) (payload as any).id = movie.id;
      
      const res = await createOrUpdateMovie(payload);
      if (res.success) {
        toast.success(`Movie ${isEditing ? "updated" : "added"} successfully.`);
        setIsOpen(false);
      } else {
        toast.error(res.error || "Failed to save movie.");
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
          <Plus className="h-4 w-4 mr-2" /> Add Movie
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-cinema-surface border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white">{isEditing ? "Edit Movie" : "Add Movie"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">English Title</label>
                  <Input name="titleEn" value={formData.titleEn} onChange={handleChange} required className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Arabic Title</label>
                  <Input name="titleAr" value={formData.titleAr} onChange={handleChange} required className="bg-white/5 border-white/10" dir="rtl" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-white">English Description</label>
                  <textarea 
                    name="descriptionEn" 
                    value={formData.descriptionEn} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold min-h-[100px]" 
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
                    className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold min-h-[100px]" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Genre</label>
                  <Input name="genre" value={formData.genre} onChange={handleChange} required className="bg-white/5 border-white/10" placeholder="e.g., Action / Sci-Fi" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Duration (Minutes)</label>
                  <Input type="number" name="durationMin" value={formData.durationMin} onChange={handleChange} required className="bg-white/5 border-white/10" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Release Date</label>
                  <Input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} required className="bg-white/5 border-white/10 [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Rating</label>
                  <Input name="rating" value={formData.rating} onChange={handleChange} required className="bg-white/5 border-white/10" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-white">Poster URL</label>
                  <Input name="posterUrl" value={formData.posterUrl} onChange={handleChange} required className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-white">Trailer URL (Optional)</label>
                  <Input name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} className="bg-white/5 border-white/10" />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-cinema-surface py-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-white/10">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-gold text-black hover:bg-gold-light">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Create Movie"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
