import { describe, it, expect, beforeEach } from 'vitest';
import { signUpUser, signInUser, resetPasswordForEmail, updateUserPassword, getCurrentUser, signOutUser } from './auth';

describe('auth.js utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('signs up user in local fallback mode', async () => {
    const res = await signUpUser('test@example.com', 'password123');
    expect(res.user).not.toBeNull();
    expect(res.user.email).toBe('test@example.com');
    expect(res.user.username).toBe('test');

    const current = await getCurrentUser();
    expect(current.email).toBe('test@example.com');
  });

  it('signs in user in local fallback mode', async () => {
    const res = await signInUser('user@example.com', 'password123');
    expect(res.user).not.toBeNull();
    expect(res.user.email).toBe('user@example.com');
    expect(res.user.username).toBe('user');
  });

  it('handles password reset request for email', async () => {
    const res = await resetPasswordForEmail('user@example.com');
    expect(res.success).toBe(true);
  });

  it('handles password update', async () => {
    await signInUser('user@example.com', 'oldpassword');
    const res = await updateUserPassword('newpassword123');
    expect(res.user).not.toBeNull();
  });

  it('signs out user', async () => {
    await signInUser('user@example.com', 'password123');
    await signOutUser();
    const current = await getCurrentUser();
    expect(current).toBeNull();
  });
});
