import React, { useState, useEffect } from 'react';
import { Repeat, Plus, Trash2, Calendar, Check, Play, Pause, AlertCircle } from 'lucide-react';
import { getRecurringExpenses, addRecurringExpense, deleteRecurringExpense, saveRecurringExpenses } from '../utils/storage';
import { CATEGORIES, getCategoryConfig } from '../constants/categories';
import { PAYMENT_METHODS } from '../constants/paymentMethods';
import { formatCurrency } from '../utils/calculations';
import { processDueRecurringExpenses } from '../utils/recurring';

export default function RecurringExpenses({ onExpensesUpdated }) {
  const [recurringList, setRecurringList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New form fields
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bills');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [note, setNote] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    let isMounted = true;
    getRecurringExpenses().then(items => {
      if (isMounted && items) setRecurringList(items);
    });
    return () => { isMounted = false; };
  }, []);

  const handleToggleActive = async (id) => {
    const updated = recurringList.map(item => {
      if (item.id === id) {
        return { ...item, active: !item.active };
      }
      return item;
    });
    setRecurringList(updated);
    await saveRecurringExpenses(updated);
  };

  const handleDelete = async (id) => {
    const updated = await deleteRecurringExpense(id);
    setRecurringList(updated);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const newItem = {
      amount: parseFloat(amount),
      category,
      paymentMethod,
      note: note.trim() || 'Subscription/Bill',
      frequency,
      nextDueDate,
      member: 'Self',
      isShared: false
    };

    const updated = await addRecurringExpense(newItem);
    setRecurringList(updated);
    setShowAddForm(false);
    setAmount('');
    setNote('');
  };

  const handleRunSync = async () => {
    const { updatedExpenses, addedCount } = await processDueRecurringExpenses();
    if (addedCount > 0) {
      onExpensesUpdated(updatedExpenses);
    }
    const items = await getRecurringExpenses();
    setRecurringList(items);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recurring Expenses & Bills</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Automate subscriptions, rent, utility bills, and fixed periodic expenses.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunSync}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Repeat className="w-4 h-4" />
            <span>Process Due Bills</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Recurring</span>
          </button>
        </div>
      </div>

      {/* Add Recurring Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-800">Set Up New Recurring Expense</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:border-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Frequency *</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Next Due Date *</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:border-indigo-500"
              >
                {PAYMENT_METHODS.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description / Note</label>
              <input
                type="text"
                placeholder="e.g., Netflix, Rent..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
            >
              Save Recurring Item
            </button>
          </div>
        </form>
      )}

      {/* Recurring List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {recurringList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            No recurring expenses configured. Click "New Recurring" to automate bills.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recurringList.map((item) => {
              const catConfig = getCategoryConfig(item.category);
              const Icon = catConfig.icon;

              return (
                <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${catConfig.iconBg} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-base">{item.note}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.frequency}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span>Next due: <strong className="text-slate-600">{item.nextDueDate}</strong></span>
                        <span>•</span>
                        <span>{item.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-extrabold text-slate-900 text-lg">
                      {formatCurrency(item.amount)}
                    </span>
                    <button
                      onClick={() => handleToggleActive(item.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        item.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                      }`}
                      title={item.active ? 'Pause Recurring' : 'Resume Recurring'}
                    >
                      {item.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
