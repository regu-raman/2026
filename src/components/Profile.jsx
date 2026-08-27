import React, { useState } from 'react';
import { User, Mail, Palette, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { updateUserProfile } from '../utils/auth';

export const THEME_PALETTES = [
  { id: 'indigo', name: 'Indigo Elegance', primary: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-600', ring: 'ring-indigo-100', bg: 'bg-indigo-50', gradient: 'from-indigo-600 to-violet-600' },
  { id: 'emerald', name: 'Emerald Forest', primary: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', ring: 'ring-emerald-100', bg: 'bg-emerald-50', gradient: 'from-emerald-600 to-teal-600' },
  { id: 'violet', name: 'Violet Sunset', primary: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-600', ring: 'ring-violet-100', bg: 'bg-violet-50', gradient: 'from-violet-600 to-purple-600' },
  { id: 'amber', name: 'Amber Sunrise', primary: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', ring: 'ring-amber-100', bg: 'bg-amber-50', gradient: 'from-amber-600 to-orange-600' },
  { id: 'rose', name: 'Rose Petal', primary: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', ring: 'ring-rose-100', bg: 'bg-rose-50', gradient: 'from-rose-600 to-pink-600' },
  { id: 'dark', name: 'Midnight Dark', primary: 'bg-slate-800', text: 'text-slate-800', border: 'border-slate-800', ring: 'ring-slate-200', bg: 'bg-slate-100', gradient: 'from-slate-800 to-slate-900' },
];

export default function Profile({ currentUser, currentTheme, onThemeChange, onProfileUpdate }) {
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'indigo');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updated = await updateUserProfile(currentUser.id, {
        username: username.trim(),
        email: email.trim(),
        theme: selectedTheme
      });

      onThemeChange(selectedTheme);
      if (onProfileUpdate && updated) {
        onProfileUpdate(updated);
      }

      setSuccessMsg('Profile settings and theme preferences updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const activePalette = THEME_PALETTES.find(t => t.id === selectedTheme) || THEME_PALETTES[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className={`rounded-3xl p-8 bg-gradient-to-r ${activePalette.gradient} text-white shadow-xl transition-all duration-300`}>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold shadow-inner">
            {currentUser?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {currentUser?.username || 'User Profile'}
            </h1>
            <p className="text-white/80 text-sm font-medium flex items-center justify-center sm:justify-start space-x-1">
              <Mail className="w-3.5 h-3.5 inline shrink-0" />
              <span>{currentUser?.email}</span>
            </p>
            <div className="inline-flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-semibold mt-2">
              <Shield className="w-3 h-3" />
              <span>Authenticated User Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm flex items-center space-x-3 shadow-xs">
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Main Form Settings Grid */}
      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Details Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className={`p-2.5 rounded-xl ${activePalette.bg} ${activePalette.text}`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Account Credentials</h2>
              <p className="text-xs text-slate-500">Update your username and contact email</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Theme Preferences Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className={`p-2.5 rounded-xl ${activePalette.bg} ${activePalette.text}`}>
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Visual Theme</h2>
              <p className="text-xs text-slate-500">Customize application accent color theme</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {THEME_PALETTES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => {
                    setSelectedTheme(theme.id);
                    onThemeChange(theme.id);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                    isSelected
                      ? `border-2 ${theme.border} ${theme.bg} shadow-xs`
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full ${theme.primary} shrink-0 shadow-xs`} />
                  <span className={`text-xs font-semibold ${isSelected ? theme.text : 'text-slate-700'}`}>
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3 ${activePalette.primary} text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50`}
            >
              {saving ? (
                <span>Saving Preferences...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Profile & Theme</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
