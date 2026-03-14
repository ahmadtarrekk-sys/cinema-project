import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { User, Mail, Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth();
  const t = await getTranslations("Navigation");

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("profile")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          View and manage your Lumière account details.
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-cinema-surface/50 p-6 backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gold/10 text-3xl font-bold text-gold ring-1 ring-gold/20">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{session.user.name}</h2>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {session.user.email}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/10">
                {session.user.role === "ADMIN" ? "Admin" : "Member"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {/* Quick Stats/Actions */}
          <div className="rounded-xl border border-white/5 bg-white/5 p-5">
            <h3 className="flex items-center gap-2 font-medium text-white">
              <Calendar className="h-4 w-4 text-gold" />
              Recent Bookings
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You have no active bookings at the moment.
            </p>
            <Button variant="outline" className="mt-4 w-full border-white/10 hover:bg-white/5" asChild>
              <a href="/movies">Browse Movies</a>
            </Button>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/5 p-5">
             <h3 className="flex items-center gap-2 font-medium text-white">
              <User className="h-4 w-4 text-gold" />
              Account Settings
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
               Update your personal details and password.
            </p>
             <Button variant="outline" className="mt-4 w-full border-white/10 hover:bg-white/5">
              Edit Profile (Coming Soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
