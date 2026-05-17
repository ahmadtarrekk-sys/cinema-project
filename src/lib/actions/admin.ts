"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Utility to check admin role
async function ensureAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

// ----------------------------------------------------
// Movies CRUD
// ----------------------------------------------------
export async function deleteMovie(id: string) {
  try {
    await ensureAdmin();
    await prisma.movie.delete({ where: { id } });
    revalidatePath("/admin/movies");
    revalidatePath("/movies");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createOrUpdateMovie(data: any) {
  try {
    await ensureAdmin();
    // Assuming data contains id if updating, otherwise it's a creation
    const { id, ...movieData } = data;
    
    // Convert duration to int if coming as string
    if (typeof movieData.durationMin === 'string') {
        movieData.durationMin = parseInt(movieData.durationMin, 10);
    }
    // Need a valid Date for releaseDate
    if (movieData.releaseDate && typeof movieData.releaseDate === 'string') {
        movieData.releaseDate = new Date(movieData.releaseDate);
    }

    if (id) {
      await prisma.movie.update({ where: { id }, data: movieData });
    } else {
      await prisma.movie.create({ data: movieData });
    }
    
    revalidatePath("/admin/movies");
    revalidatePath("/movies");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// Cinemas CRUD
// ----------------------------------------------------
export async function deleteCinema(id: string) {
  try {
    await ensureAdmin();
    await prisma.cinema.delete({ where: { id } });
    revalidatePath("/admin/cinemas");
    revalidatePath("/cinemas");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createOrUpdateCinema(data: any) {
  try {
    await ensureAdmin();
    const { id, ...cinemaData } = data;
    
    // Sanitize imageUrl
    if (!cinemaData.imageUrl || cinemaData.imageUrl.trim() === '') {
      cinemaData.imageUrl = null;
    } else {
      cinemaData.imageUrl = cinemaData.imageUrl.trim();
    }
    
    if (id) {
      await prisma.cinema.update({ where: { id }, data: cinemaData });
    } else {
      await prisma.cinema.create({ data: cinemaData });
    }
    
    revalidatePath("/admin/cinemas");
    revalidatePath("/cinemas");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// Halls CRUD
// ----------------------------------------------------
export async function deleteHall(id: string) {
  try {
    await ensureAdmin();
    await prisma.hall.delete({ where: { id } });
    revalidatePath("/admin/halls");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createOrUpdateHall(data: any) {
  try {
    await ensureAdmin();
    const { id, ...hallData } = data;
    
    if (typeof hallData.capacity === 'string') {
        hallData.capacity = parseInt(hallData.capacity, 10);
    }
    
    if (id) {
      await prisma.hall.update({ where: { id }, data: hallData });
    } else {
      const newHall = await prisma.hall.create({ data: hallData });
      
      // Auto-generate 10 rows of seats (A-J) for the new hall
      const seatRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const seatsPerRow = 16;
      const seatsData = [];
      
      for (const row of seatRows) {
        for (let col = 1; col <= seatsPerRow; col++) {
          let type = "STANDARD";
          const rowIndex = seatRows.indexOf(row);
          if (rowIndex < 3) {
            type = "VIP";
          } else if (rowIndex >= 3 && rowIndex < 5) {
            type = "PREMIUM";
          } else if (row === 'J' && (col <= 2 || col >= seatsPerRow - 1)) {
            type = "WHEELCHAIR";
          }
          
          seatsData.push({
            hallId: newHall.id,
            row,
            column: col,
            type: type as any
          });
        }
      }
      
      await prisma.seat.createMany({ data: seatsData });
    }
    
    revalidatePath("/admin/halls");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// Showtimes CRUD
// ----------------------------------------------------
export async function deleteShowtime(id: string) {
  try {
    await ensureAdmin();
    await prisma.showtime.delete({ where: { id } });
    revalidatePath("/admin/showtimes");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createOrUpdateShowtime(data: any) {
  try {
    await ensureAdmin();
    const { id, ...showtimeData } = data;
    
    if (typeof showtimeData.basePrice === 'string') {
        showtimeData.basePrice = parseFloat(showtimeData.basePrice);
    }
    if (showtimeData.startTime && typeof showtimeData.startTime === 'string') {
        showtimeData.startTime = new Date(showtimeData.startTime);
    }
    
    if (id) {
      await prisma.showtime.update({ where: { id }, data: showtimeData });
    } else {
      await prisma.showtime.create({ data: showtimeData });
    }
    
    revalidatePath("/admin/showtimes");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// Concessions CRUD
// ----------------------------------------------------
export async function deleteConcession(id: string) {
  try {
    await ensureAdmin();
    await prisma.concessionItem.delete({ where: { id } });
    revalidatePath("/admin/concessions");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createOrUpdateConcession(data: any) {
  try {
    await ensureAdmin();
    const { id, ...concessionData } = data;
    
    // Ensure price is a valid number
    if (typeof concessionData.price === 'string') {
      concessionData.price = parseFloat(concessionData.price);
    }
    if (isNaN(concessionData.price) || concessionData.price <= 0) {
      return { success: false, error: "Invalid price value." };
    }
    
    // Sanitize imageUrl — store null instead of empty string for optional field
    if (!concessionData.imageUrl || concessionData.imageUrl.trim() === '') {
      concessionData.imageUrl = null;
    } else {
      concessionData.imageUrl = concessionData.imageUrl.trim();
    }
    
    if (id) {
      await prisma.concessionItem.update({ where: { id }, data: concessionData });
    } else {
      await prisma.concessionItem.create({ data: concessionData });
    }
    
    revalidatePath("/admin/concessions");
    return { success: true };
  } catch (err: any) {
    console.error("createOrUpdateConcession error:", err);
    return { success: false, error: err.message };
  }
}

