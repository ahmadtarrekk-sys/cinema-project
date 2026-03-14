import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Film } from "lucide-react";

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Navigation");

  const footerLinks = [
    {
      title: t("explore"),
      links: [
        { label: tNav("cinemas"), href: "/cinemas" },
        { label: tNav("movies"), href: "/movies" },
        { label: tNav("recommend"), href: "/chat" },
      ],
    },
    {
      title: t("account"),
      links: [
        { label: tNav("signin"), href: "/login" },
        { label: tNav("register"), href: "/register" },
        { label: tNav("bookings"), href: "/bookings" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/5 bg-cinema-bg">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
                <Film className="h-4 w-4 text-gold" />
              </div>
              <span className="font-display text-lg font-semibold text-gradient-gold">
                LUMIÈRE
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t("brand_desc")}
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("rights")}
          </p>
          <p className="text-xs text-muted-foreground/50">
            {t("crafted")}
          </p>
        </div>
      </div>
    </footer>
  );
}
