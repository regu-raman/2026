import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App component integration with new features', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders application header and title', async () => {
    render(<App />);
    expect(await screen.findByText('Daily Expense Tracker')).toBeInTheDocument();
  });

  it('navigates between all tabs including Budgets, Family, and Recurring', async () => {
    render(<App />);

    // Switch to Budgets
    fireEvent.click(await screen.findByRole('button', { name: /budgets/i }));
    expect(await screen.findByText('Budget Limits & Goal Tracker')).toBeInTheDocument();

    // Switch to Family
    fireEvent.click(await screen.findByRole('button', { name: /family/i }));
    expect(await screen.findByText('Family & Shared Expenses')).toBeInTheDocument();

    // Switch to Recurring
    fireEvent.click(await screen.findByRole('button', { name: /recurring/i }));
    expect(await screen.findByText('Recurring Expenses & Bills')).toBeInTheDocument();
  });
});
