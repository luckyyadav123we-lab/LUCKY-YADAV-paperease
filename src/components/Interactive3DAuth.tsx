import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Cpu,
} from 'lucide-react';

export const Interactive3DAuth: React.FC = () => {
  const { loginUser, setIsAuthenticated } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 3D Mouse Parallax & Dynamic Tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    rotX: 0,
    rotY: 0,
    shineX: 50,
    shineY: 50,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Smooth tilt angles (up to ±14 degrees)
    const rotY = (mouseX / (rect.width / 2)) * 14;
    const rotX = -(mouseY / (rect.height / 2)) * 14;

    // Specular light coordinates
    const shineX = ((e.clientX - rect.left) / rect.width) * 100;
    const shineY = ((e.clientY - rect.top) / rect.height) * 100;

    setTilt({ rotX, rotY, shineX, shineY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotX: 0, rotY: 0, shineX: 50, shineY: 50 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      loginUser(email || 'alex@example.com', name || (isSignUp ? 'Alex Turner' : undefined));
      setLoading(false);
    }, 450);
  };

  const handleDemoSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      loginUser('alex@example.com', 'Alex Turner');
      setLoading(false);
    }, 350);
  };

  const handleGuestContinue = () => {
    setIsAuthenticated(true);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#EEF2F6] to-[#E2E8F0] flex flex-col items-center justify-center p-4 sm:p-6"
      style={{ perspective: '1400px' }}
    >
      {/* 3D Atmospheric Luminous Background Orbs */}
      <div
        className="absolute top-1/6 -left-28 w-96 h-96 bg-blue-500/25 rounded-full blur-[90px] pointer-events-none animate-pulse"
        style={{ animationDuration: '7s' }}
      />
      <div
        className="absolute bottom-1/6 -right-28 w-96 h-96 bg-purple-500/25 rounded-full blur-[90px] pointer-events-none animate-pulse"
        style={{ animationDuration: '9s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/10 to-violet-400/15 rounded-full blur-[110px] pointer-events-none -z-10"
      />

      {/* Floating 3D Format Badges with Glowing Borders & Parallax Depth */}
      <div
        className="hidden lg:flex absolute top-16 left-20 p-4 bg-white/85 backdrop-blur-md rounded-2xl border border-blue-200/90 shadow-[0_15px_35px_rgba(37,99,235,0.2),0_0_15px_rgba(59,130,246,0.3)] items-center gap-3.5 transition-transform duration-200"
        style={{
          transform: `translate3d(${tilt.rotY * -2.8}px, ${tilt.rotX * 2.8}px, 70px) rotate(${tilt.rotY * 0.9}deg)`,
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 to-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
          PDF
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <span>Merge & Split</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Zero file degradation</div>
        </div>
      </div>

      <div
        className="hidden lg:flex absolute top-24 right-20 p-4 bg-white/85 backdrop-blur-md rounded-2xl border border-indigo-200/90 shadow-[0_15px_35px_rgba(99,102,241,0.2),0_0_15px_rgba(99,102,241,0.3)] items-center gap-3.5 transition-transform duration-200"
        style={{
          transform: `translate3d(${tilt.rotY * 3.2}px, ${tilt.rotX * -2.4}px, 85px) rotate(${tilt.rotY * -0.8}deg)`,
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-slate-800">Word DOCX</div>
          <div className="text-[10px] text-slate-400 font-medium">Valid OpenXML export</div>
        </div>
      </div>

      <div
        className="hidden lg:flex absolute bottom-24 left-24 p-4 bg-white/85 backdrop-blur-md rounded-2xl border border-purple-200/90 shadow-[0_15px_35px_rgba(168,85,247,0.2),0_0_15px_rgba(168,85,247,0.3)] items-center gap-3.5 transition-transform duration-200"
        style={{
          transform: `translate3d(${tilt.rotY * -2.4}px, ${tilt.rotX * -3.2}px, 60px) rotate(${tilt.rotY * 0.7}deg)`,
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
          <ImageIcon className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-slate-800">PNG / JPG / WEBP</div>
          <div className="text-[10px] text-slate-400 font-medium">Ultra-sharp conversion</div>
        </div>
      </div>

      <div
        className="hidden lg:flex absolute bottom-28 right-24 p-4 bg-white/85 backdrop-blur-md rounded-2xl border border-emerald-200/90 shadow-[0_15px_35px_rgba(16,185,129,0.2),0_0_15px_rgba(16,185,129,0.3)] items-center gap-3.5 transition-transform duration-200"
        style={{
          transform: `translate3d(${tilt.rotY * 2.8}px, ${tilt.rotX * 2.8}px, 75px) rotate(${tilt.rotY * -0.9}deg)`,
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
          <FileSpreadsheet className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-slate-800">Excel XLSX & CSV</div>
          <div className="text-[10px] text-slate-400 font-medium">Table structure intact</div>
        </div>
      </div>

      {/* Main 3D Glowing Interactive Card */}
      <div
        ref={cardRef}
        className="w-full max-w-md relative transition-transform duration-100 ease-out"
        style={{
          transform: `rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Dynamic Specular Glass Sheen Overlay */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none z-30 transition-opacity duration-200 opacity-60 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle 380px at ${tilt.shineX}% ${tilt.shineY}%, rgba(255,255,255,0.95), transparent 70%)`,
          }}
        />

        {/* Luminous Glow Border Halo */}
        <div
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-violet-500/35 blur-xl -z-10 opacity-75 group-hover:opacity-100 transition-opacity"
        />

        {/* 3D Card Glass Body */}
        <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_25px_70px_-15px_rgba(37,99,235,0.28),0_0_25px_rgba(139,92,246,0.18)] p-7 sm:p-9 text-slate-800">
          
          {/* 3D Floating Header with PaperEase Brand Logo */}
          <div
            className="flex flex-col items-center text-center mb-6"
            style={{ transform: 'translateZ(45px)' }}
          >
            {/* Authentic Brand Logo with 3D Glowing Halo */}
            <div className="mb-2 p-2 bg-gradient-to-tr from-white via-blue-50/50 to-indigo-50/70 rounded-2xl border border-blue-100/90 shadow-[0_6px_20px_rgba(37,99,235,0.14)] inline-flex items-center justify-center">
              <Logo size="lg" showTagline={false} />
            </div>

            <p className="text-xs text-slate-500 font-semibold tracking-tight mt-1">
              Every File. Every Format. One Simple Workspace.
            </p>

            {/* Glowing Interactive Sign In / Login Mode Tabs */}
            <div className="mt-5 w-full p-1 bg-slate-100/95 rounded-xl flex items-center gap-1 border border-slate-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isSignUp
                    ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.18)] border border-blue-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isSignUp
                    ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.18)] border border-blue-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form with 3D Pop Depth */}
          <form onSubmit={handleSubmit} className="space-y-4" style={{ transform: 'translateZ(35px)' }}>
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Turner"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/90 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 outline-hidden transition-all shadow-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/90 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 outline-hidden transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('alex@example.com');
                      setPassword('workspace2026');
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Auto-Fill Demo
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/90 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 outline-hidden transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Glowing 3D Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 rounded-xl shadow-[0_8px_24px_rgba(37,99,235,0.4),0_0_15px_rgba(139,92,246,0.25)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.5),0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>
                {loading
                  ? 'Accessing Workspace...'
                  : isSignUp
                  ? 'Create Free Account'
                  : 'Sign In to Workspace'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* 1-Click Instant Demo & Guest Access */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5" style={{ transform: 'translateZ(25px)' }}>
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2.5 px-3 text-xs font-bold text-slate-800 hover:text-blue-700 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Instant 1-Click Demo Sign In</span>
            </button>

            <button
              type="button"
              onClick={handleGuestContinue}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold py-1 cursor-pointer transition-colors"
            >
              Continue as Guest (10 free daily operations) →
            </button>
          </div>

          {/* Privacy & Guarantee Badges */}
          <div
            className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium"
            style={{ transform: 'translateZ(15px)' }}
          >
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Server Retention</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Local WASM Sandbox</span>
          </div>
        </div>
      </div>
    </div>
  );
};
