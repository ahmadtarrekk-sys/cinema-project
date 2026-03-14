import { Film, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("Exceptions");
  const tNav = useTranslations("Navigation");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cinema-surface ring-1 ring-white/10">
            <Film className="h-10 w-10 text-gold/60" />
          </div>
          <div className="absolute -inset-4 -z-10 rounded-full bg-gold/5 blur-2xl" />
        </div>

        <div className="mb-2 font-display text-7xl font-bold text-gradient-gold sm:text-8xl">
          404
        </div>

        <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
          {t("404_title")}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("404_desc")}
        </p>

        <div className="mt-8 flex gap-3">
          <Link href="/">
            <Button
              variant="outline"
              className="gap-2 border-white/10 hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("back_home")}
            </Button>
          </Link>
          <Link href="/movies">
            <Button className="gap-2 bg-gold text-black hover:bg-gold-light font-semibold">
              {tNav("movies")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
