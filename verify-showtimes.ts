import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

const prisma = new PrismaClient();

async function verifyShowtimes() {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  console.log(`\n--- Fetching tomorrow's showtimes (${format(tomorrow, "yyyy-MM-dd")}) ---`);

  const showtimes = await prisma.showtime.findMany({
    where: {
      startTime: {
        gte: tomorrow,
        lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      }
    },
    include: {
      movie: true,
      hall: { include: { cinema: true } }
    },
    orderBy: [{ movie: { titleEn: 'asc' } }, { startTime: 'asc' }]
  });

  if (showtimes.length === 0) {
    console.log("No showtimes found!");
    return;
  }

  let currentMovie = "";
  let dailyCount = 0;

  for (const st of showtimes) {
    if (st.movie.titleEn !== currentMovie) {
      if (currentMovie !== "") {
         console.log(`  -> Total: ${dailyCount} showtimes`);
      }
      currentMovie = st.movie.titleEn;
      dailyCount = 0;
      console.log(`\nMovie: ${currentMovie}`);
    }
    
    dailyCount++;
    console.log(`  - ${format(st.startTime, "h:mm a")} | ${st.hall.cinema.nameEn} | ${st.hall.nameEn}`);
  }
  
  if (currentMovie !== "") {
     console.log(`  -> Total: ${dailyCount} showtimes`);
  }
}

verifyShowtimes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
