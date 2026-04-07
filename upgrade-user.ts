
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdmin() {
  await prisma.user.update({
    where: { email: 'admintester@cinema.local' },
    data: { role: 'ADMIN' }
  });
  console.log("Upgraded user role to ADMIN.");
}

setAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
