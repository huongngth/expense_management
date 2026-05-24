import React from 'react';
import {
  Wallet,
  Building2,
  Smartphone,
  CreditCard,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight } from
'lucide-react';
import { formatVND, MOCK_ACCOUNTS } from '../lib/mockData';
export function Accounts() {
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
  const totalBalance = MOCK_ACCOUNTS.reduce((sum, acc) => sum + acc.balance, 0);
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Accounts</h2>
          <p className="text-slate-500 text-sm">
            Manage your wallets and bank accounts
          </p>
        </div>
        <button className="btn-primary flex items-center justify-center sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="card p-6 bg-navy-900 text-white border-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-navy-200 text-sm font-medium mb-1">
            Total Net Worth
          </p>
          <p className="text-3xl font-bold font-mono">
            {formatVND(totalBalance)}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-navy-800 rounded-lg p-3 px-4">
            <div className="flex items-center text-emerald-400 text-xs font-medium mb-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> Assets
            </div>
            <p className="font-mono font-semibold">
              {formatVND(
                MOCK_ACCOUNTS.filter((a) => a.balance > 0).reduce(
                  (s, a) => s + a.balance,
                  0
                )
              )}
            </p>
          </div>
          <div className="bg-navy-800 rounded-lg p-3 px-4">
            <div className="flex items-center text-red-400 text-xs font-medium mb-1">
              <ArrowDownRight className="w-3 h-3 mr-1" /> Liabilities
            </div>
            <p className="font-mono font-semibold">
              {formatVND(
                Math.abs(
                  MOCK_ACCOUNTS.filter((a) => a.balance < 0).reduce(
                    (s, a) => s + a.balance,
                    0
                  )
                )
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {MOCK_ACCOUNTS.map((account) =>
        <div
          key={account.id}
          className="card p-5 hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden">
          
            <div className="flex justify-between items-start mb-4">
              <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${getAccountColor(account.type)}`}>
              
                {getAccountIcon(account.type)}
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {account.name}
              </p>
              <p
              className={`text-xl font-bold font-mono ${account.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
              
                {formatVND(account.balance)}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span className="bg-slate-100 px-2 py-1 rounded font-medium">
                {account.type}
              </span>
              <span>Updated today</span>
            </div>

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-navy-900/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button className="btn-primary py-1.5 px-3 text-sm shadow-sm">
                View Details
              </button>
            </div>
          </div>
        )}

        {/* Add Account Card */}
        <button className="card p-5 border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-colors flex flex-col items-center justify-center min-h-[180px] text-slate-500 hover:text-emerald-600 group">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <p className="font-medium">Add New Account</p>
        </button>
      </div>
    </div>);

}