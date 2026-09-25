import React from 'react';
import { User as UserIcon, LogOut, BookmarkCheck, Timer, MessageSquare } from 'lucide-react';
import { User, ResourceCategory } from '../types';
import { StudyProLogo } from './StudyProLogo';

interface HeaderProps {
  currentTab: ResourceCategory | 'home';
  onTabChange: (tab: ResourceCategory | 'home') => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenTimer: () => void;
  onOpenContactUs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  user,
  onOpenAuth,
  onLogout,
  savedCount,
  onOpenSaved,
  onOpenTimer,
  onOpenContactUs,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand: Study Pro */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center text-left focus-visible:outline-none cursor-pointer group"
          title="Study Pro - Home"
        >
          <StudyProLogo size="md" variant="light" />
        </button>

        {/* Primary Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-slate-600">
          <button
            onClick={() => onTabChange('home')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-blue-50 text-[#0066FF] font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('past-papers')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'past-papers'
                ? 'bg-blue-50 text-[#0066FF] font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Past Papers
          </button>
          <button
            onClick={() => onTabChange('fwc-papers')}
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
            onClick={() => onTabChange('theory-notes')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'theory-notes'
                ? 'bg-blue-50 text-[#0066FF] font-bold shadow-xs'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Theory Notes
          </button>
          <button
            onClick={() => onTabChange('theory-videos')}
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
          {/* Contact Help Desk */}
          {onOpenContactUs && (
            <button
              onClick={onOpenContactUs}
              className="px-2.5 py-1.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-slate-200 flex items-center gap-1.5 text-xs font-bold"
              title="Contact Us / Help Desk"
            >
              <MessageSquare className="w-4 h-4 text-[#0066FF]" />
              <span className="hidden md:inline">Contact</span>
            </button>
          )}

          {/* Focus Timer */}
          <button
            onClick={onOpenTimer}
            className="px-2.5 py-1.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-slate-200 flex items-center gap-1.5 text-xs font-bold"
            title="Focus Pomodoro Timer"
          >
            <Timer className="w-4 h-4 text-[#0066FF]" />
            <span className="hidden sm:inline">Timer</span>
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenSaved}
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

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right leading-tight">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{user.name}</span>
                <span className="text-[10px] text-[#0066FF] font-bold">A/L Candidate</span>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-[#0066FF] hover:bg-blue-600 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 bg-slate-50/90 border-t border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          onClick={() => onTabChange('home')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'home' ? 'bg-[#0066FF] text-white' : 'text-slate-600'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onTabChange('past-papers')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'past-papers' ? 'bg-[#0066FF] text-white' : 'text-slate-600'
          }`}
        >
          Past Papers
        </button>
        <button
          onClick={() => onTabChange('fwc-papers')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'fwc-papers' || currentTab === 'term-papers' ? 'bg-[#0066FF] text-white' : 'text-slate-600'
          }`}
        >
          FWC & Term Tests
        </button>
        <button
          onClick={() => onTabChange('theory-notes')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
            currentTab === 'theory-notes' ? 'bg-[#0066FF] text-white' : 'text-slate-600'
          }`}
        >
          Theory Notes
        </button>
        <button
          onClick={() => onTabChange('theory-videos')}
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
