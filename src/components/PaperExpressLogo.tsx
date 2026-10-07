import React, { useState } from 'react';

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
  showWordmark = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: { icon: 38, text: 'text-lg', swooshH: 8, swooshW: 88 },
    md: { icon: 48, text: 'text-xl sm:text-2xl', swooshH: 10, swooshW: 108 },
    lg: { icon: 68, text: 'text-3xl sm:text-4xl', swooshH: 14, swooshW: 148 },
    xl: { icon: 96, text: 'text-4xl sm:text-5xl', swooshH: 18, swooshW: 190 },
  };

  const { icon, text, swooshH, swooshW } = sizeMap[size];

  // In dark variant or dark mode, "Paper" is crisp white; in light mode, deep navy #0F172A
  const paperTextColor = variant === 'dark' ? 'text-white' : 'text-[#0F172A] dark:text-white';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* 1. Paper Express Symbol (Transparent emblem: Open book with energetic P-arrow in vivid blue/cyan) */}
      <div 
        className="relative shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-105"
        style={{ width: icon, height: icon }}
      >
        {!imgError ? (
          <img
            src="/paper_express_symbol.png"
            alt="Paper Express Logo"
            className="w-full h-full object-contain filter drop-shadow-sm select-none"
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src="/paper_express_symbol_royal.png"
            alt="Paper Express Logo"
            className="w-full h-full object-contain filter drop-shadow-sm select-none"
          />
        )}
      </div>

      {/* 2. Paper Express Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none text-left relative">
          <div className="flex items-baseline tracking-tight font-black">
            <span className={`${paperTextColor} ${text} font-black tracking-tight`}>
              Paper
            </span>
            <span className={`ml-1.5 ${text} font-black tracking-tight bg-gradient-to-r from-[#0052D4] via-[#0066FF] to-[#00A3FF] bg-clip-text text-transparent`}>
              Express
            </span>
          </div>

          {/* Authentic Tapered Speed Swoosh Underneath "Express" */}
          <div className="relative -mt-0.5 sm:-mt-1" style={{ width: swooshW, height: swooshH }}>
            <svg
              viewBox="0 0 160 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                <linearGradient id="peSwooshGradPrecise" x1="0" y1="8" x2="160" y2="8" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0052D4" stopOpacity="0.3" />
                  <stop offset="30%" stopColor="#0066FF" />
                  <stop offset="85%" stopColor="#00C6FF" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <path
                d="M 2 13 C 45 13, 100 10, 158 3 C 120 7, 65 9, 2 13 Z"
                fill="url(#peSwooshGradPrecise)"
              />
              <path
                d="M 25 13 C 65 13, 115 10, 158 3 C 125 6, 75 9, 25 13 Z"
                fill="#0066FF"
                opacity="0.85"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
