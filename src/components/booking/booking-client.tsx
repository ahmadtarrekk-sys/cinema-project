"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format as formatDt } from "date-fns";
import { Calendar, Clock, MapPin, Armchair, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBookingDraft } from "@/lib/actions/bookings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";

// A minimal representation of the types we need
type Seat = { id: string; row: string; column: number; type: string };
type ShowtimeData = any; // We can type this properly later depending on Prisma generated types

interface BookingClientProps {
  showtime: ShowtimeData;
  bookedSeatIds: string[];
  isArabic: boolean;
}

export function BookingClient({ showtime, bookedSeatIds, isArabic }: BookingClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id || "guest"; // Fallback if no session

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [heldSeatIds, setHeldSeatIds] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  const { movie, hall } = showtime;
  const cinema = hall.cinema;
  const seats: Seat[] = hall.seats;

  // Real-time synchronization
  useEffect(() => {
    const socket = getSocket();
    socket.emit("joinShowtime", showtime.id);

    socket.on("initialHolds", (holds: { seatId: string; userId: string }[]) => {
      // Exclude seats held by current user from the 'held by others' list
      const othersHolds = holds
        .filter((h) => h.userId !== userId)
        .map((h) => h.seatId);
      setHeldSeatIds(othersHolds);
    });

    socket.on("seatHeld", ({ seatId, userId: holderId }: { seatId: string; userId: string }) => {
      if (holderId !== userId) {
        setHeldSeatIds((prev) => [...prev, seatId]);
      }
    });

    socket.on("seatReleased", ({ seatId, userId: holderId }: { seatId: string; userId: string }) => {
      if (holderId !== userId) {
        setHeldSeatIds((prev) => prev.filter((id) => id !== seatId));
      }
    });

    return () => {
      socket.off("initialHolds");
      socket.off("seatHeld");
      socket.off("seatReleased");
    };
  }, [showtime.id, userId]);

  // Group seats by row
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();
  
  const toggleSeat = (seatId: string) => {
    const isSelected = selectedSeatIds.includes(seatId);
    const socket = getSocket();

    if (isSelected) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
      socket.emit("releaseSeat", { showtimeId: showtime.id, seatId, userId });
    } else {
      setSelectedSeatIds((prev) => [...prev, seatId]);
      socket.emit("holdSeat", { showtimeId: showtime.id, seatId, userId });
    }
  };

  const getSeatStatus = (seatId: string) => {
    if (bookedSeatIds.includes(seatId)) return "booked";
    if (heldSeatIds.includes(seatId)) return "held";
    if (selectedSeatIds.includes(seatId)) return "selected";
    return "available";
  };

  // Pricing calculations
  // Assume VIP seats cost 1.5x base price. Standard is 1x.
  const calculateTotal = () => {
    return selectedSeatIds.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      const multiplier = seat?.type === "VIP" ? 1.5 : 1.0;
      return total + showtime.basePrice * multiplier;
    }, 0);
  };

  const fees = selectedSeatIds.length * 1.5; // $1.50 fee per ticket
  const subtotal = calculateTotal();
  const total = subtotal + fees;

  const handleBooking = async () => {
    setIsBooking(true);
    try {
      const res = await createBookingDraft({
        showtimeId: showtime.id,
        seatIds: selectedSeatIds,
        totalAmount: total,
      });

      if (res.success) {
        toast.success("Seats reserved! Redirecting to summary...");
        router.push(`/book/${showtime.id}/summary/${res.bookingId}`);
      } else {
        toast.error(res.error || "Failed to reserve seats.");
        setIsBooking(false);
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
      setIsBooking(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Flow */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-cinema-surface/50 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-display font-medium text-white mb-6">Select Seats</h2>
            
            {/* Legend */}
            <div className="flex justify-center gap-6 mb-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm border border-white/20 bg-white/5"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm border border-gold bg-gold/20 text-gold shadow-[0_0_10px_rgba(234,179,8,0.3)]"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-white/10 opacity-50"></div>
                <span>Booked</span>
              </div>
            </div>

            {/* Screen */}
            <div className="mb-12 relative flex justify-center">
              <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-[100%] blur-[2px]"></div>
              <div className="absolute top-4 text-xs tracking-[0.3em] text-muted-foreground uppercase">Screen</div>
            </div>

            {/* Seat Map */}
            <div className="flex flex-col items-center gap-3 overflow-x-auto pb-6">
              {rows.map((row) => {
                const rowSeats = seats.filter((s) => s.row === row).sort((a, b) => a.column - b.column);
                return (
                  <div key={row} className="flex items-center gap-4">
                    <div className="w-6 font-mono text-sm text-muted-foreground text-center">{row}</div>
                    <div className="flex items-center gap-2">
                      {rowSeats.map((seat) => {
                        const status = getSeatStatus(seat.id);
                        return (
                          <button
                            key={seat.id}
                            disabled={status === "booked" || status === "held"}
                            onClick={() => toggleSeat(seat.id)}
                            className={`relative flex h-8 w-8 items-center justify-center rounded-t-xl rounded-b-md transition-all duration-200
                              ${
                                status === "booked"
                                  ? "bg-white/5 cursor-not-allowed opacity-40 text-transparent"
                                  : status === "held"
                                  ? "bg-white/20 cursor-not-allowed border outline-dashed outline-1 outline-white/30 text-transparent opacity-50"
                                  : status === "selected"
                                  ? "bg-gold/20 border-2 border-gold text-gold shadow-[0_0_12px_rgba(234,179,8,0.4)] scale-110"
                                  : "bg-white/5 border border-white/20 hover:border-white/50 hover:bg-white/10 text-transparent hover:text-white/50"
                              }
                            `}
                          >
                            <span className="text-[10px] font-mono">{seat.column}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="w-6 font-mono text-sm text-muted-foreground text-center">{row}</div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>

        {/* Right Column: Sticky Booking Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-cinema-surface/50 p-6 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">Booking Summary</h3>
            
            <div className="flex gap-4 mb-6">
              <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-black">
                <Image
                  src={movie.posterUrl}
                  alt={isArabic ? movie.titleAr : movie.titleEn}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  {isArabic ? movie.titleAr : movie.titleEn}
                </h4>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gold" />
                    {isArabic ? cinema.nameAr : cinema.nameEn} • {isArabic ? hall.nameAr : hall.nameEn}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold" />
                    {formatDt(new Date(showtime.startTime), "EEE, MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold" />
                    {formatDt(new Date(showtime.startTime), "h:mm a")}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tickets ({selectedSeatIds.length})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {selectedSeatIds.length > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Fees</span>
                  <span>${fees.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/5 pt-3 font-semibold text-white text-lg">
                <span>Total</span>
                <span className="text-gold">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="mt-6 w-full bg-gold py-6 text-base font-semibold text-black hover:bg-gold-light transition-colors disabled:opacity-50" 
              disabled={selectedSeatIds.length === 0 || isBooking}
              onClick={handleBooking}
            >
              {isBooking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {isBooking ? "Reserving..." : "Review & Book Tickets"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
