import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Building2,
  Plus,
  X,
  Trash2
} from 'lucide-react';
import { formatVND } from '../lib/mockData';
import { api } from '../lib/api';

const accountTypeLabels: { [key: string]: string } = {
  BANK: 'Ngân hàng',
  CASH: 'Tiền mặt',
};

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('BANK');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/api/accounts');
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/api/accounts', {
        name,
        type,
        balance: 0,
        currency: 'VND'
      });
      setName('');
      setType('BANK');
      setIsAddModalOpen(false);
      fetchAccounts();
    } catch (err: any) {
      setError(err.message || 'Tạo tài khoản thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này không? Thao tác này cũng sẽ xóa tất cả giao dịch liên quan.')) {
      return;
    }
    try {
      await api.delete(`/api/accounts/${id}`);
      fetchAccounts();
    } catch (err: any) {
      alert(err.message || 'Xóa tài khoản thất bại.');
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Quản lý tài khoản giao dịch</h2>
          <p className="text-sm text-slate-500 mt-1">Theo dõi số dư tiền mặt và ngân hàng</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center justify-center sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm tài khoản
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Total Balance Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-850 to-emerald-950 p-6 text-white border border-navy-800 shadow-xl max-w-md w-full">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-navy-200 text-xs font-semibold uppercase tracking-wider">
                  Tổng số tiền còn lại
                </p>
                <span className="text-[10px] text-emerald-300 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Hoạt động
                </span>
              </div>
            </div>
            <p className="text-3xl font-extrabold font-mono tracking-tight bg-gradient-to-r from-white via-white to-emerald-200 bg-clip-text text-transparent">
              {formatVND(totalBalance)}
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-navy-300">
              <span>Cập nhật thời gian thực</span>
              <span className="font-semibold text-emerald-400 font-mono">{accounts.length} Tài khoản</span>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[170px]"
              >
                {/* Top Accent Bar */}
                <div className={`absolute top-0 left-0 h-1.5 w-full ${account.type === 'BANK' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`} />
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${account.type === 'BANK' ? 'bg-blue-55 text-blue-600' : 'bg-emerald-55 text-emerald-600'}`}>
                    {account.type === 'BANK' ? (
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-emerald-600" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all duration-200"
                    title="Xóa tài khoản"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {account.name}
                  </p>
                  <p className={`text-2xl font-bold font-mono tracking-tight ${account.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                    {formatVND(account.balance)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-[11px] ${account.type === 'BANK' ? 'bg-blue-50 text-blue-700 border border-blue-100/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'}`}>
                    {accountTypeLabels[account.type] || account.type}
                  </span>
                  <span className="font-semibold text-slate-400">VND</span>
                </div>
              </div>
            ))}

            {/* Add Account Card */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-400 transition-all duration-300 flex flex-col items-center justify-center min-h-[170px] text-slate-500 hover:text-emerald-600 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm">Thêm tài khoản mới</p>
              <p className="text-xs text-slate-400 mt-1">Ngân hàng hoặc Tiền mặt</p>
            </button>
          </div>
        </>
      )}

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-navy-900 mb-4">Thêm tài khoản mới</h3>

            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 rounded text-sm border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên tài khoản
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Ví dụ: Vietcombank, Tiền mặt sinh hoạt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Loại tài khoản
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-field"
                >
                  <option value="BANK">Tài khoản ngân hàng</option>
                  <option value="CASH">Tiền mặt</option>
                </select>
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
                  {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}