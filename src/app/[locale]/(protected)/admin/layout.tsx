import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { LayoutDashboard, Film, Clapperboard, MonitorPlay, Popcorn, Clock } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const t = await getTranslations("Navigation");

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/movies", label: "Movies", icon: Film },
    { href: "/admin/cinemas", label: "Cinemas", icon: Clapperboard },
    { href: "/admin/halls", label: "Halls", icon: MonitorPlay },
    { href: "/admin/showtimes", label: "Showtimes", icon: Clock },
    { href: "/admin/concessions", label: "Concessions", icon: Popcorn },
  ];

  return (
    <div className="flex min-h-screen pt-16">
      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 pt-16 border-r border-white/10 bg-black/50 backdrop-blur-xl hidden md:block z-40">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Admin Panel
          </h2>
          <nav className="space-y-1">
            {adminLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64">
        {children}
      </main>
    </div>
  );
}
