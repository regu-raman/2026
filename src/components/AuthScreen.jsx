import React, { useState, useEffect } from 'react';
import { Wallet, Mail, Lock, LogIn, UserPlus, CheckCircle2, AlertCircle, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';
import { signInUser, signUpUser, resetPasswordForEmail, updateUserPassword } from '../utils/auth';

export default function AuthScreen({ onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!email.trim() || !password) {
          throw new Error('Please enter your email and password.');
        }
        const res = await signUpUser(email, password);
        if (res.needsVerification) {
          setSuccessMsg('Registration successful! Please check your email inbox to verify your account before logging in.');
        } else {
          setSuccessMsg('Registration successful!');
          if (res.user) onAuthSuccess(res.user);
        }
      } else if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter your email and password.');
        }
        const res = await signInUser(email, password);
        if (res.user) {
          onAuthSuccess(res.user);
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          throw new Error('Please enter your email address.');
        }
        await resetPasswordForEmail(email);
        setSuccessMsg('Password reset instructions have been sent to your email address.');
      } else if (mode === 'reset') {
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        const res = await updateUserPassword(password);
        setSuccessMsg('Your password has been updated successfully.');
        if (res.user) {
          setTimeout(() => onAuthSuccess(res.user), 1500);
        } else {
          switchMode('login');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoGuestLogin = async () => {
    try {
      setLoading(true);
      const res = await signInUser('guest@expensetracker.local', 'Demo123456!');
      if (res.user) onAuthSuccess(res.user);
    } catch (err) {
      setErrorMsg('Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  const getSubtitleText = () => {
    switch (mode) {
      case 'register':
        return 'Register your account to manage budgets';
      case 'forgot':
        return 'Enter your email to receive a password reset link';
      case 'reset':
        return 'Enter your new password below';
      case 'login':
      default:
        return 'Sign in with your email address';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-slate-100 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Daily Expense Tracker
          </h1>
          <p className="text-slate-500 text-sm">{getSubtitleText()}</p>
        </div>

        {/* Tab Switcher (Only on login / register modes) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'login' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'register' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field (for login, register, forgot) */}
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          )}

          {/* Password field (for login, register, reset) */}
          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {mode === 'reset' ? 'New Password *' : 'Password *'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          )}

          {/* Confirm Password field (for reset mode) */}
          {mode === 'reset' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : mode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            ) : mode === 'forgot' ? (
              <>
                <Mail className="w-4 h-4" />
                <span>Send Reset Link</span>
              </>
            ) : mode === 'reset' ? (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Set New Password</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Secondary Back action for forgot or reset modes */}
        {(mode === 'forgot' || mode === 'reset') && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center justify-center space-x-1 transition-colors mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Log In</span>
            </button>
          </div>
        )}

        <div className="relative flex items-center justify-center border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleDemoGuestLogin}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center space-x-1 transition-colors"
          >
            <span>Continue as Guest / Quick Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
