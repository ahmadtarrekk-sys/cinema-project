import { PrismaClient, Role, HallType, SeatType, ConcessionCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');

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

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@cinema.local',
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@cinema.local',
      role: Role.USER,
    },
  });

  console.log('Seeding Cinemas and Halls...');

  const c1 = await prisma.cinema.create({
    data: {
      nameEn: 'VOX Cinemas Mall of Egypt',
      nameAr: 'فوكس سينما مول مصر',
      location: 'Mall of Egypt, 6th of October City',
      contact: '+201234567891',
      halls: {
        create: [
          { nameEn: 'Max 1', nameAr: 'ماكس ١', type: HallType.IMAX, capacity: 80 },
          { nameEn: 'Standard 2', nameAr: 'عادي ٢', type: HallType.STANDARD, capacity: 80 },
          { nameEn: 'VIP 3', nameAr: 'كبار الشخصيات ٣', type: HallType.VIP, capacity: 30 }
        ]
      }
    }, include: { halls: true }
  });

  const c2 = await prisma.cinema.create({
    data: {
      nameEn: 'Point 90 Cinema',
      nameAr: 'بوينت ٩٠ سينما',
      location: 'Point 90 Mall, New Cairo',
      contact: '+201234567892',
      halls: {
        create: [
          { nameEn: 'Premium 1', nameAr: 'بريميوم ١', type: HallType.STANDARD, capacity: 80 },
          { nameEn: 'Premium 2', nameAr: 'بريميوم ٢', type: HallType.STANDARD, capacity: 80 }
        ]
      }
    }, include: { halls: true }
  });

  const c3 = await prisma.cinema.create({
    data: {
      nameEn: 'VOX Cinemas City Centre Almaza',
      nameAr: 'فوكس سينما سيتي سنتر ألماظة',
      location: 'Heliopolis, Cairo',
      contact: '+201234567893',
      halls: {
        create: [
          { nameEn: 'Gold 1', nameAr: 'جولد ١', type: HallType.VIP, capacity: 30 },
          { nameEn: 'Standard 2', nameAr: 'عادي ٢', type: HallType.STANDARD, capacity: 80 },
          { nameEn: 'IMAX 3', nameAr: 'آيماكس ٣', type: HallType.IMAX, capacity: 80 }
        ]
      }
    }, include: { halls: true }
  });

  const c4 = await prisma.cinema.create({
    data: {
      nameEn: 'San Stefano Grand Plaza',
      nameAr: 'سان ستيفانو جراند بلازا',
      location: 'San Stefano, Alexandria',
      contact: '+201234567894',
      halls: {
        create: [
          { nameEn: 'Hall A', nameAr: 'قاعة أ', type: HallType.STANDARD, capacity: 80 },
          { nameEn: 'Hall B', nameAr: 'قاعة ب', type: HallType.STANDARD, capacity: 80 }
        ]
      }
    }, include: { halls: true }
  });

  const c5 = await prisma.cinema.create({
    data: {
      nameEn: 'Americana Plaza IMAX',
      nameAr: 'أمريكانا بلازا آيماكس',
      location: 'Sheikh Zayed City',
      contact: '+201234567895',
      halls: {
        create: [
          { nameEn: 'IMAX Theatre', nameAr: 'مسرح آيماكس', type: HallType.IMAX, capacity: 80 }
        ]
      }
    }, include: { halls: true }
  });

  console.log('Seeding Seats...');
  const halls = [...c1.halls, ...c2.halls, ...c3.halls, ...c4.halls, ...c5.halls];

  for (const hall of halls) {
    const seatRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 16;

    const seatsData = [];
    for (const row of seatRows) {
      for (let col = 1; col <= seatsPerRow; col++) {
        let type: SeatType = SeatType.STANDARD;

        const rowIndex = seatRows.indexOf(row);

        // Rows A, B, C (indices 0, 1, 2) are VIP
        if (rowIndex < 3) {
          type = SeatType.VIP;
        } else if (rowIndex >= 3 && rowIndex < 5) {
          // Rows D, E (indices 3, 4) are Premium
          type = SeatType.PREMIUM;
        } else {
          // Rows F to J are Standard
          type = SeatType.STANDARD;
        }

        // Wheelchair seats at the ends of the last row (J)
        if (row === 'J' && (col <= 2 || col >= seatsPerRow - 1)) {
          type = SeatType.WHEELCHAIR;
        }

        seatsData.push({ hallId: hall.id, row, column: col, type });
      }
    }
    await prisma.seat.createMany({ data: seatsData });
  }

  console.log('Seeding 20 Movies...');

  const movieData = [
    { titleEn: 'Dune: Part Two', titleAr: 'كثيب: الجزء الثاني', gen: 'Sci-Fi / Adventure', r: 'PG-13', m: 166, dEn: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.', dAr: 'يتحد بول أتريدس مع تشاني والفريمن في مسار انتقام.', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000' },
    { titleEn: 'Oppenheimer', titleAr: 'أوبنهايمر', gen: 'Biography / Drama', r: 'R', m: 180, dEn: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', dAr: 'قصة العالم الأمريكي ج. روبرت أوبنهايمر.', img: 'https://images.unsplash.com/photo-1440051163481-9b19dfafade9?q=80&w=1000' },
    { titleEn: 'The Batman', titleAr: 'باتمان', gen: 'Action / Crime', r: 'PG-13', m: 176, dEn: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption.', dAr: 'بينما يبدأ قاتل متسلسل سادي في قتل شخصيات سياسية...', img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cb3?q=80&w=1000' },
    { titleEn: 'Avatar: The Way of Water', titleAr: 'أفاتار: طريق الماء', gen: 'Sci-Fi / Fantasy', r: 'PG-13', m: 192, dEn: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns.', dAr: 'يعيش جيك سولي مع عائلته الجديدة على قمر باندورا.', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000' },
    { titleEn: 'Top Gun: Maverick', titleAr: 'توب غان: مافريك', gen: 'Action / Drama', r: 'PG-13', m: 130, dEn: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator.', dAr: 'بعد ثلاثين عامًا، لا يزال مافريك يتجاوز الحدود.', img: 'https://images.unsplash.com/photo-1629844853037-9af70a316b1f?q=80&w=1000' },
    { titleEn: 'Spider-Man: No Way Home', titleAr: 'سبايدرمان: لا طريق للمنزل', gen: 'Action / Adventure', r: 'PG-13', m: 148, dEn: 'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help.', dAr: 'بعد الكشف عن هوية سبايدرمان، يطلب بيتر المساعدة.', img: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1000' },
    { titleEn: 'Joker: Folie à Deux', titleAr: 'جوكر: جنون مشترك', gen: 'Crime / Drama', r: 'R', m: 138, dEn: 'Arthur Fleck is institutionalized at Arkham awaiting trial for his crimes as Joker.', dAr: 'يتم إيداع آرثر فليك في آركام في انتظار محاكمته.', img: 'https://images.unsplash.com/photo-1581404090123-5d752f9c4fcc?q=80&w=1000' },
    { titleEn: 'Inception', titleAr: 'بداية', gen: 'Sci-Fi / Thriller', r: 'PG-13', m: 148, dEn: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.', dAr: 'لص يسرق أسرار الشركات عبر الأحلام.', img: 'https://images.unsplash.com/photo-1508247072979-cb4a9463ae37?q=80&w=1000' },
    { titleEn: 'Interstellar', titleAr: 'بين النجوم', gen: 'Sci-Fi / Drama', r: 'PG-13', m: 169, dEn: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', dAr: 'فريق من المستكشفين يسافرون لضمان بقاء البشرية.', img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000' },
    { titleEn: 'Kira & El Gin', titleAr: 'كيرة والجن', gen: 'Action / History', r: 'R', m: 150, dEn: 'A story spanning the 1919 revolution in Egypt, featuring the underground resistance.', dAr: 'قصة تمتد عبر ثورة ١٩١٩ في مصر وتبرز المقاومة السرية.', img: 'https://images.unsplash.com/photo-1604928148812-4eb52fd105bd?q=80&w=1000' },
    { titleEn: 'Welad Rizk 3', titleAr: 'ولاد رزق ٣', gen: 'Action / Crime', r: 'R', m: 125, dEn: 'The Rizk brothers return for the biggest heist of their lives in Riyadh.', dAr: 'يعود الإخوة رزق لأكبر عملية سطو في حياتهم في الرياض.', img: 'https://images.unsplash.com/photo-1552528151-6fcc118da55a?q=80&w=1000' },
    { titleEn: 'Beit El Ruby', titleAr: 'بيت الروبي', gen: 'Comedy / Family', r: 'PG-13', m: 110, dEn: 'A comedic tale of a family navigating the modern pressures of social media.', dAr: 'قصة كوميدية عن عائلة تواجه ضغوط السوشيال ميديا.', img: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=1000' },
    { titleEn: 'Bahebek', titleAr: 'بحبك', gen: 'Romance / Comedy', r: 'PG-13', m: 105, dEn: 'A man finds himself torn between two women, exploring the true meaning of love.', dAr: 'رجل يجد نفسه ممزقاً بين امرأتين، مستكشفاً المعنى الحقيقي للحب.', img: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=1000' },
    { titleEn: 'Deadpool & Wolverine', titleAr: 'ديدبول ووولفرين', gen: 'Action / Comedy', r: 'R', m: 127, dEn: 'Wolverine joins the "merc with a mouth" on a timeline changing quest.', dAr: 'وولفرين ينضم إلى بطلنا الساخر في مهمة تغير الزمن.', img: 'https://images.unsplash.com/photo-1596727147705-611529ce2e6c?q=80&w=1000' },
    { titleEn: 'Gladiator II', titleAr: 'المصارع ٢', gen: 'Action / Epic', r: 'R', m: 145, dEn: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle.', dAr: 'بعد سنوات من مشاهدة موت ماكسيموس البطل.', img: 'https://images.unsplash.com/photo-1533157577536-a3ee515c0e2a?q=80&w=1000' },
    { titleEn: 'Furiosa: A Mad Max Saga', titleAr: 'فيوريوسا: ملحمة ماد ماكس', gen: 'Action / Sci-Fi', r: 'R', m: 148, dEn: 'The origin story of renegade warrior Furiosa before she teamed up with Mad Max.', dAr: 'القصة الأصلية للمحاربة فيوريوسا قبل تعاونها مع ماد ماكس.', img: 'https://images.unsplash.com/photo-1519965942470-e448b47bbd35?q=80&w=1000' },
    { titleEn: 'Inside Out 2', titleAr: 'قلباً وقالباً ٢', gen: 'Animation / Family', r: 'PG', m: 96, dEn: 'Follow Riley, in her teenage years, encountering new emotions.', dAr: 'تابع رايلي في سنوات مراهقتها وهي تواجه مشاعر جديدة.', img: 'https://images.unsplash.com/photo-1620062402927-5d070b4c8038?q=80&w=1000' },
    { titleEn: 'Despicable Me 4', titleAr: 'أنا الحقير ٤', gen: 'Animation / Comedy', r: 'PG', m: 95, dEn: 'Gru and Lucy and their girls welcome a new member to the family.', dAr: 'جرو ولوسي يرحبان بعضو جديد في العائلة.', img: 'https://images.unsplash.com/photo-1555543419-411a5fd20eb0?q=80&w=1000' },
    { titleEn: 'A Quiet Place: Day One', titleAr: 'مكان هادئ: اليوم الأول', gen: 'Horror / Thriller', r: 'PG-13', m: 100, dEn: 'Experience the day the world went quiet.', dAr: 'عش اليوم الذي صمت فيه العالم.', img: 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=1000' },
    { titleEn: 'Kung Fu Panda 4', titleAr: 'كونغ فو باندا ٤', gen: 'Animation / Action', r: 'PG', m: 94, dEn: 'Po must train a new warrior when he\'s chosen to become the spiritual leader.', dAr: 'بو يجب أن يدرب محاربا جديدا.', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000' }
  ];

  const dbMovies = [];
  for (const item of movieData) {
    const movie = await prisma.movie.create({
      data: {
        titleEn: item.titleEn,
        titleAr: item.titleAr,
        descriptionEn: item.dEn,
        descriptionAr: item.dAr,
        durationMin: item.m,
        genre: item.gen,
        rating: item.r,
        posterUrl: item.img,
        releaseDate: new Date('2024-01-01'),
      }
    });
    dbMovies.push(movie);
  }

  console.log('Seeding Showtimes...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const showtimeData = [];
  for (const movie of dbMovies) {
    for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
      // Exactly 3 showtimes per day, strictly after 3 PM (4 PM, 7 PM, 10 PM)
      const slots = [
        { h: 16 }, // 4 PM
        { h: 19 }, // 7 PM
        { h: 22 }  // 10 PM
      ];
      for (const slot of slots) {
        // Randomly pick a hall to host this showing
        const randomHall = halls[Math.floor(Math.random() * halls.length)];

        let bPrice = 180;

        if (randomHall.type === HallType.IMAX) bPrice = 220;
        if (randomHall.type === HallType.VIP) bPrice = 300;

        const startTime = new Date(today);
        startTime.setDate(today.getDate() + dayOffset);
        startTime.setHours(slot.h, 0, 0, 0);

        showtimeData.push({
          movieId: movie.id,
          hallId: randomHall.id,
          startTime,
          basePrice: bPrice,
        });
      }
    }
  }

  await prisma.showtime.createMany({ data: showtimeData });

  console.log('Seeding Concessions...');
  await prisma.concessionItem.createMany({
    data: [
      {
        nameEn: 'Large Caramel Popcorn',
        nameAr: 'فشار كراميل كبير',
        descriptionEn: 'Sweet and crunchy caramel coated popcorn.',
        descriptionAr: 'فشار مغطى بالكراميل المقرمش.',
        price: 80,
        category: ConcessionCategory.SNACK,
        imageUrl: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=500',
      },
      {
        nameEn: 'Large Nachos & Cheese',
        nameAr: 'ناتشوز كبير بالجبن',
        descriptionEn: 'Crispy nachos with warm melted cheese and jalapenos.',
        descriptionAr: 'ناتشوز مقرمش مع جبن سائل دافئ وهالبينو.',
        price: 70,
        category: ConcessionCategory.SNACK,
        imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=500',
      },
      {
        nameEn: 'Large Cola',
        nameAr: 'كولا كبير',
        descriptionEn: 'Refreshing icy cola drink.',
        descriptionAr: 'مشروب كولا مثلج ومنعش.',
        price: 50,
        category: ConcessionCategory.DRINK,
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500',
      },
      {
        nameEn: 'Family Combo',
        nameAr: 'وجبة العائلة',
        descriptionEn: '2 Large Popcorns, 1 Nachos, and 4 Medium Drinks.',
        descriptionAr: '٢ فشار كبير، ١ ناتشوز، و ٤ مشروبات وسط.',
        price: 150,
        category: ConcessionCategory.COMBO,
        imageUrl: 'https://images.unsplash.com/photo-1621217650532-628d052be17c?q=80&w=500',
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
