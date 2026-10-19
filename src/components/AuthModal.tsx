import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, Lock, User, ArrowRight, CheckCircle2, LogOut } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, user, switchTier, showToast, loginUser, logoutUser } = useApp();
  const [tab, setTab] = useState<'profile' | 'login' | 'signup' | 'forgot'>('profile');

  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user.name);

  if (!authModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(email);
    setTab('profile');
    setAuthModalOpen(false);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(email, name);
    setTab('profile');
    setAuthModalOpen(false);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Password reset link sent to ${email}`, 'info');
    setTab('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {tab === 'profile'
              ? 'Account Profile'
              : tab === 'login'
              ? 'Sign in to PaperEase'
              : tab === 'signup'
              ? 'Create your account'
              : 'Reset Password'}
          </h2>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{user.name}</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 capitalize">
                    {user.tier} Plan
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Member since {user.joinedDate}</span>
                </div>
              </div>
            </div>

            {/* Quota and Usage Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-700">
                <span className="font-medium">Today’s Operations</span>
                <span className="font-mono font-bold">
                  {user.operationsToday} / {user.tier === 'free' ? user.maxDailyOperations : '∞'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{
                    width: `${
                      user.tier === 'free'
                        ? Math.min(100, (user.operationsToday / user.maxDailyOperations) * 100)
                        : 20
                    }%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>Max File Size: {user.maxFileSizeMB} MB</span>
                <span>Active local session</span>
              </div>
            </div>

            {/* Account Quick Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setTab('login')}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-center"
              >
                Switch Account
              </button>
              <button
                onClick={() => {
                  logoutUser();
                  setAuthModalOpen(false);
                }}
                className="w-full py-2 px-3 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Login Tab */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Sign In
            </button>

            <div className="text-center text-xs text-slate-500 pt-2">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setTab('signup')}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </div>
          </form>
        )}

        {/* Signup Tab */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500"
                  placeholder="Alex Turner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Create Account
            </button>

            <div className="text-center text-xs text-slate-500 pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgot} className="p-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered email address and we'll send you a secure link to reset your password.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Send Reset Link
            </button>

            <div className="text-center text-xs text-slate-500 pt-2">
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Back to Sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
