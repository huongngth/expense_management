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

const getPeriodRange = (year?: number, month?: number) => {
  if (year && month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }
  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    return { startDate, endDate };
  }
  return null;
};

const formatGroupLabel = (budget: any, groupBy: string) => {
  if (groupBy === 'year') {
    return String(budget.startDate.getFullYear());
  }
  if (groupBy === 'category') {
    return budget.category?.name || 'Unknown';
  }
  const month = budget.startDate.getMonth();
  const year = budget.startDate.getFullYear();
  const monthName = budget.startDate.toLocaleString('vi-VN', { month: 'short' });
  return `${monthName} ${year}`;
};

// GET /api/budgets/history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const groupBy = String(req.query.groupBy || 'month');
    const year = req.query.year ? parseInt(String(req.query.year), 10) : undefined;
    const month = req.query.month ? parseInt(String(req.query.month), 10) : undefined;
    const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;

    const period = getPeriodRange(year, month);
    const where: any = { userId };
    if (categoryId) where.categoryId = categoryId;
    if (period) {
      where.AND = [
        { startDate: { lte: period.endDate } },
        { endDate: { gte: period.startDate } },
      ];
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: { category: true },
      orderBy: { startDate: 'desc' },
    });

    const enriched = await enrichBudgets(userId, budgets);

    const groupMap: Record<string, any> = {};
    for (const budget of enriched) {
      const label = groupBy === 'year'
        ? new Date(budget.startDate).getFullYear().toString()
        : groupBy === 'category'
          ? budget.category.name
          : `${new Date(budget.startDate).toLocaleString('vi-VN', { month: 'short' })} ${new Date(budget.startDate).getFullYear()}`;

      if (!groupMap[label]) {
        groupMap[label] = {
          label,
          totalLimit: 0,
          totalSpent: 0,
          count: 0,
          percentUsedSum: 0,
        };
      }

      groupMap[label].totalLimit += budget.amountLimit;
      groupMap[label].totalSpent += budget.amountSpent;
      groupMap[label].count += 1;
      groupMap[label].percentUsedSum += budget.percentUsed;
    }

    const groups = Object.values(groupMap).map((group) => ({
      label: group.label,
      totalLimit: group.totalLimit,
      totalSpent: group.totalSpent,
      count: group.count,
      avgPercentUsed: group.count > 0 ? Math.round(group.percentUsedSum / group.count) : 0,
    })).sort((a, b) => b.totalLimit - a.totalLimit);

    const totalLimit = enriched.reduce((sum, budget) => sum + budget.amountLimit, 0);
    const totalSpent = enriched.reduce((sum, budget) => sum + budget.amountSpent, 0);
    const averageUsage = enriched.length > 0
      ? Math.round(enriched.reduce((sum, budget) => sum + budget.percentUsed, 0) / enriched.length)
      : 0;

    return res.json({
      items: enriched,
      groups,
      stats: {
        totalBudgets: enriched.length,
        totalLimit,
        totalSpent,
        averageUsage,
      },
      selected: {
        groupBy,
        year,
        month,
        categoryId,
      }
    });
  } catch (error: any) {
    console.error('Error fetching budget history:', error);
    return res.status(500).json({ message: 'Error retrieving budget history.' });
  }
});

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
