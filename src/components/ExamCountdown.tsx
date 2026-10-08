import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Flame } from 'lucide-react';

export const ExamCountdown: React.FC = () => {
  // Target Exam Date: August 10, 2027, 08:30 AM
  const examDate = new Date('2027-08-10T08:30:00');

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>(() => {
    const now = new Date();
    const diff = examDate.getTime() - now.getTime();
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return { days, hours, minutes, seconds };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diff = examDate.getTime() - now.getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative group w-full">
      {/* Ambient Gradient Glow Backdrop */}
      <div 
        aria-hidden="true" 
        className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/15 via-sky-500/20 to-indigo-600/15 blur-xl opacity-75 dark:opacity-60 group-hover:opacity-100 transition duration-700 pointer-events-none" 
      />

      {/* Main Glass Deck Container */}
      <div className="relative rounded-3xl backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/80 dark:border-sky-500/25 p-5 sm:p-7 text-slate-800 dark:text-white shadow-[0_12px_40px_0_rgba(0,102,255,0.08)] dark:shadow-[0_12px_40px_0_rgba(0,0,0,0.6)] ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transition-all duration-300">
        
        {/* Specular Top Rim Bevel Highlight (Light Reflection) */}
        <div 
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white dark:via-sky-300 to-transparent opacity-90"
        />

        {/* Ambient Subtle Diagonal Glass Glow Accent */}
        <div 
          aria-hidden="true"
          className="absolute -right-20 -top-20 w-56 h-56 rounded-full bg-sky-400/10 dark:bg-sky-500/15 blur-3xl pointer-events-none"
        />

        {/* Header: Pure Countdown Status & Target Date */}
        <div className="text-center mb-5 sm:mb-6 space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-[#0066FF] dark:text-sky-400 text-xs font-black uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <span>G.C.E. A/L 2027 Examination Countdown</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-sky-400" />
            <span>Target Exam Date: August 10, 2027 • 08:30 AM</span>
          </div>
        </div>

        {/* The 4 Glass Digit Tiles (Centered, High-Impact Focus) */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-2xl mx-auto mb-4 relative z-10">
          {/* Days Tile */}
          <div className="relative group/tile flex-1">
            <div className="relative rounded-2xl backdrop-blur-xl bg-gradient-to-b from-white/95 to-slate-50/80 dark:from-slate-950/85 dark:to-slate-900/70 border border-slate-200/90 dark:border-sky-500/30 p-3 sm:p-5 text-center shadow-sm hover:shadow-md transition-all duration-200 group-hover/tile:-translate-y-1">
              <div 
                aria-hidden="true"
                className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white dark:via-sky-400/40 to-transparent" 
              />
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-black font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                {timeLeft.days}
              </span>
              <span className="block text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mt-1">
                Days
              </span>
            </div>
          </div>

          {/* Glowing Colon Separator */}
          <span className="text-blue-500/70 dark:text-sky-400/70 font-black text-xl sm:text-3xl select-none pb-4 animate-pulse">
            :
          </span>

          {/* Hours Tile */}
          <div className="relative group/tile flex-1">
            <div className="relative rounded-2xl backdrop-blur-xl bg-gradient-to-b from-white/95 to-slate-50/80 dark:from-slate-950/85 dark:to-slate-900/70 border border-slate-200/90 dark:border-sky-500/30 p-3 sm:p-5 text-center shadow-sm hover:shadow-md transition-all duration-200 group-hover/tile:-translate-y-1">
              <div 
                aria-hidden="true"
                className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white dark:via-sky-400/40 to-transparent" 
              />
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-black font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="block text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mt-1">
                Hours
              </span>
            </div>
          </div>

          {/* Glowing Colon Separator */}
          <span className="text-blue-500/70 dark:text-sky-400/70 font-black text-xl sm:text-3xl select-none pb-4 animate-pulse">
            :
          </span>

          {/* Minutes Tile */}
          <div className="relative group/tile flex-1">
            <div className="relative rounded-2xl backdrop-blur-xl bg-gradient-to-b from-white/95 to-slate-50/80 dark:from-slate-950/85 dark:to-slate-900/70 border border-slate-200/90 dark:border-sky-500/30 p-3 sm:p-5 text-center shadow-sm hover:shadow-md transition-all duration-200 group-hover/tile:-translate-y-1">
              <div 
                aria-hidden="true"
                className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white dark:via-sky-400/40 to-transparent" 
              />
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-black font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="block text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mt-1">
                Minutes
              </span>
            </div>
          </div>

          {/* Glowing Colon Separator */}
          <span className="text-blue-500/70 dark:text-sky-400/70 font-black text-xl sm:text-3xl select-none pb-4 animate-pulse">
            :
          </span>

          {/* Seconds Tile (Electric Cyan Highlight) */}
          <div className="relative group/tile flex-1">
            <div className="relative rounded-2xl backdrop-blur-xl bg-gradient-to-b from-blue-50/90 to-sky-50/80 dark:from-sky-950/80 dark:to-blue-950/70 border border-blue-400/60 dark:border-sky-400/60 p-3 sm:p-5 text-center shadow-[0_4px_20px_0_rgba(0,102,255,0.12)] dark:shadow-[0_0_24px_0_rgba(56,189,248,0.25)] transition-all duration-200 group-hover/tile:-translate-y-1">
              <div 
                aria-hidden="true"
                className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400 to-transparent" 
              />
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-black font-mono tabular-nums text-[#0066FF] dark:text-[#38BDF8] drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] tracking-tight">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="block text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-[#0066FF] dark:text-sky-400 mt-1">
                Seconds
              </span>
            </div>
          </div>
        </div>

        {/* Minimal Clean Kicker Footer */}
        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400 font-medium relative z-10 flex items-center justify-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
          <span>Every hour of focused preparation shapes your Island Rank — Stay consistent!</span>
        </div>

      </div>
    </div>
  );
};
