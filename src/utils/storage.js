const STORAGE_KEY = 'daily_expenses_tracker_data_v1';

// Helper to format date string to YYYY-MM-DD
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
      amount: 25.50,
      category: 'Food',
      date: formatDate(today),
      paymentMethod: 'UPI',
      note: 'Lunch at cafe'
    },
    {
      id: 'sample-2',
      amount: 45.00,
      category: 'Fuel',
      date: formatDate(today),
      paymentMethod: 'Credit Card',
      note: 'Gas station refill'
    },
    {
      id: 'sample-3',
      amount: 120.00,
      category: 'Shopping',
      date: daysAgo(2),
      paymentMethod: 'Credit Card',
      note: 'Groceries store'
    },
    {
      id: 'sample-4',
      amount: 85.00,
      category: 'Bills',
      date: daysAgo(4),
      paymentMethod: 'Bank Transfer',
      note: 'Electricity bill'
    },
    {
      id: 'sample-5',
      amount: 15.00,
      category: 'Travel',
      date: daysAgo(5),
      paymentMethod: 'Cash',
      note: 'Taxi fare'
    },
    {
      id: 'sample-6',
      amount: 60.00,
      category: 'Medical',
      date: daysAgo(10),
      paymentMethod: 'Debit Card',
      note: 'Pharmacy prescription'
    },
    {
      id: 'sample-7',
      amount: 150.00,
      category: 'Education',
      date: daysAgo(15),
      paymentMethod: 'Credit Card',
      note: 'Online course subscription'
    }
  ];
};

export const getExpenses = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const initialData = getSampleData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses to localStorage', error);
  }
};

export const addExpense = (expense) => {
  const expenses = getExpenses();
  const newExpense = {
    ...expense,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
    amount: parseFloat(expense.amount) || 0
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
        amount: parseFloat(updatedData.amount) || 0
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
