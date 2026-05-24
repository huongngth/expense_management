import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { formatVND } from '../lib/mockData';
import { api } from '../lib/api';

interface Budget {
  id: string;
  amountLimit: number;
  amountSpent: number;
  percentUsed: number;
  category: {
    name: string;
    color: string;
  };
}

interface DashboardData {
  summary: {
    totalBalance: number;
    totalIncomeThisMonth: number;
    totalExpenseThisMonth: number;
  };
  trendData: Array<{ period: string; income: number; expense: number }>;
  categoryStats: Array<{ name: string; value: number; color: string }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    categoryName: string;
    categoryColor: string;
    accountName: string;
    transactionDate: string;
    description: string;
  }>;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, budgetsData] = await Promise.all([
        api.get('/api/dashboard/summary'),
        api.get('/api/budgets')
      ]);
      setData(summaryData);
      setBudgets(budgetsData.slice(0, 4)); // Show top 4 budgets
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { summary, trendData, categoryStats, recentTransactions } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Tổng quan tài chính</h2>
          <p className="text-slate-500 text-sm">Theo dõi thu chi và chi tiêu của bạn</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5 flex flex-col">
          <div className="flex items-center text-slate-500 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-medium text-sm">Tổng thu nhập (Tháng này)</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono">
            {formatVND(summary.totalIncomeThisMonth)}
          </div>
        </div>

        <div className="card p-5 flex flex-col">
          <div className="flex items-center text-slate-500 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            </div>
            <span className="font-medium text-sm">Tổng chi tiêu (Tháng này)</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono">
            {formatVND(summary.totalExpenseThisMonth)}
          </div>
        </div>

        <div className="card p-5 flex flex-col bg-navy-900 text-white border-transparent">
          <div className="flex items-center text-navy-200 mb-2">
            <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center mr-3">
              <Wallet className="w-4 h-4 text-navy-200" />
            </div>
            <span className="font-medium text-sm">Tổng số dư ròng</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatVND(summary.totalBalance)}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Thu nhập và Chi tiêu</h3>
          <div className="h-72">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000000} triệu`}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    formatter={(value: number) => [formatVND(value), '']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="income"
                    name="Thu nhập"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="expense"
                    name="Chi tiêu"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Không có dữ liệu xu hướng.
              </div>
            )}
          </div>
        </div>

        {/* Category Donut Chart */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Chi tiêu theo danh mục</h3>
          <div className="h-64">
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatVND(value)}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Chưa có chi tiêu nào được ghi nhận trong tháng này.
              </div>
            )}
          </div>
          <div className="mt-2 space-y-2">
            {categoryStats.slice(0, 4).map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-slate-600">{stat.name}</span>
                </div>
                <span className="font-medium text-slate-800 font-mono">
                  {formatVND(stat.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card p-0 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Giao dịch gần đây</h3>
            <Link
              to="/transactions"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center"
            >
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {recentTransactions.map((txn) => (
              <div
                key={txn.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: txn.categoryColor }}
                  >
                    {txn.categoryName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{txn.description}</p>
                    <div className="flex items-center text-xs text-slate-500 mt-0.5">
                      <span>{txn.categoryName}</span>
                      <span className="mx-1.5">•</span>
                      <span>{txn.accountName}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold font-mono ${txn.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {txn.type === 'INCOME' ? '+' : '-'}
                    {formatVND(txn.amount)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(txn.transactionDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Overview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Theo dõi ngân sách</h3>
            <Link to="/budgets" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Quản lý
            </Link>
          </div>
          <div className="space-y-5">
            {budgets.length > 0 ? (
              budgets.map((budget) => {
                const isOver = budget.percentUsed >= 100;
                const isWarning = budget.percentUsed >= 80 && !isOver;
                let progressColor = 'bg-emerald-500';
                if (isOver) progressColor = 'bg-red-500';
                else if (isWarning) progressColor = 'bg-amber-500';

                return (
                  <div key={budget.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700">{budget.category.name}</span>
                      <span className="text-slate-500 font-mono">
                        <span className={isOver ? 'text-red-600 font-medium' : 'text-slate-800'}>
                          {formatVND(budget.amountSpent)}
                        </span>
                        {' / '}
                        {formatVND(budget.amountLimit)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${progressColor}`}
                        style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-right text-slate-500">
                      đã dùng {budget.percentUsed}%
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-400 text-sm text-center py-6">
                Chưa có ngân sách hoạt động. Tạo ngân sách mới để theo dõi chi tiêu!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}