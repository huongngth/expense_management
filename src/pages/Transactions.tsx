import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X } from
'lucide-react';
import {
  formatVND,
  MOCK_TRANSACTIONS,
  MOCK_CATEGORIES,
  MOCK_ACCOUNTS } from
'../lib/mockData';
export function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // Mock pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(MOCK_TRANSACTIONS.length / itemsPerPage);
  const currentTransactions = MOCK_TRANSACTIONS.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Transactions</h2>
          <p className="text-slate-500 text-sm">
            Manage your income and expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
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
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full" />
          
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`btn-secondary flex items-center justify-center sm:w-auto ${isFilterOpen ? 'bg-slate-100 ring-2 ring-slate-200' : ''}`}>
          
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col card overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {currentTransactions.map((txn) =>
                <tr
                  key={txn.id}
                  className="hover:bg-slate-50 transition-colors group">
                  
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(txn.transactionDate).toLocaleDateString(
                      'vi-VN'
                    )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {txn.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${txn.categoryColor}15`,
                        color: txn.categoryColor
                      }}>
                      
                        {txn.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {txn.accountName}
                    </td>
                    <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-bold font-mono text-right ${txn.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    
                      {txn.type === 'INCOME' ? '+' : '-'}
                      {formatVND(txn.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-5 h-5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex-1 overflow-auto divide-y divide-slate-100">
            {currentTransactions.map((txn) =>
            <div key={txn.id} className="p-4 bg-white hover:bg-slate-50">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-slate-800 line-clamp-1">
                    {txn.description}
                  </p>
                  <p
                  className={`text-sm font-bold font-mono whitespace-nowrap ml-2 ${txn.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  
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
                    }}>
                    
                      {txn.categoryName}
                    </span>
                    <span>•</span>
                    <span>{txn.accountName}</span>
                  </div>
                  <span>
                    {new Date(txn.transactionDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="hidden sm:block text-sm text-slate-500">
              Showing{' '}
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, MOCK_TRANSACTIONS.length)}
              </span>{' '}
              of <span className="font-medium">{MOCK_TRANSACTIONS.length}</span>{' '}
              results
            </div>
            <div className="flex-1 sm:flex-none flex justify-between sm:justify-end gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary px-3 py-1 text-sm flex items-center">
                
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </button>
              <button
                onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="btn-secondary px-3 py-1 text-sm flex items-center">
                
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Sidebar (Desktop) / Drawer (Mobile) */}
        {isFilterOpen &&
        <div className="w-full md:w-72 flex-shrink-0 card p-5 flex flex-col h-full overflow-y-auto absolute md:relative inset-0 z-20 bg-white md:bg-transparent">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-800">Filters</h3>
              <button
              onClick={() => setIsFilterOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600">
              
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-navy-500">
                    All
                  </button>
                  <button className="flex-1 py-1.5 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium text-emerald-600 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-500">
                    Income
                  </button>
                  <button className="flex-1 py-1.5 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-500">
                    Expense
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select className="input-field py-1.5 text-sm">
                  <option value="">All Categories</option>
                  {MOCK_CATEGORIES.map((c) =>
                <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                )}
                </select>
              </div>

              {/* Account Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account
                </label>
                <select className="input-field py-1.5 text-sm">
                  <option value="">All Accounts</option>
                  {MOCK_ACCOUNTS.map((a) =>
                <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                )}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                  type="date"
                  className="input-field py-1.5 text-sm px-2" />
                
                  <input
                  type="date"
                  className="input-field py-1.5 text-sm px-2" />
                
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 flex gap-3">
              <button className="btn-secondary flex-1 py-2 text-sm">
                Reset
              </button>
              <button className="btn-primary flex-1 py-2 text-sm">Apply</button>
            </div>
          </div>
        }
      </div>
    </div>);

}