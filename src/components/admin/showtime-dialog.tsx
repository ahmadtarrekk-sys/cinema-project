"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Loader2 } from "lucide-react";
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
          className="text-white/70 hover:text-white hover:bg-white/10"
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
          <div className="bg-cinema-surface border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white">{isEditing ? "Edit Showtime" : "Schedule Movie"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Movie</label>
                  <select 
                    name="movieId" 
                    value={formData.movieId} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold appearance-none text-white [&>option]:bg-zinc-900"
                  >
                    {movies.map((m) => (
                      <option key={m.id} value={m.id}>{m.titleEn}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Cinema</label>
                    <select 
                      name="cinemaId" 
                      value={formData.cinemaId} 
                      onChange={handleChange} 
                      required 
                      className="w-full bg-white/5 border border-white/10 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold appearance-none text-white [&>option]:bg-zinc-900"
                    >
                      {cinemas.map((c) => (
                        <option key={c.id} value={c.id}>{c.nameEn}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Hall</label>
                    <select 
                      name="hallId" 
                      value={formData.hallId} 
                      onChange={handleChange} 
                      required 
                      disabled={!selectedCinema || selectedCinema.halls.length === 0}
                      className="w-full bg-white/5 border border-white/10 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold appearance-none text-white disabled:opacity-50 [&>option]:bg-zinc-900"
                    >
                      {selectedCinema?.halls.map((h: any) => (
                        <option key={h.id} value={h.id}>{h.nameEn} ({h.type})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Start Time</label>
                    <Input 
                      type="datetime-local" 
                      name="startTime" 
                      value={formData.startTime} 
                      onChange={handleChange} 
                      required 
                      className="bg-white/5 border-white/10 [color-scheme:dark]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Base Price (EGP)</label>
                    <Input 
                      type="number" 
                      step="0.01"
                      name="basePrice" 
                      value={formData.basePrice} 
                      onChange={handleChange} 
                      required 
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-cinema-surface py-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-white/10">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-gold text-black hover:bg-gold-light">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
