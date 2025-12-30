import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Welfare validation helper
interface WelfareCheck {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

async function checkHorseWelfare(
  horseId: string,
  date: Date,
  startTime: string,
  duration: number,
  excludeScheduleId?: string
): Promise<WelfareCheck> {
  const result: WelfareCheck = { valid: true, errors: [], warnings: [] };

  const horse = await prisma.horse.findUnique({
    where: { id: horseId },
  });

  if (!horse) {
    result.valid = false;
    result.errors.push('Horse not found');
    return result;
  }

  // Get all schedules for this horse on this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingSchedules = await prisma.schedule.findMany({
    where: {
      horseId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: 'SCHEDULED',
      ...(excludeScheduleId ? { NOT: { id: excludeScheduleId } } : {}),
    },
    orderBy: { startTime: 'asc' },
  });

  // Check total work hours
  const existingMinutes = existingSchedules.reduce((sum, s) => sum + s.duration, 0);
  const newTotalMinutes = existingMinutes + duration;
  const maxMinutes = horse.maxWorkHours * 60;

  if (newTotalMinutes > maxMinutes) {
    result.valid = false;
    result.errors.push(
      `Horse would exceed daily work limit. Current: ${existingMinutes}min, New: ${duration}min, Max: ${maxMinutes}min`
    );
  }

  // Check for required breaks (1h rest after 2h continuous work)
  const allSchedules = [
    ...existingSchedules,
    { startTime, duration, endTime: calculateEndTime(startTime, duration) },
  ].sort((a, b) => a.startTime.localeCompare(b.startTime));

  let consecutiveMinutes = 0;
  let lastEndTime: string | null = null;

  for (const schedule of allSchedules) {
    if (lastEndTime) {
      const breakMinutes = getMinutesBetween(lastEndTime, schedule.startTime);
      if (breakMinutes < horse.restAfterWork * 60 && consecutiveMinutes >= 120) {
        result.valid = false;
        result.errors.push(
          `Horse needs ${horse.restAfterWork}h rest after 2h of work. Only ${breakMinutes}min break detected.`
        );
      }
      if (breakMinutes >= horse.restAfterWork * 60) {
        consecutiveMinutes = 0;
      }
    }
    consecutiveMinutes += schedule.duration;
    lastEndTime = calculateEndTime(schedule.startTime, schedule.duration);
  }

  return result;
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

