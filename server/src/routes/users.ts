import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole('ADMIN'), async (_, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        specialization: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get users by role
router.get('/role/:role', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: req.params.role.toUpperCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        specialization: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get riders
router.get('/riders', authenticateToken, async (_, res) => {
  try {
    const riders = await prisma.user.findMany({
      where: { role: { contains: 'RIDER' } },
      select: {
        id: true,
        name: true,
        level: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(riders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get trainers
router.get('/trainers', authenticateToken, async (_, res) => {
  try {
    const trainers = await prisma.user.findMany({
      where: { role: { contains: 'TRAINER' } },
      select: {
        id: true,
        name: true,
        specialization: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, role, level, specialization, password } = req.body;

    const updateData: any = {
      name,
      email: email?.toLowerCase(),
      role,
      level,
      specialization,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        specialization: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
