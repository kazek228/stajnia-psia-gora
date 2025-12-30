import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get work statistics for trainers and horses
router.get('/work', authenticateToken, async (req, res) => {
  try {
    const { date, month } = req.query;

    let dateFilter: any = {};
    
    if (date) {
      // Filter by specific day
      const targetDate = new Date(date as string);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      dateFilter = {
        date: {
          gte: targetDate,
          lt: nextDay,
        }
      };
    } else if (month) {
      // Filter by month (format: YYYY-MM)
      const [year, monthNum] = (month as string).split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
      
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        }
      };
    }

    // Get all schedules with the filter
    const schedules = await prisma.schedule.findMany({
      where: dateFilter,
      include: {
        trainer: {
          select: { id: true, name: true }
        },
        horse: {
          select: { id: true, name: true }
        }
      }
    });

    // Calculate trainer statistics
    const trainerStats = new Map<string, { 
      name: string; 
      totalMinutes: number; 
      sessions: number;
      totalRevenue: number;
      paidRevenue: number;
      unpaidRevenue: number;
    }>();
    
    schedules.forEach(schedule => {
      if (schedule.trainer) {
        const existing = trainerStats.get(schedule.trainer.id) || { 
          name: schedule.trainer.name, 
          totalMinutes: 0, 
          sessions: 0,
          totalRevenue: 0,
          paidRevenue: 0,
          unpaidRevenue: 0,
        };
        existing.totalMinutes += schedule.duration;
        existing.sessions += 1;
        
        const price = schedule.price || 0;
        existing.totalRevenue += price;
        if (schedule.paid) {
          existing.paidRevenue += price;
        } else {
          existing.unpaidRevenue += price;
        }
        
        trainerStats.set(schedule.trainer.id, existing);
      }
    });

    // Calculate horse statistics
    const horseStats = new Map<string, { 
      name: string; 
      totalMinutes: number; 
      sessions: number;
      totalRevenue: number;
      paidRevenue: number;
      unpaidRevenue: number;
    }>();
    
    schedules.forEach(schedule => {
      const existing = horseStats.get(schedule.horse.id) || { 
        name: schedule.horse.name, 
        totalMinutes: 0, 
        sessions: 0,
        totalRevenue: 0,
        paidRevenue: 0,
        unpaidRevenue: 0,
      };
      existing.totalMinutes += schedule.duration;
      existing.sessions += 1;
      
      const price = schedule.price || 0;
      existing.totalRevenue += price;
      if (schedule.paid) {
        existing.paidRevenue += price;
      } else {
        existing.unpaidRevenue += price;
      }
      
      horseStats.set(schedule.horse.id, existing);
    });

    // Convert to arrays and add hours
    const trainers = Array.from(trainerStats.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      totalMinutes: data.totalMinutes,
      totalHours: parseFloat((data.totalMinutes / 60).toFixed(2)),
      sessions: data.sessions,
      totalRevenue: parseFloat(data.totalRevenue.toFixed(2)),
      paidRevenue: parseFloat(data.paidRevenue.toFixed(2)),
      unpaidRevenue: parseFloat(data.unpaidRevenue.toFixed(2)),
    })).sort((a, b) => b.totalMinutes - a.totalMinutes);

    const horses = Array.from(horseStats.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      totalMinutes: data.totalMinutes,
      totalHours: parseFloat((data.totalMinutes / 60).toFixed(2)),
      sessions: data.sessions,
      totalRevenue: parseFloat(data.totalRevenue.toFixed(2)),
      paidRevenue: parseFloat(data.paidRevenue.toFixed(2)),
      unpaidRevenue: parseFloat(data.unpaidRevenue.toFixed(2)),
    })).sort((a, b) => b.totalMinutes - a.totalMinutes);

    res.json({
      period: date ? 'day' : month ? 'month' : 'all',
      date: date || month || null,
      trainers,
      horses,
      totalSessions: schedules.length,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
