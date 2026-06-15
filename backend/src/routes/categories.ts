import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware to all endpoints in this file
router.use(authenticateToken);

// GET /api/categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate } = req.query;

    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(String(startDate));
    }
    if (endDate) {
      parsedEndDate = new Date(String(endDate));
      parsedEndDate.setHours(23, 59, 59, 999);
    }

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    const enriched: any[] = [];

    for (const c of categories) {
      // total amount for category (filtered by date range if provided)
      const whereTx: any = { userId, categoryId: c.id, type: c.type };
      if (parsedStartDate || parsedEndDate) {
        whereTx.transactionDate = {};
        if (parsedStartDate) whereTx.transactionDate.gte = parsedStartDate;
        if (parsedEndDate) whereTx.transactionDate.lte = parsedEndDate;
      }

      const agg = await prisma.transaction.aggregate({
        where: whereTx,
        _sum: { amount: true },
      });
      const totalSpent = agg._sum.amount || 0;

      // find active budget for this category (overlapping with query range or active now)
      let activeBudget = null;
      if (parsedStartDate && parsedEndDate) {
        activeBudget = await prisma.budget.findFirst({
          where: {
            userId,
            categoryId: c.id,
            startDate: { lte: parsedEndDate },
            endDate: { gte: parsedStartDate },
          },
        });
      } else {
        const now = new Date();
        activeBudget = await prisma.budget.findFirst({
          where: {
            userId,
            categoryId: c.id,
            startDate: { lte: now },
            endDate: { gte: now },
          },
        });
      }

      let budgetInfo = null;
      if (activeBudget) {
        let amountSpent = 0;
        if (parsedStartDate && parsedEndDate) {
          amountSpent = totalSpent;
        } else {
          const bAgg = await prisma.transaction.aggregate({
            where: {
              userId,
              categoryId: c.id,
              type: c.type,
              transactionDate: { gte: activeBudget.startDate, lte: activeBudget.endDate },
            },
            _sum: { amount: true },
          });
          amountSpent = bAgg._sum.amount || 0;
        }

        const percentUsed = activeBudget.amountLimit > 0 ? Math.round((amountSpent / activeBudget.amountLimit) * 100) : 0;
        budgetInfo = {
          id: activeBudget.id,
          amountLimit: activeBudget.amountLimit,
          amountSpent,
          percentUsed,
          startDate: activeBudget.startDate.toISOString().split('T')[0],
          endDate: activeBudget.endDate.toISOString().split('T')[0],
        };
      }

      enriched.push({
        ...c,
        totalSpent,
        currentBudget: budgetInfo,
      });
    }

    return res.json(enriched);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Error retrieving categories.' });
  }
});

// POST /api/categories
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, type, icon, color } = req.body;

    if (!name || !type || !icon || !color) {
      return res.status(400).json({ message: 'Name, Type, Icon, and Color are required.' });
    }

    // Check unique for user
    const existing = await prisma.category.findFirst({
      where: { userId, name, type },
    });

    if (existing) {
      return res.status(400).json({ message: 'A category with this name and type already exists.' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        icon,
        color,
        userId,
      },
    });

    return res.status(201).json(category);
  } catch (error: any) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Error creating category.' });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, type, icon, color } = req.body;

    // Verify ownership
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found or access denied.' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name : category.name,
        type: type !== undefined ? type : category.type,
        icon: icon !== undefined ? icon : category.icon,
        color: color !== undefined ? color : category.color,
      },
    });

    return res.json(updatedCategory);
  } catch (error: any) {
    console.error('Error updating category:', error);
    return res.status(500).json({ message: 'Error updating category.' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Verify ownership
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found or access denied.' });
    }

    await prisma.category.delete({
      where: { id },
    });

    return res.json({ message: 'Category deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ message: 'Error deleting category.' });
  }
});

export default router;
