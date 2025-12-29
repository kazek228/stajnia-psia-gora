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
          level: 'ADVANCED',
          maxWorkHours: 4,
          restAfterWork: 1,
          postTrainingMeal: 'Owies 3kg, marchewki',
          notes: 'Uczulony na niektóre antybiotyki',
        },
        {
          name: 'Luna',
          breed: 'Polski koń szlachetny półkrwi',
          level: 'INTERMEDIATE',
          maxWorkHours: 3,
          restAfterWork: 1,
          postTrainingMeal: 'Owies 2.5kg, siano',
          notes: 'Wymaga regularnego czyszczenia kopyt',
        },
        {
          name: 'Grom',
          breed: 'Hanowerski',
          level: 'ADVANCED',
          maxWorkHours: 2,
          restAfterWork: 2,
          postTrainingMeal: 'Specjalna dieta - owies 4kg, suplementy',
          notes: 'Staw skokowy - unikać długich treningów',
        },
        {
          name: 'Śnieżka',
          breed: 'Kuc szetlandzki',
          level: 'BEGINNER',
          maxWorkHours: 2,
          restAfterWork: 1,
          postTrainingMeal: 'Ograniczone porcje',
          notes: 'Idealna dla początkujących dzieci',
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

// Reset and reseed - use carefully!
app.get('/api/reseed', async (_, res) => {
  try {
    // Delete all data
    await prisma.schedule.deleteMany();
    await prisma.horse.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const trainerPassword = await bcrypt.hash('trainer123', 10);
    const riderPassword = await bcrypt.hash('rider123', 10);
    const stablePassword = await bcrypt.hash('stable123', 10);

    await prisma.user.createMany({
      data: [
        { email: 'admin@stajnia.pl', password: hashedPassword, name: 'Administrator', role: 'ADMIN' },
        { email: 'anna@stajnia.pl', password: trainerPassword, name: 'Anna Kowalska', role: 'TRAINER' },
        { email: 'maria@example.com', password: riderPassword, name: 'Maria Nowak', role: 'RIDER', level: 'INTERMEDIATE' },
        { email: 'tomek@stajnia.pl', password: stablePassword, name: 'Tomek Wiśniewski', role: 'STABLE_HAND' },
      ]
    });

    await prisma.horse.createMany({
      data: [
        { name: 'Bursztyn', breed: 'Koń małopolski', level: 'ADVANCED', maxWorkHours: 4, restAfterWork: 1, postTrainingMeal: 'Owies 3kg', notes: 'Doświadczony koń' },
        { name: 'Luna', breed: 'Polski koń szlachetny', level: 'INTERMEDIATE', maxWorkHours: 3, restAfterWork: 1, postTrainingMeal: 'Owies 2.5kg', notes: 'Spokojna klacz' },
        { name: 'Grom', breed: 'Hanowerski', level: 'ADVANCED', maxWorkHours: 2, restAfterWork: 2, postTrainingMeal: 'Dieta specjalna', notes: 'Unikać długich treningów' },
        { name: 'Śnieżka', breed: 'Kuc szetlandzki', level: 'BEGINNER', maxWorkHours: 2, restAfterWork: 1, postTrainingMeal: 'Ograniczone porcje', notes: 'Dla początkujących' },
      ]
    });

    res.json({ 
      message: 'Database reset and reseeded!',
      credentials: {
        admin: { email: 'admin@stajnia.pl', password: 'admin123' },
        trainer: { email: 'anna@stajnia.pl', password: 'trainer123' },
        rider: { email: 'maria@example.com', password: 'rider123' },
        stableHand: { email: 'tomek@stajnia.pl', password: 'stable123' },
      }
    });
  } catch (error) {
    console.error('Reseed error:', error);
    res.status(500).json({ error: 'Failed to reseed', details: String(error) });
  }
});

// Change password endpoint - use: /api/change-password?email=admin@stajnia.pl&newPassword=NoweHaslo123
app.get('/api/change-password', async (req, res) => {
  try {
    const { email, newPassword } = req.query;
    
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Provide email and newPassword as query params' });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    
    const user = await prisma.user.update({
      where: { email: String(email) },
      data: { password: hashedPassword },
    });

    res.json({ message: `Password changed for ${user.email}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password', details: String(error) });
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
