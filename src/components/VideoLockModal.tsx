import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, UserCheck, AlertCircle, X, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { playRoboticUnlock, playRoboticError, playRoboticClick } from '../utils/audio';

interface VideoLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  targetVideoTitle?: string;
}

export const VideoLockModal: React.FC<VideoLockModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
  targetVideoTitle,
}) => {
  const [indexNumber, setIndexNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedIndex = indexNumber.trim();
    const trimmedPass = password.trim();

    // Verify index (4428) and password (1016)
    if (trimmedIndex === '4428' && trimmedPass === '1016') {
      setIsSuccess(true);
      playRoboticUnlock();
      setTimeout(() => {
        setIsSuccess(false);
        setIndexNumber('');
        setPassword('');
        onUnlock();
      }, 700);
    } else {
      playRoboticError();
      setErrorMsg('Invalid Index or Password. Please check and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-3xl shadow-[0_0_50px_rgba(0,102,255,0.35)] border border-blue-500/30 overflow-hidden text-white">
        {/* Futuristic Background Glows */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            playRoboticClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer z-20 border border-white/10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Ribbon with Cyber Shield */}
        <div className="pt-8 pb-5 px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-300 text-[11px] font-mono font-bold tracking-wider mb-4 shadow-inner">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>CYBER-GATE · VERIFIED STUDENT ACCESS</span>
          </div>

          {/* Animated Glowing Holographic Lock */}
          <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 opacity-30 blur-md animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-slate-900/90 border border-blue-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.3)]">
              {isSuccess ? (
                <Unlock className="w-7 h-7 text-emerald-400 animate-bounce drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              ) : (
                <Lock className="w-7 h-7 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
              )}
            </div>
          </div>

          <h3 className="text-xl font-black tracking-tight text-white">
            Theory Video Masterclasses
          </h3>
          <p className="text-xs text-sky-200/90 font-semibold mt-1">
            Exclusive Access to Theory Video Masterclasses
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Physics Hydrodynamics (Units 1–5) & Chemistry IUPAC Lectures
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-1 relative z-10">
          {targetVideoTitle && (
            <div className="mb-4 p-3 bg-blue-950/60 border border-blue-500/30 rounded-xl flex items-center gap-2.5 text-xs text-sky-200 font-medium">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate">Selected Lecture: <strong>{targetVideoTitle}</strong></span>
            </div>
          )}

          <p className="text-xs text-slate-300 mb-5 leading-relaxed text-center">
            Please enter your student <strong>Index</strong> and <strong>Password</strong> to unlock the theory video player.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Index Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Index</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={indexNumber}
                onChange={(e) => {
                  setIndexNumber(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Index"
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/90 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all font-mono tracking-wider placeholder-slate-500"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Password"
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/90 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all font-mono tracking-wider placeholder-slate-500"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-300 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-300 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Access Granted! Unlocking video lessons...</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSuccess}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(0,102,255,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Video Lessons</span>
            </button>
          </form>

          {/* Quick Security Notice */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Official Student Credential Required</span>
            <span className="font-mono font-bold text-sky-400">Security Gate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
