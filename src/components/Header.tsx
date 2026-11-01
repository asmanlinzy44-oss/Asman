import React, { useState, useEffect } from 'react';
import { User as UserIcon, LogOut, BookmarkCheck, ShieldCheck, Search, Sun, Moon, FlaskConical, Lock } from 'lucide-react';
import { motion } from 'motion/react';
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
  isPaidStudent?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenWorkspace?: (tab?: 'drive' | 'tasks' | 'calendar' | 'gmail') => void;
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

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
  isPaidStudent = false,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenWorkspace,
}) => {
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    setPhotoError(false);
  }, [user?.photoURL]);

  const handleNav = (tab: ResourceCategory | 'home') => {
    playRoboticTab();
    onTabChange(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs google-anno-skip">
      {/* High-tech top ambient glow line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 opacity-90 shadow-[0_0_12px_rgba(56,189,248,0.5)]" />

      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand: Paper Express */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center text-left focus-visible:outline-none cursor-pointer group shrink-0"
          title="Paper Express - Home"
        >
          <PaperExpressLogo size="md" variant={isDarkMode ? 'dark' : 'light'} />
        </button>

        {/* Primary Desktop Navigation with Physics Beast style animated sliding pill */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-semibold text-slate-600 dark:text-slate-300 overflow-x-auto scrollbar-thin flex-1 min-w-0 justify-end xl:justify-center py-1">
          {[
            { id: 'home' as const, label: 'Home' },
            { id: 'past-papers' as const, label: 'Past Papers' },
            {
              id: 'fwc-papers' as const,
              label: 'FWC & Term Tests',
              badge: 'Hot',
              badgeColor: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300',
              isActiveMatch: (tab: string) => tab === 'fwc-papers' || tab === 'term-papers',
            },
            {
              id: 'theory-notes' as const,
              label: 'Resources',
              badge: '4 Folders',
              badgeColor: 'bg-blue-100 dark:bg-blue-950/70 text-[#0066FF] dark:text-sky-400',
            },
            {
              id: 'pilot-papers' as const,
              label: 'Other Pilot',
              badge: 'Moratuwa',
              badgeColor: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300',
            },
            {
              id: 'ai-search' as const,
              label: 'Advance Search',
              icon: Search,
            },
            {
              id: 'theory-videos' as const,
              label: 'Video Lessons',
              showLoginHint: !user,
            },
          ].map((item) => {
            const isSelected = item.isActiveMatch
              ? item.isActiveMatch(currentTab)
              : currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap z-10 ${
                  isSelected
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="desktopNavActivePill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-[#0066FF] to-blue-500 shadow-md shadow-blue-500/30 dark:shadow-[0_0_18px_rgba(56,189,248,0.4)] -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                {Icon && (
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#0066FF] dark:text-sky-400'}`} />
                )}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold uppercase transition-colors ${
                      isSelected ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.showLoginHint && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/70 text-[#0066FF] dark:text-sky-400'
                  }`}>
                    <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center shrink-0 p-0.5 shadow-2xs">
                      <GoogleIcon className="w-full h-full" />
                    </div>
                    <span>Login</span>
                  </span>
                )}
              </button>
            );
          })}

          {/* Google Workspace Hub */}
          {onOpenWorkspace && (
            <button
              onClick={() => {
                playRoboticClick();
                onOpenWorkspace('drive');
              }}
              className="px-2.5 xl:px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-400 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs font-bold"
              title="Google Workspace Hub (Drive, Tasks, Calendar, Gmail)"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shrink-0 p-0.5 shadow-2xs">
                <GoogleIcon className="w-full h-full" />
              </div>
              <span>Workspace</span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300 px-1.5 py-0.2 rounded-md font-extrabold">
                Drive · Tasks
              </span>
            </button>
          )}

          {/* Chemistry Virtual Lab Direct Link */}
          <a
            href="https://paperexpresslab1.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 xl:px-3 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/80 transition-all cursor-pointer flex items-center gap-1.5 font-bold shadow-2xs group whitespace-nowrap shrink-0"
            title="Paper Express Chemistry Virtual Lab (paperexpresslab1.vercel.app)"
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>Chemistry Lab</span>
            <span className="text-[9px] bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.2 rounded font-black uppercase">
              Lab 1
            </span>
          </a>
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
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0066FF] to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs overflow-hidden shrink-0 border border-blue-400/40">
                  {user.photoURL && !photoError ? (
                    <img
                      src={user.photoURL}
                      alt={user.name || 'User Profile'}
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <span>{user.name ? user.name.charAt(0).toUpperCase() : 'S'}</span>
                  )}
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
              className="px-3.5 py-1.5 rounded-xl bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer group"
              title="Sign in with Google"
            >
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 p-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                <GoogleIcon className="w-full h-full" />
              </div>
              <span className="hidden sm:inline">Sign in with Google</span>
              <span className="sm:hidden font-extrabold flex items-center gap-1">Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar with animatic sliding pill */}
      <div className="lg:hidden flex items-center gap-1 px-3 py-2 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold scrollbar-none">
        {[
          { id: 'home' as const, label: 'Home' },
          { id: 'past-papers' as const, label: 'Past Papers' },
          {
            id: 'fwc-papers' as const,
            label: 'FWC & Term Tests',
            isActiveMatch: (tab: string) => tab === 'fwc-papers' || tab === 'term-papers',
          },
          { id: 'theory-notes' as const, label: 'Resources' },
          { id: 'pilot-papers' as const, label: 'Other Pilot' },
          { id: 'ai-search' as const, label: 'Advance Search', icon: Search },
          { id: 'theory-videos' as const, label: 'Video Lessons' },
        ].map((tab) => {
          const isSelected = tab.isActiveMatch
            ? tab.isActiveMatch(currentTab)
            : currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleNav(tab.id)}
              className={`relative px-3 py-1.5 rounded-lg shrink-0 transition-colors z-10 font-bold whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="mobileNavActivePill"
                  className="absolute inset-0 rounded-lg bg-[#0066FF] shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              {Icon && <Icon className="w-3 h-3" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
        {onOpenWorkspace && (
          <button
            onClick={() => {
              playRoboticClick();
              onOpenWorkspace('drive');
            }}
            className="px-2.5 py-1 rounded-lg shrink-0 bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-sky-400 font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-800"
          >
            <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center shrink-0 p-0.5">
              <GoogleIcon className="w-full h-full" />
            </div>
            <span>Workspace</span>
          </button>
        )}
        <a
          href="https://paperexpresslab1.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 rounded-lg shrink-0 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 font-bold flex items-center gap-1 border border-emerald-300/60 dark:border-emerald-700/60"
        >
          <FlaskConical className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Chemistry Lab</span>
        </a>
        {!user && (
          <button
            onClick={() => {
              playRoboticClick();
              onGoogleLogin();
            }}
            className="px-2.5 py-1 rounded-lg shrink-0 bg-[#0066FF] hover:bg-blue-600 text-white flex items-center gap-1.5 font-bold shadow-xs cursor-pointer ml-auto"
            title="Sign in with Google"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shrink-0 p-0.5 shadow-2xs">
              <GoogleIcon className="w-full h-full" />
            </div>
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
