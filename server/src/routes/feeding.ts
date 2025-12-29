import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get feeding tasks for a specific date (for stable hands)
router.get('/date/:date', authenticateToken, async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await prisma.feedingTask.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { endTime: 'asc' },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark feeding task as completed
router.put('/:id/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.feedingTask.update({
      where: { id: req.params.id },
      data: {
        completed: true,
        completedAt: new Date(),
        completedBy: req.user?.name,
      },
    });

    // Also update the associated schedule
    if (task.scheduleId) {
      await prisma.schedule.update({
        where: { id: task.scheduleId },
        data: { feedingDone: true },
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Undo feeding task completion
router.put('/:id/uncomplete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.feedingTask.update({
      where: { id: req.params.id },
      data: {
        completed: false,
        completedAt: null,
        completedBy: null,
      },
    });

    if (task.scheduleId) {
      await prisma.schedule.update({
        where: { id: task.scheduleId },
        data: { feedingDone: false },
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate feeding list for a date based on schedules
router.post('/generate/:date', authenticateToken, async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all schedules for the date with horse meal info
    const schedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'SCHEDULED',
      },
      include: {
        horse: {
          select: { name: true, postTrainingMeal: true },
        },
      },
    });

    // Create feeding tasks for horses with post-training meals
    const createdTasks = [];
    for (const schedule of schedules) {
      if (schedule.horse.postTrainingMeal) {
        // Check if task already exists
        const existing = await prisma.feedingTask.findFirst({
          where: { scheduleId: schedule.id },
        });

        if (!existing) {
          const task = await prisma.feedingTask.create({
            data: {
              scheduleId: schedule.id,
              horseName: schedule.horse.name,
              endTime: schedule.endTime,
              mealDescription: schedule.horse.postTrainingMeal,
              date: schedule.date,
            },
          });
          createdTasks.push(task);
        }
      }
    }

    res.json({
      message: `Generated ${createdTasks.length} feeding tasks`,
      tasks: createdTasks,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
