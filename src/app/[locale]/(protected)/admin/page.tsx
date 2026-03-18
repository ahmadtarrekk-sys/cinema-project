import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Ticket, Users, Film, LayoutDashboard } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  
  // Quick stats
  const totalMovies = await prisma.movie.count();
  const totalBookings = await prisma.booking.count();
  const totalUsers = await prisma.user.count();

  const stats = [
    { label: "Total Movies", value: totalMovies, icon: Film, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Bookings", value: totalBookings, icon: Ticket, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Total Cinemas", value: await prisma.cinema.count(), icon: LayoutDashboard, color: "text-gold", bg: "bg-gold/10" },
    { label: "Total Showtimes", value: await prisma.showtime.count(), icon: Film, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-gold" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session?.user?.name}. Here's an overview of Lumière.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-cinema-surface/50 p-6 backdrop-blur-xl flex items-center gap-4">
            <div className={`p-4 rounded-lg flex items-center justify-center ${stat.bg}`}>
               <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
