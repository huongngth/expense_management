export const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const MOCK_USER = {
  id: 'u1',
  fullName: 'Nguyen Van A',
  email: 'a@example.com',
  phone: '0912345678',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d'
};

export const MOCK_ACCOUNTS = [
{
  id: 'a1',
  name: 'Vietcombank',
  type: 'BANK',
  balance: 15500000,
  currency: 'VND'
},
{
  id: 'a2',
  name: 'MoMo Wallet',
  type: 'EWALLET',
  balance: 2450000,
  currency: 'VND'
},
{ id: 'a3', name: 'Cash', type: 'CASH', balance: 850000, currency: 'VND' },
{
  id: 'a4',
  name: 'Credit Card',
  type: 'CREDIT',
  balance: -4200000,
  currency: 'VND'
}];


export const MOCK_CATEGORIES = [
{
  id: 'c1',
  name: 'Food & Drink',
  type: 'EXPENSE',
  icon: 'utensils',
  color: '#F59E0B'
},
{
  id: 'c2',
  name: 'Transport',
  type: 'EXPENSE',
  icon: 'car',
  color: '#3B82F6'
},
{
  id: 'c3',
  name: 'Shopping',
  type: 'EXPENSE',
  icon: 'shopping-bag',
  color: '#EC4899'
},
{
  id: 'c4',
  name: 'Utilities',
  type: 'EXPENSE',
  icon: 'zap',
  color: '#8B5CF6'
},
{
  id: 'c5',
  name: 'Salary',
  type: 'INCOME',
  icon: 'briefcase',
  color: '#10B981'
},
{ id: 'c6', name: 'Bonus', type: 'INCOME', icon: 'gift', color: '#14B8A6' }];


export const MOCK_TRANSACTIONS = Array.from({ length: 50 }).
map((_, i) => {
  const isExpense = Math.random() > 0.2;
  const category = isExpense ?
  MOCK_CATEGORIES[Math.floor(Math.random() * 4)] :
  MOCK_CATEGORIES[4 + Math.floor(Math.random() * 2)];

  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));

  return {
    id: `t${i}`,
    type: isExpense ? 'EXPENSE' : 'INCOME',
    amount: isExpense ?
    Math.floor(Math.random() * 500000) + 20000 :
    Math.floor(Math.random() * 10000000) + 5000000,
    categoryId: category.id,
    categoryName: category.name,
    categoryColor: category.color,
    accountId:
    MOCK_ACCOUNTS[Math.floor(Math.random() * MOCK_ACCOUNTS.length)].id,
    accountName:
    MOCK_ACCOUNTS[Math.floor(Math.random() * MOCK_ACCOUNTS.length)].name,
    transactionDate: date.toISOString(),
    description: isExpense ?
    `Payment for ${category.name.toLowerCase()}` :
    `Received ${category.name.toLowerCase()}`
  };
}).
sort(
  (a, b) =>
  new Date(b.transactionDate).getTime() -
  new Date(a.transactionDate).getTime()
);

export const MOCK_BUDGETS = [
{
  id: 'b1',
  category: { name: 'Food & Drink', color: '#F59E0B' },
  amountLimit: 5000000,
  amountSpent: 4250000,
  percentUsed: 85,
  startDate: '2026-05-01',
  endDate: '2026-05-31'
},
{
  id: 'b2',
  category: { name: 'Shopping', color: '#EC4899' },
  amountLimit: 2000000,
  amountSpent: 2100000,
  percentUsed: 105,
  startDate: '2026-05-01',
  endDate: '2026-05-31'
},
{
  id: 'b3',
  category: { name: 'Transport', color: '#3B82F6' },
  amountLimit: 1500000,
  amountSpent: 600000,
  percentUsed: 40,
  startDate: '2026-05-01',
  endDate: '2026-05-31'
}];


export const MOCK_TREND_DATA = [
{ period: 'Dec', income: 15000000, expense: 12000000 },
{ period: 'Jan', income: 15000000, expense: 11500000 },
{ period: 'Feb', income: 18000000, expense: 14000000 },
{ period: 'Mar', income: 15000000, expense: 13200000 },
{ period: 'Apr', income: 15000000, expense: 12800000 },
{ period: 'May', income: 16500000, expense: 10500000 }];


export const MOCK_CATEGORY_STATS = [
{ name: 'Food & Drink', value: 4250000, color: '#F59E0B' },
{ name: 'Shopping', value: 2100000, color: '#EC4899' },
{ name: 'Transport', value: 600000, color: '#3B82F6' },
{ name: 'Utilities', value: 1200000, color: '#8B5CF6' },
{ name: 'Other', value: 2350000, color: '#64748B' }];