import React from 'react';
import { User as UserIcon, LogOut, BookmarkCheck, ShieldCheck } from 'lucide-react';
import { User, ResourceCategory } from '../types';
import { PaperExpressLogo } from './PaperExpressLogo';
import { playRoboticTab, playRoboticClick } from '../utils/audio';

interface HeaderProps {
  currentTab: ResourceCategory | 'home';
  onTabChange: (tab: ResourceCategory | 'home') => void;
  user: User | null;
  onGoogleLogin: () => void;
  onLogout: () => void;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenProfile?: () => void;
  onOpenAdminPanel?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  user,
  onGoogleLogin,
  onLogout,
  savedCount,
  onOpenSaved,
  onOpenProfile,
  onOpenAdminPanel,
  isAdminLoggedIn = false,
}) => {
  const handleNav = (tab: ResourceCategory | 'home') => {
    playRoboticTab();
    onTabChange(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs google-anno-skip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand: Paper Express */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center text-left focus-visible:outline-none cursor-pointer group"
          title="Paper Express - Home"
        >
          <PaperExpressLogo size="md" variant="light" />
        </button>

        {/* Primary Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-slate-600">
          <button
            onClick={() => handleNav('home')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-blue-50 text-[#0066FF] font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('past-papers')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'past-papers'
                ? 'bg-blue-50 text-[#0066FF] font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Past Papers
          </button>
          <button
            onClick={() => handleNav('fwc-papers')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'fwc-papers' || currentTab === 'term-papers'
                ? 'bg-blue-50 text-[#0066FF] font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>FWC & Term Tests</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md font-extrabold uppercase">
              Hot
            </span>
          </button>
          <button
            onClick={() => handleNav('theory-notes')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'theory-notes'
                ? 'bg-blue-50 text-[#0066FF] font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Resources</span>
            <span className="text-[10px] bg-blue-100 text-[#0066FF] px-1.5 py-0.2 rounded-md font-extrabold">
              4 Folders
            </span>
          </button>
          <button
            onClick={() => handleNav('pilot-papers')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'pilot-papers'
                ? 'bg-blue-50 text-[#0066FF] font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Other Pilot Papers</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-md font-extrabold">
              Moratuwa & Pilot
            </span>
          </button>
          <button
            onClick={() => handleNav('theory-videos')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'theory-videos'
                ? 'bg-blue-50 text-[#0066FF] font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Video Lessons</span>
            {!user && (
              <span className="text-[10px] bg-blue-100 text-[#0066FF] px-1.5 py-0.2 rounded-md font-bold">
                Login
              </span>
            )}
          </button>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Bookmarks */}
          <button
            onClick={() => {
              playRoboticClick();
              onOpenSaved();
            }}
            className="p-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors relative cursor-pointer border border-slate-200"
            title="Saved Bookmarks"
          >
            <BookmarkCheck className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0066FF] text-white text-[10px] flex items-center justify-center font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Google Sign In / User Profile */}
          {user && user.id !== 'student_guest' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playRoboticClick();
                  if (onOpenProfile) onOpenProfile();
                }}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left cursor-pointer"
                title="View Student Profile & Local Storage"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name ? user.name.charAt(0).toUpperCase() : 'G'}</span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[110px]">{user.name}</span>
                  <span className="text-[10px] text-[#0066FF] font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>{user.role === 'admin' ? 'Admin' : 'Google Sync'}</span>
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  playRoboticClick();
                  onLogout();
                }}
                title="Logout"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playRoboticClick();
                onGoogleLogin();
              }}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-slate-800 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-xs border border-slate-300 hover:border-slate-400 flex items-center gap-2 active:scale-95"
              title="Sign in directly with your Google account"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span className="hidden sm:inline">Google Login</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 bg-slate-50/90 border-t border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          onClick={() => handleNav('home')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'home' ? 'bg-[#0066FF] text-white' : 'text-slate-600'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => handleNav('past-papers')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'past-papers' ? 'bg-[#0066FF] text-white' : 'text-slate-600'
          }`}
        >
          Past Papers
        </button>
        <button
          onClick={() => handleNav('fwc-papers')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'fwc-papers' || currentTab === 'term-papers' ? 'bg-[#0066FF] text-white' : 'text-slate-600'
          }`}
        >
          FWC & Term Tests
        </button>
        <button
          onClick={() => handleNav('theory-notes')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'theory-notes' ? 'bg-[#0066FF] text-white' : 'text-slate-600'
          }`}
        >
          Resources
        </button>
        <button
          onClick={() => handleNav('pilot-papers')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'pilot-papers' ? 'bg-[#0066FF] text-white' : 'text-slate-600'
          }`}
        >
          Other Pilot Papers
        </button>
        <button
          onClick={() => handleNav('theory-videos')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'theory-videos' ? 'bg-[#0066FF] text-white' : 'text-slate-600'
          }`}
        >
          Video Lessons
        </button>
      </div>
    </header>
  );
};
