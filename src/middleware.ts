import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect paths: /profile, /bookings, /admin, /book (regardless of locale)
  const isProtectedPath = ["/profile", "/bookings", "/admin", "/book"].some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`) ||
      routing.locales.some(
        (loc) =>
          pathname === `/${loc}${path}` ||
          pathname.startsWith(`/${loc}${path}/`)
      )
  );

  if (isProtectedPath && !req.auth) {
    // If not authenticated, redirect to login with the correct locale
    const localeMatch = pathname.match(/^\/([a-z]{2})/);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, req.url);
    return Response.redirect(loginUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(ar|en)/:path*"],
};
