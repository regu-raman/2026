import { CATEGORIES } from '../constants/categories';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

export const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const isThisWeek = (date) => {
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  // Set start of week (Monday)
  const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
};

export const isThisMonth = (date) => {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
};

export const calculateTotals = (expenses = []) => {
  const now = new Date();
  let todayTotal = 0;
  let weekTotal = 0;
  let monthTotal = 0;

  expenses.forEach(exp => {
    if (!exp.date) return;
    const expDate = new Date(exp.date + 'T00:00:00');
    const amt = Number(exp.amount) || 0;

    if (isSameDay(expDate, now)) {
      todayTotal += amt;
    }
    if (isThisWeek(expDate)) {
      weekTotal += amt;
    }
    if (isThisMonth(expDate)) {
      monthTotal += amt;
    }
  });

  return {
    todayTotal,
    weekTotal,
    monthTotal
  };
};

export const filterExpenses = (expenses = [], { searchQuery = '', category = 'All', startDate = '', endDate = '' }) => {
  return expenses.filter(exp => {
    // Category filter
    if (category !== 'All' && exp.category !== category) {
      return false;
    }

    // Search query filter (matches note, category, paymentMethod, amount)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNote = (exp.note || '').toLowerCase().includes(q);
      const matchCategory = (exp.category || '').toLowerCase().includes(q);
      const matchPayment = (exp.paymentMethod || '').toLowerCase().includes(q);
      const matchAmount = exp.amount.toString().includes(q);

      if (!matchNote && !matchCategory && !matchPayment && !matchAmount) {
        return false;
      }
    }

    // Date range filter
    if (startDate && exp.date < startDate) {
      return false;
    }
    if (endDate && exp.date > endDate) {
      return false;
    }

    return true;
  });
};

export const getCategoryBreakdown = (expenses = []) => {
  const categoryTotals = {};
  let totalSpent = 0;

  expenses.forEach(exp => {
    const amt = Number(exp.amount) || 0;
    const cat = exp.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    totalSpent += amt;
  });

  return CATEGORIES.map(catConfig => {
    const amount = categoryTotals[catConfig.name] || 0;
    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
    return {
      ...catConfig,
      amount,
      percentage: Math.round(percentage * 10) / 10
    };
  }).sort((a, b) => b.amount - a.amount);
};

export const getChartData = (expenses = [], period = 'daily') => {
  const now = new Date();

  if (period === 'daily') {
    // Last 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

      const dayTotal = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      result.push({
        label: dayName,
        date: dateStr,
        total: dayTotal
      });
    }
    return result;
  }

  if (period === 'weekly') {
    // Last 4 weeks
    const result = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (i * 7 + 6));
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const weekLabel = `W${4 - i} (${start.getMonth() + 1}/${start.getDate()})`;

      const weekTotal = expenses
        .filter(e => {
          if (!e.date) return false;
          const expDate = new Date(e.date + 'T00:00:00');
          return expDate >= start && expDate <= end;
        })
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      result.push({
        label: weekLabel,
        total: weekTotal
      });
    }
    return result;
  }

  if (period === 'monthly') {
    // Last 6 months
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const monthPrefix = `${year}-${monthStr}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      const monthTotal = expenses
        .filter(e => e.date && e.date.startsWith(monthPrefix))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      result.push({
        label,
        total: monthTotal
      });
    }
    return result;
  }

  return [];
};
