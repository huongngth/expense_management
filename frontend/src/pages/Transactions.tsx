import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2
} from 'lucide-react';
import { formatVND } from '../lib/mockData';
import { api } from '../lib/api';

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  accountId: string;
  accountName: string;
  transactionDate: string;
  description: string;
}

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Add Transaction Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFiltersData = async () => {
    try {
      const [catsData, accsData] = await Promise.all([
        api.get('/api/categories'),
        api.get('/api/accounts')
      ]);
      setCategories(catsData);
      setAccounts(accsData);
      if (catsData.length > 0) setCategoryId(catsData[0].id);
      if (accsData.length > 0) setAccountId(accsData[0].id);
    } catch (err) {
      console.error('Error fetching categories/accounts:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: '10',
        searchTerm,
        type: filterType,
        categoryId: filterCategory,
        accountId: filterAccount,
        startDate: filterStartDate,
        endDate: filterEndDate
      });
      const data = await api.get(`/api/transactions?${queryParams.toString()}`);
      setTransactions(data.data);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm, filterType, filterCategory, filterAccount, filterStartDate, filterEndDate]);

  // Synchronize categoryId when transaction type changes to prevent mismatch
  useEffect(() => {
    const filtered = categories.filter(c => type === 'ALL' || c.type === type);
    if (filtered.length > 0) {
      const isCurrentValid = filtered.some(c => c.id === categoryId);
      if (!isCurrentValid) {
        setCategoryId(filtered[0].id);
      }
    } else {
      setCategoryId('');
    }
  }, [type, categories, categoryId]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !accountId || !categoryId) return;

    // Check balance if type is EXPENSE
    const selectedAccount = accounts.find(a => a.id === accountId);
    if (type === 'EXPENSE' && selectedAccount && parseFloat(amount) > selectedAccount.balance) {
      setError(`Không thể chọn tài khoản ${selectedAccount.name} do không đủ số dư (Số dư hiện tại: ${formatVND(selectedAccount.balance)}).`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/api/transactions', {
        type,
        amount: parseFloat(amount),
        description,
        transactionDate: new Date(transactionDate).toISOString(),
        accountId,
        categoryId
      });
      setDescription('');
      setAmount('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setIsAddModalOpen(false);
      await fetchFiltersData();
      fetchTransactions();
    } catch (err: any) {
      setError(err.message || 'Tạo giao dịch thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giao dịch này không?')) return;
    try {
      await api.delete(`/api/transactions/${id}`);
      await fetchFiltersData();
      fetchTransactions();
    } catch (err: any) {
      alert(err.message || 'Xóa giao dịch thất bại.');
    }
  };

  const handleResetFilters = () => {
    setFilterType('ALL');
    setFilterCategory('');
    setFilterAccount('');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(1);
  };

  const selectedAccount = accounts.find(a => a.id === accountId);
  const isOverdrawn = type === 'EXPENSE' && selectedAccount && amount && parseFloat(amount) > selectedAccount.balance;

  return (
    <div className="h-full flex flex-col space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Giao dịch mới
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm giao dịch..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field pl-10 w-full"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`btn-secondary flex items-center justify-center sm:w-auto ${isFilterOpen ? 'bg-slate-100 ring-2 ring-slate-200' : ''}`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Bộ lọc
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center flex-1 py-12">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mô tả</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh mục</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tài khoản</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Số tiền</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(txn.transactionDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{txn.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${txn.categoryColor}15`,
                              color: txn.categoryColor
                            }}
                          >
                            {txn.categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{txn.accountName}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold font-mono text-right ${txn.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {txn.type === 'INCOME' ? '+' : '-'}
                          {formatVND(txn.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => handleDeleteTransaction(txn.id)}
                            className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden flex-1 overflow-auto divide-y divide-slate-100">
                {transactions.map((txn) => (
                  <div key={txn.id} className="p-4 bg-white hover:bg-slate-50 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">{txn.description}</p>
                      <p className={`text-sm font-bold font-mono whitespace-nowrap ml-2 ${txn.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {txn.type === 'INCOME' ? '+' : '-'}
                        {formatVND(txn.amount)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <div className="flex items-center space-x-2">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            backgroundColor: `${txn.categoryColor}15`,
                            color: txn.categoryColor
                          }}
                        >
                          {txn.categoryName}
                        </span>
                        <span>•</span>
                        <span>{txn.accountName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{new Date(txn.transactionDate).toLocaleDateString('vi-VN')}</span>
                        <button
                          onClick={() => handleDeleteTransaction(txn.id)}
                          className="text-slate-400 hover:text-red-600 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="hidden sm:block text-sm text-slate-500">
                  Hiển thị từ <span className="font-medium">{Math.min(totalCount, (currentPage - 1) * 10 + 1)}</span> đến{' '}
                  <span className="font-medium">{Math.min(currentPage * 10, totalCount)}</span> trên tổng số{' '}
                  <span className="font-medium">{totalCount}</span> kết quả
                </div>
                <div className="flex-1 sm:flex-none flex justify-between sm:justify-end gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary px-3 py-1 text-sm flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary px-3 py-1 text-sm flex items-center"
                  >
                    Sau <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filter Sidebar (Desktop) / Drawer (Mobile) */}
        {isFilterOpen && (
          <div className="w-full md:w-72 flex-shrink-0 card p-5 flex flex-col h-full overflow-y-auto absolute md:relative inset-0 z-20 bg-white md:bg-transparent shadow-lg md:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-800">Bộ lọc</h3>
              <button onClick={() => setIsFilterOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 flex-1 text-slate-700">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Loại</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFilterType('ALL'); setCurrentPage(1); }}
                    className={`flex-1 py-1.5 px-3 rounded-md border text-sm font-medium transition-colors ${filterType === 'ALL' ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => { setFilterType('INCOME'); setCurrentPage(1); }}
                    className={`flex-1 py-1.5 px-3 rounded-md border text-sm font-medium transition-colors ${filterType === 'INCOME' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 bg-white text-emerald-600 hover:bg-emerald-50'}`}
                  >
                    Thu nhập
                  </button>
                  <button
                    onClick={() => { setFilterType('EXPENSE'); setCurrentPage(1); }}
                    className={`flex-1 py-1.5 px-3 rounded-md border text-sm font-medium transition-colors ${filterType === 'EXPENSE' ? 'bg-red-600 border-red-600 text-white' : 'border-slate-200 bg-white text-red-600 hover:bg-red-50'}`}
                  >
                    Chi tiêu
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Danh mục</label>
                <select
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                  className="input-field py-1.5 text-sm"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Account Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tài khoản</label>
                <select
                  value={filterAccount}
                  onChange={(e) => { setFilterAccount(e.target.value); setCurrentPage(1); }}
                  className="input-field py-1.5 text-sm"
                >
                  <option value="">Tất cả tài khoản</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Khoảng thời gian</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
                    className="input-field py-1.5 text-sm px-2"
                  />
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
                    className="input-field py-1.5 text-sm px-2"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 flex gap-3">
              <button onClick={handleResetFilters} className="btn-secondary flex-1 py-2 text-sm">Đặt lại</button>
              <button onClick={() => setIsFilterOpen(false)} className="btn-primary flex-1 py-2 text-sm">Xong</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-navy-900 mb-4">Giao dịch mới</h3>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 rounded text-sm border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  placeholder="Ví dụ: Ăn trưa văn phòng, Nhận lương..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phân loại
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input-field"
                  >
                    <option value="EXPENSE">Chi tiêu</option>
                    <option value="INCOME">Thu nhập</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Số tiền (VND)
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field"
                    placeholder="Ví dụ: 50000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tài khoản
                  </label>
                  <select
                    required
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className={`input-field ${isOverdrawn ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/20' : ''}`}
                  >
                    <option value="" disabled>Chọn tài khoản</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatVND(a.balance)})
                      </option>
                    ))}
                  </select>
                  {isOverdrawn && selectedAccount && (
                    <p className="mt-1 text-xs text-red-600 font-semibold animate-pulse">
                      Không đủ số dư
                    </p>
                  )}
                </div>
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
                    {categories.filter(c => type === 'ALL' || c.type === type).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ngày giao dịch
                </label>
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="input-field"
                />
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
                  {isSubmitting ? 'Đang tạo...' : 'Tạo giao dịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}