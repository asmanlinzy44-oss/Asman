import React, { useState } from 'react';
import { X, User as UserIcon, Mail, GraduationCap, MapPin, Building, ShieldCheck, HardDrive, BookmarkCheck, FileText, LogOut, Check, RefreshCw, Sparkles } from 'lucide-react';
import { User } from '../types';
import { playRoboticClick } from '../utils/audio';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  const [isSavedLocally, setIsSavedLocally] = useState<boolean>(false);

  const handleManualSaveLocalStorage = () => {
    playRoboticClick();
    if (user) {
      try {
        localStorage.setItem('studypro_user_session', JSON.stringify(user));
        localStorage.setItem(
          'studypro_user_storage',
          JSON.stringify({
            userId: user.id,
            email: user.email,
            bookmarks: user.bookmarks,
            notesCount: user.notes?.length || 0,
            lastSynced: new Date().toISOString(),
          })
        );
        setIsSavedLocally(true);
        setTimeout(() => setIsSavedLocally(false), 2000);
      } catch (e) {
        console.warn('LocalStorage save warning:', e);
      }
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl font-black shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">{user.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold flex items-center gap-1 border border-white/30">
                  <ShieldCheck className="w-3 h-3 text-sky-300" />
                  Google Verified
                </span>
              </div>
              <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5 font-mono">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Details Grid */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Academic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                Target Exam
              </span>
              <span className="text-sm font-black text-slate-900">{user.alYear} G.C.E. A/L</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Stream
              </span>
              <span className="text-sm font-black text-slate-900 capitalize">
                {user.stream === 'maths' ? 'Physical Science (Maths)' : 'Biological Science (Bio)'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                District
              </span>
              <span className="text-sm font-black text-slate-900">{user.district || 'Jaffna'}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                School
              </span>
              <span className="text-sm font-black text-slate-900 truncate">
                {user.school || 'A/L Science College'}
              </span>
            </div>
          </div>

          {/* Local Storage Vault Section */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-300">
                  Local Storage Vault
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/30">
                Persistent Cache Active
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your Google session, bookmarks, theory notes, and study progress are stored in your device's browser local storage for fast access.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-0.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Saved Bookmarks</span>
                </div>
                <div className="text-sm font-black text-white">{user.bookmarks.length}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-0.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Study Notes</span>
                </div>
                <div className="text-sm font-black text-white">{user.notes?.length || 0}</div>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={handleManualSaveLocalStorage}
                className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
              >
                {isSavedLocally ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-300">Saved to Local Storage!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sync & Save to Local Storage</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              playRoboticClick();
              onLogout();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
