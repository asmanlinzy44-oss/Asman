import React from 'react';
import { User as UserIcon, LogOut, BookmarkCheck, ShieldCheck, Search, Sun, Moon } from 'lucide-react';
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
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
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
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const handleNav = (tab: ResourceCategory | 'home') => {
    playRoboticTab();
    onTabChange(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs google-anno-skip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand: Paper Express */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center text-left focus-visible:outline-none cursor-pointer group"
          title="Paper Express - Home"
        >
          <PaperExpressLogo size="md" variant={isDarkMode ? 'dark' : 'light'} />
        </button>

        {/* Primary Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => handleNav('home')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-sky-400 font-bold shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('past-papers')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'past-papers'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-sky-400 font-bold shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Past Papers
          </button>
          <button
            onClick={() => handleNav('fwc-papers')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'fwc-papers' || currentTab === 'term-papers'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-sky-400 font-bold shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>FWC & Term Tests</span>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-1.5 py-0.2 rounded-md font-extrabold uppercase">
              Hot
            </span>
          </button>
          <button
            onClick={() => handleNav('theory-notes')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'theory-notes'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-sky-400 font-bold shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Resources</span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950/70 text-[#0066FF] dark:text-sky-400 px-1.5 py-0.2 rounded-md font-extrabold">
              4 Folders
            </span>
          </button>
          <button
            onClick={() => handleNav('pilot-papers')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'pilot-papers'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-sky-400 font-bold shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Other Pilot</span>
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded-md font-extrabold">
              Moratuwa
            </span>
          </button>

          {/* Advance Search Page Button */}
          <button
            onClick={() => handleNav('ai-search')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'ai-search'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-sky-400 font-bold shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>Advance Search</span>
          </button>

          <button
            onClick={() => handleNav('theory-videos')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'theory-videos'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-sky-400 font-bold shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Video Lessons</span>
            {!user && (
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950/70 text-[#0066FF] dark:text-sky-400 px-1.5 py-0.2 rounded-md font-bold">
                Login
              </span>
            )}
          </button>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Dark Mode Toggle */}
          {onToggleDarkMode && (
            <button
              onClick={() => {
                playRoboticClick();
                onToggleDarkMode();
              }}
              className="p-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
          )}

          {/* Bookmarks */}
          <button
            onClick={() => {
              playRoboticClick();
              onOpenSaved();
            }}
            className="p-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-colors relative cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Saved Bookmarks"
          >
            <BookmarkCheck className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0066FF] text-white text-[10px] flex items-center justify-center font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playRoboticClick();
                  if (onOpenProfile) onOpenProfile();
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer group"
                title="View Profile & Settings"
              >
                <div className="w-6 h-6 rounded-lg bg-[#0066FF] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold leading-tight group-hover:text-blue-600 truncate max-w-[90px]">
                    {user.name || 'Student'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  playRoboticClick();
                  onLogout();
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                title="Log out"
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
              className="px-3.5 py-1.5 rounded-xl bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign in with Google</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          onClick={() => handleNav('home')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'home' ? 'bg-[#0066FF] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => handleNav('past-papers')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'past-papers' ? 'bg-[#0066FF] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Past Papers
        </button>
        <button
          onClick={() => handleNav('fwc-papers')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'fwc-papers' || currentTab === 'term-papers' ? 'bg-[#0066FF] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          FWC & Term Tests
        </button>
        <button
          onClick={() => handleNav('theory-notes')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'theory-notes' ? 'bg-[#0066FF] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Resources
        </button>
        <button
          onClick={() => handleNav('pilot-papers')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'pilot-papers' ? 'bg-[#0066FF] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Other Pilot
        </button>
        <button
          onClick={() => handleNav('ai-search')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors flex items-center gap-1 ${
            currentTab === 'ai-search' ? 'bg-[#0066FF] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <Search className="w-3 h-3" />
          <span>Advance Search</span>
        </button>
        <button
          onClick={() => handleNav('theory-videos')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'theory-videos' ? 'bg-[#0066FF] text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Video Lessons
        </button>
      </div>
    </header>
  );
};
