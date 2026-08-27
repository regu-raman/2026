import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App component integration with auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders login/registration auth screen by default when unauthenticated', async () => {
    render(<App />);
    expect(await screen.findByText('Daily Expense Tracker')).toBeInTheDocument();
    expect(await screen.findByText('Sign in with your email address')).toBeInTheDocument();
  });

  it('allows toggling forgot password mode', async () => {
    render(<App />);
    const forgotBtn = await screen.findByRole('button', { name: /forgot password\?/i });
    fireEvent.click(forgotBtn);

    expect(await screen.findByText('Enter your email to receive a password reset link')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /send reset link/i })).toBeInTheDocument();

    const backBtn = await screen.findByRole('button', { name: /back to log in/i });
    fireEvent.click(backBtn);
    expect(await screen.findByText('Sign in with your email address')).toBeInTheDocument();
  });

  it('allows guest login and navigates across tabs', async () => {
    render(<App />);

    // Click guest quick access button
    const guestBtn = await screen.findByRole('button', { name: /continue as guest/i });
    fireEvent.click(guestBtn);

    // Dashboard title
    expect(await screen.findByText('Today\'s Total')).toBeInTheDocument();

    // Switch to Budgets
    fireEvent.click(await screen.findByRole('button', { name: /budgets/i }));
    expect(await screen.findByText('Budget Limits & Goal Tracker')).toBeInTheDocument();

    // Switch to Family
    fireEvent.click(await screen.findByRole('button', { name: /family/i }));
    expect(await screen.findByText('Family & Shared Expenses')).toBeInTheDocument();
  });
});
