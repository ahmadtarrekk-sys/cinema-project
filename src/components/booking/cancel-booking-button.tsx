"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST"
      });

      if (res.ok) {
        toast.success("Booking cancelled successfully.");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to cancel booking.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border-none"
      onClick={handleCancel}
      disabled={isPending}
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Cancel
    </Button>
  );
}
