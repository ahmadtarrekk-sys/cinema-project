import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Ticket, Users, Film, LayoutDashboard, Banknote } from "lucide-react";
import { getDashboardAnalytics } from "@/lib/actions/analytics";
import { DailyRevenueChart } from "@/components/admin/charts/daily-revenue-chart";
import { MovieRevenueChart } from "@/components/admin/charts/movie-revenue-chart";
import { CinemaRevenueChart } from "@/components/admin/charts/cinema-revenue-chart";
import { CinemaRevenueDetails } from "@/components/admin/cinema-revenue-details";

export default async function AdminDashboardPage() {
  const session = await auth();
  
  // Basic static metrics
  const totalMovies = await prisma.movie.count();
  const totalUsers = await prisma.user.count();
  const totalCinemas = await prisma.cinema.count();

  // Advanced analytics
  const analyticsRes = await getDashboardAnalytics();
  const analytics = analyticsRes.data;



  // Render variables
  const formatCurrency = (val: number | undefined) => `$${(val || 0).toLocaleString()}`;
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-gold" />
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session?.user?.name}. Here's the performance across all terminals.
        </p>
      </div>

      {/* Top 4 Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-xl border border-white/5 bg-cinema-surface/50 p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="p-4 rounded-lg flex items-center justify-center bg-green-500/10">
            <Banknote className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{formatCurrency(analytics?.totalRevenue)}</div>
            <div className="text-sm text-muted-foreground font-medium">Total Revenue</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-cinema-surface/50 p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="p-4 rounded-lg flex items-center justify-center bg-blue-500/10">
            <Ticket className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{analytics?.totalTickets || 0}</div>
            <div className="text-sm text-muted-foreground font-medium">Tickets Sold</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-cinema-surface/50 p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="p-4 rounded-lg flex items-center justify-center bg-gold/10">
            <Film className="h-8 w-8 text-gold" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xl font-bold text-white truncate w-full" title={analytics?.mostPopularMovie?.title}>
              {analytics?.mostPopularMovie ? analytics.mostPopularMovie.title : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground font-medium">Most Popular Movie</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-cinema-surface/50 p-6 backdrop-blur-xl flex items-center gap-4">
          <div className="p-4 rounded-lg flex items-center justify-center bg-purple-500/10">
            <Users className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{totalUsers}</div>
            <div className="text-sm text-muted-foreground font-medium">Registered Users</div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Daily Revenue Trend */}
          <div className="col-span-1 lg:col-span-2 rounded-xl border border-white/5 bg-cinema-surface/50 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-2">14-Day Revenue Trend</h2>
            <DailyRevenueChart data={analytics.dailyRevenue} />
          </div>

          {/* Revenue by Movie */}
          <div className="rounded-xl border border-white/5 bg-cinema-surface/50 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-2">Revenue by Movie</h2>
            <p className="text-xs text-muted-foreground mb-4">Top 10 highest grossing films</p>
            <MovieRevenueChart data={analytics.revenuePerMovie} />
          </div>

          {/* Revenue by Cinema Location */}
          <div className="rounded-xl border border-white/5 bg-cinema-surface/50 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-2">Revenue by Location</h2>
            <p className="text-xs text-muted-foreground mb-4">Distribution across all cinemas</p>
            <CinemaRevenueChart data={analytics.revenuePerCinema} />
          </div>

        </div>
      )}

      {/* Detailed Cinema Breakdown */}
      {analytics && <CinemaRevenueDetails data={analytics.revenuePerCinema} />}
    </div>
  );
}
