import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, AlertCircle, X, CheckCircle2, Shield, Sparkles, MessageCircle, LogIn, ChevronDown } from 'lucide-react';
import { playRoboticUnlock, playRoboticError, playRoboticClick } from '../utils/audio';
import { User } from '../types';

interface VideoLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  targetVideoTitle?: string;
  currentUser?: User | null;
  userAccessScopeLabel?: string;
  onGoogleLogin?: () => void;
  onLogoutAndSwitch?: () => void;
  onOpenContactUs?: () => void;
}

export const VideoLockModal: React.FC<VideoLockModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
  targetVideoTitle,
  currentUser,
  userAccessScopeLabel,
  onGoogleLogin,
  onLogoutAndSwitch,
  onOpenContactUs,
}) => {
  const [indexNumber, setIndexNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOverride, setShowOverride] = useState(false);

  if (!isOpen) return null;

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedIndex = indexNumber.trim();
    const trimmedPass = password.trim();

    // Verify index (4428) and password (1016) or master admin pass
    if (
      (trimmedIndex === '4428' && trimmedPass === '1016') ||
      trimmedPass === 'admin2026' ||
      trimmedPass === 'asman44'
    ) {
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
      setErrorMsg('Invalid code. Please contact Asman Linzy for official enrollment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 google-anno-skip">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-3xl shadow-[0_0_50px_rgba(0,102,255,0.35)] border border-blue-500/30 overflow-hidden text-white google-anno-skip">
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
        <div className="pt-8 pb-4 px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-mono font-bold tracking-wider mb-4 shadow-inner">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>LOCKED 🔐 · PAID STUDENTS ONLY</span>
          </div>

          {/* Animated Glowing Holographic Lock */}
          <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-red-500 opacity-30 blur-md animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-slate-900/90 border border-amber-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              {isSuccess ? (
                <Unlock className="w-7 h-7 text-emerald-400 animate-bounce drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              ) : (
                <Lock className="w-7 h-7 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
              )}
            </div>
          </div>

          <h3 className="text-xl font-black tracking-tight text-white">
            Locked 🔐 Video Lessons
          </h3>
          <p className="text-xs text-amber-200/90 font-semibold mt-1">
            Exclusive Masterclasses for Enrolled Students
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Physics Hydrodynamics (Units 1–5) & Chemistry IUPAC Lectures
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 pt-1 relative z-10 space-y-4">
          {targetVideoTitle && (
            <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-xl flex items-center gap-2.5 text-xs text-sky-200 font-medium">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate">Selected Lecture: <strong>{targetVideoTitle}</strong></span>
            </div>
          )}

          {/* Scenario 1: User is logged in with an unauthorized Gmail */}
          {currentUser && currentUser.email ? (
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Signed in as: <strong className="text-white font-mono">{currentUser.email}</strong></span>
              </div>

              {userAccessScopeLabel ? (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs text-left leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Lesson Not Included In Your Enrolled Course (Locked 🔐)</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Your account has access to: <strong className="text-amber-300 font-bold">{userAccessScopeLabel}</strong>. This lecture is part of another module. Please contact Admin Asman Linzy to add this lesson to your access.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs text-left leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Access Not Activated (Locked 🔐)</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    This Gmail has not been granted video access by the administrator yet. If you have completed payment, please contact Asman Linzy to add your email in the Admin Panel.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {onOpenContactUs && (
                  <button
                    type="button"
                    onClick={() => {
                      playRoboticClick();
                      onClose();
                      onOpenContactUs();
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact Admin</span>
                  </button>
                )}

                {onLogoutAndSwitch && (
                  <button
                    type="button"
                    onClick={() => {
                      playRoboticClick();
                      onLogoutAndSwitch();
                    }}
                    className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-sky-400" />
                    <span>Switch Gmail</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Scenario 2: User is NOT logged in */
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-center space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Video masterclasses are protected and only accessible to enrolled students. Please sign in with your authorized <strong>Google / Gmail</strong> account.
              </p>

              {onGoogleLogin && (
                <button
                  type="button"
                  onClick={() => {
                    playRoboticClick();
                    onGoogleLogin();
                  }}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer group active:scale-[0.98]"
                >
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                    </svg>
                  </div>
                  <span>Sign In with Google (Gmail)</span>
                </button>
              )}

              {onOpenContactUs && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playRoboticClick();
                      onClose();
                      onOpenContactUs();
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Want to enroll? Contact Asman Linzy to get access</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Admin Override */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowOverride(!showOverride)}
              className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-300 py-1 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-slate-400" />
                <span>Admin Passcode Override</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOverride ? 'rotate-180' : ''}`} />
            </button>

            {showOverride && (
              <form onSubmit={handleOverrideSubmit} className="mt-3 space-y-2.5 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={indexNumber}
                    onChange={(e) => setIndexNumber(e.target.value)}
                    placeholder="Index"
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Passcode"
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2 bg-rose-950/60 border border-rose-500/40 rounded-lg flex items-center gap-1.5 text-[11px] font-bold text-rose-300">
                    <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {isSuccess && (
                  <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-lg flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Access Granted!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSuccess}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Verify Passcode</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Security Notice */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Verified Paid Student Gate</span>
            <span className="font-mono font-bold text-sky-400">Paper Express Masterclasses</span>
          </div>
        </div>
      </div>
    </div>
  );
};
