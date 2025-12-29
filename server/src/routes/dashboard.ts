import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard data for admin
router.get('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get counts
    const [horsesCount, ridersCount, trainersCount, todaySchedulesCount] = await Promise.all([
      prisma.horse.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { contains: 'RIDER' } } }),
      prisma.user.count({ where: { role: { contains: 'TRAINER' } } }),
      prisma.schedule.count({
        where: {
          date: { gte: today, lte: endOfDay },
          status: 'SCHEDULED',
        },
      }),
    ]);

    // Get horse workload for today
    const horses = await prisma.horse.findMany({
      where: { isActive: true },
      include: {
        schedules: {
          where: {
            date: { gte: today, lte: endOfDay },
            status: 'SCHEDULED',
          },
        },
      },
    });

    const horseWorkloads = horses.map((horse) => {
      const totalMinutes = horse.schedules.reduce((sum, s) => sum + s.duration, 0);
      const maxMinutes = horse.maxWorkHours * 60;
      const workloadPercent = (totalMinutes / maxMinutes) * 100;

      return {
        id: horse.id,
        name: horse.name,
        totalMinutes,
        maxMinutes,
        workloadPercent: Math.round(workloadPercent),
        status: workloadPercent >= 100 ? 'red' : workloadPercent >= 75 ? 'yellow' : 'green',
        schedulesCount: horse.schedules.length,
      };
    });

    res.json({
      stats: {
        horses: horsesCount,
        riders: ridersCount,
        trainers: trainersCount,
        todaySchedules: todaySchedulesCount,
      },
      horseWorkloads,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get upcoming schedules summary
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const schedules = await prisma.schedule.findMany({
      where: {
        date: { gte: now, lte: nextWeek },
        status: 'SCHEDULED',
      },
      include: {
        horse: { select: { name: true } },
        rider: { select: { name: true } },
        trainer: { select: { name: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 20,
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
