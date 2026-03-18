"use client";

import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyBookingIdButton({ bookingId }: { bookingId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(bookingId);
      } else {
        // Fallback for insecure contexts or unsupported browsers
        const textArea = document.createElement("textarea");
        textArea.value = bookingId;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (error) {
          console.error(error);
        } finally {
          textArea.remove();
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 ml-2 inline-flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/10"
      onClick={handleCopy}
      title="Copy full Booking ID"
    >
      {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
