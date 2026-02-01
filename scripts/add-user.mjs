import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetUserId = '110753093651931352478';

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { id: targetUserId } });

  if (existing) {
    console.log('✅ User already exists:', existing.email);
    return;
  }

  // Create the user
  const newUser = await prisma.user.create({
    data: {
      id: targetUserId,
      email: 'tyrrellfoster@gmail.com',
      name: 'Tyrrell Foster',
      firstName: 'Tyrrell',
      lastName: 'Foster',
    }
  });

  console.log('✅ User created successfully!');
  console.log('   ID:', newUser.id);
  console.log('   Email:', newUser.email);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
