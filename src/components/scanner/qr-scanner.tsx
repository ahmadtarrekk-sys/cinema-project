"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { validateBooking } from "@/lib/actions/scanner";
import { CheckCircle, XCircle, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QrScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [manualInput, setManualInput] = useState("");

  const handleValidation = async (bookingId: string) => {
    if (!bookingId.trim()) return;
    
    setIsValidating(true);
    setValidationResult(null);
    setScanResult(bookingId);

    const result = await validateBooking(bookingId);
    setValidationResult(result);
    setIsValidating(false);
  };

  useEffect(() => {
    // Only initialize scanner if we haven't scanned successfully yet
    if (scanResult) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      scanner.clear(); // Stop scanning once we get a hit
      setScanResult(decodedText);
      handleValidation(decodedText);
    }

    function onScanFailure() {
      // ignore empty frames
    }

    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, [scanResult]);

  const resetScanner = () => {
    setScanResult(null);
    setValidationResult(null);
    setManualInput("");
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {!scanResult && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5 text-gold" />
            Scan Ticket QR
          </h2>
          {/* HTML5 QR Code Container */}
          <div id="reader" className="overflow-hidden rounded-xl bg-zinc-900 mx-auto max-w-[400px]"></div>
          
          {/* Manual Input Fallback */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-muted-foreground mb-3 text-center">Or enter booking ID manually:</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Booking ID..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                onKeyDown={(e) => e.key === "Enter" && handleValidation(manualInput)}
              />
              <Button onClick={() => handleValidation(manualInput)} disabled={!manualInput.trim()}>
                Verify
              </Button>
            </div>
          </div>
        </div>
      )}

      {isValidating && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-12 backdrop-blur-xl text-center flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gold mb-4" />
          <h3 className="text-xl font-medium text-white">Validating Ticket...</h3>
          <p className="text-muted-foreground mt-2 font-mono">{scanResult}</p>
        </div>
      )}

      {validationResult && !isValidating && (
        <div className={`rounded-2xl border p-8 backdrop-blur-xl text-center shadow-2xl relative overflow-hidden
          ${validationResult.success 
            ? 'border-green-500/30 bg-green-500/10' 
            : 'border-red-500/30 bg-red-500/10'}`}>
          
          <div className={`absolute top-0 left-0 w-full h-2 ${validationResult.success ? 'bg-green-500' : 'bg-red-500'}`} />
          
          <div className="flex justify-center mb-6">
            {validationResult.success ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>

          <h3 className="font-display text-3xl font-bold text-white mb-2">
            {validationResult.success ? "Ticket Valid!" : "Ticket Invalid"}
          </h3>

          {!validationResult.success ? (
            <p className="text-red-300 font-medium text-lg mt-4">{validationResult.error}</p>
          ) : (
            <div className="mt-6 text-left bg-black/40 rounded-xl p-5 border border-white/5 space-y-3">
               <div className="flex justify-between items-center border-b border-white/10 pb-3">
                 <span className="text-muted-foreground">Movie</span>
                 <span className="font-bold text-white">{validationResult.booking.showtime.movie.titleEn}</span>
               </div>
               <div className="flex justify-between items-center border-b border-white/10 pb-3">
                 <span className="text-muted-foreground">Location</span>
                 <span className="font-medium text-white">
                   {validationResult.booking.showtime.hall.cinema.nameEn} • {validationResult.booking.showtime.hall.nameEn}
                 </span>
               </div>
               <div className="flex justify-between items-center border-b border-white/10 pb-3">
                 <span className="text-muted-foreground">Customer</span>
                 <span className="font-medium text-white">{validationResult.booking.user.name}</span>
               </div>
               <div className="pt-2">
                 <div className="text-sm text-muted-foreground mb-2">Seats ({validationResult.booking.tickets.length})</div>
                 <div className="flex flex-wrap gap-2">
                   {validationResult.booking.tickets.map((t: any) => (
                      <span key={t.id} className="bg-gold/20 border border-gold/40 text-gold px-3 py-1 rounded-md text-lg font-bold">
                        {t.seat.row}{t.seat.column}
                      </span>
                   ))}
                 </div>
               </div>
            </div>
          )}

          <Button 
            className="mt-8 w-full bg-white/10 hover:bg-white/20 text-white font-semibold"
            onClick={resetScanner}
          >
            Scan Another Ticket
          </Button>
        </div>
      )}
    </div>
  );
}
