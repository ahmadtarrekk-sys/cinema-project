"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/routing"
import { Plus, Minus, Loader2, Popcorn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { addConcessionsToBooking } from "@/lib/actions/concessions"

interface ConcessionsClientProps {
  items: any[]
  bookingId: string
  showtimeId: string
  isArabic: boolean
  baseTotal: number
}

export function ConcessionsClient({
  items,
  bookingId,
  showtimeId,
  isArabic,
  baseTotal,
}: ConcessionsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[itemId] || 0
      const next = Math.max(0, current + delta)
      return { ...prev, [itemId]: next }
    })
  }

  const concessionsTotal = items.reduce((total, item) => {
    const qty = quantities[item.id] || 0
    return total + (item.price * qty)
  }, 0)

  const finalTotal = baseTotal + concessionsTotal

  const handleCompleteBooking = async () => {
    startTransition(async () => {
      const selectedItems = items
        .filter(item => (quantities[item.id] || 0) > 0)
        .map(item => ({
          concessionItemId: item.id,
          quantity: quantities[item.id],
          subtotal: item.price * quantities[item.id]
        }))

      const res = await addConcessionsToBooking({
        bookingId,
        items: selectedItems,
        concessionsTotal
      })

      if (res.success) {
        toast.success("Concessions added. Proceeding to payment...")
        router.push(`/book/${showtimeId}/payment/${bookingId}`)
      } else {
        toast.error(res.error || "Failed to complete booking.")
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const qty = quantities[item.id] || 0
            const name = isArabic ? item.nameAr : item.nameEn
            const desc = isArabic ? item.descriptionAr : item.descriptionEn

            return (
              <div key={item.id} className="flex flex-col rounded-xl border border-border bg-card/80 overflow-hidden backdrop-blur-xl transition hover:border-gold/30">
                <div className="relative h-40 w-full bg-muted border-b border-border">
                  {item.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.imageUrl}
                      alt={name}
                      className="h-full w-full object-cover opacity-80"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Popcorn className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-bold text-foreground text-lg">{name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{desc}</p>
                  
                  <div className="mt-4 flex flex-1 items-end justify-between">
                    <span className="font-semibold text-gold">EGP {item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-border text-foreground hover:bg-foreground/10"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        disabled={qty === 0}
                      >
                         <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-4 text-center text-sm font-medium">{qty}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-border text-foreground hover:bg-foreground/10"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                      >
                         <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-foreground mb-6">Order Summary</h3>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Tickets & Fees</span>
              <span className="text-foreground">EGP {baseTotal.toFixed(2)}</span>
            </div>
            
            {items.filter(item => (quantities[item.id] || 0) > 0).length > 0 && (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="font-medium text-foreground/80">Concessions</p>
                {items.map(item => {
                  const qty = quantities[item.id] || 0
                  if (qty === 0) return null
                  return (
                    <div key={item.id} className="flex justify-between text-xs">
                      <span>{qty}x {isArabic ? item.nameAr : item.nameEn}</span>
                      <span>EGP {(item.price * qty).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div className="flex justify-between border-t border-border pt-4 font-bold text-lg text-foreground">
              <span>Final Total</span>
              <span className="text-gold">EGP {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button 
            className="mt-6 w-full bg-gold py-6 text-base font-semibold text-black hover:bg-gold-light transition-colors"
            onClick={handleCompleteBooking}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  )
}
