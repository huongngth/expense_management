import React, { useState, useEffect } from 'react';
import {
  Plus,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  X,
  Trash2
} from 'lucide-react';
import { formatVND } from '../lib/mockData';
import { api } from '../lib/api';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Budget {
  id: string;
  amountLimit: number;
  amountSpent: number;
  percentUsed: number;
  startDate: string;
  endDate: string;
  categoryId: string;
  category: {
    name: string;
    color: string;
  };
}

export function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [categoryId, setCategoryId] = useState('');
  const [amountLimit, setAmountLimit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current month start and end dates formatted for input type="date"
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const fetchBudgetsAndCategories = async () => {
    try {
      setIsLoading(true);
      const [budgetsData, categoriesData] = await Promise.all([
        api.get('/api/budgets'),
        api.get('/api/categories')
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        setCategoryId(categoriesData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetsAndCategories();
  }, []);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amountLimit) return;

    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/api/budgets', {
        categoryId,
        amountLimit: parseFloat(amountLimit),
        startDate,
        endDate
      });
      setAmountLimit('');
      setIsAddModalOpen(false);
      fetchBudgetsAndCategories();
    } catch (err: any) {
      setError(err.message || 'Tạo hạn mức chi tiêu thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hạn mức chi tiêu này không?')) return;
    try {
      await api.delete(`/api/budgets/${id}`);
      fetchBudgetsAndCategories();
    } catch (err: any) {
      alert(err.message || 'Xóa hạn mức chi tiêu thất bại.');
    }
  };

  // Metrics
  const onTrackCount = budgets.filter((b) => b.percentUsed < 80).length;
  const warningCount = budgets.filter((b) => b.percentUsed >= 80 && b.percentUsed < 100).length;
  const exceededCount = budgets.filter((b) => b.percentUsed >= 100).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Hạn mức chi tiêu</h2>
          <p className="text-slate-500 text-sm">Kiểm soát giới hạn chi tiêu của bạn</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center justify-center sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Hạn mức mới
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-4 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Đúng tiến độ</p>
                <p className="text-xl font-bold text-slate-800">{onTrackCount}</p>
              </div>
            </div>
            <div className="card p-4 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Sắp chạm hạn mức</p>
                <p className="text-xl font-bold text-slate-800">{warningCount}</p>
              </div>
            </div>
            <div className="card p-4 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Vượt hạn mức</p>
                <p className="text-xl font-bold text-slate-800">{exceededCount}</p>
              </div>
            </div>
          </div>

          {/* Budgets List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const isOver = budget.percentUsed >= 100;
              const isWarning = budget.percentUsed >= 80 && !isOver;
              let statusColor = 'text-emerald-600';
              let statusBg = 'bg-emerald-50';
              let progressColor = 'bg-emerald-500';
              let statusText = 'Đúng tiến độ';
              
              if (isOver) {
                statusColor = 'text-red-600';
                statusBg = 'bg-red-50';
                progressColor = 'bg-red-500';
                statusText = 'Vượt hạn mức';
              } else if (isWarning) {
                statusColor = 'text-amber-600';
                statusBg = 'bg-amber-50';
                progressColor = 'bg-amber-500';
                statusText = 'Cảnh báo';
              }

              const remaining = budget.amountLimit - budget.amountSpent;

              return (
                <div key={budget.id} className="card p-5 hover:shadow-md transition-shadow relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: budget.category.color }}
                      >
                        {budget.category.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {budget.category.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {new Date(budget.startDate).toLocaleDateString('vi-VN', {
                            month: 'short',
                            day: 'numeric'
                          })}{' '}
                          -{' '}
                          {new Date(budget.endDate).toLocaleDateString('vi-VN', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}>
                        {statusText}
                      </span>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Đã chi</span>
                      <span className="font-bold font-mono text-slate-800">
                        {formatVND(budget.amountSpent)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full ${progressColor} transition-all duration-500`}
                        style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Hạn mức: {formatVND(budget.amountLimit)}
                      </span>
                      <span className="text-slate-500">{budget.percentUsed}%</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg flex items-center justify-between text-sm ${isOver ? 'bg-red-50' : 'bg-slate-50'}`}>
                    <span className={isOver ? 'text-red-700 font-medium' : 'text-slate-600'}>
                      {isOver ? 'Vượt quá' : 'Còn lại'}
                    </span>
                    <span className={`font-bold font-mono ${isOver ? 'text-red-700' : 'text-slate-800'}`}>
                      {formatVND(Math.abs(remaining))}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Add Budget Card */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="card p-5 border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-colors flex flex-col items-center justify-center min-h-[240px] text-slate-500 hover:text-emerald-600 group"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <p className="font-medium">Tạo hạn mức mới</p>
              <p className="text-xs text-slate-400 mt-1">Thiết lập hạn mức cho các danh mục khác</p>
            </button>
          </div>
        </>
      )}

      {/* Add Budget Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-navy-900 mb-4">Tạo hạn mức mới</h3>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 rounded text-sm border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Danh mục
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="input-field"
                >
                  <option value="" disabled>Chọn danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hạn mức chi tiêu (VND)
                </label>
                <input
                  type="number"
                  required
                  value={amountLimit}
                  onChange={(e) => setAmountLimit(e.target.value)}
                  className="input-field"
                  placeholder="Ví dụ: 2000000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
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
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                  />
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
                  {isSubmitting ? 'Đang tạo...' : 'Tạo hạn mức'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}