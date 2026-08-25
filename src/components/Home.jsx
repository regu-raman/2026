import React from 'react';
import { Plus, Calendar, TrendingUp, DollarSign, Clock, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { calculateTotals, formatCurrency } from '../utils/calculations';
import { getCategoryConfig } from '../constants/categories';

export default function Home({ expenses = [], onOpenAddModal, onEditExpense, onDeleteExpense, onViewAll }) {
  const totals = calculateTotals(expenses);
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Banner / Greeting */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Daily Expense Tracker
            </h1>
            <p className="mt-1 text-indigo-100 text-sm sm:text-base max-w-lg">
              Monitor your daily spending habits, manage categories, and stay on budget effortless.
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-2 px-5 py-3 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>Add Expense</span>
          </button>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Totals Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Total
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">
              {formatCurrency(totals.todayTotal)}
            </span>
            <p className="text-xs text-slate-400 mt-1">Expenses recorded today</p>
          </div>
        </div>

        {/* This Week's Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              This Week's Total
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">
              {formatCurrency(totals.weekTotal)}
            </span>
            <p className="text-xs text-slate-400 mt-1">Mon - Sun current week</p>
          </div>
        </div>

        {/* This Month's Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              This Month's Total
            </span>
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">
              {formatCurrency(totals.monthTotal)}
            </span>
            <p className="text-xs text-slate-400 mt-1">Current calendar month</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Recent Transactions</h2>
            <p className="text-xs text-slate-500">Latest expense activities</p>
          </div>
          {expenses.length > 0 && (
            <button
              onClick={onViewAll}
              className="flex items-center space-x-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-slate-600 font-medium text-sm">No expenses recorded yet</p>
            <p className="text-slate-400 text-xs mt-1">Click "+ Add Expense" to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentExpenses.map((exp) => {
              const categoryConfig = getCategoryConfig(exp.category);
              const Icon = categoryConfig.icon;

              return (
                <div
                  key={exp.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${categoryConfig.iconBg} text-white shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800 text-sm">
                          {exp.note || exp.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryConfig.color}`}>
                          {exp.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span>{exp.date}</span>
                        <span>•</span>
                        <span className="capitalize">{exp.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-slate-800 text-base">
                      -{formatCurrency(exp.amount)}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                      <button
                        onClick={() => onEditExpense(exp)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
