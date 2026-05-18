"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Loader2, X, Ban, Save } from "lucide-react";
import { toast } from "sonner";
import { createOrUpdateShowtime } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";

// Fix React hydration issues with locale dates by handling it simply
function toLocalISOString(date: Date) {
    const tzOffsetMs = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

export function ShowtimeDialog({ movies, cinemas, showtime }: { movies: any[], cinemas: any[], showtime?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!showtime;

  const [formData, setFormData] = useState({
    movieId: showtime?.movieId || movies[0]?.id || "",
    cinemaId: showtime?.hall?.cinemaId || cinemas[0]?.id || "",
    hallId: showtime?.hallId || cinemas[0]?.halls[0]?.id || "",
    startTime: showtime?.startTime ? toLocalISOString(new Date(showtime.startTime)) : "",
    basePrice: showtime?.basePrice || 15.0,
  });

  const selectedCinema = cinemas.find(c => c.id === formData.cinemaId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "cinemaId") {
      const newCinema = cinemas.find(c => c.id === value);
      setFormData({ 
        ...formData, 
        cinemaId: value, 
        hallId: newCinema?.halls[0]?.id || "" 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const payload: any = { 
        movieId: formData.movieId,
        hallId: formData.hallId,
        startTime: new Date(formData.startTime).toISOString(),
        basePrice: parseFloat(formData.basePrice.toString())
      };
      
      if (isEditing) payload.id = showtime.id;
      
      const res = await createOrUpdateShowtime(payload);
      if (res.success) {
        toast.success(`Showtime ${isEditing ? "updated" : "added"} successfully.`);
        setIsOpen(false);
      } else {
        toast.error(res.error || "Failed to save showtime.");
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
          <Plus className="h-4 w-4 mr-2" /> Schedule Movie
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-cinema-surface border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center bg-background/80 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-foreground">{isEditing ? "Edit Showtime" : "Schedule Movie"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="gap-1.5 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /> Close</Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Movie</label>
                  <select 
                    name="movieId" 
                    value={formData.movieId} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-foreground/5 border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold appearance-none text-foreground [&>option]:bg-muted"
                  >
                    {movies.map((m) => (
                      <option key={m.id} value={m.id}>{m.titleEn}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Cinema</label>
                    <select 
                      name="cinemaId" 
                      value={formData.cinemaId} 
                      onChange={handleChange} 
                      required 
                      className="w-full bg-foreground/5 border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold appearance-none text-foreground [&>option]:bg-muted"
                    >
                      {cinemas.map((c) => (
                        <option key={c.id} value={c.id}>{c.nameEn}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Hall</label>
                    <select 
                      name="hallId" 
                      value={formData.hallId} 
                      onChange={handleChange} 
                      required 
                      disabled={!selectedCinema || selectedCinema.halls.length === 0}
                      className="w-full bg-foreground/5 border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold appearance-none text-foreground disabled:opacity-50 [&>option]:bg-muted"
                    >
                      {selectedCinema?.halls.map((h: any) => (
                        <option key={h.id} value={h.id}>{h.nameEn} ({h.type})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Start Time</label>
                    <Input 
                      type="datetime-local" 
                      name="startTime" 
                      value={formData.startTime} 
                      onChange={handleChange} 
                      required 
                      className="bg-foreground/5 border-border [color-scheme:dark]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Base Price (EGP)</label>
                    <Input 
                      type="number" 
                      step="0.01"
                      name="basePrice" 
                      value={formData.basePrice} 
                      onChange={handleChange} 
                      required 
                      className="bg-foreground/5 border-border" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-cinema-surface py-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-border gap-1.5">
                  <Ban className="h-4 w-4" /> Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-gold text-black hover:bg-gold-light gap-1.5">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isEditing ? "Save Changes" : "Schedule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
