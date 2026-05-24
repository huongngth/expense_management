import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

const mapTransaction = (tx: any) => ({
  id: tx.id,
  type: tx.type,
  amount: tx.amount,
  categoryId: tx.categoryId,
  categoryName: tx.category?.name || 'Unknown',
  categoryColor: tx.category?.color || '#000000',
  accountId: tx.accountId,
  accountName: tx.account?.name || 'Unknown',
  transactionDate: tx.transactionDate instanceof Date ? tx.transactionDate.toISOString() : new Date(tx.transactionDate).toISOString(),
  description: tx.description
});

// GET /api/transactions
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { searchTerm, type, categoryId, accountId, startDate, endDate, page, limit } = req.query;

    const where: any = { userId };

    if (searchTerm) {
      where.description = { contains: String(searchTerm) };
    }
    if (type && type !== 'ALL') {
      where.type = String(type);
    }
    if (categoryId) {
      where.categoryId = String(categoryId);
    }
    if (accountId) {
      where.accountId = String(accountId);
    }
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = new Date(String(startDate));
      }
      if (endDate) {
        where.transactionDate.lte = new Date(String(endDate));
      }
    }

    const currentPage = parseInt(String(page || 1)) || 1;
    const currentLimit = parseInt(String(limit || 10)) || 10;
    const skip = (currentPage - 1) * currentLimit;

    const total = await prisma.transaction.count({ where });

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: { transactionDate: 'desc' },
      skip,
      take: currentLimit,
    });

    return res.json({
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit),
      data: transactions.map(mapTransaction),
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ message: 'Error retrieving transactions.' });
  }
});

// POST /api/transactions
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { type, amount, description, transactionDate, accountId, categoryId } = req.body;

    if (!type || !amount || !description || !transactionDate || !accountId || !categoryId) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Verify account and category belong to user
    const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
    if (!account) return res.status(400).json({ message: 'Account not found.' });

    const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
    if (!category) return res.status(400).json({ message: 'Category not found.' });

    const parsedAmount = parseFloat(amount);

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          type,
          amount: parsedAmount,
          description,
          transactionDate: new Date(transactionDate),
          accountId,
          categoryId,
          userId,
        },
        include: {
          category: true,
          account: true,
        },
      });

      const adjustment = type === 'INCOME' ? parsedAmount : -parsedAmount;
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: adjustment } },
      });

      return transaction;
    });

    return res.status(201).json(mapTransaction(result));
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ message: 'Error creating transaction.' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { type, amount, description, transactionDate, accountId, categoryId } = req.body;

    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (accountId) {
      const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
      if (!account) return res.status(400).json({ message: 'Account not found.' });
    }

    if (categoryId) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
      if (!category) return res.status(400).json({ message: 'Category not found.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Revert old effect
      const oldAdjustment = existing.type === 'INCOME' ? -existing.amount : existing.amount;
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: oldAdjustment } },
      });

      // Update
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          type: type !== undefined ? type : existing.type,
          amount: amount !== undefined ? parseFloat(amount) : existing.amount,
          description: description !== undefined ? description : existing.description,
          transactionDate: transactionDate !== undefined ? new Date(transactionDate) : existing.transactionDate,
          accountId: accountId !== undefined ? accountId : existing.accountId,
          categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        },
        include: {
          category: true,
          account: true,
        },
      });

      // Apply new effect
      const newAdjustment = updated.type === 'INCOME' ? updated.amount : -updated.amount;
      await tx.account.update({
        where: { id: updated.accountId },
        data: { balance: { increment: newAdjustment } },
      });

      return updated;
    });

    return res.json(mapTransaction(result));
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return res.status(500).json({ message: 'Error updating transaction.' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    await prisma.$transaction(async (tx) => {
      // Revert balance effect
      const revertAdjustment = existing.type === 'INCOME' ? -existing.amount : existing.amount;
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: revertAdjustment } },
      });

      await tx.transaction.delete({ where: { id } });
    });

    return res.json({ message: 'Transaction deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return res.status(500).json({ message: 'Error deleting transaction.' });
  }
});

export default router;
