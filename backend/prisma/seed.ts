import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database...');

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      id: 'u1',
      fullName: 'Nguyễn Văn A',
      email: 'a@example.com',
      phone: '0912345678',
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
      password: passwordHash,
    },
  });

  console.log(`Created default user: ${user.email}`);

  // 2. Create Categories
  const categoriesData = [
    { id: 'c1', name: 'Ăn uống', type: 'EXPENSE', icon: 'utensils', color: '#F59E0B' },
    { id: 'c2', name: 'Di chuyển', type: 'EXPENSE', icon: 'car', color: '#3B82F6' },
    { id: 'c3', name: 'Mua sắm', type: 'EXPENSE', icon: 'shopping-bag', color: '#EC4899' },
    { id: 'c4', name: 'Hóa đơn & Tiện ích', type: 'EXPENSE', icon: 'zap', color: '#8B5CF6' },
    { id: 'c5', name: 'Lương', type: 'INCOME', icon: 'briefcase', color: '#10B981' },
    { id: 'c6', name: 'Thưởng', type: 'INCOME', icon: 'gift', color: '#14B8A6' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.create({
      data: {
        ...cat,
        userId: user.id,
      },
    });
  }
  console.log('Created default categories');

  // 3. Create Accounts
  const accountsData = [
    { id: 'a1', name: 'Vietcombank', type: 'BANK', balance: 15500000, currency: 'VND' },
    { id: 'a3', name: 'Tiền mặt', type: 'CASH', balance: 850000, currency: 'VND' },
  ];

  for (const acc of accountsData) {
    await prisma.account.create({
      data: {
        ...acc,
        userId: user.id,
      },
    });
  }
  console.log('Created default accounts');

  // 4. Create Budgets
  const budgetsData = [
    {
      id: 'b1',
      categoryId: 'c1', // Ăn uống
      amountLimit: 5000000,
      startDate: new Date('2026-05-01T00:00:00Z'),
      endDate: new Date('2026-05-31T23:59:59Z'),
    },
    {
      id: 'b2',
      categoryId: 'c3', // Mua sắm
      amountLimit: 2000000,
      startDate: new Date('2026-05-01T00:00:00Z'),
      endDate: new Date('2026-05-31T23:59:59Z'),
    },
    {
      id: 'b3',
      categoryId: 'c2', // Di chuyển
      amountLimit: 1500000,
      startDate: new Date('2026-05-01T00:00:00Z'),
      endDate: new Date('2026-05-31T23:59:59Z'),
    },
  ];

  for (const b of budgetsData) {
    await prisma.budget.create({
      data: {
        ...b,
        userId: user.id,
      },
    });
  }
  console.log('Created default budgets');

  // 5. Create Transactions
  const now = new Date();
  const txs = [];
  const categoriesList = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
  const accountsList = ['a1', 'a3'];

  for (let i = 0; i < 50; i++) {
    const isExpense = i % 5 !== 0; // 80% expenses, 20% income
    const categoryId = isExpense 
      ? categoriesList[Math.floor((i * 7) % 4)] // c1 to c4
      : categoriesList[4 + Math.floor((i * 3) % 2)]; // c5 to c6

    const accountId = accountsList[Math.floor((i * 13) % accountsList.length)];
    const amount = isExpense 
      ? Math.floor(((i * 27000) % 480000) + 20000) // 20k to 500k
      : Math.floor(((i * 750000) % 5000000) + 3000000); // 3M to 8M

    const date = new Date(now);
    date.setDate(now.getDate() - Math.floor((i * 3) % 30)); // spread over 30 days

    const descriptions = {
      c1: ['Ăn tối gia đình', 'Đi siêu thị mua đồ ăn', 'Cà phê Starbucks', 'Ăn trưa văn phòng', 'Phở bò gia truyền'],
      c2: ['Xe Grab', 'Đổ xăng xe máy', 'Vé xe buýt', 'Phí cầu đường', 'Gửi xe ở hầm'],
      c3: ['Áo thun Zara', 'Giày thể thao mới', 'Mua sách ngoại văn', 'Ốp lưng điện thoại', 'Quà sinh nhật cho bạn'],
      c4: ['Hóa đơn tiền điện', 'Hóa đơn tiền nước', 'Gói cước Internet', 'Thuê bao Netflix', 'Gói iCloud lưu trữ'],
      c5: ['Nhận lương tháng', 'Tiền làm dự án ngoài', 'Thanh toán hợp đồng freelancer'],
      c6: ['Thưởng đạt chỉ tiêu', 'Thưởng ngày lễ Tết', 'Hoàn tiền thẻ tín dụng'],
    };

    const descList = descriptions[categoryId as keyof typeof descriptions] || ['Giao dịch'];
    const description = descList[Math.floor((i * 9) % descList.length)];

    txs.push({
      id: `t${i}`,
      type: isExpense ? 'EXPENSE' : 'INCOME',
      amount,
      description,
      transactionDate: date,
      accountId,
      categoryId,
      userId: user.id,
    });
  }

  // Insert transactions
  for (const tx of txs) {
    await prisma.transaction.create({
      data: tx,
    });
  }

  console.log(`Seeded ${txs.length} transactions successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    (globalThis as any).process?.exit?.(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
