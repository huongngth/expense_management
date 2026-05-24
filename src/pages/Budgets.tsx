import React from 'react';
import {
  Plus,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  TrendingUp } from
'lucide-react';
import { formatVND, MOCK_BUDGETS } from '../lib/mockData';
export function Budgets() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Budgets</h2>
          <p className="text-slate-500 text-sm">Control your spending limits</p>
        </div>
        <button className="btn-primary flex items-center justify-center sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Budget
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">On Track</p>
            <p className="text-xl font-bold text-slate-800">2</p>
          </div>
        </div>
        <div className="card p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Nearing Limit</p>
            <p className="text-xl font-bold text-slate-800">1</p>
          </div>
        </div>
        <div className="card p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Exceeded</p>
            <p className="text-xl font-bold text-slate-800">1</p>
          </div>
        </div>
      </div>

      {/* Budgets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_BUDGETS.map((budget) => {
          const isOver = budget.percentUsed >= 100;
          const isWarning = budget.percentUsed >= 80 && !isOver;
          let statusColor = 'text-emerald-600';
          let statusBg = 'bg-emerald-50';
          let progressColor = 'bg-emerald-500';
          let statusText = 'On Track';
          if (isOver) {
            statusColor = 'text-red-600';
            statusBg = 'bg-red-50';
            progressColor = 'bg-red-500';
            statusText = 'Exceeded';
          } else if (isWarning) {
            statusColor = 'text-amber-600';
            statusBg = 'bg-amber-50';
            progressColor = 'bg-amber-500';
            statusText = 'Warning';
          }
          const remaining = budget.amountLimit - budget.amountSpent;
          return (
            <div
              key={budget.id}
              className="card p-5 hover:shadow-md transition-shadow">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{
                      backgroundColor: budget.category.color
                    }}>
                    
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
                      -
                      {new Date(budget.endDate).toLocaleDateString('vi-VN', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}>
                    
                    {statusText}
                  </span>
                  <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Spent</span>
                  <span className="font-bold font-mono text-slate-800">
                    {formatVND(budget.amountSpent)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${progressColor} transition-all duration-500`}
                    style={{
                      width: `${Math.min(budget.percentUsed, 100)}%`
                    }}>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Limit: {formatVND(budget.amountLimit)}
                  </span>
                  <span className="text-slate-500">{budget.percentUsed}%</span>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg flex items-center justify-between text-sm ${isOver ? 'bg-red-50' : 'bg-slate-50'}`}>
                
                <span
                  className={
                  isOver ? 'text-red-700 font-medium' : 'text-slate-600'
                  }>
                  
                  {isOver ? 'Overspent by' : 'Remaining'}
                </span>
                <span
                  className={`font-bold font-mono ${isOver ? 'text-red-700' : 'text-slate-800'}`}>
                  
                  {formatVND(Math.abs(remaining))}
                </span>
              </div>
            </div>);

        })}

        {/* Add Budget Card */}
        <button className="card p-5 border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-colors flex flex-col items-center justify-center min-h-[240px] text-slate-500 hover:text-emerald-600 group">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <p className="font-medium">Create New Budget</p>
          <p className="text-xs text-slate-400 mt-1">
            Set limits for other categories
          </p>
        </button>
      </div>
    </div>);

}