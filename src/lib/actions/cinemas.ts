"use server";

import { prisma } from "@/lib/prisma";

export async function getCinemas() {
  try {
    const cinemas = await prisma.cinema.findMany({
      include: {
        halls: { select: { id: true } }
      },
      orderBy: { nameEn: "asc" },
    });
    return { success: true, data: cinemas };
  } catch (error) {
    console.error("Error fetching cinemas:", error);
    return { success: false, error: "Failed to fetch cinemas" };
  }
}
