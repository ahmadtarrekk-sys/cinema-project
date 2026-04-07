"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import Image from "next/image"
import { format as formatDt } from "date-fns"
import { Calendar, Clock, MapPin, CreditCard, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { processPaymentMock, createStripeCheckoutSession } from "@/lib/actions/payments"

interface PaymentClientProps {
  booking: any
  isArabic: boolean
  stripeEnabled: boolean
}

export function PaymentClient({ booking, isArabic, stripeEnabled }: PaymentClientProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardData, setCardData] = useState({ name: "", number: "", expiry: "", cvc: "" })

  const { showtime, concessions } = booking
  const { movie, hall } = showtime
  const cinema = hall.cinema

  const isFormValid = cardData.name.length > 3 && cardData.number.length >= 15 && cardData.expiry.length >= 4 && cardData.cvc.length >= 3

  const handlePayment = async () => {
    if (!stripeEnabled && !isFormValid) {
      toast.error("Please fill in valid card details.")
      return
    }

    setIsProcessing(true)
    try {
      if (stripeEnabled) {
        // Stripe flow - redirects to secure checkout
        const res = await createStripeCheckoutSession(booking.id)
        if (res.success && res.url) {
          window.location.href = res.url
        } else {
          toast.error(res.error || "Failed to initialize checkout.")
          setIsProcessing(false)
        }
      } else {
        // Mock flow
        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const res = await processPaymentMock(booking.id)
        if (res.success) {
          toast.success("Payment successful! Seats confirmed.")
          
          // Emit booked seats to update all other clients instantly
          import("@/lib/socket").then(({ getSocket }) => {
            if (booking.tickets) {
              const seatIds = booking.tickets.map((t: any) => t.seatId);
              getSocket().emit("seatsBooked", { showtimeId: showtime.id, seatIds });
            }
          });

          router.push(`/book/${showtime.id}/payment/${booking.id}/success`)
        } else {
          toast.error(res.error || "Failed to process payment.")
          setIsProcessing(false)
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-cinema-surface/50 overflow-hidden backdrop-blur-xl">
          {/* Movie Details */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 border-b border-white/10 bg-white/5">
            <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md border border-white/10 shadow-xl">
              <Image src={movie.posterUrl} alt={movie.titleEn} fill className="object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-xl font-bold text-white">
                {isArabic ? movie.titleAr : movie.titleEn}
              </h2>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  <span className="font-medium text-white/80">
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
              <h3 className="text-lg font-bold text-white">Payment Details</h3>
              <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                <ShieldCheck className="w-4 h-4" /> Secure 256-bit Encryption
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="name">Cardholder Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Ahmed Tarek" 
                  className="bg-black/20 border-white/10 focus-visible:border-gold focus-visible:ring-gold/20"
                  value={cardData.name}
                  onChange={(e) => setCardData({...cardData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cc">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="cc" 
                    placeholder="0000 0000 0000 0000" 
                    className="pl-9 bg-black/20 border-white/10 focus-visible:border-gold focus-visible:ring-gold/20 font-mono tracking-widest"
                    maxLength={19}
                    value={cardData.number}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim();
                      setCardData({...cardData, number: val})
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input 
                    id="expiry" 
                    placeholder="MM/YY" 
                    className="bg-black/20 border-white/10 focus-visible:border-gold focus-visible:ring-gold/20 text-center font-mono"
                    maxLength={5}
                    value={cardData.expiry}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      const formatted = val.length > 2 ? `${val.substring(0, 2)}/${val.substring(2, 4)}` : val;
                      setCardData({...cardData, expiry: formatted})
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input 
                    id="cvv" 
                    type="password"
                    placeholder="•••" 
                    className="bg-black/20 border-white/10 focus-visible:border-gold focus-visible:ring-gold/20 text-center font-mono tracking-widest"
                    maxLength={4}
                    value={cardData.cvc}
                    onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '')})}
                  />
                </div>
              </div>
            </div>
            
            {stripeEnabled && (
              <p className="mt-6 text-sm text-muted-foreground bg-white/5 p-4 rounded-lg border border-white/5">
                <strong>Note:</strong> Since Stripe checkout is enabled in your environment, clicking pay will safely redirect you to Stripe&apos;s hosted gateway for ultimate security, bypassing this local mock form.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-white/10 bg-cinema-surface/50 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-6">Final Summary</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex justify-between border-b border-white/10 pb-4">
              <span>Total Amount</span>
              <span className="text-3xl font-bold text-gold">EGP {booking.totalAmount.toFixed(2)}</span>
            </div>
            {concessions.length > 0 && (
              <div className="text-xs">
                 Includes {concessions.map((c: any) => c.quantity).reduce((a:number,b:number)=>a+b,0)} concession items.
              </div>
            )}
          </div>

          <Button 
            className="mt-8 w-full bg-gold py-6 text-base font-semibold text-black hover:bg-gold-light transition-colors"
            onClick={handlePayment}
            disabled={isProcessing || (!stripeEnabled && !isFormValid)}
          >
            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isProcessing ? "Processing..." : `Pay EGP ${booking.totalAmount.toFixed(2)}`}
          </Button>
          {!stripeEnabled && (
            <p className="mt-3 text-center text-xs text-muted-foreground/50">
               Test mode enabled. Use any card details.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
