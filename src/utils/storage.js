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

// Mappers between JS camelCase and DB snake_case
const expenseToDb = (exp) => ({
  id: exp.id,
  amount: exp.amount,
  category: exp.category,
  date: exp.date,
  payment_method: exp.paymentMethod,
  note: exp.note,
  member: exp.member || 'Self',
  is_shared: Boolean(exp.isShared)
});

const expenseFromDb = (dbExp) => ({
  id: dbExp.id,
  amount: Number(dbExp.amount) || 0,
  category: dbExp.category,
  date: dbExp.date,
  paymentMethod: dbExp.payment_method || dbExp.paymentMethod,
  note: dbExp.note || '',
  member: dbExp.member || 'Self',
  isShared: Boolean(dbExp.is_shared !== undefined ? dbExp.is_shared : dbExp.isShared)
});

const recurringToDb = (rec) => ({
  id: rec.id,
  amount: rec.amount,
  category: rec.category,
  payment_method: rec.paymentMethod,
  note: rec.note,
  frequency: rec.frequency,
  next_due_date: rec.nextDueDate,
  member: rec.member || 'Self',
  is_shared: Boolean(rec.isShared),
  active: Boolean(rec.active)
});

const recurringFromDb = (dbRec) => ({
  id: dbRec.id,
  amount: Number(dbRec.amount) || 0,
  category: dbRec.category,
  paymentMethod: dbRec.payment_method || dbRec.paymentMethod,
  note: dbRec.note || '',
  frequency: dbRec.frequency || 'Monthly',
  nextDueDate: dbRec.next_due_date || dbRec.nextDueDate,
  member: dbRec.member || 'Self',
  isShared: Boolean(dbRec.is_shared !== undefined ? dbRec.is_shared : dbRec.isShared),
  active: Boolean(dbRec.active !== undefined ? dbRec.active : true)
});

// --- EXPENSES CRUD ---
export const getExpenses = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped = data.map(expenseFromDb);
        localStorage.setItem(EXPENSES_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (error) {
      console.error('Error fetching expenses from Supabase:', error);
    }
  }

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

export const saveExpenses = async (expenses) => {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    if (isSupabaseConfigured()) {
      const dbPayload = expenses.map(expenseToDb);
      const { error } = await supabase.from('expenses').upsert(dbPayload);
      if (error) {
        console.error('Supabase saveExpenses error:', error);
      }
    }
  } catch (error) {
    console.error('Error saving expenses', error);
  }
};

export const addExpense = async (expense) => {
  const expenses = await getExpenses();
  const newExpense = {
    ...expense,
    id: expense.id || (Date.now().toString() + Math.random().toString(36).substring(2, 6)),
    amount: parseFloat(expense.amount) || 0,
    member: expense.member || 'Self',
    isShared: Boolean(expense.isShared)
  };
  const updated = [newExpense, ...expenses];
  await saveExpenses(updated);
  return updated;
};

export const updateExpense = async (id, updatedData) => {
  const expenses = await getExpenses();
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
  await saveExpenses(updated);
  return updated;
};

export const deleteExpense = async (id) => {
  const expenses = await getExpenses();
  const updated = expenses.filter(exp => exp.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) console.error('Supabase deleteExpense error:', error);
    } catch (error) {
      console.error('Error deleting expense from Supabase:', error);
    }
  }
  return updated;
};

// --- BUDGETS CRUD ---
export const getBudgets = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('budgets').select('*').eq('id', 'default').single();
      if (!error && data) {
        const loaded = {
          monthlyTotal: Number(data.monthly_total) || 25000,
          categories: data.categories || {}
        };
        localStorage.setItem(BUDGETS_KEY, JSON.stringify(loaded));
        return loaded;
      }
    } catch (error) {
      console.error('Error fetching budgets from Supabase:', error);
    }
  }

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

export const saveBudgets = async (budgets) => {
  try {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    if (isSupabaseConfigured()) {
      const dbPayload = {
        id: 'default',
        monthly_total: budgets.monthlyTotal,
        categories: budgets.categories
      };
      const { error } = await supabase.from('budgets').upsert([dbPayload]);
      if (error) console.error('Supabase saveBudgets error:', error);
    }
  } catch (error) {
    console.error('Error saving budgets', error);
  }
};

// --- RECURRING EXPENSES CRUD ---
export const getRecurringExpenses = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('recurring_expenses').select('*');
      if (!error && data && data.length > 0) {
        const mapped = data.map(recurringFromDb);
        localStorage.setItem(RECURRING_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (error) {
      console.error('Error fetching recurring_expenses from Supabase:', error);
    }
  }

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

export const saveRecurringExpenses = async (items) => {
  try {
    localStorage.setItem(RECURRING_KEY, JSON.stringify(items));
    if (isSupabaseConfigured()) {
      const dbPayload = items.map(recurringToDb);
      const { error } = await supabase.from('recurring_expenses').upsert(dbPayload);
      if (error) console.error('Supabase saveRecurringExpenses error:', error);
    }
  } catch (error) {
    console.error('Error saving recurring expenses', error);
  }
};

export const addRecurringExpense = async (item) => {
  const items = await getRecurringExpenses();
  const newItem = {
    ...item,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
    amount: parseFloat(item.amount) || 0,
    active: true
  };
  const updated = [newItem, ...items];
  await saveRecurringExpenses(updated);
  return updated;
};

export const deleteRecurringExpense = async (id) => {
  const items = await getRecurringExpenses();
  const updated = items.filter(item => item.id !== id);
  localStorage.setItem(RECURRING_KEY, JSON.stringify(updated));
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
      if (error) console.error('Supabase deleteRecurringExpense error:', error);
    } catch (error) {
      console.error('Error deleting recurring_expense from Supabase:', error);
    }
  }
  return updated;
};

// --- FAMILY MEMBERS CRUD ---
export const getFamilyMembers = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('family_members').select('name');
      if (!error && data && data.length > 0) {
        const names = data.map(m => m.name);
        localStorage.setItem(FAMILY_KEY, JSON.stringify(names));
        return names;
      }
    } catch (error) {
      console.error('Error fetching family_members from Supabase:', error);
    }
  }

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

export const addFamilyMember = async (name) => {
  if (!name || !name.trim()) return await getFamilyMembers();
  const members = await getFamilyMembers();
  const trimmed = name.trim();
  if (!members.includes(trimmed)) {
    const updated = [...members, trimmed];
    localStorage.setItem(FAMILY_KEY, JSON.stringify(updated));
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('family_members').insert([{ name: trimmed }]);
        if (error) console.error('Supabase addFamilyMember error:', error);
      } catch (error) {
        console.error('Error adding family_member to Supabase:', error);
      }
    }
    return updated;
  }
  return members;
};
