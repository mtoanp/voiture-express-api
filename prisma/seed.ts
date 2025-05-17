import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const hash = (password: string) => bcrypt.hash(password, SALT_ROUNDS);

async function seed() {
  console.log('🚀 Starting seed...');

  // Step 1: Clean up old data (in correct order if relations exist)
  // await prisma.$transaction([prisma.user.deleteMany()]);
  await prisma.user.deleteMany();

  const users = [
    {
      id: crypto.randomUUID(),
      email: 'admin@example.com',
      name: 'Admin User',
      password: await hash('123456'),
      role: Role.admin,
    },
    {
      id: crypto.randomUUID(),
      email: 'user@example.com',
      name: 'Regular User',
      password: await hash('123456'),
      role: Role.user,
    },
  ];

  // Step 2: Seed fresh data
  await prisma.user.createMany({
    data: users,
  });

  console.log('✅ Seed complete');
}

// eslint-disable-next-line
(async () => {
  try {
    await seed();
  } catch (e) {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('⚠️ Failed to disconnect Prisma:', disconnectError);
    }
  }
})();
