import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware to all endpoints in this file
router.use(authenticateToken);

// GET /api/accounts
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(accounts);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return res.status(500).json({ message: 'Error retrieving accounts.' });
  }
});

// POST /api/accounts
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, type, balance, currency } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and Type are required.' });
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: balance !== undefined ? parseFloat(balance) : 0.0,
        currency: currency || 'VND',
        userId,
      },
    });

    return res.status(201).json(account);
  } catch (error: any) {
    console.error('Error creating account:', error);
    return res.status(500).json({ message: 'Error creating account.' });
  }
});

// PUT /api/accounts/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, type, balance, currency } = req.body;

    // Verify ownership
    const account = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found or access denied.' });
    }

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        name: name !== undefined ? name : account.name,
        type: type !== undefined ? type : account.type,
        balance: balance !== undefined ? parseFloat(balance) : account.balance,
        currency: currency !== undefined ? currency : account.currency,
      },
    });

    return res.json(updatedAccount);
  } catch (error: any) {
    console.error('Error updating account:', error);
    return res.status(500).json({ message: 'Error updating account.' });
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Verify ownership
    const account = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found or access denied.' });
    }

    await prisma.account.delete({
      where: { id },
    });

    return res.json({ message: 'Account deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ message: 'Error deleting account.' });
  }
});

export default router;
