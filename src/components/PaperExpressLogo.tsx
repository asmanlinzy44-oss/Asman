import React from 'react';

export interface PaperExpressLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showWordmark?: boolean;
}

export const PaperExpressLogo: React.FC<PaperExpressLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
}) => {
  const sizeMap = {
    sm: { text: 'text-xl sm:text-2xl', swooshH: 8, swooshW: 94, space: 'ml-1' },
    md: { text: 'text-2xl sm:text-3xl', swooshH: 10, swooshW: 118, space: 'ml-1.5' },
    lg: { text: 'text-3xl sm:text-4xl', swooshH: 13, swooshW: 156, space: 'ml-2' },
    xl: { text: 'text-4xl sm:text-5xl lg:text-6xl', swooshH: 18, swooshW: 218, space: 'ml-2.5' },
  };

  const { text, swooshH, swooshW, space } = sizeMap[size];

  // In dark variant or dark mode, "Paper" is crisp white with subtle glow; in light mode, deep navy #0F172A
  const paperTextColor = variant === 'dark' ? 'text-white' : 'text-[#0F172A] dark:text-white';
  
  // In dark variant or dark mode, "Express" shines with vibrant electric cyan & sky-blue so it is vividly visible
  const expressTextColor = variant === 'dark'
    ? 'bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#93C5FD] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]'
    : 'bg-gradient-to-r from-[#0052D4] via-[#0066FF] to-[#00A3FF] dark:from-[#38BDF8] dark:via-[#60A5FA] dark:to-[#93C5FD] bg-clip-text text-transparent dark:drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]';

  return (
    <div className={`inline-flex flex-col leading-none text-left select-none relative group ${className}`}>
      {/* 1. Pure Typographic Wordmark: Paper Express */}
      <div className="flex items-baseline tracking-tight font-black">
        <span className={`${paperTextColor} ${text} font-black tracking-tight drop-shadow-xs dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]`}>
          Paper
        </span>
        <span className={`${space} ${text} font-black tracking-tight ${expressTextColor}`}>
          Express
        </span>
      </div>

      {/* 2. Authentic Tapered Speed Swoosh Underneath "Express" */}
      <div className="relative -mt-0.5 sm:-mt-1 self-end" style={{ width: swooshW, height: swooshH }}>
        <svg
          viewBox="0 0 160 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter dark:drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]"
        >
          <defs>
            <linearGradient id="peSwooshGradPrecise" x1="0" y1="8" x2="160" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0052D4" stopOpacity="0.3" />
              <stop offset="30%" stopColor="#0066FF" />
              <stop offset="85%" stopColor="#00C6FF" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="peSwooshDarkGrad" x1="0" y1="8" x2="160" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
              <stop offset="30%" stopColor="#38BDF8" />
              <stop offset="85%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <path
            d="M 2 13 C 45 13, 100 10, 158 3 C 120 7, 65 9, 2 13 Z"
            fill={variant === 'dark' ? "url(#peSwooshDarkGrad)" : "url(#peSwooshGradPrecise)"}
          />
          <path
            d="M 25 13 C 65 13, 115 10, 158 3 C 125 6, 75 9, 25 13 Z"
            fill={variant === 'dark' ? "#38BDF8" : "#0066FF"}
            opacity="0.85"
          />
        </svg>
      </div>
    </div>
  );
};


