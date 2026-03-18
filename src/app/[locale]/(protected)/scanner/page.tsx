import { QrScanner } from "@/components/scanner/qr-scanner";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default async function ScannerPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Only Admin and Staff can use the scanner
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to access the scanner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-profile bg-blend-overlay bg-background/80 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-background/60 pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white drop-shadow-lg mb-4">
          Ticket Validation
        </h1>
        <p className="text-lg text-white/70">
          Staff Portal to verify Aurora Cinema bookings
        </p>
      </div>
      
      <div className="relative z-10">
        <QrScanner />
      </div>
    </div>
  );
}
