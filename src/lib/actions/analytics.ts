"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardAnalytics() {
  try {
    const confirmedBookings = await prisma.booking.findMany({
      where: { status: "CONFIRMED" },
      include: {
        tickets: true,
        showtime: {
          include: {
            movie: true,
            hall: {
              include: { cinema: true }
            }
          }
        }
      }
    });

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTickets = confirmedBookings.reduce((sum, b) => sum + b.tickets.length, 0);

    const movieMap = new Map<string, { title: string; revenue: number; bookings: number }>();
    const cinemaMap = new Map<string, { id: string; name: string; revenue: number; movies: Map<string, { title: string; revenue: number }> }>();
    const dailyMap = new Map<string, number>();

    // Pre-fill daily map for the last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailyMap.set(dateStr, 0);
    }

    confirmedBookings.forEach((b) => {
      // Movie aggregation
      const movie = b.showtime.movie;
      const m = movieMap.get(movie.id) || { title: movie.titleEn, revenue: 0, bookings: 0 };
      m.revenue += b.totalAmount;
      m.bookings += 1;
      movieMap.set(movie.id, m);

      // Cinema aggregation
      const cinema = b.showtime.hall.cinema;
      const c = cinemaMap.get(cinema.id) || { id: cinema.id, name: cinema.nameEn, revenue: 0, movies: new Map() };
      c.revenue += b.totalAmount;
      
      const cm = c.movies.get(movie.id) || { title: movie.titleEn, revenue: 0 };
      cm.revenue += b.totalAmount;
      c.movies.set(movie.id, cm);
      
      cinemaMap.set(cinema.id, c);

      // Daily aggregation
      const dateKey = b.createdAt.toISOString().split("T")[0];
      if (dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, dailyMap.get(dateKey)! + b.totalAmount);
      }
    });

    const revenuePerMovie = Array.from(movieMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 movies

    const mostPopularMovie = Array.from(movieMap.values())
      .sort((a, b) => b.bookings - a.bookings)[0] || null;

    const revenuePerCinema = Array.from(cinemaMap.values())
      .map(c => ({ 
        id: c.id,
        name: c.name, 
        value: c.revenue,
        movies: Array.from(c.movies.values()).sort((a, b) => b.revenue - a.revenue)
      }))
      .sort((a, b) => b.value - a.value);

    // Format for charting
    const dailyRevenue = Array.from(dailyMap.entries()).map(([date, revenue]) => {
      const d = new Date(date);
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`, // short format like "4/9"
        revenue
      };
    });

    return {
      success: true,
      data: {
        totalRevenue,
        totalTickets,
        mostPopularMovie,
        revenuePerMovie,
        revenuePerCinema,
        dailyRevenue
      }
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return { success: false, data: null };
  }
}
