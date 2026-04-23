import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Only ensure admin user exists — nothing else
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@mellowshive.com' },
  });

  if (existing) {
    console.log('Admin already exists — skipping seed.');
    return;
  }

  const adminPasswordHash = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mellowshive.com',
      name: 'Mellow Admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      verificationStatus: 'VERIFIED',
      studentId: 'MH-ADMIN',
    },
  });

  console.log(`Admin created: ${admin.email}`);
  console.log('Login: admin@mellowshive.com / admin123456');
  console.log('Admin panel: /login?admin=true');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
