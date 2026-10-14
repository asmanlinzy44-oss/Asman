import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  Lock,
  Unlock,
  Play,
  Clock,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Search,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Film,
  Zap,
  BookOpen,
  Filter,
  Eye,
  AlertCircle
} from 'lucide-react';
import { VideoLesson, VideoFolder, User } from '../types';
import { VideoCard } from './VideoCard';
import { formatVideoDuration } from '../utils/drive';
import { playRoboticFolder, playRoboticClick } from '../utils/audio';

interface VideoFoldersViewProps {
  videos: VideoLesson[];
  folders: VideoFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  user: User | null;
  onPlayVideo: (video: VideoLesson) => void;
  onRequireLogin: () => void;
  isEffectiveVideoUnlocked: boolean;
  isVideoLessonUnlocked: (video: VideoLesson) => boolean;
  isFolderUnlocked: (folder: VideoFolder) => boolean;
  onUnlockFolderWithCode: (passcode: string, folderId?: string) => Promise<{ success: boolean; message: string }>;
  onRequireUnlock?: (video: VideoLesson) => void;
  isAdmin?: boolean;
  onOpenAdminFolders?: () => void;
}

export const VideoFoldersView: React.FC<VideoFoldersViewProps> = ({
  videos,
  folders,
  selectedFolderId,
  onSelectFolder,
  user,
  onPlayVideo,
  onRequireLogin,
  isEffectiveVideoUnlocked,
  isVideoLessonUnlocked,
  isFolderUnlocked,
  onUnlockFolderWithCode,
  onRequireUnlock,
  isAdmin = false,
  onOpenAdminFolders,
}) => {
  // Navigation tabs: 'folders' | 'my-videos' | 'all-videos'
  const [activeTab, setActiveTab] = useState<'folders' | 'my-videos' | 'all-videos'>('folders');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  
  // Passcode unlock form state for locked folders
  const [passcodeInput, setPasscodeInput] = useState('');
  const [unlockStatus, setUnlockStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({
    type: 'idle',
  });

  // Calculate folder stats (video count, total duration)
  const folderStats = useMemo(() => {
    const stats: Record<string, { count: number; totalMinutes: number; videos: VideoLesson[] }> = {};
    folders.forEach((f) => {
      const vids = videos.filter((v) => v.folderId === f.id);
      const totalMinutes = vids.reduce((sum, v) => sum + (v.durationMinutes || 0), 0);
      stats[f.id] = { count: vids.length, totalMinutes, videos: vids };
    });
    return stats;
  }, [folders, videos]);

  // Current selected folder object (if in drill-down)
  const currentFolder = useMemo(() => {
    if (!selectedFolderId || selectedFolderId === 'all' || selectedFolderId === 'unorganized') {
      return null;
    }
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [selectedFolderId, folders]);

  // Current folder videos
  const currentFolderVideos = useMemo(() => {
    if (!selectedFolderId) return [];
    if (selectedFolderId === 'unorganized') {
      return videos.filter((v) => !v.folderId);
    }
    return videos.filter((v) => v.folderId === selectedFolderId);
  }, [selectedFolderId, videos]);

  // Accessible (unlocked) folders for the current user
  const accessibleFolders = useMemo(() => {
    return folders.filter((f) => isFolderUnlocked(f));
  }, [folders, isFolderUnlocked]);

  // Accessible videos for the current user
  const accessibleVideos = useMemo(() => {
    return videos.filter((v) => isVideoLessonUnlocked(v));
  }, [videos, isVideoLessonUnlocked]);

  // Filtered folders for the list view
  const filteredFolders = useMemo(() => {
    return folders.filter((f) => {
      if (subjectFilter !== 'all') {
        const matchesSubject =
          (f.subjectName && f.subjectName.toLowerCase().includes(subjectFilter.toLowerCase())) ||
          (f.id.toLowerCase().includes(subjectFilter.toLowerCase()));
        if (!matchesSubject) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q) || (f.nameTa && f.nameTa.toLowerCase().includes(q));
        const matchesDesc = f.description && f.description.toLowerCase().includes(q);
        const matchesVideos = videos.some(
          (v) => v.folderId === f.id && (v.titleEn.toLowerCase().includes(q) || (v.titleTa && v.titleTa.toLowerCase().includes(q)))
        );
        return matchesName || matchesDesc || matchesVideos;
      }
      return true;
    });
  }, [folders, subjectFilter, searchQuery, videos]);

  // Handle Passcode Unlock
  const handlePasscodeSubmit = async (e: React.FormEvent, targetFolderId?: string) => {
    e.preventDefault();
    if (!passcodeInput.trim()) return;

    setUnlockStatus({ type: 'loading' });
    playRoboticClick();

    try {
      const res = await onUnlockFolderWithCode(passcodeInput.trim(), targetFolderId || currentFolder?.id);
      if (res.success) {
        setUnlockStatus({ type: 'success', message: res.message || 'Folder unlocked successfully! Access granted.' });
        setPasscodeInput('');
        setTimeout(() => {
          setUnlockStatus({ type: 'idle' });
        }, 3000);
      } else {
        setUnlockStatus({ type: 'error', message: res.message || 'Incorrect passcode. Please check and try again.' });
      }
    } catch (err: any) {
      setUnlockStatus({ type: 'error', message: err.message || 'Error validating code. Please retry.' });
    }
  };

  // Switch folder with robotic sound
  const handleFolderClick = (folderId: string) => {
    playRoboticFolder();
    onSelectFolder(folderId);
  };

  const handleBackToFolders = () => {
    playRoboticClick();
    onSelectFolder(null);
  };

  return (
    <div className="space-y-6">
      {/* TOP NAVIGATION & TABS RIBBON */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                A/L Masterclass Video System
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
              <span>Theory Video Folders</span>
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">· பாட அலகுக் கோப்புறைகள்</span>
            </h3>
          </div>

          {/* Quick Stats & Admin Access Button */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && onOpenAdminFolders && (
              <button
                type="button"
                onClick={() => {
                  playRoboticClick();
                  onOpenAdminFolders();
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 hover:bg-purple-600/20 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Admin Folders</span>
              </button>
            )}

            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-blue-500" />
              <span>{videos.length} Videos</span>
              <span className="text-slate-400">·</span>
              <span>{folders.length} Folders</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs: All Folders | My Videos | All Videos List */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                playRoboticClick();
                setActiveTab('folders');
                onSelectFolder(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'folders' && !selectedFolderId
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>All Folders ({folders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playRoboticClick();
                setActiveTab('my-videos');
                onSelectFolder(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'my-videos'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>My Videos ({accessibleFolders.length})</span>
              {accessibleFolders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                playRoboticClick();
                setActiveTab('all-videos');
                onSelectFolder(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'all-videos'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>All Videos ({videos.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search folders or lessons..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: DRILL-DOWN INSIDE A SPECIFIC FOLDER */}
      {selectedFolderId && currentFolder ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Breadcrumbs & Return Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBackToFolders}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 flex items-center gap-2 cursor-pointer transition-all shadow-xs group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to All Folders</span>
            </button>

            <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span>Theory Videos</span>
              <ChevronRight className="w-3 h-3" />
              <span className="font-bold text-slate-900 dark:text-white">{currentFolder.name}</span>
            </div>
          </div>

          {/* Folder Hero Header Banner (Consistent, clean styling across all folders) */}
          <div className="p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden shadow-xs transition-all text-slate-900 dark:text-white">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">{currentFolder.icon || '📁'}</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black font-mono uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                    {currentFolder.subjectName || 'Theory Module'}
                  </span>
                  
                  {isFolderUnlocked(currentFolder) ? (
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Access Granted · Session Active</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 font-mono">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>Locked Session · Passcode Required</span>
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentFolder.name}
                </h2>
                {currentFolder.nameTa && (
                  <p className="text-sm font-sans text-slate-600 dark:text-slate-400 font-medium">
                    {currentFolder.nameTa}
                  </p>
                )}
                {currentFolder.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                    {currentFolder.description}
                  </p>
                )}

                {/* Meta stats: lessons and total duration */}
                <div className="flex items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-300 pt-2 flex-wrap">
                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Film className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    <strong>{currentFolderVideos.length}</strong> Video Lessons
                  </span>

                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-sky-400" />
                    Total Duration:{' '}
                    <strong>
                      {formatVideoDuration(
                        currentFolderVideos.reduce((sum, v) => sum + (v.durationMinutes || 0), 0)
                      )}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Passcode Unlock Box if Folder is Locked */}
              {!isFolderUnlocked(currentFolder) && (
                <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-center sm:text-left space-y-3 shrink-0 md:max-w-xs shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <KeyRound className="w-4 h-4 shrink-0" />
                    <span>Enter Folder Access Passcode</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    This folder is restricted to enrolled students. Enter your passcode (e.g., <code className="text-amber-300 font-mono">PRAC2026</code>) to unlock all sessions.
                  </p>

                  <form onSubmit={(e) => handlePasscodeSubmit(e, currentFolder.id)} className="space-y-2">
                    <input
                      type="text"
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value)}
                      placeholder="Passcode / Student Index..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono tracking-wider"
                    />

                    <button
                      type="submit"
                      disabled={unlockStatus.type === 'loading' || !passcodeInput.trim()}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{unlockStatus.type === 'loading' ? 'Verifying...' : 'Unlock Folder'}</span>
                    </button>
                  </form>

                  {unlockStatus.message && (
                    <div className={`p-2 rounded-xl text-[11px] font-bold text-center ${
                      unlockStatus.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {unlockStatus.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Videos List within this Folder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
              <span>Lectures in this Workshop ({currentFolderVideos.length})</span>
              <span className="font-mono text-[11px]">Click any video to play directly</span>
            </div>

            {currentFolderVideos.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <Film className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Videos in this Folder Yet</h4>
                <p className="text-xs text-slate-400">Educators will publish lectures here shortly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentFolderVideos.map((video) => {
                  const isFolderAccess = isFolderUnlocked(currentFolder);
                  const isUnlocked = isFolderAccess && isVideoLessonUnlocked(video);
                  return (
                    <VideoCard
                      key={video.id}
                      video={video}
                      user={user}
                      onPlay={onPlayVideo}
                      onRequireLogin={onRequireLogin}
                      isWatched={user?.watchedVideoIds?.includes(video.id) || false}
                      isUnlocked={isUnlocked}
                      onRequireUnlock={() => {
                        if (onRequireUnlock) {
                          onRequireUnlock(video);
                        } else {
                          onRequireLogin();
                        }
                      }}
                      accessStatusText={
                        isFolderAccess
                          ? 'Enrolled Session'
                          : 'Locked Workshop • Passcode Required'
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'my-videos' ? (
        /* VIEW 2: "MY VIDEOS" (Accessible / Enrolled Sessions) */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 rounded-3xl border border-emerald-500/30 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    My Enrolled Masterclasses · எனது அங்கீகரிக்கப்பட்ட வகுப்புகள்
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Accessible Video Folders & Active Sessions
                </h3>
                <p className="text-xs text-slate-400 max-w-xl">
                  {user?.email ? (
                    <>Logged in as <strong className="font-mono text-cyan-300">{user.email}</strong>. All folders and sessions unlocked for your account are shown below.</>
                  ) : (
                    <>Sessions unlocked on this device. Sign in to sync across all your phones and computers.</>
                  )}
                </p>
              </div>

              {/* Quick Code Unlock form */}
              <form onSubmit={handlePasscodeSubmit} className="flex items-center gap-2 sm:max-w-xs shrink-0">
                <input
                  type="text"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter access code..."
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={unlockStatus.type === 'loading' || !passcodeInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all shadow-xs shrink-0"
                >
                  Unlock
                </button>
              </form>
            </div>
            
            {unlockStatus.message && (
              <div className={`mt-3 p-2 rounded-xl text-xs font-bold ${
                unlockStatus.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {unlockStatus.message}
              </div>
            )}
          </div>

          {accessibleFolders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                No Unlocked Folders Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                You have not unlocked any private theory folders yet. Enter your student passcode (e.g. <span className="font-mono font-bold text-cyan-500">PRAC2026</span>) in the box above or click on any folder to unlock it.
              </p>
              <button
                type="button"
                onClick={() => {
                  playRoboticClick();
                  setActiveTab('folders');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-500 transition-all shadow-xs"
              >
                Browse All Folders
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {accessibleFolders.map((folder) => {
                const stats = folderStats[folder.id] || { count: 0, totalMinutes: 0, videos: [] };
                return (
                  <div
                    key={folder.id}
                    onClick={() => handleFolderClick(folder.id)}
                    className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-xl p-5 sm:p-6 shadow-xs transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-slate-800 border border-blue-500/20 dark:border-slate-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform text-blue-600 dark:text-cyan-400">
                          {folder.icon || '📁'}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Active Access</span>
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                            {folder.subjectName || 'Theory Module'}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                          {folder.name}
                        </h4>
                        {folder.nameTa && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1">
                            {folder.nameTa}
                          </p>
                        )}
                        {folder.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {folder.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 relative z-10">
                      <span className="font-mono flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <Film className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                        {stats.count} Lessons
                      </span>

                      <span className="font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        {formatVideoDuration(stats.totalMinutes)}
                      </span>

                      <span className="text-blue-600 dark:text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-mono text-[11px]">
                        Open ➜
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'all-videos' ? (
        /* VIEW 3: "ALL VIDEOS" FLAT LIST */
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>Showing All Masterclass Lectures ({videos.length})</span>
            <span className="font-mono text-[11px]">Direct Stream & Masterclasses</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video) => {
              const isUnlocked = isVideoLessonUnlocked(video);
              return (
                <VideoCard
                  key={video.id}
                  video={video}
                  user={user}
                  onPlay={onPlayVideo}
                  onRequireLogin={onRequireLogin}
                  isWatched={user?.watchedVideoIds?.includes(video.id) || false}
                  isUnlocked={isUnlocked}
                  onRequireUnlock={() => {
                    if (onRequireUnlock) {
                      onRequireUnlock(video);
                    } else {
                      onRequireLogin();
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 4: ALL FOLDERS GRID (DOCUMENT LE VAARE FOLDER MAARI) */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Informative Guidance Banner */}
          <div className="bg-gradient-to-r from-blue-950/20 via-slate-900 to-indigo-950/20 rounded-2xl border border-blue-500/20 p-3.5 sm:p-4 text-xs text-slate-400 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong>Document Folder Navigation:</strong> Click on any subject folder below to expand its lessons. Locked folders can be unlocked with an access code.
              </span>
            </div>
            <span className="font-mono text-[11px] text-cyan-400 font-bold shrink-0 hidden sm:inline">
              Select a Folder to Start ▶
            </span>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'physics', 'chemistry'].map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  playRoboticClick();
                  setSubjectFilter(sub);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer transition-all ${
                  subjectFilter === sub
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sub === 'all' ? 'All Subjects' : sub}
              </button>
            ))}
          </div>

          {/* Grid of Folders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFolders.map((folder) => {
              const stats = folderStats[folder.id] || { count: 0, totalMinutes: 0, videos: [] };
              const isUnlocked = isFolderUnlocked(folder);

              return (
                <div
                  key={folder.id}
                  onClick={() => handleFolderClick(folder.id)}
                  className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-xl p-5 sm:p-6 shadow-xs transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="space-y-3 relative z-10">
                    {/* Top Row: Icon, Subject Tag & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-slate-800 border border-blue-500/20 dark:border-slate-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform text-blue-600 dark:text-cyan-400">
                        {folder.icon || '📁'}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isUnlocked ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Access Granted</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black font-mono flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span>Locked Session</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Folder Title & Subject */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                          {folder.subjectName || 'Theory Module'}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                        {folder.name}
                      </h4>
                      {folder.nameTa && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1">
                          {folder.nameTa}
                        </p>
                      )}
                      {folder.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {folder.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Meta & Open Action */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 relative z-10">
                    <span className="font-mono flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <Film className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                      {stats.count} Lessons
                    </span>

                    <span className="font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      {formatVideoDuration(stats.totalMinutes)}
                    </span>

                    <span className="text-blue-600 dark:text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-mono text-[11px]">
                      Open ➜
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
