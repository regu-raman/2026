import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, CheckCircle2, Save, Edit3, IndianRupee } from 'lucide-react';
import { getBudgets, saveBudgets } from '../utils/storage';
import { CATEGORIES } from '../constants/categories';
import { formatCurrency, isThisMonth } from '../utils/calculations';

export default function BudgetManager({ expenses = [] }) {
  const [budgets, setBudgets] = useState({ monthlyTotal: 0, categories: {} });
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudgets, setEditedBudgets] = useState({ monthlyTotal: 0, categories: {} });

  useEffect(() => {
    let isMounted = true;
    getBudgets().then(loaded => {
      if (isMounted && loaded) {
        setBudgets(loaded);
        setEditedBudgets(loaded);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Filter expenses for current month
  const currentMonthExpenses = expenses.filter(e => {
    if (!e.date) return false;
    return isThisMonth(new Date(e.date + 'T00:00:00'));
  });

  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleSave = async (e) => {
    e.preventDefault();
    await saveBudgets(editedBudgets);
    setBudgets(editedBudgets);
    setIsEditing(false);
  };

  const handleCategoryChange = (catName, val) => {
    const num = parseFloat(val) || 0;
    setEditedBudgets(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [catName]: num
      }
    }));
  };

  const monthlyBudget = budgets.monthlyTotal || 0;
  const monthlyPercent = monthlyBudget > 0 ? (totalSpentThisMonth / monthlyBudget) * 100 : 0;
  const isOverallOverBudget = monthlyBudget > 0 && totalSpentThisMonth > monthlyBudget;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Budget Limits & Goal Tracker</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Set and manage your monthly spending limits per category and overall household limit.
          </p>
        </div>

        <div>
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Budget Limits</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors text-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Budget Limits</span>
            </button>
          )}
        </div>
      </div>

      {/* Monthly Total Budget Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl ${isOverallOverBudget ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Overall Monthly Budget</h2>
              <p className="text-xs text-slate-400">Current calendar month target</p>
            </div>
          </div>

          <div className="text-right">
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={editedBudgets.monthlyTotal}
                  onChange={(e) => setEditedBudgets({ ...editedBudgets, monthlyTotal: parseFloat(e.target.value) || 0 })}
                  className="w-32 px-3 py-1.5 text-base font-bold text-slate-800 border border-slate-300 rounded-xl focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            ) : (
              <div>
                <span className="text-2xl font-extrabold text-slate-900 block">{formatCurrency(monthlyBudget)}</span>
                <span className="text-xs text-slate-400 font-medium">
                  Remaining: <span className={monthlyBudget - totalSpentThisMonth < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {formatCurrency(monthlyBudget - totalSpentThisMonth)}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Spent: {formatCurrency(totalSpentThisMonth)}</span>
            <span className={monthlyPercent > 100 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
              {monthlyPercent.toFixed(1)}% Used
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                monthlyPercent > 100 ? 'bg-rose-500' : monthlyPercent > 85 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(monthlyPercent, 100)}%` }}
            />
          </div>
        </div>

        {isOverallOverBudget && (
          <div className="flex items-center space-x-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Alert: You have exceeded your overall monthly budget limit by {formatCurrency(totalSpentThisMonth - monthlyBudget)}!</span>
          </div>
        )}
      </div>

      {/* Category Budget Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-800">Category-Wise Budget Allocations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const categoryExpenses = currentMonthExpenses.filter(e => e.category === cat.name);
            const spent = categoryExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            const limit = (isEditing ? editedBudgets.categories?.[cat.name] : budgets.categories?.[cat.name]) || 0;
            const pct = limit > 0 ? (spent / limit) * 100 : 0;
            const isExceeded = limit > 0 && spent > limit;

            return (
              <div key={cat.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl ${cat.iconBg} text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">{cat.name}</span>
                      <span className="text-xs text-slate-400">Spent: {formatCurrency(spent)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {isEditing ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          value={editedBudgets.categories?.[cat.name] || 0}
                          onChange={(e) => handleCategoryChange(cat.name, e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-bold text-slate-800 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">Limit: {formatCurrency(limit)}</span>
                        <span className={`text-[10px] font-bold ${isExceeded ? 'text-rose-600' : 'text-slate-400'}`}>
                          {limit > 0 ? `${pct.toFixed(0)}% limit used` : 'No limit set'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {limit > 0 && (
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded ? 'bg-rose-500' : pct > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
