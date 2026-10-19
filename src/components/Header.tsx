import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { Sparkles, Shield, User, History, Menu, X, ArrowUpRight, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentPath,
    navigateTo,
    user,
    setPricingModalOpen,
    setAuthModalOpen,
    setPrivacyModalOpen,
    logoutUser,
    jobs,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'All Tools', path: 'home' },
    { label: 'PDF Tools', path: 'merge-pdf' },
    { label: 'Image Tools', path: 'png-to-jpg' },
    { label: 'Pricing', action: () => setPricingModalOpen(true) },
    {
      label: `History (${jobs.length})`,
      path: 'history',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center text-left focus:outline-none shrink-0 cursor-pointer"
          aria-label="PaperEase Home"
        >
          <Logo size="md" />
        </button>

        {/* Zone 2: 4–5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                if (link.action) link.action();
                else if (link.path) navigateTo(link.path);
              }}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                currentPath === link.path
                  ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                  : 'hover:text-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action & User Status */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Privacy & Retention Link */}
          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors px-2 py-1.5 rounded-lg cursor-pointer"
            title="Privacy & File Retention Policy"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span className="whitespace-nowrap">100% Private</span>
          </button>

          {/* Tier Badge / Upgrade Button */}
          {user.tier === 'free' ? (
            <button
              onClick={() => setPricingModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Upgrade to Pro</span>
            </button>
          ) : (
            <button
              onClick={() => setPricingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              <span className="capitalize">{user.tier} Plan</span>
            </button>
          )}

          {/* Account Profile Trigger */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg bg-slate-50/50 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label="User Account"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
              {user.name.charAt(0)}
            </div>
            <span className="hidden sm:inline truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
          </button>

          {/* Quick Sign Out to return to 3D Interactive Login Gateway */}
          <button
            onClick={() => logoutUser()}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
            title="Sign Out to 3D Interactive Login"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Sign Out</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (link.action) link.action();
                  else if (link.path) navigateTo(link.path);
                }}
                className="text-left py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setPrivacyModalOpen(true);
              }}
              className="flex items-center gap-2 text-sm text-slate-600 py-1.5 px-3"
            >
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Privacy & Retention Guarantee</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
