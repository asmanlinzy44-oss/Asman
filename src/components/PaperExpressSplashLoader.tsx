import React, { useState, useEffect, useRef } from 'react';
import { PaperExpressLogo } from './PaperExpressLogo';

interface PaperExpressSplashLoaderProps {
  onComplete: () => void;
  minDuration?: number; // duration in ms (default: 1300ms)
}

export const PaperExpressSplashLoader: React.FC<PaperExpressSplashLoaderProps> = ({
  onComplete,
  minDuration = 1350,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    const startTime = performance.now();
    let animFrame: number;

    const tick = (now: number) => {
      if (hasFinishedRef.current) return;
      const elapsed = now - startTime;
      // Smooth easing curve for natural feeling progress
      const progressFraction = Math.min(1, elapsed / minDuration);
      // Ease-out cubic calculation
      const easedProgress = Math.floor((1 - Math.pow(1 - progressFraction, 2.5)) * 100);
      setProgress(easedProgress);

      if (elapsed >= minDuration) {
        finish();
        return;
      }

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        finish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [minDuration]);

  const finish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setProgress(100);
    setIsFadingOut(true);

    // Smooth gentle fade out
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  return (
    <div
      role="dialog"
      aria-label="Loading Paper Express"
      aria-modal="true"
      onClick={finish}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#090D1A] transition-all duration-500 ease-out select-none cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 45%, rgba(14, 116, 244, 0.12) 0%, transparent 65%),
          radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.05) 0%, transparent 40%)
        `,
      }}
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center">
        {/* Subtle glowing logo presentation */}
        <div className="relative mb-6 transform transition-all duration-700 ease-out">
          {/* Gentle background glow behind logo */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-sky-500/20 to-indigo-600/20 rounded-full blur-2xl opacity-75" />
          
          {/* Logo with proper styling */}
          <div className="relative">
            <PaperExpressLogo size="xl" variant="dark" />
          </div>
        </div>

        {/* Clean, decent subtitle */}
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold mb-7">
          A/L Science Resource Portal
        </p>

        {/* Decent Minimalist Progress Bar */}
        <div className="w-52 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/40 relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-400 rounded-full transition-all duration-100 ease-out shadow-[0_0_8px_rgba(56,189,248,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Subtle, calm status indicator */}
        <div className="mt-3.5 flex items-center gap-2 text-[11px] font-medium text-slate-400/80">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>
            {progress < 40
              ? 'Loading resources...'
              : progress < 85
              ? 'Preparing past papers...'
              : 'Opening Paper Express...'}
          </span>
          <span className="text-slate-500 font-mono text-[10px] ml-1">{progress}%</span>
        </div>
      </div>

      {/* Subtle skip hint at the bottom */}
      <div className="absolute bottom-6 text-[11px] text-slate-500/70 tracking-wide font-medium">
        Click anywhere to skip
      </div>
    </div>
  );
};
