import { describe, it, expect } from 'vitest';
import {
  calculateTotals,
  filterExpenses,
  getCategoryBreakdown,
  getChartData,
  formatCurrency
} from './calculations';

describe('calculations utility functions', () => {
  const mockExpenses = [
    {
      id: '1',
      amount: 50,
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
      note: 'Lunch'
    },
    {
      id: '2',
      amount: 100,
      category: 'Fuel',
      date: '2020-01-01',
      paymentMethod: 'Credit Card',
      note: 'Gasoline'
    },
    {
      id: '3',
      amount: 200,
      category: 'Shopping',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      note: 'Clothes'
    }
  ];

  it('formats currency correctly', () => {
    expect(formatCurrency(50)).toBe('$50.00');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('calculates totals correctly for today', () => {
    const totals = calculateTotals(mockExpenses);
    expect(totals.todayTotal).toBe(250);
  });

  it('filters expenses by category and search query', () => {
    const filteredCat = filterExpenses(mockExpenses, { category: 'Food' });
    expect(filteredCat.length).toBe(1);
    expect(filteredCat[0].category).toBe('Food');

    const filteredQuery = filterExpenses(mockExpenses, { searchQuery: 'clothes' });
    expect(filteredQuery.length).toBe(1);
    expect(filteredQuery[0].note).toBe('Clothes');
  });

  it('calculates category breakdown percentages', () => {
    const breakdown = getCategoryBreakdown(mockExpenses);
    const foodBreakdown = breakdown.find(b => b.name === 'Food');
    expect(foodBreakdown.amount).toBe(50);
    // 50 / 350 * 100 = ~14.3%
    expect(foodBreakdown.percentage).toBe(14.3);
  });

  it('generates chart data for daily, weekly, and monthly periods', () => {
    const dailyData = getChartData(mockExpenses, 'daily');
    expect(dailyData.length).toBe(7);

    const weeklyData = getChartData(mockExpenses, 'weekly');
    expect(weeklyData.length).toBe(4);

    const monthlyData = getChartData(mockExpenses, 'monthly');
    expect(monthlyData.length).toBe(6);
  });
});