function getMinutesBetween(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

// Get all schedules for a date
router.get('/date/:date', authenticateToken, async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const schedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        horse: true,
        rider: {
          select: { id: true, name: true, level: true },
        },
        trainer: {
          select: { id: true, name: true, specialization: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get rider's upcoming schedules
router.get('/my-schedules', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await prisma.schedule.findMany({
      where: {
        riderId: req.user?.id,
        date: { gte: today },
        status: 'SCHEDULED',
      },
      include: {
        horse: {
          select: { id: true, name: true, breed: true },
        },
        trainer: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get trainer's schedules
router.get('/trainer-schedules', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await prisma.schedule.findMany({
      where: {
        trainerId: req.user?.id,
        date: { gte: today },
        status: 'SCHEDULED',
      },
      include: {
        horse: {
          select: { id: true, name: true },
        },
        rider: {
          select: { id: true, name: true, level: true },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create schedule (Admin only)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { horseId, riderId, trainerId, date, startTime, duration, notes, price, paid } = req.body;

    if (!horseId || !riderId || !trainerId || !date || !startTime || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Welfare check
    const welfareCheck = await checkHorseWelfare(horseId, new Date(date), startTime, duration);
    if (!welfareCheck.valid) {
      return res.status(400).json({
        error: 'Welfare validation failed',
        details: welfareCheck.errors,
      });
    }

    // Level matching check
    const horse = await prisma.horse.findUnique({ where: { id: horseId } });
    const rider = await prisma.user.findUnique({ where: { id: riderId } });

    let levelWarning: string | null = null;
    if (horse && rider && horse.level !== rider.level) {
      levelWarning = `Level mismatch: Horse is ${horse.level}, Rider is ${rider.level}`;
    }

    const endTime = calculateEndTime(startTime, duration);

    const schedule = await prisma.schedule.create({
      data: {
        horseId,
        riderId,
        trainerId,
        date: new Date(date),
        startTime,
        endTime,
        duration,
        notes,
        price: price ? parseFloat(price) : null,
        paid: paid === true || paid === 'true',
      },
      include: {
        horse: true,
        rider: { select: { id: true, name: true, level: true } },
        trainer: { select: { id: true, name: true } },
      },
    });

    // Create feeding task if horse has post-training meal
    if (horse?.postTrainingMeal) {
      await prisma.feedingTask.create({
        data: {
          scheduleId: schedule.id,
          horseName: horse.name,
          endTime,
          mealDescription: horse.postTrainingMeal,
          date: new Date(date),
        },
      });
    }

    res.status(201).json({
      schedule,
      warning: levelWarning,
      welfareWarnings: welfareCheck.warnings,
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update schedule (Admin only)
router.put('/:id', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { horseId, riderId, trainerId, date, startTime, duration, status, notes, price, paid } = req.body;

    // Welfare check if changing horse, time, or duration
    if (horseId || startTime || duration) {
      const existingSchedule = await prisma.schedule.findUnique({
        where: { id: req.params.id },
      });

      if (existingSchedule) {
        const checkHorseId = horseId || existingSchedule.horseId;
        const checkDate = date ? new Date(date) : existingSchedule.date;
        const checkStartTime = startTime || existingSchedule.startTime;
        const checkDuration = duration || existingSchedule.duration;

        const welfareCheck = await checkHorseWelfare(
          checkHorseId,
          checkDate,
          checkStartTime,
          checkDuration,
          req.params.id
        );

        if (!welfareCheck.valid) {
          return res.status(400).json({
            error: 'Welfare validation failed',
            details: welfareCheck.errors,
          });
        }
      }
    }

    const endTime = startTime && duration ? calculateEndTime(startTime, duration) : undefined;

    const schedule = await prisma.schedule.update({
      where: { id: req.params.id },
      data: {
        ...(horseId && { horseId }),
        ...(riderId && { riderId }),
        ...(trainerId && { trainerId }),
        ...(date && { date: new Date(date) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(duration && { duration }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(paid !== undefined && { paid: paid === true || paid === 'true' }),
      },
      include: {
        horse: true,
        rider: { select: { id: true, name: true, level: true } },
        trainer: { select: { id: true, name: true } },
      },
    });

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete schedule (Admin only)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    // Delete associated feeding task
    await prisma.feedingTask.deleteMany({
      where: { scheduleId: req.params.id },
    });

    await prisma.schedule.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark schedule as completed and deduct subscription hours
router.post('/:id/complete', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: req.params.id },
      include: {
        rider: true,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Update schedule status to COMPLETED
    await prisma.schedule.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED' },
    });

    // If rider has subscription, deduct hours
    if (schedule.rider && schedule.rider.paymentMethod === 'SUBSCRIPTION') {
      const hoursToDeduct = schedule.duration / 60; // Convert minutes to hours
      const currentHours = schedule.rider.subscriptionHours || 0;
      const newHours = Math.max(0, currentHours - hoursToDeduct);

      await prisma.user.update({
        where: { id: schedule.riderId },
        data: { subscriptionHours: newHours },
      });

      return res.json({ 
        message: 'Schedule completed and subscription hours deducted',
        deductedHours: hoursToDeduct,
        remainingHours: newHours,
      });
    }

    res.json({ message: 'Schedule completed' });
  } catch (error) {
    console.error('Complete schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Validate schedule (check welfare before creating)
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { horseId, date, startTime, duration } = req.body;

    const welfareCheck = await checkHorseWelfare(horseId, new Date(date), startTime, duration);

    res.json(welfareCheck);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
