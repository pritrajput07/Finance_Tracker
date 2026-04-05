require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;


async function main() {
  console.log('Clearing database sections...');
  await prisma.insight.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Synchronizing standard sectors...');
  const catHousing = await prisma.category.create({ data: { name: 'Housing', type: 'expense', color: '#3525cd' } });
  const catFood = await prisma.category.create({ data: { name: 'Food', type: 'expense', color: '#006c49' } });
  const catTransport = await prisma.category.create({ data: { name: 'Transport', type: 'expense', color: '#95002b' } });
  const catEntertainment = await prisma.category.create({ data: { name: 'Entertainment', type: 'expense', color: '#464555' } });
  const catSalary = await prisma.category.create({ data: { name: 'Salary', type: 'income', color: '#006c49' } });

  console.log('Establishing primary identity...');
  const user = await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'Pritam Santra',
      passwordHash: 'test_hash', 
      preferences: JSON.stringify({ summaries: true, alerts: true, emails: false })
    }
  });

  console.log('Configuring initial allocations...');
  await prisma.budget.create({
    data: {
      userId: user.id,
      categoryId: catHousing.id,
      amountLimit: 25000
    }
  });

  await prisma.budget.create({
    data: {
      userId: user.id,
      categoryId: catFood.id,
      amountLimit: 12000
    }
  });

  console.log('Seeding complete. PostgreSQL setup finalized.');
}

main()
  .catch((e) => {
    console.error('Seeding process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
