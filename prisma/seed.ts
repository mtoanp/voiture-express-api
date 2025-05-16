import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
  {
    email: 'admin@example.com',
    name: 'Admin User',
    password: '123456', // ⚠️ Replace with hashed passwords in real apps
    role: Role.admin,
  },
  {
    email: 'user@example.com',
    name: 'Regular User',
    password: '123456',
    role: Role.user,
  },
];

async function seed() {
  console.log('🚀 Starting seed...');

  // Step 1: Clean up old data (in correct order if relations exist)
  // await prisma.$transaction([prisma.user.deleteMany()]);
  await prisma.user.deleteMany();

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
