import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Use environment variable for seed password
  const seedPassword = process.env.SEED_PASSWORD || 'changeme123';
  const hashedPassword = await bcrypt.hash(seedPassword, 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stajnia.pl' },
    update: {},
    create: {
      email: 'admin@stajnia.pl',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create trainers
  const trainer1 = await prisma.user.upsert({
    where: { email: 'anna@stajnia.pl' },
    update: {},
    create: {
      email: 'anna@stajnia.pl',
      password: hashedPassword,
      name: 'Anna Kowalska',
      role: 'TRAINER',
      specialization: 'Ujeżdżenie / Dressage',
      color: '#FF69B4',
    },
  });
  
  const trainer2 = await prisma.user.upsert({
    where: { email: 'jan@stajnia.pl' },
    update: {},
    create: {
      email: 'jan@stajnia.pl',
      password: hashedPassword,
      name: 'Jan Nowak',
      role: 'TRAINER',
      specialization: 'Skoki / Jumping',
      color: '#4ADE80',
    },
  });
  console.log('✅ Trainers created');

  // Create riders
  const rider1 = await prisma.user.upsert({
    where: { email: 'maria@example.com' },
    update: {},
    create: {
      email: 'maria@example.com',
      password: hashedPassword,
      name: 'Maria Wiśniewska',
      role: 'RIDER',
      level: 'ADVANCED',
    },
  });
  
  const rider2 = await prisma.user.upsert({
    where: { email: 'piotr@example.com' },
    update: {},
    create: {
      email: 'piotr@example.com',
      password: hashedPassword,
      name: 'Piotr Zieliński',
      role: 'RIDER',
      level: 'INTERMEDIATE',
    },
  });
  
  const rider3 = await prisma.user.upsert({
    where: { email: 'ewa@example.com' },
    update: {},
    create: {
      email: 'ewa@example.com',
      password: hashedPassword,
      name: 'Ewa Kamińska',
      role: 'RIDER',
      level: 'BEGINNER',
    },
  });
  console.log('✅ Riders created');

  // Create stable hand
  const stableHand = await prisma.user.upsert({
    where: { email: 'tomek@stajnia.pl' },
    update: {},
    create: {
      email: 'tomek@stajnia.pl',
      password: hashedPassword,
      name: 'Tomasz Woźniak',
      role: 'STABLE_HAND',
    },
  });
  console.log('✅ Stable hand created');

  // Create horses
  const horse1 = await prisma.horse.upsert({
    where: { id: 'iskierka' },
    update: {},
    create: {
      id: 'iskierka',
      name: 'Iskierka',
      breed: 'Polski koń szlachetny półkrwi',
      level: 'BEGINNER',
      maxWorkHours: 4,
      restAfterWork: 1,
      postTrainingMeal: '1 miarka meszu, 50g marchewki',
      notes: 'Spokojna klacz, idealna dla początkujących',
    },
  });

  const horse2 = await prisma.horse.upsert({
    where: { id: 'burza' },
    update: {},
    create: {
      id: 'burza',
      name: 'Burza',
      breed: 'Hanowerski',
      level: 'ADVANCED',
      maxWorkHours: 5,
      restAfterWork: 1,
      postTrainingMeal: '2 miarki meszu, suplementy elektrolitowe',
      notes: 'Energiczny ogier, wymaga doświadczonego jeźdźca',
    },
  });

  const horse3 = await prisma.horse.upsert({
    where: { id: 'luna' },
    update: {},
    create: {
      id: 'luna',
      name: 'Luna',
      breed: 'Holsztyński',
      level: 'INTERMEDIATE',
      maxWorkHours: 4,
      restAfterWork: 1,
      postTrainingMeal: '1.5 miarki meszu, jabłko',
      notes: 'Świetna do skoków, przyjazna',
    },
  });

  const horse4 = await prisma.horse.upsert({
    where: { id: 'grom' },
    update: {},
    create: {
      id: 'grom',
      name: 'Grom',
      breed: 'Westfalski',
      level: 'ADVANCED',
      maxWorkHours: 5,
      restAfterWork: 1,
      postTrainingMeal: '2 miarki meszu, witaminy',
      notes: 'Doskonały do ujeżdżenia',
    },
  });

  const horse5 = await prisma.horse.upsert({
    where: { id: 'mgiełka' },
    update: {},
    create: {
      id: 'mgiełka',
      name: 'Mgiełka',
      breed: 'Konik polski',
      level: 'BEGINNER',
      maxWorkHours: 3,
      restAfterWork: 1,
      postTrainingMeal: '1 miarka meszu',
      notes: 'Mała, spokojna klacz',
    },
  });
  console.log('✅ Horses created');

  // Create some sample schedules for Sunday
  const nextSunday = new Date();
  nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7));
  nextSunday.setHours(0, 0, 0, 0);

  await prisma.schedule.create({
    data: {
      date: nextSunday,
      startTime: '09:00',
      endTime: '10:00',
      duration: 60,
      horseId: 'iskierka',
      riderId: rider3.id,
      trainerId: trainer1.id,
      notes: 'Lekcja dla początkujących',
    },
  });

  await prisma.schedule.create({
    data: {
      date: nextSunday,
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      horseId: 'luna',
      riderId: rider2.id,
      trainerId: trainer2.id,
      notes: 'Trening skoków',
    },
  });

  await prisma.schedule.create({
    data: {
      date: nextSunday,
      startTime: '11:00',
      endTime: '12:00',
      duration: 60,
      horseId: 'burza',
      riderId: rider1.id,
      trainerId: trainer1.id,
      notes: 'Ujeżdżenie zaawansowane',
    },
  });
  console.log('✅ Sample schedules created');

  // Create feeding tasks
  await prisma.feedingTask.create({
    data: {
      horseName: 'Iskierka',
      endTime: '10:00',
      mealDescription: '1 miarka meszu, 50g marchewki',
      date: nextSunday,
    },
  });

  await prisma.feedingTask.create({
    data: {
      horseName: 'Luna',
      endTime: '11:00',
      mealDescription: '1.5 miarki meszu, jabłko',
      date: nextSunday,
    },
  });

  await prisma.feedingTask.create({
    data: {
      horseName: 'Burza',
      endTime: '12:00',
      mealDescription: '2 miarki meszu, suplementy elektrolitowe',
      date: nextSunday,
    },
  });
  console.log('✅ Feeding tasks created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📋 Demo accounts created (use SEED_PASSWORD env var or default: changeme123):');
  console.log('   Admin: admin@stajnia.pl');
  console.log('   Trainer: anna@stajnia.pl');
  console.log('   Rider: maria@example.com');
  console.log('   Stable Hand: tomek@stajnia.pl');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
