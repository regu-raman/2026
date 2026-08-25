import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App component integration with new features', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders application header and title', () => {
    render(<App />);
    expect(screen.getByText('Daily Expense Tracker')).toBeInTheDocument();
  });

  it('navigates between all tabs including Budgets, Family, and Recurring', () => {
    render(<App />);

    // Switch to Budgets
    fireEvent.click(screen.getByRole('button', { name: /budgets/i }));
    expect(screen.getByText('Budget Limits & Goal Tracker')).toBeInTheDocument();

    // Switch to Family
    fireEvent.click(screen.getByRole('button', { name: /family/i }));
    expect(screen.getByText('Family & Shared Expenses')).toBeInTheDocument();

    // Switch to Recurring
    fireEvent.click(screen.getByRole('button', { name: /recurring/i }));
    expect(screen.getByText('Recurring Expenses & Bills')).toBeInTheDocument();
  });
});
