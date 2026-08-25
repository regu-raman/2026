import React from 'react';
import { Wallet, Home, History as HistoryIcon, PieChart, Target, Users, Repeat, Plus, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal, currentUser, onSignOut }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab('home')}
          >
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-200">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ExpenseTracker
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                Daily
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2 mx-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions & User Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs sm:text-sm shadow-md shadow-indigo-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>

            {currentUser && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-600 font-medium px-2 py-1 bg-slate-100 rounded-lg">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="max-w-[120px] truncate">{currentUser.username || currentUser.email}</span>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
