import React, { useState, Component } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Briefcase,
  Gift,
  MoreVertical } from
'lucide-react';
import { MOCK_CATEGORIES } from '../lib/mockData';
export function Categories() {
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const expenseCategories = MOCK_CATEGORIES.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = MOCK_CATEGORIES.filter((c) => c.type === 'INCOME');
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
  const CategoryList = ({
    categories


  }: {categories: typeof MOCK_CATEGORIES;}) =>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {categories.map((category) =>
    <div
      key={category.id}
      className="card p-4 flex items-center justify-between group hover:border-slate-300 transition-colors">
      
          <div className="flex items-center space-x-4">
            <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
          style={{
            backgroundColor: category.color
          }}>
          
              {getIconComponent(category.icon)}
            </div>
            <div>
              <h4 className="font-medium text-slate-800">{category.name}</h4>
              <p className="text-xs text-slate-500">12 transactions</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {/* Mobile actions */}
          <button className="sm:hidden p-2 text-slate-400 hover:text-slate-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
    )}

      {/* Add New Button */}
      <button className="card p-4 border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-colors flex items-center justify-center text-slate-500 hover:text-emerald-600 group min-h-[74px]">
        <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        <span className="font-medium">Add Category</span>
      </button>
    </div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Categories</h2>
          <p className="text-slate-500 text-sm">Organise your transactions</p>
        </div>
        <button className="btn-primary flex items-center justify-center sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </button>
      </div>

      {/* Desktop View: Two Columns */}
      <div className="hidden md:grid grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              Expense Categories
            </h3>
            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {expenseCategories.length}
            </span>
          </div>
          <CategoryList categories={expenseCategories} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Income Categories
            </h3>
            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {incomeCategories.length}
            </span>
          </div>
          <CategoryList categories={incomeCategories} />
        </div>
      </div>

      {/* Mobile View: Tabs */}
      <div className="md:hidden space-y-4">
        <div className="flex p-1 bg-slate-200 rounded-lg">
          <button
            onClick={() => setActiveTab('EXPENSE')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'EXPENSE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('INCOME')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'INCOME' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            
            Income
          </button>
        </div>

        <div>
          <CategoryList
            categories={
            activeTab === 'EXPENSE' ? expenseCategories : incomeCategories
            } />
          
        </div>
      </div>
    </div>);

}