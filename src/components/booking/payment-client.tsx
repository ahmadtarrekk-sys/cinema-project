"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import Image from "next/image"
import { format as formatDt } from "date-fns"
import { Calendar, Clock, MapPin, ShieldCheck, CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { Button } from "@/components/ui/button"

interface PaymentClientProps {
  booking: any
  isArabic: boolean
  stripeEnabled: boolean
}

export function PaymentClient({ booking, isArabic, stripeEnabled }: PaymentClientProps) {
  const router = useRouter()
  const { showtime, concessions } = booking
  const { movie, hall } = showtime
  const cinema = hall.cinema
  const [isProcessing, setIsProcessing] = useState(false);

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", // Defaults to sandbox "test" mode if missing
    currency: "USD", // Forcing USD since standard PayPal Sandbox doesn't natively spin up EGP balances by default
    intent: "capture",
  };

  const handleCancelPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments/paypal/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      
      if (data.success) {
        import("@/lib/socket").then(({ getSocket }) => {
          const socket = getSocket();
          if (data.releasedSeats && socket) {
            data.releasedSeats.forEach((seatId: string) => {
              socket.emit("releaseSeat", { showtimeId: data.showtimeId, seatId });
            });
          }
        });
        toast.info("Payment canceled. Seats released.");
        router.push(`/book/${showtime.id}`);
      } else {
        toast.error("Failed to cancel payment securely.");
      }
    } catch (err) {
      toast.error("Error canceling payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-border bg-card/80 overflow-hidden backdrop-blur-xl">
          {/* Movie Details */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 border-b border-border bg-foreground/5">
            <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border shadow-xl">
              <Image src={movie.posterUrl} alt={movie.titleEn} fill className="object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-xl font-bold text-foreground">
                {isArabic ? movie.titleAr : movie.titleEn}
              </h2>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  <span className="font-medium text-foreground/80">
                    {isArabic ? cinema.nameAr : cinema.nameEn}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{isArabic ? hall.nameAr : hall.nameEn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gold" />
                  <span>{formatDt(new Date(showtime.startTime), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gold" />
                  <span>{formatDt(new Date(showtime.startTime), "h:mm a")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">Payment Method</h3>
              <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                <ShieldCheck className="w-4 h-4" /> Secure checkout
              </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto py-4">
               {isProcessing && <div className="text-center text-sm py-4"><Loader2 className="mx-auto w-8 h-8 animate-spin" /><br/>Loading secure environment...</div>}
               
               <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                  createOrder={async (data, actions) => {
                    try {
                      const res = await fetch("/api/payments/paypal/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ bookingId: booking.id })
                      });
                      const orderData = await res.json();
                      
                      if (orderData.orderID) {
                        return orderData.orderID;
                      } else if (orderData.mockFallback) {
                        // Backend detected no API keys, seamlessly fall back to local client processing for demo purposes
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{
                            amount: { value: booking.totalAmount.toFixed(2).toString(), currency_code: "USD" }
                          }]
                        });
                      } else {
                        const errorDetail = orderData?.details?.[0];
                        const errorMessage = errorDetail ? `${errorDetail.issue} ${errorDetail.description}` : (orderData.error || "Failed to initialize PayPal.");
                        toast.error(`PayPal Issue: ${errorMessage}`);
                        throw new Error(errorMessage);
                      }
                    } catch (err: any) {
                      toast.error(`PayPal Error: ${err.message}`);
                      throw err;
                    }
                  }}
                  onApprove={async (data, actions) => {
                    const res = await fetch("/api/payments/paypal/capture-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ bookingId: booking.id, orderID: data.orderID })
                    });
                    
                    const captureData = await res.json();
                    
                    if (captureData.success) {
                      import("@/lib/socket").then(({ getSocket }) => {
                        const socket = getSocket();
                        const seatIds = booking.tickets?.map((t: any) => t.seatId) || [];
                        if (socket) {
                          socket.emit("seatsBooked", { showtimeId: booking.showtimeId, seatIds });
                        }
                      });

                      toast.success("Payment completed successfully!");
                      router.refresh(); // Clear client-side router cache to reset booking state
                      router.push(`/book/${showtime.id}/payment/${booking.id}/success`);
                    } else {
                      toast.error("Failed to capture payment cleanly.");
                    }
                  }}
                  onCancel={() => {
                     handleCancelPayment();
                  }}
                  onError={(err) => {
                     console.error("PayPal Error:", err);
                     toast.error("PayPal encountered an error processing your request.");
                  }}
                  style={{ layout: "vertical", shape: "rect", color: "gold" }}
                />
              </PayPalScriptProvider>
            </div>
            
            <p className="mt-8 text-center text-xs text-muted-foreground">
              By completing this purchase, you agree to our Terms of Service. Tickets are non-refundable.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-foreground mb-6">Final Summary</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex justify-between border-b border-border pb-4">
              <span>Total Amount</span>
              <span className="text-3xl font-bold text-gold">USD {booking.totalAmount.toFixed(2)}</span>
            </div>
            {concessions.length > 0 && (
              <div className="text-xs">
                 Includes {concessions.map((c: any) => c.quantity).reduce((a:number,b:number)=>a+b,0)} concession items.
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-4 space-y-4 text-center">
            <Button variant="ghost" onClick={handleCancelPayment} disabled={isProcessing} className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10">
              Cancel Order
            </Button>
            <p className="text-xs text-muted-foreground/60 w-full text-center">Your seats are temporarily locked. Exiting will cancel the reservation.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
