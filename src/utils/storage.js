import { supabase, isSupabaseConfigured } from './supabase';

const EXPENSES_KEY = 'daily_expenses_tracker_data_v2';
const BUDGETS_KEY = 'daily_expenses_budgets_v1';
const RECURRING_KEY = 'daily_expenses_recurring_v1';
const FAMILY_KEY = 'daily_expenses_family_members_v1';

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSampleData = () => {
  const today = new Date();
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return formatDate(d);
  };

  return [
    {
      id: 'sample-1',
      amount: 450.00,
      category: 'Food',
      date: formatDate(today),
      paymentMethod: 'UPI',
      note: 'Dinner with family',
      member: 'Self',
      isShared: false
    },
    {
      id: 'sample-2',
      amount: 1200.00,
      category: 'Fuel',
      date: formatDate(today),
      paymentMethod: 'Credit Card',
      note: 'Car full tank fuel',
      member: 'Spouse',
      isShared: true
    },
    {
      id: 'sample-3',
      amount: 3500.00,
      category: 'Shopping',
      date: daysAgo(2),
      paymentMethod: 'Credit Card',
      note: 'Grocery & Home supplies',
      member: 'Family Shared',
      isShared: true
    },
    {
      id: 'sample-4',
      amount: 2400.00,
      category: 'Bills',
      date: daysAgo(4),
      paymentMethod: 'Bank Transfer',
      note: 'Electricity bill',
      member: 'Self',
      isShared: true
    },
    {
      id: 'sample-5',
      amount: 450.00,
      category: 'Travel',
      date: daysAgo(5),
      paymentMethod: 'Cash',
      note: 'Metro train pass',
      member: 'Kids',
      isShared: false
    }
  ];
};

const getSampleBudgets = () => ({
  monthlyTotal: 25000,
  categories: {
    Food: 8000,
    Travel: 3000,
    Shopping: 6000,
    Bills: 5000,
    Medical: 4000,
    Education: 5000,
    Fuel: 4000,
    Other: 2000
  }
});

const getSampleRecurring = () => [
  {
    id: 'rec-1',
    amount: 12000,
    category: 'Bills',
    paymentMethod: 'Bank Transfer',
    note: 'House Rent',
    frequency: 'Monthly',
    member: 'Family Shared',
    isShared: true,
    nextDueDate: formatDate(new Date()),
    active: true
  },
  {
    id: 'rec-2',
    amount: 699,
    category: 'Bills',
    paymentMethod: 'Credit Card',
    note: 'Broadband Wi-Fi Plan',
    frequency: 'Monthly',
    member: 'Self',
    isShared: false,
    nextDueDate: formatDate(new Date()),
    active: true
  }
];

const getSampleFamilyMembers = () => [
  'Self',
  'Spouse',
  'Parents',
  'Kids',
  'Family Shared'
];

// --- EXPENSES CRUD ---
export const getExpenses = () => {
  try {
    const data = localStorage.getItem(EXPENSES_KEY);
    if (!data) {
      const initialData = getSampleData();
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading expenses from localStorage', error);
    return getSampleData();
  }
};

export const saveExpenses = (expenses) => {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    if (isSupabaseConfigured()) {
      supabase.from('expenses').upsert(expenses).catch(console.error);
    }
  } catch (error) {
    console.error('Error saving expenses', error);
  }
};

export const addExpense = (expense) => {
  const expenses = getExpenses();
  const newExpense = {
    ...expense,
    id: expense.id || (Date.now().toString() + Math.random().toString(36).substring(2, 6)),
    amount: parseFloat(expense.amount) || 0,
    member: expense.member || 'Self',
    isShared: Boolean(expense.isShared)
  };
  const updated = [newExpense, ...expenses];
  saveExpenses(updated);
  return updated;
};

export const updateExpense = (id, updatedData) => {
  const expenses = getExpenses();
  const updated = expenses.map(exp => {
    if (exp.id === id) {
      return {
        ...exp,
        ...updatedData,
        amount: parseFloat(updatedData.amount) || 0,
        member: updatedData.member || exp.member || 'Self',
        isShared: updatedData.isShared !== undefined ? Boolean(updatedData.isShared) : Boolean(exp.isShared)
      };
    }
    return exp;
  });
  saveExpenses(updated);
  return updated;
};

export const deleteExpense = (id) => {
  const expenses = getExpenses();
  const updated = expenses.filter(exp => exp.id !== id);
  saveExpenses(updated);
  return updated;
};

// --- BUDGETS CRUD ---
export const getBudgets = () => {
  try {
    const data = localStorage.getItem(BUDGETS_KEY);
    if (!data) {
      const initial = getSampleBudgets();
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch (error) {
    return getSampleBudgets();
  }
};

export const saveBudgets = (budgets) => {
  try {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    if (isSupabaseConfigured()) {
      supabase.from('budgets').upsert([{ id: 'default', ...budgets }]).catch(console.error);
    }
  } catch (error) {
    console.error('Error saving budgets', error);
  }
};

// --- RECURRING EXPENSES CRUD ---
export const getRecurringExpenses = () => {
  try {
    const data = localStorage.getItem(RECURRING_KEY);
    if (!data) {
      const initial = getSampleRecurring();
      localStorage.setItem(RECURRING_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch (error) {
    return getSampleRecurring();
  }
};

export const saveRecurringExpenses = (items) => {
  try {
    localStorage.setItem(RECURRING_KEY, JSON.stringify(items));
    if (isSupabaseConfigured()) {
      supabase.from('recurring_expenses').upsert(items).catch(console.error);
    }
  } catch (error) {
    console.error('Error saving recurring expenses', error);
  }
};

export const addRecurringExpense = (item) => {
  const items = getRecurringExpenses();
  const newItem = {
    ...item,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
    amount: parseFloat(item.amount) || 0,
    active: true
  };
  const updated = [newItem, ...items];
  saveRecurringExpenses(updated);
  return updated;
};

export const deleteRecurringExpense = (id) => {
  const items = getRecurringExpenses();
  const updated = items.filter(item => item.id !== id);
  saveRecurringExpenses(updated);
  return updated;
};

// --- FAMILY MEMBERS CRUD ---
export const getFamilyMembers = () => {
  try {
    const data = localStorage.getItem(FAMILY_KEY);
    if (!data) {
      const initial = getSampleFamilyMembers();
      localStorage.setItem(FAMILY_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch (error) {
    return getSampleFamilyMembers();
  }
};

export const addFamilyMember = (name) => {
  if (!name || !name.trim()) return getFamilyMembers();
  const members = getFamilyMembers();
  const trimmed = name.trim();
  if (!members.includes(trimmed)) {
    const updated = [...members, trimmed];
    localStorage.setItem(FAMILY_KEY, JSON.stringify(updated));
    return updated;
  }
  return members;
};
