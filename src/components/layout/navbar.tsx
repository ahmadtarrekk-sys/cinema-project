"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Ticket,
  Popcorn,
  User,
  LogOut,
  LayoutDashboard,
  MessageCircle,
  Clapperboard,
  QrCode,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/locale-switcher";

export function Navbar() {
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on auth pages
  const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (authPaths.some((p) => pathname.startsWith(p))) return null;

  const navLinks = [
    { href: "/cinemas", label: t("cinemas"), icon: Clapperboard },
    { href: "/movies", label: t("movies"), icon: Ticket },
    { href: "/chat", label: t("recommend"), icon: MessageCircle },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "glass-strong shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Logo />

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gold/10 text-gold hover:bg-gold/15 hover:text-gold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <LocaleSwitcher />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-2 text-sm" })}>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-gold/15 text-xs font-semibold text-gold">
                      {getInitials(user.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-foreground sm:inline">
                    {user.name}
                  </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 glass-strong border-border"
              >
                <Link href="/profile">
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    {t("profile")}
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile">
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Ticket className="h-4 w-4" />
                    {t("bookings")}
                  </DropdownMenuItem>
                </Link>
                {(user.role === "ADMIN" || user.role === "STAFF") && (
                  <>
                    <DropdownMenuSeparator />
                    <Link href="/scanner">
                      <DropdownMenuItem className="gap-2 cursor-pointer text-gold hover:text-gold-light focus:text-gold-light">
                        <QrCode className="h-4 w-4" />
                        Scanner
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                {user.role === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator />
                    <Link href="/admin">
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" />
                        {t("admin")}
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 text-destructive cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  {t("signout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("signin")}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gold text-black hover:bg-gold-light text-sm font-semibold">
                  {t("register")}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-9 w-9 md:hidden" })}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 glass-strong border-border p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border px-4 py-4">
                  <Logo />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-3 text-sm ${
                            isActive
                              ? "bg-gold/10 text-gold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
                {user ? (
                  <div className="border-t border-border p-4 flex flex-col gap-1">
                    <Link href="/profile" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3 text-sm text-muted-foreground hover:text-foreground">
                        <User className="h-4 w-4" />
                        {t("profile")}
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3 text-sm text-muted-foreground hover:text-foreground">
                        <Ticket className="h-4 w-4" />
                        {t("bookings")}
                      </Button>
                    </Link>
                    {(user.role === "ADMIN" || user.role === "STAFF") && (
                      <Link href="/scanner" onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-sm text-gold hover:text-gold-light hover:bg-gold/10">
                          <QrCode className="h-4 w-4" />
                          Scanner
                        </Button>
                      </Link>
                    )}
                    {user.role === "ADMIN" && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-sm text-muted-foreground hover:text-foreground">
                          <LayoutDashboard className="h-4 w-4" />
                          {t("admin")}
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full text-sm text-destructive justify-start gap-3 hover:text-destructive hover:bg-destructive/10 mt-2"
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      {t("signout")}
                    </Button>
                  </div>
                ) : (
                  <div className="border-t border-border p-4">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="mb-2 w-full text-sm">
                        {t("signin")}
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-gold text-black hover:bg-gold-light text-sm font-semibold">
                        {t("register")}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
