import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  const isProtectedPath = ["/profile", "/bookings", "/admin", "/book", "/scanner"].some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`) ||
      routing.locales.some(
        (loc) =>
          pathname === `/${loc}${path}` ||
          pathname.startsWith(`/${loc}${path}/`)
      )
  );

  if (isProtectedPath && !token) {
    const localeMatch = pathname.match(/^\/([a-z]{2})/);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/",
    "/(ar|en)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)"
  ],
};