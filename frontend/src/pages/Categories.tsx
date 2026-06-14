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

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    if (!window.confirm('Bạn có chắc chắn muốn xóa hạn mức này không?')) return;
    try {
      await api.delete(`/api/budgets/${budgetId}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Xóa hạn mức thất bại.');
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
        const percent = hasBudget ? Math.min(budget!.percentUsed, 100) : 0;

        let statusText = 'Trong hạn mức';
        let statusBg = 'bg-emerald-50';
        let statusColor = 'text-emerald-600';
        let progressColor = 'bg-emerald-500';

        if (hasBudget) {
          if (budget!.percentUsed >= 100) {
            statusText = 'Vượt hạn mức';
            statusBg = 'bg-red-50';
            statusColor = 'text-red-600';
            progressColor = 'bg-red-500';
          } else if (budget!.percentUsed >= 90) {
            statusText = 'Sắp chạm hạn mức';
            statusBg = 'bg-amber-50';
            statusColor = 'text-amber-600';
            progressColor = 'bg-amber-500';
          }
        }

        const remaining = hasBudget ? Math.round(budget!.amountLimit - budget!.amountSpent) : 0;

        return (
          <div
            key={category.id}
            className="card p-4 flex flex-col group hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: category.color }}
                >
                  {getIconComponent(category.icon)}
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">{category.name}</h4>
                  <p className="text-xs text-slate-500">{category.type === 'EXPENSE' ? 'Chi phí' : 'Thu nhập'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
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
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-slate-500">{category.type === 'EXPENSE' ? 'Tổng chi' : 'Tổng thu nhập'}</p>
                <p className="font-bold">{formatVND(totalSpent)}</p>
              </div>

              <div className="text-right">
                {hasBudget ? (
                  <>
                    <p className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}>{statusText}</p>
                    <p className="text-sm text-slate-500">Hạn mức: {formatVND(budget!.amountLimit)}</p>
                  </>
                ) : category.type === 'EXPENSE' ? (
                  <p className="text-sm text-slate-500">Không có hạn mức</p>
                ) : (
                  <p className="text-sm text-slate-400">-</p>
                )}
              </div>
            </div>

            {hasBudget && (
              <div className="space-y-2 mb-3">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${progressColor} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{category.type === 'EXPENSE' ? 'Đã chi' : 'Đã thu'}: {formatVND(budget!.amountSpent)}</span>
                  <span className="text-slate-500">{percent}%</span>
                </div>

                <div className={`p-3 rounded-lg flex items-center justify-between text-sm ${budget!.percentUsed >= 100 ? 'bg-red-50' : 'bg-slate-50'}`}>
                  <span className={budget!.percentUsed >= 100 ? 'text-red-700 font-medium' : 'text-slate-600'}>
                    {budget!.percentUsed >= 100 ? 'Vượt quá' : 'Còn lại'}
                  </span>
                  <span className={`font-bold ${budget!.percentUsed >= 100 ? 'text-red-700' : 'text-slate-800'}`}>
                    {formatVND(Math.abs(remaining))}
                  </span>
                </div>
              </div>
            )}

          </div>
        );
      })}
    </>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Danh mục</h2>
          <p className="text-slate-500 text-sm">Phân loại giao dịch của bạn</p>
        </div>
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
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Danh mục Chi phí
                </h3>
                <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {expenseCategories.length}
                </span>
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
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  Danh mục Thu nhập
                </h3>
                <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {incomeCategories.length}
                </span>
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
            <div className="flex p-1 bg-slate-200 rounded-lg">
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
                      Hạn mức
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Hạn mức (VND)
                      </label>
                      <input
                        type="number"
                        value={budgetAmountLimit}
                        onChange={(e) => setBudgetAmountLimit(e.target.value)}
                        className="input-field"
                        placeholder="Để trống để bỏ hạn mức"
                      />
                      <p className="text-xs text-slate-500 mt-1">Để trống nếu không muốn thiết lập hạn mức</p>
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
                          if (window.confirm('Bạn có chắc chắn muốn xóa hạn mức này không?')) {
                            handleDeleteBudget(editingBudgetId);
                            setEditingBudgetId(null);
                            setBudgetAmountLimit('');
                            setBudgetStartDate('');
                            setBudgetEndDate('');
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-800 mt-2"
                      >
                        Xóa hạn mức
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
    </div>
  );
}
