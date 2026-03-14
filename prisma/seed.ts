import { PrismaClient, Role, HallType, SeatType, ConcessionCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');

  // Truncate tables (depends on RDBMS, for Postgres with cascade it's complex, so we delete from bottom up or just delete all)
  await prisma.payment.deleteMany();
  await prisma.bookingConcession.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.cinema.deleteMany();
  await prisma.concessionItem.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Users...');

  // We'll create user accounts in Patch 2 (Auth) with hashed passwords. 
  // For now, let's create a basic Admin and normal User.
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@cinema.local',
      role: Role.ADMIN,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@cinema.local',
      role: Role.USER,
    },
  });

  console.log('Seeding Cinemas and Halls...');

  const cinema1 = await prisma.cinema.create({
    data: {
      nameEn: 'Grand Cinema Downtown',
      nameAr: 'جراند سينما وسط البلد',
      location: 'Downtown Boulevard, City Center',
      contact: '+123456789',
      halls: {
        create: [
          {
            nameEn: 'Hall 1 (Standard)',
            nameAr: 'القاعة ١ (عادية)',
            type: HallType.STANDARD,
            capacity: 50,
          },
          {
            nameEn: 'Hall 2 (IMAX)',
            nameAr: 'القاعة ٢ (آيماكس)',
            type: HallType.IMAX,
            capacity: 80,
          }
        ]
      }
    },
    include: {
      halls: true,
    }
  });

  const cinema2 = await prisma.cinema.create({
    data: {
      nameEn: 'Starlight Mall Cinema',
      nameAr: 'سينما ستارلايت مول',
      location: 'Starlight Mall, West Side',
      contact: '+987654321',
      halls: {
        create: [
          {
            nameEn: 'VIP Lounge',
            nameAr: 'صالة كبار الشخصيات',
            type: HallType.VIP,
            capacity: 30,
          }
        ]
      }
    },
    include: {
      halls: true,
    }
  });

  console.log('Seeding Seats...');
  const halls = [...cinema1.halls, ...cinema2.halls];

  for (const hall of halls) {
    const seatRows = hall.type === HallType.VIP ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = hall.type === HallType.VIP ? 10 : 16; // adjust later based on exact capacity

    const seatsData = [];
    for (const row of seatRows) {
      for (let col = 1; col <= seatsPerRow; col++) {
        let type = SeatType.STANDARD;
        if (hall.type === HallType.VIP) {
          type = SeatType.VIP;
        } else if (row === seatRows[seatRows.length - 1] && (col <= 2 || col >= seatsPerRow - 1)) {
          // make last row edges wheelchair accessible
          type = SeatType.WHEELCHAIR;
        } else if (row === 'D') {
          type = SeatType.VIP; // Premium row in standard halls
        }

        seatsData.push({
          hallId: hall.id,
          row,
          column: col,
          type
        });
      }
    }

    await prisma.seat.createMany({
      data: seatsData,
    });
  }

  console.log('Seeding Movies...');
  const movie1 = await prisma.movie.create({
    data: {
      titleEn: 'Dune: Part Two',
      titleAr: 'كثيب: الجزء الثاني',
      descriptionEn: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
      descriptionAr: 'يتحد بول أتريدس مع تشاني والفريمن في مسار انتقام ضد المتآمرين الذين دمروا عائلته.',
      durationMin: 166,
      genre: 'Sci-Fi / Adventure',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1000',
      rating: 'PG-13',
      releaseDate: new Date('2024-03-01'),
    }
  });

  const movie2 = await prisma.movie.create({
    data: {
      titleEn: 'Oppenheimer',
      titleAr: 'أوبنهايمر',
      descriptionEn: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
      descriptionAr: 'قصة العالم الأمريكي ج. روبرت أوبنهايمر ودوره في تطوير القنبلة الذرية.',
      durationMin: 180,
      genre: 'Biography / Drama',
      posterUrl: 'https://images.unsplash.com/photo-1440051163481-9b19dfafade9?auto=format&fit=crop&q=80&w=1000',
      rating: 'R',
      releaseDate: new Date('2023-07-21'),
    }
  });

  console.log('Seeding Showtimes...');
  const now = new Date();

  await prisma.showtime.createMany({
    data: [
      {
        movieId: movie1.id,
        hallId: cinema1.halls[0].id,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 19, 0, 0),
        basePrice: 15.0,
      },
      {
        movieId: movie1.id,
        hallId: cinema1.halls[1].id, // IMAX
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 21, 0, 0),
        basePrice: 20.0,
      },
      {
        movieId: movie2.id,
        hallId: cinema2.halls[0].id, // VIP
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 20, 0, 0),
        basePrice: 30.0,
      }
    ]
  });

  console.log('Seeding Concessions...');
  await prisma.concessionItem.createMany({
    data: [
      {
        nameEn: 'Large Popcorn',
        nameAr: 'فشار كبير',
        descriptionEn: 'Classic buttery popcorn, perfect for a movie night.',
        descriptionAr: 'فشار كلاسيكي بالزبدة، مثالي لليلة فيلم.',
        price: 8.5,
        category: ConcessionCategory.SNACK,
        imageUrl: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&q=80&w=500',
      },
      {
        nameEn: 'Medium Soda',
        nameAr: 'مشروب غازي وسط',
        descriptionEn: 'Refreshing icy cola or lemon-lime soda.',
        descriptionAr: 'كولا مثلجة منعشة أو صودا بليمون.',
        price: 4.5,
        category: ConcessionCategory.DRINK,
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500',
      },
      {
        nameEn: 'Couples Combo',
        nameAr: 'وجبة الكابلز',
        descriptionEn: '1 Large Popcorn and 2 Medium Sodas.',
        descriptionAr: '١ فشار كبير و ٢ مشروب غازي وسط.',
        price: 15.0,
        category: ConcessionCategory.COMBO,
        imageUrl: 'https://images.unsplash.com/photo-1621217650532-628d052be17c?auto=format&fit=crop&q=80&w=500',
      }
    ]
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
