import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Edit2, Trash2, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';
import { filterExpenses, formatCurrency } from '../utils/calculations';
import { exportToCSV, exportToExcel } from '../utils/export';
import { CATEGORIES, getCategoryConfig } from '../constants/categories';

export default function History({ expenses = [], onEditExpense, onDeleteExpense }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredExpenses = useMemo(() => {
    return filterExpenses(expenses, {
      searchQuery,
      category: selectedCategory,
      startDate,
      endDate
    });
  }, [expenses, searchQuery, selectedCategory, startDate, endDate]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || startDate || endDate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expense History</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Search, filter, and manage all your past expense records.
          </p>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => exportToCSV(filteredExpenses)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV Export</span>
          </button>
          <button
            onClick={() => exportToExcel(filteredExpenses)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors"
            title="Export Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel Export</span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Query */}
          <div className="relative md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search notes, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Expense List / Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 font-semibold">No transactions match your search/filter criteria.</p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-3 inline-flex items-center space-x-1.5 text-sm font-medium text-indigo-600 hover:underline"
              >
                <span>Clear filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Note / Description</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Payment Method</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredExpenses.map((exp) => {
                  const catConfig = getCategoryConfig(exp.category);
                  const Icon = catConfig.icon;

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Category */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${catConfig.iconBg} text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${catConfig.color}`}>
                            {exp.category}
                          </span>
                        </div>
                      </td>

                      {/* Note */}
                      <td className="py-4 px-6 text-slate-800 font-medium max-w-xs truncate">
                        {exp.note || <span className="text-slate-400 italic">No note</span>}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {exp.date}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-6 text-slate-600">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {exp.paymentMethod}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        -{formatCurrency(exp.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
