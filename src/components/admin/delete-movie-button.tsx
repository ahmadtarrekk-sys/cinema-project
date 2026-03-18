"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteMovie } from "@/lib/actions/admin";

export function DeleteMovieButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this movie? This action cannot be undone.")) {
      return;
    }

    setIsPending(true);
    try {
      const res = await deleteMovie(id);
      if (res.success) {
        toast.success("Movie deleted successfully.");
      } else {
        toast.error(res.error || "Failed to delete movie.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Delete movie"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
