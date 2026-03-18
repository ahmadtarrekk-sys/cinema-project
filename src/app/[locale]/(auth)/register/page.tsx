import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { RegisterForm } from "@/components/auth/register-form";
import { Film } from "lucide-react";

export default async function RegisterPage() {
  const t = await getTranslations("Auth");

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-auth">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.82_0.12_75/5%),transparent)]" />
      
      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <Link href="/" className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold backdrop-blur-md">
            <Film className="h-6 w-6" />
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {t("register_title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("register_subtitle")}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-cinema-surface/50 p-6 backdrop-blur-xl sm:p-8">
          <RegisterForm />
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t("has_account")}{" "}
          <Link href="/login" className="font-medium text-gold hover:underline">
            {t("login_link")}
          </Link>
        </div>
      </div>
    </div>
  );
}
