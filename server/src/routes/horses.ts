import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all horses
router.get('/', authenticateToken, async (_, res) => {
  try {
    const horses = await prisma.horse.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(horses);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single horse
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const horse = await prisma.horse.findUnique({
      where: { id: req.params.id },
      include: {
        schedules: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!horse) {
      return res.status(404).json({ error: 'Horse not found' });
    }

    res.json(horse);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create horse (Admin only)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, breed, level, maxWorkHours, restAfterWork, postTrainingMeal, notes } = req.body;

    if (!name || !level) {
      return res.status(400).json({ error: 'Name and level are required' });
    }

    const horse = await prisma.horse.create({
      data: {
        name,
        breed,
        level,
        maxWorkHours: maxWorkHours || 4,
        restAfterWork: restAfterWork || 1,
        postTrainingMeal,
        notes,
      },
    });

    res.status(201).json(horse);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update horse (Admin only)
router.put('/:id', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, breed, level, maxWorkHours, restAfterWork, postTrainingMeal, notes, isActive } = req.body;

    const horse = await prisma.horse.update({
      where: { id: req.params.id },
      data: {
        name,
        breed,
        level,
        maxWorkHours,
        restAfterWork,
        postTrainingMeal,
        notes,
        isActive,
      },
    });

    res.json(horse);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete horse (Admin only) - soft delete
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.horse.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ message: 'Horse deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get horse workload for a specific date
router.get('/:id/workload/:date', authenticateToken, async (req, res) => {
  try {
    const { id, date } = req.params;
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const schedules = await prisma.schedule.findMany({
      where: {
        horseId: id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'SCHEDULED',
      },
      orderBy: { startTime: 'asc' },
    });

    const horse = await prisma.horse.findUnique({
      where: { id },
      select: { maxWorkHours: true, restAfterWork: true },
    });

    if (!horse) {
      return res.status(404).json({ error: 'Horse not found' });
    }

    const totalMinutes = schedules.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = totalMinutes / 60;
    const workloadPercent = (totalHours / horse.maxWorkHours) * 100;

    res.json({
      totalMinutes,
      totalHours,
      maxWorkHours: horse.maxWorkHours,
      workloadPercent,
      status: workloadPercent >= 100 ? 'red' : workloadPercent >= 75 ? 'yellow' : 'green',
      schedules,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
