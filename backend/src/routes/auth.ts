import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET || 'super-secret-key-12345';

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password, and full name are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone,
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
      },
    });

    // Seed default categories for this user
    const defaultCategories = [
      { name: 'Ăn uống', type: 'EXPENSE', icon: 'utensils', color: '#F59E0B' },
      { name: 'Di chuyển', type: 'EXPENSE', icon: 'car', color: '#3B82F6' },
      { name: 'Mua sắm', type: 'EXPENSE', icon: 'shopping-bag', color: '#EC4899' },
      { name: 'Hóa đơn & Tiện ích', type: 'EXPENSE', icon: 'zap', color: '#8B5CF6' },
      { name: 'Lương', type: 'INCOME', icon: 'briefcase', color: '#10B981' },
      { name: 'Thưởng', type: 'INCOME', icon: 'gift', color: '#14B8A6' },
    ];

    for (const cat of defaultCategories) {
      await prisma.category.create({
        data: {
          ...cat,
          userId: user.id,
        },
      });
    }

    // Seed a default Cash Account
    await prisma.account.create({
      data: {
        name: 'Tiền mặt',
        type: 'CASH',
        balance: 0,
        currency: 'VND',
        userId: user.id,
      },
    });

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });

    return res.status(210).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Internal server error fetching profile.' });
  }
});

export default router;
