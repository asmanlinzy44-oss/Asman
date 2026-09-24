import React from 'react';

interface StudyProLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showWordmark?: boolean;
}

export const StudyProLogo: React.FC<StudyProLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
  showWordmark = true,
}) => {
  const sizeMap = {
    sm: { icon: 30, text: 'text-lg', subtext: 'text-[9px]' },
    md: { icon: 38, text: 'text-xl', subtext: 'text-[10px]' },
    lg: { icon: 54, text: 'text-2xl sm:text-3xl', subtext: 'text-xs' },
    xl: { icon: 68, text: 'text-3xl sm:text-4xl', subtext: 'text-sm' },
  };

  const { icon, text, subtext } = sizeMap[size];

  // Explicit contrast colors: never use dark:text-white inside a light-header context
  const studyColor = variant === 'dark' ? 'text-white' : 'text-slate-900';
  const subtextColor = variant === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SP Monogram Icon Badge */}
      <div 
        className="relative shrink-0 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-1.5 shadow-sm border border-slate-700/60 flex items-center justify-center transition-transform duration-200 hover:scale-105"
        style={{ width: icon, height: icon }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="spBlue" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="spGold" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Letter 'S' in White */}
          <path
            d="M 42 28 C 42 22 36 18 27 18 C 17 18 12 23 12 29 C 12 41 42 39 42 57 C 42 69 32 77 21 77 C 13 77 7 73 5 69 L 13 60 C 15 63 18 67 21 67 C 27 67 31 63 31 57 C 31 45 2 47 2 29 C 2 16 13 8 27 8 C 40 8 52 16 52 28 Z"
            fill="#FFFFFF"
          />

          {/* Letter 'P' in Vibrant Electric Blue */}
          <path
            d="M 50 18 L 75 18 C 87 18 95 26 95 38 C 95 50 87 58 75 58 L 62 58 L 62 84 L 50 84 Z M 62 28 L 62 48 L 73 48 C 79 48 83 44 83 38 C 83 32 79 28 73 28 Z"
            fill="url(#spBlue)"
          />

          {/* Spark Star in Gold */}
          <circle cx="85" cy="18" r="4.5" fill="url(#spGold)" />
        </svg>
      </div>

      {/* Wordmark: ALWAYS Study Pro */}
      {showWordmark && (
        <div className="flex flex-col leading-none text-left">
          <div className="flex items-center tracking-tight">
            <span className={`font-black tracking-tight ${studyColor} ${text}`}>
              Study
            </span>
            <span className={`font-black tracking-tight text-[#0066FF] ${text} ml-1`}>
              Pro
            </span>
          </div>
          <span className={`font-bold tracking-widest uppercase mt-0.5 ${subtextColor} ${subtext}`}>
            A/L Smart Portal
          </span>
        </div>
      )}
    </div>
  );
};
