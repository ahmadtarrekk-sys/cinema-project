"use server";

import { prisma } from "@/lib/prisma";

export async function getMovies(query?: string, genre?: string) {
  try {
    const movies = await prisma.movie.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { titleEn: { contains: query, mode: "insensitive" } },
                  { titleAr: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          genre && genre !== "all" ? { genre: { equals: genre } } : {},
        ],
      },
      orderBy: { releaseDate: "desc" },
    });
    return { success: true, data: movies };
  } catch (error) {
    console.error("Error fetching movies:", error);
    return { success: false, error: "Failed to fetch movies" };
  }
}

export async function getMovieById(id: string) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        showtimes: {
          where: { startTime: { gte: new Date() } },
          orderBy: { startTime: "asc" },
          include: { hall: { include: { cinema: true } } },
        },
      },
    });
    if (!movie) return { success: false, error: "Movie not found" };
    return { success: true, data: movie };
  } catch (error) {
    console.error("Error fetching movie:", error);
    return { success: false, error: "Failed to fetch movie details" };
  }
}
