import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Building2,
  Smartphone,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Trash2
} from 'lucide-react';
import { formatVND } from '../lib/mockData';
import { api } from '../lib/api';

const accountTypeLabels: { [key: string]: string } = {
  BANK: 'Ngân hàng',
  EWALLET: 'Ví điện tử',
  CASH: 'Tiền mặt',
  CREDIT: 'Thẻ tín dụng',
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

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'BANK':
        return <Building2 className="w-6 h-6 text-blue-500" />;
      case 'EWALLET':
        return <Smartphone className="w-6 h-6 text-purple-500" />;
      case 'CREDIT':
        return <CreditCard className="w-6 h-6 text-red-500" />;
      case 'CASH':
      default:
        return <Wallet className="w-6 h-6 text-emerald-500" />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'BANK':
        return 'bg-blue-50';
      case 'EWALLET':
        return 'bg-purple-50';
      case 'CREDIT':
        return 'bg-red-50';
      case 'CASH':
      default:
        return 'bg-emerald-50';
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Quản lý tài khoản giao dịch</h2>
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
          <div className="card p-6 bg-navy-900 text-white border-transparent flex flex-col sm:flex-row sm:items-center justify-between w-1/3">
            <div>
              <p className="text-navy-200 text-sm font-medium mb-1">
                Tổng số tiền còn lại
              </p>
              <p className="text-3xl font-bold font-mono">
                {formatVND(totalBalance)}
              </p>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="card p-5 hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${getAccountColor(account.type)}`}
                  >
                    {getAccountIcon(account.type)}
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    {account.name}
                  </p>
                  <p
                    className={`text-xl font-bold font-mono ${account.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}
                  >
                    {formatVND(account.balance)}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded font-medium">
                    {accountTypeLabels[account.type] || account.type}
                  </span>
                  <span>VND</span>
                </div>
              </div>
            ))}

            {/* Add Account Card */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="card p-5 border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-colors flex flex-col items-center justify-center min-h-[180px] text-slate-500 hover:text-emerald-600 group"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <p className="font-medium">Thêm tài khoản mới</p>
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
                  placeholder="Ví dụ: Vietcombank, Ví Momo"
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
                  <option value="EWALLET">Ví điện tử</option>
                  <option value="CASH">Tiền mặt</option>
                  <option value="CREDIT">Thẻ tín dụng</option>
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