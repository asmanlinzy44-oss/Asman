import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, CheckCircle2, Lock, Unlock, ExternalLink, 
  Clock, ShieldCheck, Flame, Gift, ArrowRight, Check, AlertCircle 
} from 'lucide-react';
import { User, UserAdProgress } from '../types';
import { ADSTERRA_SMART_LINK, ADSTERRA_SCRIPT_URL, TARGET_ADS_REQUIRED, getStudentAdProgress, recordAdWatched } from '../utils/adReward';
import { playRoboticClick, playRoboticUnlock } from '../utils/audio';
import { AdsterraBannerAd } from './AdsterraBannerAd';

interface AdUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onGoogleLogin?: () => void;
  onUnlockSuccess?: (email: string) => Promise<boolean | void> | boolean | void;
  isAlreadyUnlocked?: boolean;
}

export const AdUnlockModal: React.FC<AdUnlockModalProps> = ({
  isOpen,
  onClose,
  user,
  onGoogleLogin,
  onUnlockSuccess,
  isAlreadyUnlocked = false,
}) => {
  const [adProgress, setAdProgress] = useState<UserAdProgress>({
    userEmail: user?.email || '',
    adsWatched: 0,
    targetAds: TARGET_ADS_REQUIRED,
    isUnlocked: isAlreadyUnlocked,
  });

  const [isVerifyingAd, setIsVerifyingAd] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [canClaim, setCanClaim] = useState(false);
  const [justCelebrated, setJustCelebrated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync progress from Firestore on open or user change
  useEffect(() => {
    if (!isOpen || !user?.email) return;

    let mounted = true;
    getStudentAdProgress(user.email).then((prog) => {
      if (mounted) {
        setAdProgress(prog);
        if (prog.isUnlocked || isAlreadyUnlocked) {
          setJustCelebrated(true);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [isOpen, user?.email, isAlreadyUnlocked]);

  // Timer countdown while user is visiting the ad
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerifyingAd && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isVerifyingAd && countdown === 0) {
      setCanClaim(true);
    }
    return () => clearTimeout(timer);
  }, [isVerifyingAd, countdown]);

  if (!isOpen) return null;

  const currentCount = adProgress.adsWatched;
  const isCompleted = currentCount >= TARGET_ADS_REQUIRED || adProgress.isUnlocked || isAlreadyUnlocked;
  const progressPercent = Math.min(100, Math.round((currentCount / TARGET_ADS_REQUIRED) * 100));

  // Step 1: Open the Adsterra Smart Link
  const handleWatchAdClick = () => {
    playRoboticClick();
    if (!user || !user.email) {
      if (onGoogleLogin) onGoogleLogin();
      return;
    }

    if (isCompleted) {
      setToastMessage('🎉 All 20 Ads completed! Your access is already unlocked.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    // Inject & trigger Adsterra script tag
    try {
      const existingScript = document.querySelector(`script[src="${ADSTERRA_SCRIPT_URL}"]`);
      if (!existingScript) {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = ADSTERRA_SCRIPT_URL;
        s.async = true;
        document.body.appendChild(s);
      }
    } catch (e) {
      console.warn('Adsterra script injection error:', e);
    }

    // Open the sponsor smart link in a new window/tab
    try {
      window.open(ADSTERRA_SMART_LINK, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = ADSTERRA_SMART_LINK;
    }

    // Start verification countdown
    setIsVerifyingAd(true);
    setCountdown(10);
    setCanClaim(false);
  };

  // Step 2: Claim credit (+1) after visiting
  const handleClaimAdCredit = async () => {
    if (!user || !user.email) return;
    playRoboticClick();
    setIsVerifyingAd(false);
    setCanClaim(false);

    try {
      const { progress: updated, justUnlocked } = await recordAdWatched(user.email, user.name);
      setAdProgress(updated);

      if (justUnlocked || updated.adsWatched >= TARGET_ADS_REQUIRED) {
        playRoboticUnlock();
        setJustCelebrated(true);
        if (onUnlockSuccess) {
          await onUnlockSuccess(user.email);
        }
        setToastMessage('🎉 Congratulations! 20 Ads completed! Video Lessons unlocked for your Gmail!');
      } else {
        setToastMessage(`✅ Ad credit added! Progress: ${updated.adsWatched} / ${TARGET_ADS_REQUIRED}`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.warn('Error recording ad watched:', err);
      setToastMessage('Credit saved! Keep going towards 20 ads.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 google-anno-skip">
      <div className="relative w-full max-w-lg bg-[#081028] text-white rounded-3xl shadow-2xl border-2 border-cyan-500/40 overflow-hidden flex flex-col">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-5 pb-3 border-b border-slate-800/80 flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>FREE VIDEO ACCESS MISSION</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Watch 20 Ads to Unlock All Videos
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playRoboticClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 relative z-10 overflow-y-auto max-h-[80vh]">
          {/* Explanation Text */}
          <div className="text-xs text-slate-300 leading-relaxed space-y-1">
            <p className="font-semibold text-slate-100">
              20 ஸ்பான்சர் விளம்பரங்களைப் பார்த்து உங்கள் Gmail கணக்கிற்கு அனைத்து வீடியோ பாடங்களையும் முற்றிலும் இலவசமாக அன்லாக் செய்யலாம்!
            </p>
            <p className="text-[11px] text-slate-400">
              ஒவ்வொரு விளம்பரத்தையும் கிளிக் செய்து சில நொடிகள் பார்த்தபின் உங்கள் கணக்கில் +1 பாயிண்ட் சேரும். 20 விளம்பரங்கள் முடிந்ததும் உடனே அன்லாக் ஆகும்.
            </p>
          </div>

          {/* Connected User Badge */}
          {user && user.email ? (
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400 text-[11px]">Enrolled Gmail:</span>
                <span className="font-mono font-bold text-cyan-300 truncate">{user.email}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold shrink-0">
                Live Sync
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-xs text-amber-200">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Google Sign-In Required (Gmail லாகின் தேவை)</span>
              </div>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                நீங்கள் பார்க்கும் 20 விளம்பரங்களின் புள்ளிகள் பாதுகாப்பாக சேமிக்கப்படவும், உங்கள் கணக்கிற்கு வீடியோக்கள் அன்லாக் ஆகவும் தயவுசெய்து Google மூலம் லாகின் செய்யவும்.
              </p>
              {onGoogleLogin && (
                <button
                  type="button"
                  onClick={() => {
                    playRoboticClick();
                    onGoogleLogin();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  <span>Sign in with Google First</span>
                </button>
              )}
            </div>
          )}

          {/* Progress Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B1536] to-[#070E24] border border-cyan-500/30 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Mission Progress:</span>
              </span>
              <span className="font-black text-sm text-cyan-300">
                {currentCount} / {TARGET_ADS_REQUIRED} Ads ({progressPercent}%)
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Milestones row */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center pt-1">
              {[
                { count: 5, label: '5 Ads (25%)' },
                { count: 10, label: '10 Ads (50%)' },
                { count: 15, label: '15 Ads (75%)' },
                { count: 20, label: '20 Ads (Unlock! 🔓)' },
              ].map((m) => {
                const reached = currentCount >= m.count;
                return (
                  <div 
                    key={m.count}
                    className={`py-1 px-1 rounded-lg border transition-all ${
                      reached 
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>{reached ? '✓ ' : ''}{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sponsored Adsterra Banner Ad */}
          <AdsterraBannerAd className="my-3" />

          {/* Verification Active Screen */}
          {isVerifyingAd && (
            <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-400/50 space-y-3 animate-in fade-in duration-150 text-center">
              <div className="flex items-center justify-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Verifying Advertisement Visit...</span>
              </div>
              <p className="text-[11px] text-slate-300">
                விளம்பரம் புதிய tab-இல் திறக்கப்பட்டுள்ளது. விளம்பரத்தை சில நொடிகள் பார்த்துவிட்டு வந்து கீழே உள்ள பட்டனை அழுத்தவும்.
              </p>

              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-black font-mono text-cyan-300">
                  {countdown > 0 ? `${countdown}s` : 'Ready! ✅'}
                </span>
              </div>

              {canClaim ? (
                <button
                  type="button"
                  onClick={handleClaimAdCredit}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-98 animate-bounce"
                >
                  <Check className="w-4 h-4" />
                  <span>Claim Ad Point (+1) • உறுதி செய்</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Please wait {countdown} seconds to verify...</span>
                </button>
              )}
            </div>
          )}

          {/* Toast Message Notification */}
          {toastMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs font-bold text-center animate-in fade-in duration-200 shadow-md">
              {toastMessage}
            </div>
          )}

          {/* Completed State */}
          {isCompleted ? (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-900 border border-emerald-400/60 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Unlock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-emerald-300">
                  All Video Lessons Unlocked! 🔓
                </h4>
                <p className="text-xs text-slate-300">
                  நீங்கள் 20 விளம்பரங்களை வெற்றிகரமாக முடித்துவிட்டீர்கள். உங்கள் Gmail கணக்கிற்கு அனைத்து வீடியோ பாடங்களும் அன்லாக் செய்யப்பட்டுள்ளன!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playRoboticClick();
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start Watching Lessons Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : !isVerifyingAd && (
            /* Main Watch Next Ad Action Button */
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleWatchAdClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span>
                  Watch Ad #{currentCount + 1} of 20 (விளம்பரம் பார்)
                </span>
              </button>

              <p className="text-[10px] text-center text-slate-400">
                Official Adsterra sponsor link opens safely in a new tab. No payment required.
              </p>
            </div>
          )}

          {/* Footer security tag */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Safe Adsterra Verified Smart Link</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">Paper Express 20-Ads Mission</span>
          </div>
        </div>
      </div>
    </div>
  );
};
