import { Link } from "@/i18n/routing";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage({ params }: { params: { showtimeId: string, bookingId: string } }) {
  // We can safely grab it synchronously here as it's params properties, but best practice is awaiting.
  // We'll just construct the back URL.
  
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.82_0.12_75/5%),transparent)]" />
      
      <div className="relative w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-2">
          Payment Cancelled
        </h1>
        <p className="text-muted-foreground mb-8">
          The checkout process was aborted. No charges were made.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto border-border">
              Return Home
            </Button>
          </Link>
          <Link href="/movies">
             <Button className="w-full sm:w-auto bg-gold text-black hover:bg-gold-light font-semibold">
              Browse Movies
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
