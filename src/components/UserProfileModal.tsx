import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  GraduationCap,
  MapPin,
  Building,
  ShieldCheck,
  HardDrive,
  BookmarkCheck,
  FileText,
  LogOut,
  Check,
  RefreshCw,
  Sparkles,
  Edit3,
  Save,
  Cloud,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { User, StreamId } from '../types';
import { playRoboticClick, playRoboticUnlock } from '../utils/audio';

const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
];

const BATCH_YEARS = [2024, 2025, 2026, 2027, 2028, 2029];

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  onUpdateUser?: (updated: Partial<User>) => Promise<void> | void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateUser,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSavedLocally, setIsSavedLocally] = useState<boolean>(false);

  // Editable form fields
  const [name, setName] = useState<string>('');
  const [school, setSchool] = useState<string>('');
  const [alYear, setAlYear] = useState<number>(2026);
  const [district, setDistrict] = useState<string>('');
  const [stream, setStream] = useState<StreamId>('bio');

  // Populate state whenever user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSchool(user.school || '');
      setAlYear(user.alYear || 2026);
      setDistrict(user.district || '');
      setStream(user.stream || 'bio');
    }
  }, [user, isOpen]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    playRoboticClick();
    setIsSaving(true);

    const updatedData: Partial<User> = {
      name: name.trim() || user.name || 'Student',
      school: school.trim(),
      alYear: Number(alYear),
      district: district.trim(),
      stream: stream,
    };

    try {
      if (onUpdateUser) {
        await onUpdateUser(updatedData);
      }
      playRoboticUnlock();
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setIsSaving(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 google-anno-skip">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 flex flex-col max-h-[92vh] google-anno-skip">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-black shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white leading-tight">
                  {user.name || 'Student Account'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold flex items-center gap-1 border border-white/30">
                  <ShieldCheck className="w-3 h-3 text-sky-300" />
                  Google Verified
                </span>
              </div>
              <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-1 font-mono">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[210px] sm:max-w-xs">{user.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Top Actions: Mode Switcher */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              {isEditing ? 'Edit Profile Details' : 'Student Academic Profile'}
            </span>

            {!isEditing ? (
              <button
                onClick={() => {
                  playRoboticClick();
                  setIsEditing(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  playRoboticClick();
                  setIsEditing(false);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1"
              >
                Cancel
              </button>
            )}
          </div>

          {/* VIEW MODE: Academic Info Grid */}
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Batch / Target Year */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    Batch / Exam Year
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {user.alYear ? `${user.alYear} A/L Batch` : 'Not specified'}
                  </span>
                </div>

                {/* Science Stream */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Stream
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {user.stream === 'maths'
                      ? 'Physical Science (Maths)'
                      : user.stream === 'bio'
                      ? 'Biological Science (Bio)'
                      : 'All Streams'}
                  </span>
                </div>

                {/* School */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1 col-span-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-indigo-500" />
                    School
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {user.school && user.school.trim().length > 0 ? (
                      user.school
                    ) : (
                      <span className="text-slate-400 font-medium text-xs italic">
                        Not specified (Click &quot;Edit Profile&quot; to add your school)
                      </span>
                    )}
                  </span>
                </div>

                {/* District */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1 col-span-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    District
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {user.district && user.district.trim().length > 0 ? (
                      user.district
                    ) : (
                      <span className="text-slate-400 font-medium text-xs italic">
                        Not specified (Click &quot;Edit Profile&quot; to set your district)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE: Form to update name, school, batch, stream, and district */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* School Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>School Name</span>
                  <span className="text-[10px] font-normal text-slate-400">Optional</span>
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Jaffna Central College / Hartley College / Royal College"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Batch / AL Year & Stream */}
              <div className="grid grid-cols-2 gap-3">
                {/* Batch */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Batch / A/L Year
                  </label>
                  <div className="relative">
                    <select
                      value={alYear}
                      onChange={(e) => setAlYear(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer"
                    >
                      {BATCH_YEARS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr} A/L Batch
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Science Stream */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Science Stream
                  </label>
                  <div className="relative">
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value as StreamId)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer"
                    >
                      <option value="bio">Biological Science (Bio)</option>
                      <option value="maths">Physical Science (Maths)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>District</span>
                  <span className="text-[10px] font-normal text-slate-400">Optional</span>
                </label>
                <div className="relative">
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-8 cursor-pointer"
                  >
                    <option value="">Select your district (Optional)</option>
                    {SRI_LANKA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Google Account...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                      <span>Saved to Google Account!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes to Google Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Google Account & Local Storage Vault Section */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-sky-300">
                  Google Account Cloud Sync
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/30">
                Connected &amp; Synced
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your bookmarks, notes, and profile details are automatically saved to your Google Account (Firestore) and synced across devices.
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
                    <span className="text-emerald-300">Saved to Local Storage Cache!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sync &amp; Save Cache to Local Storage</span>
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
