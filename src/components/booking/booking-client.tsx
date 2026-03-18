"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format as formatDt } from "date-fns";
import { Calendar, Clock, MapPin, Armchair, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBookingDraft } from "@/lib/actions/bookings";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
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

  const [bookedSeatIdsLocal, setBookedSeatIdsLocal] = useState<string[]>(bookedSeatIds);
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

    socket.on("seatsBooked", ({ seatIds }: { seatIds: string[] }) => {
      setBookedSeatIdsLocal((prev) => Array.from(new Set([...prev, ...seatIds])));
      setHeldSeatIds((prev) => prev.filter((id) => !seatIds.includes(id)));
      setSelectedSeatIds((prev) => prev.filter((id) => !seatIds.includes(id)));
    });

    return () => {
      socket.off("initialHolds");
      socket.off("seatHeld");
      socket.off("seatReleased");
      socket.off("seatsBooked");
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
    if (bookedSeatIdsLocal.includes(seatId)) return "booked";
    if (heldSeatIds.includes(seatId)) return "held";
    if (selectedSeatIds.includes(seatId)) return "selected";
    return "available";
  };

  // Pricing calculations
  // First 3 rows (0, 1, 2) = VIP
  // Next 2 rows (3, 4) = Premium
  // Remaining = Normal
  const getSeatTier = (seat: Seat) => {
    if (seat.type === "VIP") return "VIP";
    if (seat.type === "PREMIUM") return "Premium";
    return "Normal";
  };

  const getSeatPrice = (seat: Seat) => {
    const tier = getSeatTier(seat);
    if (tier === "VIP") return 350;        // Example VIP price
    if (tier === "Premium") return 250;    // Given premium price
    return 180;                            // Given normal price
  };

  const calculateTotal = () => {
    return selectedSeatIds.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      if (!seat) return total;
      return total + getSeatPrice(seat);
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
    <div className="relative min-h-screen bg-booking bg-blend-overlay bg-background/80">
      <div className="absolute inset-0 bg-background/50 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Flow */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-cinema-surface/50 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-display font-medium text-white mb-6">Select Seats</h2>
            
            {/* Legend */}
            <div className="flex justify-center gap-6 mb-8 flex-wrap text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm border border-white/40 bg-white/20"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm border border-blue-500/60 bg-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]"></div>
                <span>Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm border border-fuchsia-500/60 bg-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.2)]"></div>
                <span>VIP</span>
              </div>
              <div className="flex items-center gap-2 ml-4 border-l border-white/10 pl-4">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-gold border border-gold shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-red-500/20 border border-red-500/30"></div>
                <span>Taken</span>
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
                        const tier = getSeatTier(seat);
                        const status = getSeatStatus(seat.id);
                        
                        let baseStyle = "bg-white/20 border-white/40 text-white/90 hover:border-white/80 hover:bg-white/30 hover:text-white";
                        if (tier === "Premium") {
                          baseStyle = "bg-blue-500/30 border-blue-500/60 text-blue-100 hover:border-blue-400 hover:bg-blue-500/50 hover:text-white";
                        } else if (tier === "VIP") {
                          baseStyle = "bg-fuchsia-500/30 border-fuchsia-500/60 text-fuchsia-100 hover:border-fuchsia-400 hover:bg-fuchsia-500/50 hover:text-white shadow-[0_0_10px_rgba(217,70,239,0.1)]";
                        }

                        return (
                          <button
                            key={seat.id}
                            disabled={status === "booked" || status === "held"}
                            onClick={() => toggleSeat(seat.id)}
                            className={`relative flex h-8 w-8 items-center justify-center rounded-t-xl rounded-b-md border transition-all duration-200
                              ${
                                status === "booked"
                                  ? "bg-red-500/20 border-red-500/30 cursor-not-allowed opacity-60 text-red-500/40"
                                  : status === "held"
                                  ? "bg-orange-500/20 border-transparent cursor-not-allowed outline-dashed outline-1 outline-orange-500/30 text-orange-500/40 opacity-70"
                                  : status === "selected"
                                  ? "bg-gold border-gold text-black shadow-[0_0_15px_rgba(234,179,8,0.6)] scale-110 z-10"
                                  : baseStyle
                              }
                            `}
                          >
                            <span className={`text-[10px] font-mono ${status === "selected" ? "font-bold" : ""}`}>
                              {seat.column}
                            </span>
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
              {selectedSeatIds.length > 0 ? (
                <div className="mb-2 space-y-1">
                  {/* Group selected seats by tier to show breakdown */}
                  {["Normal", "Premium", "VIP"].map((tierType) => {
                     const tierSeats = selectedSeatIds.map(id => seats.find(s => s.id === id)!).filter(s => getSeatTier(s) === tierType);
                     if (tierSeats.length === 0) return null;
                     const tierPrice = tierSeats.length > 0 ? getSeatPrice(tierSeats[0]) : 0;
                     return (
                       <div key={tierType} className="flex justify-between text-muted-foreground text-xs">
                         <span>{tierSeats.length}x {tierType}</span>
                         <span>EGP {(tierSeats.length * tierPrice).toFixed(2)}</span>
                       </div>
                     );
                  })}
                </div>
              ) : (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tickets (0)</span>
                  <span>EGP 0.00</span>
                </div>
              )}

              {selectedSeatIds.length > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Fees</span>
                  <span>EGP {fees.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/5 pt-3 font-semibold text-white text-lg">
                <span>Total</span>
                <span className="text-gold">EGP {total.toFixed(2)}</span>
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
    </div>
  );
}
