import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateColors() {
  const trainers = await prisma.user.findMany({
    where: {
      role: {
        contains: 'TRAINER'
      }
    }
  });

  console.log('Found trainers:', trainers.map(t => t.name));

  const colors = ['#FF69B4', '#4ADE80', '#3B82F6', '#F59E0B', '#8B5CF6'];

  for (let i = 0; i < trainers.length; i++) {
    await prisma.user.update({
      where: { id: trainers[i].id },
      data: { color: colors[i % colors.length] }
    });
    console.log(`Updated ${trainers[i].name} with color ${colors[i % colors.length]}`);
  }

  console.log('All trainers updated with colors');
  await prisma.$disconnect();
}

updateColors();
