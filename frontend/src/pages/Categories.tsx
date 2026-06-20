import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Briefcase,
  Gift,
  X,
  Target
} from 'lucide-react';
import { api } from '../lib/api';
import { formatVND } from '../lib/mockData';

interface BudgetInfo {
  id: string;
  amountLimit: number;
  amountSpent: number;
  percentUsed: number;
  startDate: string;
  endDate: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  totalSpent?: number;
  currentBudget?: BudgetInfo | null;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  // Watch tabs states
  const [watchTab, setWatchTab] = useState<'PERIOD' | 'ALL_TIME'>('PERIOD');
  const [timePeriod, setTimePeriod] = useState<'this_month' | 'last_7_days' | 'last_15_days' | 'last_30_days' | 'clear'>('this_month');

  const getSelectedPeriodLabel = () => {
    switch (timePeriod) {
      case 'this_month': return 'Tháng này';
      case 'last_7_days': return '7 ngày qua';
      case 'last_15_days': return '15 ngày qua';
      case 'last_30_days': return '30 ngày qua';
      case 'clear':
      default:
        return 'Tất cả';
    }
  };

  const [name, setName] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [icon, setIcon] = useState('utensils');
  const [color, setColor] = useState('#F59E0B');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Budget modal state
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetAmountLimit, setBudgetAmountLimit] = useState('');
  const [budgetStartDate, setBudgetStartDate] = useState('');
  const [budgetEndDate, setBudgetEndDate] = useState('');

  // Category Detail Modal State
  const [detailCategory, setDetailCategory] = useState<Category | null>(null);
  const [detailBudgets, setDetailBudgets] = useState<any[]>([]);
  const [detailTransactions, setDetailTransactions] = useState<any[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleViewDetails = async (category: Category) => {
    setDetailCategory(category);
    setIsDetailLoading(true);
    try {
      // Fetch budget history
      const budgetData = await api.get(`/api/budgets/history?categoryId=${category.id}`);
      setDetailBudgets(budgetData.items || []);

      // Fetch recent transactions
      const txData = await api.get(`/api/transactions?categoryId=${category.id}&limit=5`);
      setDetailTransactions(txData.data || []);
    } catch (err) {
      console.error('Error fetching category details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const getDateRange = (period: typeof timePeriod) => {
    const today = new Date();
    let start: Date;
    let end: Date = new Date(today);

    switch (period) {
      case 'this_month': {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      }
      case 'last_7_days': {
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        break;
      }
      case 'last_15_days': {
        start = new Date(today);
        start.setDate(today.getDate() - 14);
        break;
      }
      case 'last_30_days': {
        start = new Date(today);
        start.setDate(today.getDate() - 29);
        break;
      }
      case 'clear':
      default:
        return { startDate: '', endDate: '' };
    }

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(start),
      endDate: formatDate(end)
    };
  };

  const fetchCategories = async (
    currentWatchTab: 'PERIOD' | 'ALL_TIME' = watchTab,
    currentTimePeriod: typeof timePeriod = timePeriod
  ) => {
    try {
      setIsLoading(true);
      let url = '/api/categories';
      if (currentWatchTab === 'PERIOD') {
        const { startDate, endDate } = getDateRange(currentTimePeriod);
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }
      }
      const data = await api.get(url);
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(watchTab, timePeriod);
  }, [watchTab, timePeriod]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/api/categories', {
        name,
        type,
        icon,
        color
      });
      setName('');
      setIcon('utensils');
      setColor('#F59E0B');
      setIsAddModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Tạo danh mục thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này không? Thao tác này cũng sẽ xóa tất cả giao dịch liên quan.')) {
      return;
    }
    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Xóa danh mục thất bại.');
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ngân sách này không?')) return;
    try {
      await api.delete(`/api/budgets/${budgetId}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Xóa ngân sách thất bại.');
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'utensils':
        return <Utensils className="w-5 h-5" />;
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'shopping-bag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'zap':
        return <Zap className="w-5 h-5" />;
      case 'briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'gift':
        return <Gift className="w-5 h-5" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-slate-200" />;
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  const colorPresets = [
    '#F59E0B',
    '#3B82F6',
    '#EC4899',
    '#8B5CF6',
    '#10B981',
    '#14B8A6',
    '#EF4444',
    '#64748B'
  ];

  const CategoryList = ({ cats }: { cats: Category[] }) => (
    <>
      {cats.map((category) => {
        const budget = category.currentBudget;
        const totalSpent = category.totalSpent || 0;
        const hasBudget = !!budget;
        
        const percentUsed = hasBudget && budget.amountLimit > 0
          ? Math.round((totalSpent / budget.amountLimit) * 100)
          : 0;
        const barPercent = Math.min(percentUsed, 100);

        let statusText = 'Trong ngân sách';
        let statusBg = 'bg-emerald-50';
        let statusColor = 'text-emerald-600';
        let progressColor = 'bg-emerald-500';

        if (hasBudget) {
          if (percentUsed >= 100) {
            statusText = 'Vượt ngân sách';
            statusBg = 'bg-red-50';
            statusColor = 'text-red-600';
            progressColor = 'bg-red-500';
          } else if (percentUsed >= 90) {
            statusText = 'Sắp chạm ngân sách';
            statusBg = 'bg-amber-50';
            statusColor = 'text-amber-600';
            progressColor = 'bg-amber-500';
          }
        }

        const remaining = hasBudget ? Math.round(budget.amountLimit - totalSpent) : 0;

        return (
          <div
            key={category.id}
            onClick={() => handleViewDetails(category)}
            className="card p-4 flex flex-col group hover:border-slate-300 hover:shadow-md transition-all duration-300 justify-between min-h-[160px] cursor-pointer"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: category.color }}
                  >
                    {getIconComponent(category.icon)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm md:text-base">{category.name}</h4>
                    <p className="text-xs text-slate-400">{category.type === 'EXPENSE' ? 'Chi phí' : 'Thu nhập'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(category);
                      setEditingBudgetId(category.currentBudget?.id ?? null);
                      setBudgetAmountLimit(category.currentBudget?.amountLimit.toString() ?? '');
                      setBudgetStartDate(category.currentBudget?.startDate ?? '');
                      setBudgetEndDate(category.currentBudget?.endDate ?? '');
                      setIsEditModalOpen(true);
                      setName(category.name);
                      setType(category.type as 'EXPENSE' | 'INCOME');
                      setIcon(category.icon);
                      setColor(category.color);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Budgets Info */}
              {hasBudget ? (
                <div className="space-y-2.5 mt-2">
                  <div className="flex justify-between items-baseline text-xs text-slate-500">
                    <span>Tổng chi: <strong className="text-slate-800 font-semibold">{formatVND(totalSpent)}</strong></span>
                    <span>ngân sách: <strong className="text-slate-800 font-semibold">{formatVND(budget.amountLimit)}</strong></span>
                  </div>

                  <div className="relative w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200/40 shadow-inner">
                    <div
                      className={`${progressColor} h-full rounded-full transition-all duration-700 ease-out shadow-sm`}
                      style={{ width: `${barPercent}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-end pr-2 text-[9px] font-bold text-slate-700 mix-blend-difference">
                      {percentUsed}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100 shadow-sm">
                    <span className={remaining >= 0 ? "text-emerald-700 font-semibold" : "text-red-700 font-semibold"}>
                      {remaining >= 0 ? `${formatVND(remaining)}` : `- ${formatVND(Math.abs(remaining))}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${statusBg} ${statusColor} border border-current/10`}>
                      {statusText}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col justify-end">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{category.type === 'EXPENSE' ? 'Tổng chi' : 'Tổng thu nhập'}:</span>
                    <span className="font-bold text-slate-800 text-sm">{formatVND(totalSpent)}</span>
                  </div>
                  {category.type === 'EXPENSE' && (
                    <p className="text-[10px] text-slate-400 mt-1 text-right">Chưa thiết lập ngân sách</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Quản lý danh mục Thu - Chi</h2>
        </div>

        {watchTab === 'PERIOD' && (
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            {[
              { id: 'this_month', label: 'Tháng này' },
              { id: 'last_7_days', label: 'Last 7 days' },
              { id: 'last_15_days', label: 'Last 15 days' },
              { id: 'last_30_days', label: 'Last 30 days' },
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setTimePeriod(period.id as any)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  timePeriod === period.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {period.label}
              </button>
            ))}
            <button
              onClick={() => setTimePeriod('clear')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                timePeriod === 'clear'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Tabs matching Dashboard.tsx */}
      <div className="flex border-b border-slate-200 -mb-2">
        {[
          { id: 'PERIOD', label: watchTab === 'PERIOD' ? `${getSelectedPeriodLabel()}` : 'Theo giai đoạn' },
          { id: 'ALL_TIME', label: 'Lũy kế' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setWatchTab(tab.id as any)}
            className={`py-3 px-4 font-medium text-sm transition-colors relative border-b-2 ${
              watchTab === tab.id
                ? 'border-emerald-500 text-emerald-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="hidden md:grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                    Danh mục Chi phí
                  </h3>
                  <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {expenseCategories.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setType('EXPENSE');
                    setIsAddModalOpen(true);
                  }}
                  className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Tạo mới
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {expenseCategories.length > 0 ? (
                  <CategoryList cats={expenseCategories} />
                ) : (
                  <div className="col-span-2">
                    <button
                      onClick={() => {
                        setType('EXPENSE');
                        setIsAddModalOpen(true);
                      }}
                      className="w-full card p-4 border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-colors flex items-center justify-center text-slate-500 hover:text-emerald-600 group min-h-[74px]"
                    >
                      <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Thêm danh mục</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                    Danh mục Thu nhập
                  </h3>
                  <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {incomeCategories.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setType('INCOME');
                    setIsAddModalOpen(true);
                  }}
                  className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Tạo mới
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {incomeCategories.length > 0 ? (
                  <CategoryList cats={incomeCategories} />
                ) : (
                  <button
                    onClick={() => {
                      setType('INCOME');
                      setIsAddModalOpen(true);
                    }}
                    className="card p-4 border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-colors flex items-center justify-center text-slate-500 hover:text-emerald-600 group min-h-[74px]"
                  >
                    <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Thêm danh mục</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex p-1 bg-slate-200 rounded-lg flex-1">
                <button
                  onClick={() => setActiveTab('EXPENSE')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'EXPENSE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Chi phí
                </button>
                <button
                  onClick={() => setActiveTab('INCOME')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'INCOME' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Thu nhập
                </button>
              </div>
              <button
                onClick={() => {
                  setType(activeTab);
                  setIsAddModalOpen(true);
                }}
                className="btn-primary p-2.5 rounded-xl flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div>
              <CategoryList cats={activeTab === 'EXPENSE' ? expenseCategories : incomeCategories} />
            </div>
          </div>
        </>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-navy-900 mb-4">Thêm danh mục mới</h3>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 rounded text-sm border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Ví dụ: Sức khỏe, Cà phê, Tiền nhà"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Loại danh mục
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'EXPENSE' | 'INCOME')}
                  className="input-field"
                >
                  <option value="EXPENSE">Chi phí</option>
                  <option value="INCOME">Thu nhập</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Biểu tượng
                </label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="input-field"
                >
                  <option value="utensils">Ăn uống (utensils)</option>
                  <option value="car">Di chuyển (car)</option>
                  <option value="shopping-bag">Mua sắm (shopping-bag)</option>
                  <option value="zap">Dịch vụ tiện ích (zap)</option>
                  <option value="briefcase">Công việc (briefcase)</option>
                  <option value="gift">Quà tặng (gift)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Chọn màu sắc
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setColor(preset)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${color === preset ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: preset }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingCategory(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-navy-900 mb-4">Sửa danh mục</h3>
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 rounded text-sm border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!editingCategory) return;
              setIsSubmitting(true);
              setError('');
              try {
                await api.put(`/api/categories/${editingCategory.id}`, {
                  name,
                  type,
                  icon,
                  color
                });

                if (budgetAmountLimit) {
                  if (editingBudgetId) {
                    await api.put(`/api/budgets/${editingBudgetId}`, {
                      amountLimit: parseFloat(budgetAmountLimit),
                      startDate: budgetStartDate,
                      endDate: budgetEndDate,
                    });
                  } else {
                    await api.post('/api/budgets', {
                      categoryId: editingCategory.id,
                      amountLimit: parseFloat(budgetAmountLimit),
                      startDate: budgetStartDate,
                      endDate: budgetEndDate,
                    });
                  }
                } else if (editingBudgetId) {
                  await api.delete(`/api/budgets/${editingBudgetId}`);
                }

                setIsEditModalOpen(false);
                setEditingCategory(null);
                setEditingBudgetId(null);
                setName('');
                setIcon('utensils');
                setColor('#F59E0B');
                setBudgetAmountLimit('');
                setBudgetStartDate('');
                setBudgetEndDate('');
                fetchCategories();
              } catch (err: any) {
                setError(err.message || 'Cập nhật danh mục thất bại.');
              } finally {
                setIsSubmitting(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Loại danh mục
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'EXPENSE' | 'INCOME')}
                  className="input-field"
                >
                  <option value="EXPENSE">Chi phí</option>
                  <option value="INCOME">Thu nhập</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Biểu tượng
                </label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="input-field"
                >
                  <option value="utensils">Ăn uống (utensils)</option>
                  <option value="car">Di chuyển (car)</option>
                  <option value="shopping-bag">Mua sắm (shopping-bag)</option>
                  <option value="zap">Dịch vụ tiện ích (zap)</option>
                  <option value="briefcase">Công việc (briefcase)</option>
                  <option value="gift">Quà tặng (gift)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Chọn màu sắc
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setColor(preset)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${color === preset ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: preset }}
                    />
                  ))}
                </div>
              </div>

              {(type === 'EXPENSE' || editingBudgetId) && (
                <>
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      ngân sách
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        ngân sách (VND)
                      </label>
                      <input
                        type="number"
                        value={budgetAmountLimit}
                        onChange={(e) => setBudgetAmountLimit(e.target.value)}
                        className="input-field"
                        placeholder="Để trống để bỏ ngân sách"
                      />
                      <p className="text-xs text-slate-500 mt-1">Để trống nếu không muốn thiết lập ngân sách</p>
                    </div>

                    {budgetAmountLimit && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Ngày bắt đầu
                          </label>
                          <input
                            type="date"
                            required
                            value={budgetStartDate}
                            onChange={(e) => setBudgetStartDate(e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Ngày kết thúc
                          </label>
                          <input
                            type="date"
                            required
                            value={budgetEndDate}
                            onChange={(e) => setBudgetEndDate(e.target.value)}
                            className="input-field"
                          />
                        </div>
                      </div>
                    )}

                    {editingBudgetId && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa ngân sách này không?')) {
                            handleDeleteBudget(editingBudgetId);
                            setEditingBudgetId(null);
                            setBudgetAmountLimit('');
                            setBudgetStartDate('');
                            setBudgetEndDate('');
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-800 mt-2"
                      >
                        Xóa ngân sách
                      </button>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCategory(null);
                    setEditingBudgetId(null);
                    setBudgetAmountLimit('');
                    setBudgetStartDate('');
                    setBudgetEndDate('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setDetailCategory(null);
                setDetailBudgets([]);
                setDetailTransactions([]);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-slate-100">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: detailCategory.color }}
              >
                {getIconComponent(detailCategory.icon)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {detailCategory.name}
                </h3>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  detailCategory.type === 'EXPENSE'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {detailCategory.type === 'EXPENSE' ? 'Danh mục Chi phí' : 'Danh mục Thu nhập'}
                </span>
              </div>
            </div>

            {isDetailLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-500 font-medium">Đang tải dữ liệu chi tiết...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* General Stats summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      {detailCategory.type === 'EXPENSE' ? 'Tổng chi tiêu' : 'Tổng thu nhập'} ({getSelectedPeriodLabel().toLowerCase()})
                    </span>
                    <span className={`text-xl font-bold ${detailCategory.type === 'EXPENSE' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatVND(detailCategory.totalSpent || 0)}
                    </span>
                  </div>
                  {detailCategory.type === 'EXPENSE' && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Ngân sách kỳ này
                      </span>
                      {detailCategory.currentBudget ? (
                        <div>
                          <span className="text-xl font-bold text-slate-800">
                            {formatVND(detailCategory.currentBudget.amountLimit)}
                          </span>
                          <span className="text-xs text-slate-500 block">
                            Hạn mức dùng: {detailCategory.currentBudget.percentUsed}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500 italic block mt-1">
                          Chưa thiết lập cho kỳ này
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Section: Budgets list (for EXPENSE) */}
                {detailCategory.type === 'EXPENSE' && (
                  <div className="space-y-3">
                    <h4 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-emerald-600" />
                      Lịch sử ngân sách đã thiết lập
                    </h4>
                    {detailBudgets.length > 0 ? (
                      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[220px] overflow-y-auto">
                          <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase">Thời gian</th>
                                <th className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase text-right">Ngân sách</th>
                                <th className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase text-right">Đã chi</th>
                                <th className="px-4 py-2 text-slate-500 font-semibold text-xs uppercase text-right">Sử dụng</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                              {detailBudgets.map((item) => {
                                let badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                                if (item.percentUsed >= 100) {
                                  badgeColor = 'bg-red-50 text-red-600 border-red-100';
                                } else if (item.percentUsed >= 90) {
                                  badgeColor = 'bg-amber-50 text-amber-600 border-amber-100';
                                }
                                return (
                                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 text-slate-600 text-xs">
                                      {item.startDate} <span className="text-slate-400">→</span> {item.endDate}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-800 text-xs">
                                      {formatVND(item.amountLimit)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 text-xs">
                                      {formatVND(item.amountSpent)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-xs">
                                      <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-bold ${badgeColor}`}>
                                        {item.percentUsed}%
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                        <span className="text-sm text-slate-400 italic">Chưa từng thiết lập ngân sách nào.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Section: Recent Transactions */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block"></span>
                    Giao dịch gần đây
                  </h4>
                  {detailTransactions.length > 0 ? (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {detailTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-xl transition-all"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 text-xs sm:text-sm">{tx.description}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>Tài khoản: {tx.accountName}</span>
                              <span>•</span>
                              <span>{new Date(tx.transactionDate).toLocaleDateString('vi-VN')}</span>
                            </p>
                          </div>
                          <span className={`font-bold text-sm ${
                            tx.type === 'EXPENSE' ? 'text-red-500' : 'text-emerald-500'
                          }`}>
                            {tx.type === 'EXPENSE' ? '-' : '+'}{formatVND(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                      <span className="text-sm text-slate-400 italic">Chưa có giao dịch nào thuộc danh mục này.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setDetailCategory(null);
                  setDetailBudgets([]);
                  setDetailTransactions([]);
                }}
                className="btn-secondary px-5 py-2 text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
