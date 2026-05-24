import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Helper to get month name in short format (e.g. "May", "Jun")
const getMonthName = (date: Date) => {
  return date.toLocaleString('en-US', { month: 'short' });
};

// GET /api/dashboard/summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // 1. Get current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Sum Income & Expense for current month
    const incomeAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'INCOME',
        transactionDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { amount: true },
    });

    const expenseAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        transactionDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { amount: true },
    });

    const totalIncomeThisMonth = incomeAgg._sum.amount || 0;
    const totalExpenseThisMonth = expenseAgg._sum.amount || 0;

    // Sum total balance across all accounts
    const accountsAgg = await prisma.account.aggregate({
      where: { userId },
      _sum: { balance: true },
    });
    const totalBalance = accountsAgg._sum.balance || 0;

    // 2. Compile monthly trend data (last 6 months)
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const inc = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          transactionDate: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      const exp = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          transactionDate: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      trendData.push({
        period: getMonthName(start),
        income: inc._sum.amount || 0,
        expense: exp._sum.amount || 0,
      });
    }

    // 3. Compile category breakdown (expenses in current month)
    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        transactionDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        category: true,
      },
    });

    // Group and sum
    const catMap: { [key: string]: { value: number; color: string } } = {};
    for (const exp of expenses) {
      const catName = exp.category?.name || 'Other';
      const catColor = exp.category?.color || '#64748B';

      if (!catMap[catName]) {
        catMap[catName] = { value: 0, color: catColor };
      }
      catMap[catName].value += exp.amount;
    }

    const categoryStats = Object.keys(catMap).map((name) => ({
      name,
      value: catMap[name].value,
      color: catMap[name].color,
    })).sort((a, b) => b.value - a.value);

    // Get recent transactions (e.g. last 5)
    const recentDb = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true, account: true },
      orderBy: { transactionDate: 'desc' },
      take: 5,
    });

    const recentTransactions = recentDb.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      categoryId: tx.categoryId,
      categoryName: tx.category?.name || 'Unknown',
      categoryColor: tx.category?.color || '#64748B',
      accountId: tx.accountId,
      accountName: tx.account?.name || 'Unknown',
      transactionDate: tx.transactionDate.toISOString(),
      description: tx.description,
    }));

    return res.json({
      summary: {
        totalBalance,
        totalIncomeThisMonth,
        totalExpenseThisMonth,
      },
      trendData,
      categoryStats,
      recentTransactions,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({ message: 'Error retrieving dashboard statistics.' });
  }
});

export default router;
