import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import horseRoutes from './routes/horses';
import userRoutes from './routes/users';
import scheduleRoutes from './routes/schedules';
import feedingRoutes from './routes/feeding';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/horses', horseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/feeding', feedingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Seed endpoint - run once to populate database
app.get('/api/seed', async (_, res) => {
  try {
    // Check if already seeded
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return res.json({ message: 'Database already seeded', users: existingUsers });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const trainerPassword = await bcrypt.hash('trainer123', 10);
    const riderPassword = await bcrypt.hash('rider123', 10);
    const stablePassword = await bcrypt.hash('stable123', 10);

    // Create users
    const admin = await prisma.user.create({
      data: {
        email: 'admin@stajnia.pl',
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN',
      },
    });

    const trainer = await prisma.user.create({
      data: {
        email: 'anna@stajnia.pl',
        password: trainerPassword,
        name: 'Anna Kowalska',
        role: 'TRAINER',
      },
    });

    const rider = await prisma.user.create({
      data: {
        email: 'maria@example.com',
        password: riderPassword,
        name: 'Maria Nowak',
        role: 'RIDER',
        level: 'INTERMEDIATE',
      },
    });

    await prisma.user.create({
      data: {
        email: 'tomek@stajnia.pl',
        password: stablePassword,
        name: 'Tomek Wiśniewski',
        role: 'STABLE_HAND',
      },
    });

    // Create horses
    await prisma.horse.createMany({
      data: [
        {
          name: 'Bursztyn',
          breed: 'Koń małopolski',
          age: 8,
          level: 'ADVANCED',
          feedingSchedule: 'Owies 3kg rano, siano do woli, marchewki wieczorem',
          medicalNotes: 'Uczulony na niektóre antybiotyki',
          maxDailyWorkMinutes: 120,
          requiredBreakMinutes: 60,
        },
        {
          name: 'Luna',
          breed: 'Polski koń szlachetny półkrwi',
          age: 6,
          level: 'INTERMEDIATE',
          feedingSchedule: 'Owies 2.5kg rano i wieczorem, siano',
          medicalNotes: 'Wymaga regularnego czyszczenia kopyt',
          maxDailyWorkMinutes: 90,
          requiredBreakMinutes: 45,
        },
        {
          name: 'Grom',
          breed: 'Hanowerski',
          age: 10,
          level: 'ADVANCED',
          feedingSchedule: 'Specjalna dieta - owies 4kg, suplementy',
          medicalNotes: 'Staw skokowy - unikać długich treningów',
          maxDailyWorkMinutes: 60,
          requiredBreakMinutes: 90,
        },
        {
          name: 'Śnieżka',
          breed: 'Kuc szetlandzki',
          age: 12,
          level: 'BEGINNER',
          feedingSchedule: 'Ograniczone porcje - skłonność do tycia',
          medicalNotes: 'Idealna dla początkujących dzieci',
          maxDailyWorkMinutes: 60,
          requiredBreakMinutes: 30,
        },
      ],
    });

    res.json({ 
      message: 'Database seeded successfully!',
      credentials: {
        admin: { email: 'admin@stajnia.pl', password: 'admin123' },
        trainer: { email: 'anna@stajnia.pl', password: 'trainer123' },
        rider: { email: 'maria@example.com', password: 'rider123' },
        stableHand: { email: 'tomek@stajnia.pl', password: 'stable123' },
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🐴 Server running on http://localhost:${PORT}`);
});
