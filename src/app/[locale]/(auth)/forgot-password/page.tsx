import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Film, ArrowLeft } from "lucide-react";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("Auth");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.82_0.12_75/5%),transparent)]" />
      
      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <Link href="/" className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold backdrop-blur-md">
            <Film className="h-6 w-6" />
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl sm:p-8">
          <ForgotPasswordForm />
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="flex items-center justify-center gap-1 font-medium hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
