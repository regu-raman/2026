import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import { getCategoryBreakdown, getChartData, formatCurrency } from '../utils/calculations';
import { PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react';

export default function Reports({ expenses = [] }) {
  const [period, setPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'

  const chartData = getChartData(expenses, period);
  const categoryBreakdown = getCategoryBreakdown(expenses);
  const totalSpent = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Visualize your spending patterns and category distribution.
          </p>
        </div>

        {/* Period Selector */}
        <div className="inline-flex p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'daily'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily (7 Days)
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'weekly'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly (4 Weeks)
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'monthly'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly (6 Months)
          </button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Expense Trend ({period.charAt(0).toUpperCase() + period.slice(1)})
              </h2>
              <p className="text-xs text-slate-400">Total amount spent per period</p>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Total Spent']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem'
                  }}
                />
                <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No chart data available
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Progress Bars */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Category Breakdown</h2>
                <p className="text-xs text-slate-400">Spending distribution by category</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Total All Time</span>
              <span className="text-lg font-bold text-slate-800">{formatCurrency(totalSpent)}</span>
            </div>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map((cat) => {
              const Icon = cat.icon;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-1.5 rounded-lg ${cat.iconBg} text-white`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-700">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 mr-2">{formatCurrency(cat.amount)}</span>
                      <span className="text-xs font-semibold text-slate-400">({cat.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.barColor
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Highlights / Summary side panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Insights</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Top Category</span>
                <span className="text-base font-bold text-slate-800 mt-0.5 block">
                  {categoryBreakdown[0]?.amount > 0 ? categoryBreakdown[0].name : 'N/A'}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  {categoryBreakdown[0]?.amount > 0
                    ? `Accounted for ${categoryBreakdown[0].percentage}% of total expenses.`
                    : 'No expense recorded yet.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Transactions</span>
                <span className="text-base font-bold text-slate-800 mt-0.5 block">
                  {expenses.length} Records
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Average spend: {expenses.length > 0 ? formatCurrency(totalSpent / expenses.length) : '$0.00'} / record
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
            Updated in real-time based on local storage entries.
          </div>
        </div>
      </div>
    </div>
  );
}
