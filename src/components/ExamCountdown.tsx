import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, Trophy } from 'lucide-react';

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
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 text-center md:text-left">
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#38BDF8] flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-sky-400 font-bold mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>G.C.E. A/L 2027 Countdown • Exam Date: August 10, 2027</span>
          </div>
          <p className="text-xs text-slate-300">
            Target 2027.08.10 — Master every unit, solve past papers, and secure your Island Rank!
          </p>
        </div>
      </div>

      {/* Countdown Digits */}
      <div className="flex items-center gap-2 sm:gap-3 text-center shrink-0">
        <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-700 min-w-[56px]">
          <span className="block text-lg sm:text-xl font-black font-mono tabular-nums text-white">
            {timeLeft.days}
          </span>
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Days
          </span>
        </div>

        <span className="text-slate-600 font-bold">:</span>

        <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-700 min-w-[56px]">
          <span className="block text-lg sm:text-xl font-black font-mono tabular-nums text-white">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Hours
          </span>
        </div>

        <span className="text-slate-600 font-bold">:</span>

        <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-700 min-w-[56px]">
          <span className="block text-lg sm:text-xl font-black font-mono tabular-nums text-white">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Mins
          </span>
        </div>

        <span className="text-slate-600 font-bold">:</span>

        <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-700 min-w-[56px]">
          <span className="block text-lg sm:text-xl font-black font-mono tabular-nums text-[#38BDF8]">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Secs
          </span>
        </div>
      </div>
    </div>
  );
};
