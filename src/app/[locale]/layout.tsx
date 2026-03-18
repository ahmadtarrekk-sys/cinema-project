import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import type { Metadata } from "next";
import { fontDisplay, fontSans, fontMono, fontArabic } from "@/lib/fonts";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { SessionProvider } from "@/components/auth/session-provider";
import { FloatingChat } from "@/components/chat/floating-chat";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Aurora Cinema — Premium Movie Booking",
    template: "%s | Aurora Cinema",
  },
  description:
    "Discover movies, reserve the perfect seats, and enjoy a world-class cinema experience. Aurora — your premium movie booking platform.",
  keywords: ["cinema", "movies", "booking", "tickets", "showtimes"],
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client side
  const messages = await getMessages();
  
  const isArabic = locale === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className="dark"
      suppressHydrationWarning
    >
      <body
        className={`${isArabic ? fontArabic.variable : fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} ${isArabic ? 'font-arabic' : 'font-sans'} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <Providers>
              <div className="relative flex min-h-screen flex-col cinema-grain">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <FloatingChat />
              </div>
            </Providers>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
