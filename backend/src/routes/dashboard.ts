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

    // 1. Determine period boundaries (defaults to current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const startDateParam = req.query.startDate as string | undefined;
    const endDateParam = req.query.endDate as string | undefined;
    const allTimeParam = req.query.allTime === 'true';

    let periodStart: Date;
    let periodEnd: Date;

    if (allTimeParam) {
      periodStart = new Date(0);
      periodEnd = new Date(now.getFullYear() + 10, 11, 31, 23, 59, 59, 999);
    } else {
      periodStart = startDateParam ? new Date(startDateParam) : startOfMonth;
      periodEnd = endDateParam ? new Date(endDateParam) : endOfMonth;
      // Ensure end covers entire day
      periodEnd.setHours(23, 59, 59, 999);
    }

    // Sum Income & Expense for the selected period
    const incomeAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'INCOME',
        transactionDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      _sum: { amount: true },
    });

    const expenseAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        transactionDate: {
          gte: periodStart,
          lte: periodEnd,
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

    // 2. Compile monthly trend data (filtered by query params or last 6 months)
    let trendStart: Date;
    let trendEnd: Date;

    if (allTimeParam) {
      const earliestTx = await prisma.transaction.findFirst({
        where: { userId },
        orderBy: { transactionDate: 'asc' },
      });
      if (earliestTx) {
        trendStart = new Date(earliestTx.transactionDate.getFullYear(), earliestTx.transactionDate.getMonth(), 1);
      } else {
        trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      }
      trendEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (startDateParam && endDateParam) {
      trendStart = new Date(startDateParam);
      trendEnd = new Date(endDateParam);
      // Ensure trendEnd covers the entire last day
      trendEnd.setHours(23, 59, 59, 999);
    } else {
      // Default: last 6 months
      trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      trendEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const trendData = [];
    const cursor = new Date(trendStart.getFullYear(), trendStart.getMonth(), 1);
    const finalMonth = new Date(trendEnd.getFullYear(), trendEnd.getMonth(), 1);

    while (cursor <= finalMonth) {
      const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);

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
        period: `${getMonthName(start)} ${start.getFullYear()}`,
        income: inc._sum.amount || 0,
        expense: exp._sum.amount || 0,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    // 3. Compile category breakdown (expenses in selected period)
    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        transactionDate: {
          gte: periodStart,
          lte: periodEnd,
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

    // Get recent transactions within the selected period (e.g. last 5)
    const recentDb = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
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
