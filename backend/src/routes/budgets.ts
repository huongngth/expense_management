import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Helper to calculate dynamic spent for a list of budgets
const enrichBudgets = async (userId: string, budgets: any[]) => {
  const enriched = [];

  for (const b of budgets) {
    // Sum expense transactions in this category within budget's date range
    const aggregate = await prisma.transaction.aggregate({
      where: {
        userId,
        categoryId: b.categoryId,
        type: 'EXPENSE',
        transactionDate: {
          gte: b.startDate,
          lte: b.endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const amountSpent = aggregate._sum.amount || 0;
    const percentUsed = b.amountLimit > 0 ? Math.round((amountSpent / b.amountLimit) * 100) : 0;

    enriched.push({
      id: b.id,
      amountLimit: b.amountLimit,
      amountSpent,
      percentUsed,
      startDate: b.startDate.toISOString().split('T')[0],
      endDate: b.endDate.toISOString().split('T')[0],
      categoryId: b.categoryId,
      category: {
        name: b.category?.name || 'Unknown',
        color: b.category?.color || '#64748B',
      },
    });
  }

  return enriched;
};

// GET /api/budgets
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { startDate: 'desc' },
    });

    const data = await enrichBudgets(userId, budgets);
    return res.json(data);
  } catch (error: any) {
    console.error('Error fetching budgets:', error);
    return res.status(500).json({ message: 'Error retrieving budgets.' });
  }
});

// POST /api/budgets
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { categoryId, amountLimit, startDate, endDate } = req.body;

    if (!categoryId || !amountLimit || !startDate || !endDate) {
      return res.status(400).json({ message: 'Category, Limit, Start Date, and End Date are required.' });
    }

    // Verify category ownership
    const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
    if (!category) return res.status(400).json({ message: 'Category not found.' });

    const budget = await prisma.budget.create({
      data: {
        categoryId,
        amountLimit: parseFloat(amountLimit),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId,
      },
      include: {
        category: true,
      },
    });

    const enriched = await enrichBudgets(userId, [budget]);
    return res.status(201).json(enriched[0]);
  } catch (error: any) {
    console.error('Error creating budget:', error);
    return res.status(500).json({ message: 'Error creating budget.' });
  }
});

// PUT /api/budgets/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { categoryId, amountLimit, startDate, endDate } = req.body;

    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Budget not found.' });
    }

    if (categoryId) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
      if (!category) return res.status(400).json({ message: 'Category not found.' });
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: {
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        amountLimit: amountLimit !== undefined ? parseFloat(amountLimit) : existing.amountLimit,
        startDate: startDate !== undefined ? new Date(startDate) : existing.startDate,
        endDate: endDate !== undefined ? new Date(endDate) : existing.endDate,
      },
      include: {
        category: true,
      },
    });

    const enriched = await enrichBudgets(userId, [updated]);
    return res.json(enriched[0]);
  } catch (error: any) {
    console.error('Error updating budget:', error);
    return res.status(500).json({ message: 'Error updating budget.' });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Budget not found.' });
    }

    await prisma.budget.delete({ where: { id } });
    return res.json({ message: 'Budget deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting budget:', error);
    return res.status(500).json({ message: 'Error deleting budget.' });
  }
});

export default router;
