import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App component integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders application header and title', () => {
    render(<App />);
    expect(screen.getByText('Daily Expense Tracker')).toBeInTheDocument();
    expect(screen.getByText("Today's Total")).toBeInTheDocument();
    expect(screen.getByText("This Week's Total")).toBeInTheDocument();
    expect(screen.getByText("This Month's Total")).toBeInTheDocument();
  });

  it('opens add expense modal when Add Expense button is clicked', () => {
    render(<App />);
    const addBtn = screen.getAllByText('Add Expense')[0];
    fireEvent.click(addBtn);

    expect(screen.getByText('Add New Expense')).toBeInTheDocument();
  });

  it('navigates between Home, History, and Reports tabs', () => {
    render(<App />);

    // Switch to History
    fireEvent.click(screen.getByRole('button', { name: /history/i }));
    expect(screen.getByText('Expense History')).toBeInTheDocument();

    // Switch to Reports
    fireEvent.click(screen.getByRole('button', { name: /reports/i }));
    expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
  });
});
