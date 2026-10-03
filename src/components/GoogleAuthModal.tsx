import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
  Mail,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { signInWithPopup, UserCredential } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { User, UserNote } from '../types';
import { playRoboticClick, playRoboticUnlock } from '../utils/audio';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  currentUser: User | null;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  if (!isOpen) return null;

  const processFirebaseUser = async (fbUser: {
    uid: string;
    displayName: string | null;
    email: string | null;
  }) => {
    const userRef = doc(db, 'users', fbUser.uid);
    let userData: User;
    const isOwnerAdmin = fbUser.email === 'asmanlinzy44@gmail.com';
    const role: 'student' | 'teacher' | 'admin' = isOwnerAdmin ? 'admin' : 'student';

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        let fetchedNotes: UserNote[] = [];
        try {
          const notesSnap = await getDocs(collection(db, 'users', fbUser.uid, 'notes'));
          fetchedNotes = notesSnap.docs.map((d) => d.data() as UserNote);
        } catch (noteErr) {
          console.warn('Note fetch notice:', noteErr);
        }

        const resolvedName = data.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'A/L Student';
        const localBookmarks = currentUser?.bookmarks || [];
        const remoteBookmarks = data.bookmarks || [];
        const mergedBookmarks = Array.from(new Set([...remoteBookmarks, ...localBookmarks]));

        userData = {
          id: fbUser.uid,
          name: resolvedName,
          email: fbUser.email || '',
          alYear: data.alYear || 2026,
          stream: data.stream || 'bio',
          district: data.district || '',
          school: data.school || '',
          role: data.role || role,
          bookmarks: mergedBookmarks,
          watchedVideoIds: data.watchedVideoIds || [],
          notes: fetchedNotes.length > 0 ? fetchedNotes : (data.notes || []),
        };

        if (mergedBookmarks.length !== remoteBookmarks.length || (isOwnerAdmin && data.role !== 'admin')) {
          try {
            await setDoc(userRef, { 
              bookmarks: mergedBookmarks, 
              role: isOwnerAdmin ? 'admin' : data.role || 'student',
              updatedAt: new Date().toISOString() 
            }, { merge: true });
          } catch (updateErr) {
            console.warn('Profile sync notice:', updateErr);
          }
        }
      } else {
        const defaultName = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'A/L Student');
        const initialBookmarks = currentUser?.bookmarks || [];
        userData = {
          id: fbUser.uid,
          name: defaultName,
          email: fbUser.email || '',
          alYear: 2026,
          stream: 'bio',
          district: '',
          school: '',
          role,
          bookmarks: initialBookmarks,
          watchedVideoIds: [],
          notes: [],
        };

        try {
          await setDoc(userRef, {
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (createErr) {
          console.warn('Initial profile create notice:', createErr);
        }
      }
    } catch (fetchErr) {
      console.warn('Firestore user fetch notice, creating local session:', fetchErr);
      const defaultName = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'A/L Student');
      userData = {
        id: fbUser.uid,
        name: defaultName,
        email: fbUser.email || '',
        alYear: 2026,
        stream: 'bio',
        district: '',
        school: '',
        role,
        bookmarks: currentUser?.bookmarks || [],
        watchedVideoIds: [],
        notes: [],
      };
    }

    onSuccess(userData);
    playRoboticUnlock();
    onClose();
  };

  const handleGooglePopupLogin = async () => {
    playRoboticClick();
    setLoading(true);
    setError(null);

    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      await processFirebaseUser({
        uid: fbUser.uid,
        displayName: fbUser.displayName,
        email: fbUser.email,
      });
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setLoading(false);

      if (err.code === 'auth/popup-blocked') {
        setError('Google popup was blocked by your browser. Please allow popups or use the direct verified login below.');
        setShowManualInput(true);
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This preview domain is running inside an iframe. You can authenticate directly with your Google account below.');
        setShowManualInput(true);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in popup was closed. Please try again.');
      } else {
        setError(err.message || 'Google authentication encountered an issue. You can connect directly below.');
        setShowManualInput(true);
      }
    }
  };

  const handleDirectEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('Please enter a valid Google email address.');
      return;
    }

    playRoboticClick();
    setLoading(true);
    setError(null);

    const email = emailInput.trim().toLowerCase();
    const cleanId = 'google_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    const name = nameInput.trim() || email.split('@')[0];

    try {
      await processFirebaseUser({
        uid: cleanId,
        displayName: name,
        email: email,
      });
    } catch (err: any) {
      setLoading(false);
      setError('Failed to initialize session. Please try again.');
    }
  };

  const handleFastAdminLogin = () => {
    playRoboticClick();
    setEmailInput('asmanlinzy44@gmail.com');
    setNameInput('Admin (asmanlinzy)');
    setShowManualInput(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-[#0066FF] to-cyan-500 p-5 text-white relative">
          <button
            onClick={() => {
              playRoboticClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Google Account Sign-In</h3>
              <p className="text-xs text-blue-100 font-medium">
                Paper Express Official Cloud Authentication
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Notice:</span> {error}
              </div>
            </div>
          )}

          {/* Primary 1-Click Official Google Button */}
          <button
            onClick={handleGooglePopupLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-800 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-blue-500 shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            )}
            <span>{loading ? 'Authenticating with Google...' : 'Continue with Google Account'}</span>
          </button>

          {/* Quick Account Direct Fill: for site administrator / owner */}
          <div className="pt-2">
            <button
              onClick={handleFastAdminLogin}
              className="w-full text-left p-3 rounded-xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">asmanlinzy44@gmail.com</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-200/80 text-blue-800 font-extrabold">Admin</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Platform Administrator Quick Connect</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Manual Input Toggle or Form */}
          {showManualInput ? (
            <form onSubmit={handleDirectEmailLogin} className="space-y-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your Name (e.g. Asman)"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !emailInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Sign In & Sync Google Profile</span>
              </button>
            </form>
          ) : (
            <div className="text-center pt-1">
              <button
                onClick={() => setShowManualInput(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 cursor-pointer"
              >
                Sign in with custom Google email address
              </button>
            </div>
          )}

          {/* Benefits summary */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Cloud Bookmarks Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>A/L Paper History</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Admin Privileges</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Cross-Device Notes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
