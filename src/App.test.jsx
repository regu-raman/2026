import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';
import { getUsersFromDb, signUpUser, signInUser } from './utils/auth';

describe('App component integration with auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders login/registration auth screen by default when unauthenticated', async () => {
    render(<App />);
    expect(await screen.findByText('Daily Expense Tracker')).toBeInTheDocument();
    expect(await screen.findByText('Sign in using your username or email')).toBeInTheDocument();
  });

  it('allows user registration, adds user to database table, and navigates across tabs', async () => {
    render(<App />);

    // Switch to Register tab
    const registerTab = await screen.findByRole('button', { name: /^register$/i });
    fireEvent.click(registerTab);

    // Fill registration form
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'alice@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'alice' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });

    fireEvent.click(submitBtn);

    // Verify user is added to database table
    await waitFor(() => {
      const usersInDb = getUsersFromDb();
      expect(usersInDb.some(u => u.username === 'alice' && u.email === 'alice@example.com')).toBe(true);
    });

    // Dashboard title after login
    expect(await screen.findByText('Today\'s Total')).toBeInTheDocument();

    // Switch to Budgets
    fireEvent.click(await screen.findByRole('button', { name: /budgets/i }));
    expect(await screen.findByText('Budget Limits & Goal Tracker')).toBeInTheDocument();

    // Switch to Family
    fireEvent.click(await screen.findByRole('button', { name: /family/i }));
    expect(await screen.findByText('Family & Shared Expenses')).toBeInTheDocument();
  });

  it('allows user to sign in using username or email and handles invalid credentials', async () => {
    // Seed database with a registered user
    await signUpUser('bob@example.com', 'bobbuilder', 'password123');
    localStorage.removeItem('daily_expenses_user_session_v1'); // log out session

    render(<App />);

    // Attempt login with invalid password
    const usernameInput = await screen.findByPlaceholderText('username or name@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signInBtn = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'bobbuilder' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(signInBtn);

    expect(await screen.findByText(/Invalid password/i)).toBeInTheDocument();

    // Login with correct credentials using email
    fireEvent.change(usernameInput, { target: { value: 'bob@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInBtn);

    expect(await screen.findByText('Today\'s Total')).toBeInTheDocument();
  });

  it('prevents registering duplicate username or email', async () => {
    await signUpUser('charlie@example.com', 'charlie', 'password123');
    localStorage.removeItem('daily_expenses_user_session_v1');

    render(<App />);

    const registerTab = await screen.findByRole('button', { name: /^register$/i });
    fireEvent.click(registerTab);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'other@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'charlie' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Username is already taken/i)).toBeInTheDocument();
  });
});
