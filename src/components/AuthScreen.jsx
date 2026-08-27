import React, { useState } from 'react';
import { Wallet, Mail, Lock, User, LogIn, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { signInUser, signUpUser } from '../utils/auth';

export default function AuthScreen({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!email.trim() || !username.trim() || !password) {
          throw new Error('Please fill in all required fields (Email, Username, and Password).');
        }
        const res = await signUpUser(email, username, password);
        setSuccessMsg('Account created successfully! Logging you in...');
        if (res.user) {
          setTimeout(() => {
            onAuthSuccess(res.user);
          }, 400);
        }
      } else {
        if (!username.trim() || !password) {
          throw new Error('Please enter your username/email and password.');
        }
        const res = await signInUser(username, password);
        if (res.user) {
          onAuthSuccess(res.user);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
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
          <p className="text-slate-500 text-sm">
            {isRegister ? 'Register your account to manage your expenses' : 'Sign in using your username or email'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              !isRegister ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              isRegister ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

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
          {/* Email field on Register */}
          {isRegister && (
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

          {/* Username / Email field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              {isRegister ? 'Username *' : 'Username or Email Address *'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder={isRegister ? 'johndoe' : 'username or name@example.com'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Password *
            </label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
