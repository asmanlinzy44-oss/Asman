import React, { useState } from 'react';
import { Lock, X, CheckCircle2, Sparkles, MessageCircle, Send, Clock, UserCheck, ShieldCheck, Film, GraduationCap } from 'lucide-react';
import { playRoboticClick } from '../utils/audio';
import { User, VideoLesson, VideoAccessRequest, PaidStudentAccess } from '../types';
import { Mail, Check, AlertCircle } from 'lucide-react';

interface VideoLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock?: () => void;
  targetVideoTitle?: string;
  targetVideo?: VideoLesson | null;
  currentUser?: User | null;
  userAccessScopeLabel?: string;
  onGoogleLogin?: () => void;
  onLogoutAndSwitch?: () => void;
  onOpenContactUs?: () => void;
  accessRequests?: VideoAccessRequest[];
  onRequestAccess?: (params: { folderId?: string; folderName?: string; videoId?: string; videoTitle?: string; message?: string }) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onStudentGmailLogin?: (email: string) => Promise<{ success: boolean; message: string; expired?: boolean }>;
  isAccessExpired?: boolean;
  currentUserAccess?: PaidStudentAccess | null;
}

export const VideoLockModal: React.FC<VideoLockModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
  targetVideoTitle,
  targetVideo,
  currentUser,
  userAccessScopeLabel,
  onGoogleLogin,
  onLogoutAndSwitch,
  onOpenContactUs,
  accessRequests = [],
  onRequestAccess,
  onStudentGmailLogin,
  isAccessExpired = false,
  currentUserAccess,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [quickGmailInput, setQuickGmailInput] = useState('');
  const [isVerifyingGmail, setIsVerifyingGmail] = useState(false);
  const [gmailNotice, setGmailNotice] = useState<{ text: string; type: 'success' | 'error' | 'expired' } | null>(null);

  if (!isOpen) return null;

  // Check if current user has an active pending request
  const currentEmail = currentUser?.email?.toLowerCase().trim();
  const existingPending = currentEmail
    ? accessRequests.find((r) => r.status === 'pending' && r.userEmail.toLowerCase().trim() === currentEmail)
    : null;

  const handleSendRequest = async () => {
    if (!onRequestAccess) return;
    setIsRequesting(true);
    try {
      const res = await onRequestAccess({
        folderId: targetVideo?.folderId,
        folderName: targetVideo?.folderName,
        videoId: targetVideo?.id,
        videoTitle: targetVideoTitle || targetVideo?.titleEn,
        message: 'Student requested video masterclass activation.'
      });
      setRequestStatus(res.message);
    } catch (err: any) {
      setRequestStatus('Failed to send request. Please contact Asman Linzy directly.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleQuickGmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onStudentGmailLogin) return;
    const input = quickGmailInput.trim().toLowerCase();
    if (!input || !input.includes('@')) {
      setGmailNotice({ text: 'Please enter a valid Gmail address (e.g. yourname@gmail.com)', type: 'error' });
      return;
    }
    setIsVerifyingGmail(true);
    setGmailNotice(null);
    try {
      const result = await onStudentGmailLogin(input);
      if (result.success) {
        setGmailNotice({ text: result.message, type: 'success' });
        setTimeout(() => {
          if (onUnlock) onUnlock();
          onClose();
        }, 1200);
      } else if (result.expired) {
        setGmailNotice({ text: result.message, type: 'expired' });
      } else {
        setGmailNotice({ text: result.message, type: 'error' });
      }
    } catch (err: any) {
      setGmailNotice({ text: err?.message || 'Verification error. Please contact Asman Linzy.', type: 'error' });
    } finally {
      setIsVerifyingGmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 google-anno-skip">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-blue-200 dark:border-blue-900/60 overflow-hidden text-slate-900 dark:text-white google-anno-skip">
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            playRoboticClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer z-20 border border-slate-200 dark:border-slate-700"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Showcase with Golden Ribbon */}
        <div className="pt-8 pb-4 px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-400/50 text-amber-800 dark:text-amber-300 text-[11px] font-mono font-bold tracking-wider mb-3 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>👑 PAID STUDENT MASTERCLASS • ENROLLED ACCESS ONLY</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            A/L Theory Masterclass Lectures
          </h3>
          <p className="text-xs font-semibold text-blue-700 dark:text-sky-300 mt-1">
            உயர்தர விசேட கோட்பாட்டு விரிவுரைகள் & நேரடி செய்முறைப் பயிற்சி
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Exam-targeted lectures, complete derivations, real apparatus experiments, and model essay answer breakdowns.
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 pt-1 relative z-10 space-y-4">
          {targetVideoTitle && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center gap-2.5 text-xs text-blue-900 dark:text-sky-200 font-medium">
              <Film className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
              <span className="truncate">Selected Lecture: <strong>{targetVideoTitle}</strong></span>
            </div>
          )}

          {/* Value Highlights Preview */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Full Syllabus Derivations</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Past Paper Model Solutions</span>
            </div>
          </div>

          {/* Scenario 1: User is logged in with an unauthorized or pending Gmail */}
          {currentUser && currentUser.email ? (
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-blue-200/80 dark:border-slate-700 rounded-2xl p-4 text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected Gmail: <strong className="font-mono text-blue-600 dark:text-sky-400">{currentUser.email}</strong></span>
              </div>

              {isAccessExpired ? (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 text-xs text-left leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-rose-800 dark:text-rose-300 mb-1">
                    <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Access Expired (காலாவதியானது)</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Your course enrollment access expired {currentUserAccess?.expiresAt ? `on ${new Date(currentUserAccess.expiresAt).toLocaleDateString()}` : ''}. Contact Admin Asman Linzy on WhatsApp to renew your masterclass access.
                  </p>
                </div>
              ) : userAccessScopeLabel ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs text-left leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300 mb-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Lesson Not Included In Current Enrollment</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Your current account has access to: <strong>{userAccessScopeLabel}</strong>. Request an access upgrade or WhatsApp Asman Linzy to unlock this module.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs text-left leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300 mb-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Access Not Activated (அனுமதி வழங்கப்படவில்லை)</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    This Gmail account has not been activated in cloud storage yet. If you have paid the course fees, click the button below to submit your instant access request!
                  </p>
                </div>
              )}

              {/* 1-Click Request Access Action */}
              {existingPending ? (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 rounded-xl text-left space-y-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Access Request Submitted (அனுமதி கோரிக்கை அனுப்பப்பட்டது)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Your request has been received by Admin Asman Linzy. Once approved in the Admin Panel, your video lessons will immediately activate!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSendRequest}
                    disabled={isRequesting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isRequesting ? 'Sending Request...' : 'Request Access from Admin (அனுமதி கோர)'}</span>
                  </button>

                  {requestStatus && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 text-left">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{requestStatus}</span>
                    </div>
                  )}
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
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Teacher</span>
                  </button>
                )}

                {onLogoutAndSwitch && (
                  <button
                    type="button"
                    onClick={() => {
                      playRoboticClick();
                      onLogoutAndSwitch();
                    }}
                    className="w-full py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-sky-500" />
                    <span>Switch Gmail</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Scenario 2: User is NOT logged in - Instant Multi-Device Access via Registered Gmail or Google */
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center space-y-3.5">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Theory masterclass videos are protected and stored in cloud storage. Access with your registered <strong>Google (Gmail)</strong> account.
              </p>

              {/* Direct Quick Gmail Verification Form (WhatsApp-Style Cloud Lookup) */}
              <div className="p-3 bg-white dark:bg-slate-900/90 rounded-2xl border border-blue-200 dark:border-blue-900/70 text-left space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label htmlFor="quick-student-gmail" className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                    <span>Enter Registered Gmail (பதிவுசெய்த Gmail)</span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    🟢 Cloud Live
                  </span>
                </div>
                <form onSubmit={handleQuickGmailSubmit} className="flex gap-2">
                  <input
                    id="quick-student-gmail"
                    type="email"
                    value={quickGmailInput}
                    onChange={(e) => setQuickGmailInput(e.target.value)}
                    placeholder="student@gmail.com"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    disabled={isVerifyingGmail}
                  />
                  <button
                    type="submit"
                    disabled={isVerifyingGmail || !quickGmailInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs"
                  >
                    {isVerifyingGmail ? (
                      <span className="animate-pulse">Checking...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Unlock</span>
                      </>
                    )}
                  </button>
                </form>

                {gmailNotice && (
                  <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    gmailNotice.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                      : gmailNotice.type === 'expired'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300'
                      : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                  }`}>
                    {gmailNotice.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span className="leading-tight">{gmailNotice.text}</span>
                  </div>
                )}
              </div>

              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
                <span className="bg-slate-50 dark:bg-slate-800 px-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider absolute">or</span>
              </div>

              {onGoogleLogin && (
                <button
                  type="button"
                  onClick={() => {
                    playRoboticClick();
                    onGoogleLogin();
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer group active:scale-[0.98]"
                >
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                    </svg>
                  </div>
                  <span>Sign In with Google (Gmail மூலம் இணைய)</span>
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
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Want to enroll? Contact Asman Linzy on WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Clean Security Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Official Student Portal</span>
            </span>
            <span className="font-mono font-bold text-blue-600 dark:text-sky-400">Paper Express Education</span>
          </div>
        </div>
      </div>
    </div>
  );
};
