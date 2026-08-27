import React from 'react';
import { Wallet, Home, History as HistoryIcon, PieChart, Target, Users, Repeat, Plus, LogOut, User, Settings } from 'lucide-react';
import { THEME_PALETTES } from './Profile';

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal, currentUser, onSignOut, currentTheme = 'indigo' }) {
  const activePalette = THEME_PALETTES.find(t => t.id === currentTheme) || THEME_PALETTES[0];

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'profile', label: 'Profile', icon: Settings },
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
            <div className={`p-2 ${activePalette.primary} rounded-xl text-white shadow-md transition-colors`}>
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-xl font-bold bg-gradient-to-r ${activePalette.gradient} bg-clip-text text-transparent`}>
                ExpenseTracker
              </span>
              <span className={`hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 ${activePalette.bg} ${activePalette.text} rounded-full border border-slate-200`}>
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
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? `${activePalette.bg} ${activePalette.text} font-bold shadow-xs`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? activePalette.text : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions & User Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenAddModal}
              className={`flex items-center space-x-1.5 px-3.5 py-2 ${activePalette.primary} text-white font-medium rounded-lg text-xs sm:text-sm shadow-md transition-colors cursor-pointer`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>

            {currentUser && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 ${
                    activeTab === 'profile' ? activePalette.bg + ' ' + activePalette.text : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  } rounded-lg transition-colors cursor-pointer`}
                  title="Configure Profile & Theme Settings"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[100px] truncate">{currentUser.username || currentUser.email}</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
