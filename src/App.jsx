import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import History from './components/History';
import Reports from './components/Reports';
import BudgetManager from './components/BudgetManager';
import FamilyExpenses from './components/FamilyExpenses';
import RecurringExpenses from './components/RecurringExpenses';
import Profile from './components/Profile';
import ExpenseModal from './components/ExpenseModal';
import AuthScreen from './components/AuthScreen';
import { getExpenses, addExpense, updateExpense, deleteExpense } from './utils/storage';
import { processDueRecurringExpenses } from './utils/recurring';
import { onAuthStateChange, signOutUser } from './utils/auth';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('indigo');
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [authScreenMode, setAuthScreenMode] = useState('login');

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChange(async (user, event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthScreenMode('reset');
        setCurrentUser(null);
        setAuthChecking(false);
        return;
      }

      setCurrentUser(user);
      if (user?.theme) {
        setCurrentTheme(user.theme);
      }
      setAuthChecking(false);

      if (user) {
        const { updatedExpenses } = await processDueRecurringExpenses();
        const current = updatedExpenses || await getExpenses();
        setExpenses(current);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSaveExpense = async (formData) => {
    if (editingExpense) {
      const updated = await updateExpense(editingExpense.id, formData);
      setExpenses(updated);
    } else {
      const updated = await addExpense(formData);
      setExpenses(updated);
    }
    handleCloseModal();
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      const updated = await deleteExpense(deletingId);
      setExpenses(updated);
      setDeletingId(null);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        initialMode={authScreenMode}
        onAuthSuccess={(user) => {
          setAuthScreenMode('login');
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        currentTheme={currentTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <Home
            expenses={expenses}
            onOpenAddModal={handleOpenAddModal}
            onEditExpense={handleOpenEditModal}
            onDeleteExpense={handleDeleteClick}
            onViewAll={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && (
          <History
            expenses={expenses}
            onEditExpense={handleOpenEditModal}
            onDeleteExpense={handleDeleteClick}
          />
        )}

        {activeTab === 'reports' && (
          <Reports expenses={expenses} />
        )}

        {activeTab === 'budgets' && (
          <BudgetManager expenses={expenses} />
        )}

        {activeTab === 'family' && (
          <FamilyExpenses expenses={expenses} />
        )}

        {activeTab === 'recurring' && (
          <RecurringExpenses onExpensesUpdated={(updated) => setExpenses(updated)} />
        )}

        {activeTab === 'profile' && (
          <Profile
            currentUser={currentUser}
            currentTheme={currentTheme}
            onThemeChange={(theme) => setCurrentTheme(theme)}
            onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)}
          />
        )}
      </main>

      {/* Add / Edit Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center transform transition-all">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Delete Expense</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete this transaction record? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center space-x-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow-md shadow-rose-200 transition-colors flex items-center justify-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
