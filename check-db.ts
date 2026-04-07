import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const movieCount = await prisma.movie.count();
    console.log('Successfully connected to DB! Movie count:', movieCount);
  } catch (error) {
    console.error('Failed to connect:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
