"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { validateBooking } from "@/lib/actions/scanner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Camera, RotateCcw, Keyboard, Ticket, MapPin, Clock, User as UserIcon } from "lucide-react";
import { format } from "date-fns";

export function QrScanner() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualId, setManualId] = useState("");
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleValidate = useCallback(async (bookingId: string) => {
    if (isValidating) return;
    setIsValidating(true);
    setError(null);
    setResult(null);

    try {
      const res = await validateBooking(bookingId.trim());
      if (res.success) {
        setResult(res.booking);
        toast.success("Ticket validated successfully!");
      } else {
        setError(res.error || "Invalid ticket.");
        toast.error(res.error || "Invalid ticket.");
      }
    } catch (err) {
      setError("Failed to validate. Try again.");
      toast.error("Validation failed.");
    } finally {
      setIsValidating(false);
    }
  }, [isValidating]);

  // Dynamically import html5-qrcode (client-only, avoids SSR issues)
  useEffect(() => {
    if (manualMode || result || error) return;

    let scanner: any = null;

    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner, Html5QrcodeScanType } = await import("html5-qrcode");

        if (!containerRef.current) return;

        scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            rememberLastUsedCamera: true,
          },
          false
        );

        scanner.render(
          (decodedText: string) => {
            // On successful scan
            scanner.clear().catch(() => {});
            handleValidate(decodedText);
          },
          () => {
            // Scan failure (ignore — it fires constantly while scanning)
          }
        );

        scannerRef.current = scanner;
        setScannerReady(true);
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
        setError("Camera access failed. Try manual input mode.");
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e: any) => console.error("Failed to clear scanner", e));
        scannerRef.current = null;
      }
    };
  }, [manualMode, result, error, handleValidate]);

  const resetScanner = () => {
    setResult(null);
    setError(null);
    setManualId("");
    setScannerReady(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      handleValidate(manualId.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      {!result && !error && (
        <div className="flex gap-2 justify-center">
          <Button
            variant={!manualMode ? "default" : "outline"}
            size="sm"
            className={!manualMode ? "bg-gold text-black hover:bg-gold-light" : "border-border"}
            onClick={() => { setManualMode(false); resetScanner(); }}
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera Scan
          </Button>
          <Button
            variant={manualMode ? "default" : "outline"}
            size="sm"
            className={manualMode ? "bg-gold text-black hover:bg-gold-light" : "border-border"}
            onClick={() => setManualMode(true)}
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Manual Input
          </Button>
        </div>
      )}

      {/* Loading */}
      {isValidating && (
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
          <p className="text-muted-foreground">Validating ticket...</p>
        </div>
      )}

      {/* Camera scanner */}
      {!manualMode && !result && !error && !isValidating && (
        <div ref={containerRef} className="rounded-xl overflow-hidden border border-border bg-muted/30">
          <div id="qr-reader" className="w-full" />
        </div>
      )}

      {/* Manual input */}
      {manualMode && !result && !error && !isValidating && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Enter Booking ID</label>
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="e.g. 661f2a3b4c5d6e7f8a9b0c1d"
              className="w-full rounded-lg border border-border bg-card/80 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 font-mono"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gold text-black hover:bg-gold-light font-semibold"
            disabled={!manualId.trim()}
          >
            Validate Ticket
          </Button>
        </form>
      )}

      {/* Error result */}
      {error && !isValidating && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-red-300">Invalid Ticket</h3>
          <p className="text-sm text-red-200/80">{error}</p>
          <Button onClick={resetScanner} variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/10">
            <RotateCcw className="h-4 w-4 mr-2" />
            Scan Again
          </Button>
        </div>
      )}

      {/* Success result */}
      {result && !isValidating && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 overflow-hidden">
          <div className="p-6 text-center border-b border-green-500/20">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-green-300">Valid Ticket ✓</h3>
          </div>
          <div className="p-6 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Ticket className="h-4 w-4 text-gold flex-shrink-0" />
              <div>
                <p className="text-foreground font-semibold">{result.movieTitle}</p>
                <p className="text-muted-foreground text-xs">{result.movieTitleAr}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gold flex-shrink-0" />
              <p className="text-foreground/80">{result.cinemaName} — {result.hallName}</p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gold flex-shrink-0" />
              <p className="text-foreground/80">{format(new Date(result.showtime), "EEEE, MMM d · h:mm a")}</p>
            </div>
            <div className="flex items-center gap-3">
              <UserIcon className="h-4 w-4 text-gold flex-shrink-0" />
              <p className="text-foreground/80">{result.customerName} ({result.customerEmail})</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seats</span>
                <span className="text-foreground font-mono">
                  {result.seats.map((s: any) => `${s.row}${s.column}`).join(", ")}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Tickets</span>
                <span className="text-foreground">{result.ticketCount}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Total</span>
                <span className="text-gold font-bold">EGP {result.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-green-500/20">
            <Button onClick={resetScanner} className="w-full bg-gold text-black hover:bg-gold-light font-semibold">
              <RotateCcw className="h-4 w-4 mr-2" />
              Scan Next Ticket
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
