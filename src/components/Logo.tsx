import React from 'react';
import brandLogoImg from '../assets/images/paperease_logo_1792395473160.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  variant?: 'horizontal' | 'stacked' | 'badge';
  useSvgSymbolOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  variant = 'horizontal',
  useSvgSymbolOnly = false,
}) => {
  // Height presets for the authentic PaperEase brand mark image
  const imgHeightClass =
    size === 'sm'
      ? 'h-8'
      : size === 'md'
      ? 'h-10'
      : size === 'lg'
      ? 'h-14 sm:h-16'
      : 'h-20 sm:h-24';

  const glowBlurClass =
    size === 'sm'
      ? 'blur-sm scale-110'
      : size === 'md'
      ? 'blur-md scale-115'
      : size === 'lg'
      ? 'blur-lg scale-120'
      : 'blur-xl scale-125';

  if (!useSvgSymbolOnly) {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none group ${className}`}
        role="img"
        aria-label="PaperEase - Every File. Every Format. One Simple Workspace"
      >
        {/* Luminous 3D glowing ambient backlight */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-blue-500/25 via-indigo-500/20 to-purple-500/30 rounded-2xl pointer-events-none transition-all duration-300 group-hover:from-blue-500/35 group-hover:to-purple-500/40 ${glowBlurClass}`}
        />

        {/* Authentic Brand Logo Image with 3D depth and subtle luminous sheen */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-white/40 p-1 backdrop-blur-2xs transition-transform duration-300 group-hover:scale-[1.02]">
          <img
            src={brandLogoImg}
            alt="PaperEase"
            className={`${imgHeightClass} w-auto object-contain mix-blend-multiply drop-shadow-[0_4px_16px_rgba(37,99,235,0.22)]`}
            loading="eager"
          />
        </div>
      </div>
    );
  }

  // High-fidelity 3D Origami folded symbol representation
  const iconPixel = size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 56 : 72;

  return (
    <div
      className={`relative inline-flex ${
        variant === 'stacked' ? 'flex-col items-center text-center' : 'items-center'
      } gap-3 select-none group ${className}`}
    >
      {/* 3D Luminous Folded Origami Ribbon 'P' Logo Symbol with Atmospheric Glow */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Ambient atmospheric backlight behind the 3D logo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-indigo-500/25 to-purple-500/35 rounded-full blur-md -z-10 scale-125 pointer-events-none group-hover:scale-135 transition-transform" />

        <svg
          width={iconPixel}
          height={iconPixel}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-[0_8px_22px_rgba(37,99,235,0.35)] transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pe-grad-blue" x1="0%" y1="0%" x2="100%" y2="85%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="30%" stopColor="#3B82F6" />
              <stop offset="70%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            <linearGradient id="pe-grad-violet" x1="10%" y1="15%" x2="90%" y2="95%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="35%" stopColor="#6366F1" />
              <stop offset="70%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>

          {/* Glowing floor shadow */}
          <ellipse cx="50" cy="92" rx="30" ry="6" fill="#8B5CF6" fillOpacity="0.3" filter="blur(4px)" />

          {/* Outer loop of the 3D folded P */}
          <path
            d="M26 14C26 8.47715 30.4772 4 36 4H62C64.2091 4 66 5.79086 66 8V24C66 38.3594 54.3594 50 40 50H32V74C32 81.732 25.732 88 18 88C14.6863 88 12 85.3137 12 82V28C12 20.268 18.268 14 26 14Z"
            fill="url(#pe-grad-blue)"
          />

          {/* Ribbon loop forward into purple */}
          <path
            d="M18 88C25.732 88 32 81.732 32 74V50H40C54.3594 50 66 38.3594 66 24C66 40 54 62 38 72C32 76 24 82 18 88Z"
            fill="url(#pe-grad-violet)"
          />

          {/* Clean document sheet */}
          <rect x="25" y="20" width="28" height="34" rx="4" fill="white" fillOpacity="0.98" />
          <path d="M47 20V26H53L47 20Z" fill="#94A3B8" />
          <line x1="30" y1="28" x2="42" y2="28" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="30" y1="35" x2="48" y2="35" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="30" y1="42" x2="38" y2="42" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Wordmark & 4-point Sparkle */}
      <div className={`flex flex-col ${variant === 'stacked' ? 'items-center' : 'items-start'}`}>
        <div className="relative inline-flex items-center">
          <span className="font-extrabold tracking-tight text-slate-900 text-xl">
            Paper
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Ease
            </span>
          </span>
          <span className="relative -top-2.5 -right-1 text-violet-600 drop-shadow-[0_0_8px_rgba(168,85,247,0.85)]">
            ✦
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
            Every File. Every Format. One Simple Workspace.
          </span>
        )}
      </div>
    </div>
  );
};
