import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, HeartHandshake, UserCheck } from 'lucide-react';
import { getFamilyMembers, addFamilyMember } from '../utils/storage';
import { formatCurrency } from '../utils/calculations';

export default function FamilyExpenses({ expenses = [] }) {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
    let isMounted = true;
    getFamilyMembers().then(members => {
      if (isMounted && members) setFamilyMembers(members);
    });
    return () => { isMounted = false; };
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const updated = await addFamilyMember(newMemberName);
    setFamilyMembers(updated);
    setNewMemberName('');
  };

  // Calculations per family member
  const memberTotals = familyMembers.map(member => {
    const memberExps = expenses.filter(e => (e.member || 'Self') === member);
    const totalSpent = memberExps.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const sharedCount = memberExps.filter(e => e.isShared).length;
    return {
      name: member,
      totalSpent,
      count: memberExps.length,
      sharedCount
    };
  });

  const grandTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalShared = expenses.filter(e => e.isShared).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Family & Shared Expenses</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Track individual family member contributions and shared household expenses.
          </p>
        </div>

        {/* Add Family Member Form */}
        <form onSubmit={handleAddMember} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Add family member..."
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <button
            type="submit"
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Household Expenses</span>
            <span className="text-2xl font-bold text-slate-800 mt-0.5 block">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Shared / Split Pool</span>
            <span className="text-2xl font-bold text-slate-800 mt-0.5 block">{formatCurrency(totalShared)}</span>
          </div>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberTotals.map((m) => {
          const percentage = grandTotal > 0 ? ((m.totalSpent / grandTotal) * 100).toFixed(1) : '0';

          return (
            <div key={m.name} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{m.name}</h3>
                    <p className="text-xs text-slate-400">{m.count} transactions</p>
                  </div>
                </div>
                <UserCheck className="w-5 h-5 text-indigo-500" />
              </div>

              <div>
                <span className="text-2xl font-bold text-slate-900 block">{formatCurrency(m.totalSpent)}</span>
                <span className="text-xs font-medium text-slate-400">{percentage}% of family total</span>
              </div>

              {/* Share Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Shared Items:</span>
                <span className="font-semibold text-slate-700">{m.sharedCount} records</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
