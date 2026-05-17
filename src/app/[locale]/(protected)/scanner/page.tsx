import { QrScanner } from "@/components/scanner/qr-scanner";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { QrCode } from "lucide-react";

export default async function ScannerPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }

  // Only Admin and Staff can use the scanner
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">You do not have permission to access the scanner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <QrCode className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Ticket Scanner</h1>
          <p className="text-sm text-muted-foreground">
            Scan a customer's QR code or enter a booking ID to validate their ticket.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl">
          <QrScanner />
        </div>
      </div>
    </div>
  );
}
