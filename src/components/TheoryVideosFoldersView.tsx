import React, { useState, useMemo } from 'react';
import { 
  Folder, FolderOpen, Video, Lock, Unlock, Clock, 
  ChevronRight, ArrowLeft, Search, CheckCircle2, 
  Sparkles, ShieldCheck, Zap, Filter, HelpCircle,
  ExternalLink, Layers, Award
} from 'lucide-react';
import { VideoLesson, VideoFolder, User } from '../types';
import { VideoCard } from './VideoCard';
import { formatVideoDuration } from '../utils/drive';
import { playRoboticClick, playRoboticFolder } from '../utils/audio';

interface TheoryVideosFoldersViewProps {
  videos: VideoLesson[];
  videoFolders: VideoFolder[];
  user: User | null;
  onPlayVideo: (video: VideoLesson) => void;
  onRequireUnlockVideo: (video: VideoLesson) => void;
  isVideoLessonUnlocked: (video: VideoLesson) => boolean;
  hasVideoAccess: boolean;
  isAdminLoggedIn: boolean;
}

export const TheoryVideosFoldersView: React.FC<TheoryVideosFoldersViewProps> = ({
  videos,
  videoFolders,
  user,
  onPlayVideo,
  onRequireUnlockVideo,
  isVideoLessonUnlocked,
  hasVideoAccess,
  isAdminLoggedIn,
}) => {
  // Navigation State
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'my-videos' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Helper: check if a folder is unlocked for the current user
  const isFolderUnlocked = (folderId: string): boolean => {
    if (isAdminLoggedIn) return true;
    if (!user || !user.email) return false;
    const currentEmail = user.email.toLowerCase().trim();
    if (currentEmail === 'asmanlinzy44@gmail.com') return true;
    if (hasVideoAccess) return true;

    // A folder is considered accessible if at least one video in it is unlocked
    const folderVideos = videos.filter((v) => v.folderId === folderId);
    if (folderVideos.length === 0) return true;
    return folderVideos.some((v) => isVideoLessonUnlocked(v));
  };

  // Helper: compute total minutes and formatted duration for a folder
  const getFolderDuration = (folderId: string): { totalMinutes: number; formatted: string } => {
    const vids = videos.filter((v) => v.folderId === folderId);
    const totalMinutes = vids.reduce((acc, v) => acc + (v.durationMinutes || 0), 0);
    return {
      totalMinutes,
      formatted: formatVideoDuration(totalMinutes),
    };
  };

  // Filter folders based on active tab and search query
  const displayedFolders = useMemo(() => {
    return videoFolders.filter((f) => {
      const vids = videos.filter((v) => v.folderId === f.id);
      const unlocked = isFolderUnlocked(f.id);

      // Tab filter
      if (activeTab === 'my-videos' && !unlocked) return false;
      if (activeTab === 'locked' && unlocked) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q) || (f.nameTa && f.nameTa.toLowerCase().includes(q));
        const matchesSubject = f.subjectName?.toLowerCase().includes(q) || false;
        const matchesDesc = f.description?.toLowerCase().includes(q) || false;
        const matchesVideos = vids.some((v) => 
          v.titleEn.toLowerCase().includes(q) || 
          (v.titleTa && v.titleTa.toLowerCase().includes(q)) ||
          v.unitNameEn.toLowerCase().includes(q)
        );
        return matchesName || matchesSubject || matchesDesc || matchesVideos;
      }

      return true;
    });
  }, [videoFolders, videos, activeTab, searchQuery, user, isAdminLoggedIn, hasVideoAccess]);

  // Current active folder object
  const currentFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    return videoFolders.find((f) => f.id === selectedFolderId) || null;
  }, [selectedFolderId, videoFolders]);

  // Videos inside the selected folder
  const currentFolderVideos = useMemo(() => {
    if (!selectedFolderId) return [];
    let list = videos.filter((v) => v.folderId === selectedFolderId);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((v) => 
        v.titleEn.toLowerCase().includes(q) || 
        (v.titleTa && v.titleTa.toLowerCase().includes(q)) ||
        v.unitNameEn.toLowerCase().includes(q) ||
        v.teacherName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedFolderId, videos, searchQuery]);

  // Folder style configuration based on color or subject
  const getFolderTheme = (folder: VideoFolder) => {
    const name = folder.name.toLowerCase();
    if (name.includes('practical') || folder.color === 'cyan') {
      return {
        bg: 'from-cyan-950/40 via-[#08152c] to-blue-950/40',
        border: 'border-cyan-500/30 hover:border-cyan-400',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/40',
        glow: 'shadow-[0_0_25px_rgba(6,182,212,0.15)]',
        accent: 'text-cyan-400',
        tag: '🔬 PRACTICAL WORKSHOP',
      };
    }
    if (name.includes('chem') || folder.color === 'emerald') {
      return {
        bg: 'from-emerald-950/40 via-[#071d18] to-teal-950/40',
        border: 'border-emerald-500/30 hover:border-emerald-400',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40',
        glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
        accent: 'text-emerald-400',
        tag: '🧪 CHEMISTRY MASTERCLASS',
      };
    }
    return {
      bg: 'from-blue-950/40 via-[#081330] to-indigo-950/40',
      border: 'border-blue-500/30 hover:border-blue-400',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      iconBg: 'bg-blue-500/20 text-blue-400 border-blue-400/40',
      glow: 'shadow-[0_0_25px_rgba(59,130,246,0.15)]',
      accent: 'text-blue-400',
      tag: '⚛️ PHYSICS MASTERCLASS',
    };
  };

  // --------------------------------------------------------------------------
  // INSIDE FOLDER VIEW (When a folder like "Physics Practical workshop" is opened)
  // --------------------------------------------------------------------------
  if (selectedFolderId && currentFolder) {
    const theme = getFolderTheme(currentFolder);
    const durationInfo = getFolderDuration(currentFolder.id);
    const isUnlocked = isFolderUnlocked(currentFolder.id);

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Breadcrumb & Back Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                playRoboticFolder();
                setSelectedFolderId(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← All Folders (அனைத்து கோப்புறைகளும்)</span>
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 dark:text-white font-bold truncate">
              {currentFolder.name}
            </span>
          </div>

          {/* Search inside this folder */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this folder..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Current Folder Header Hero Banner */}
        <div className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-br ${theme.bg} border ${theme.border} text-white shadow-xl relative overflow-hidden backdrop-blur-md`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-white/10 to-transparent blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${theme.iconBg} border flex items-center justify-center shrink-0 shadow-lg`}>
                <FolderOpen className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${theme.badgeBg}`}>
                    {theme.tag}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 font-mono text-[10px] font-bold border border-white/10">
                    {currentFolder.subjectName || 'Science'}
                  </span>
                  {isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Unlocked · அனுமதி உண்டு</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Locked Session · அனுமதி தேவை</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentFolder.name}
                </h3>
                {currentFolder.nameTa && (
                  <p className="text-xs sm:text-sm text-slate-300 font-sans">
                    {currentFolder.nameTa}
                  </p>
                )}

                {currentFolder.description && (
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed pt-1">
                    {currentFolder.description}
                  </p>
                )}
              </div>
            </div>

            {/* Folder Quick Stats Card */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-slate-950/70 p-3.5 sm:p-4 rounded-2xl border border-white/10 font-mono text-xs">
              <div className="text-center px-2">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Videos</span>
                <span className="text-base sm:text-lg font-black text-white">{currentFolderVideos.length}</span>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="text-center px-2">
                <span className="block text-[10px] text-slate-400 uppercase font-bold flex items-center justify-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Total Time</span>
                </span>
                <span className="text-base sm:text-lg font-black text-cyan-300">
                  {durationInfo.formatted}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Cards Grid inside this Folder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono px-1">
            <span>
              Showing {currentFolderVideos.length} lesson(s) inside this folder:
            </span>
            <span>Click any lesson to play directly</span>
          </div>

          {currentFolderVideos.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 shadow-xs max-w-md mx-auto my-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6" />
              </div>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
                No videos found in this folder
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Check back shortly or reset your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentFolderVideos.map((video) => {
                const isUnlocked = isVideoLessonUnlocked(video);
                return (
                  <VideoCard
                    key={video.id}
                    video={video}
                    user={user}
                    onPlay={onPlayVideo}
                    onRequireLogin={() => onRequireUnlockVideo(video)}
                    isWatched={user?.watchedVideoIds?.includes(video.id) || false}
                    isUnlocked={isUnlocked}
                    onRequireUnlock={() => onRequireUnlockVideo(video)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TOP FOLDERS GALLERY VIEW (Document-style Folders: Physics, Chemistry, Practical Workshop)
  // --------------------------------------------------------------------------
  const myAccessibleFoldersCount = videoFolders.filter((f) => isFolderUnlocked(f.id)).length;
  const lockedFoldersCount = videoFolders.filter((f) => !isFolderUnlocked(f.id)).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            A/L Theory Masterclass Lectures · பாட அலகுக் கோப்புறைகள்
          </span>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Video Lecture Folders
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Click on any folder below (e.g. Physics Practical workshop, Hydrodynamics, IUPAC) to view its structured lesson list and direct stream videos.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search folders or lessons..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Navigation Segment Tabs: All Folders | My Videos / Enrolled | Locked Sessions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => {
            playRoboticClick();
            setActiveTab('all');
          }}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-md font-black'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>All Folders ({videoFolders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playRoboticClick();
            setActiveTab('my-videos');
          }}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'my-videos'
              ? 'bg-emerald-600 text-white shadow-md font-black'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-emerald-500 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>⭐ My Videos / Accessible ({myAccessibleFoldersCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playRoboticClick();
            setActiveTab('locked');
          }}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'locked'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-amber-500 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          <span>🔒 Locked Sessions ({lockedFoldersCount})</span>
        </button>
      </div>

      {/* Info notice about My Videos access */}
      {activeTab === 'my-videos' && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            <strong>My Videos Filter Active:</strong> Displaying only folders approved and unlocked for your account. You can watch all videos inside directly!
          </span>
        </div>
      )}

      {/* DOCUMENT-STYLE FOLDERS GRID */}
      {displayedFolders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 shadow-xs max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Folder className="w-7 h-7" />
          </div>
          <p className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
            {activeTab === 'my-videos' ? 'No Enrolled Video Folders' : 'No Folders Found'}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mb-4">
            {activeTab === 'my-videos' 
              ? 'You do not have any unlocked private video sessions at the moment. Contact the educator on WhatsApp or login with your approved student index number.'
              : 'No video folders match your search query.'}
          </p>
          {activeTab === 'my-videos' && (
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Browse All Available Folders
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedFolders.map((folder) => {
            const vids = videos.filter((v) => v.folderId === folder.id);
            const durationInfo = getFolderDuration(folder.id);
            const isUnlocked = isFolderUnlocked(folder.id);
            const theme = getFolderTheme(folder);

            return (
              <div
                key={folder.id}
                onClick={() => {
                  playRoboticFolder();
                  setSelectedFolderId(folder.id);
                }}
                className={`group relative rounded-3xl p-5 sm:p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 bg-gradient-to-br ${theme.bg} ${theme.border} hover:shadow-2xl hover:-translate-y-1`}
              >
                {/* Folder Top Row: Subject Tag + Access Status Badge */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${theme.badgeBg}`}>
                      {theme.tag}
                    </span>

                    {/* Lock / Unlocked Status Badge */}
                    {isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked Session</span>
                      </span>
                    )}
                  </div>

                  {/* Folder Icon & Title */}
                  <div className="flex items-start gap-3.5 pt-1">
                    <div className={`p-3.5 rounded-2xl ${theme.iconBg} border shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                      <Folder className="w-6 h-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {folder.name}
                      </h4>
                      {folder.nameTa && (
                        <p className="text-xs text-slate-300 font-sans mt-0.5 line-clamp-1">
                          {folder.nameTa}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {folder.description && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed pt-1">
                      {folder.description}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Video Count + Formatted Hour/Min Duration + Open CTA */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <span className="flex items-center gap-1 font-bold">
                      <Video className="w-3.5 h-3.5 text-cyan-400" />
                      {vids.length} {vids.length === 1 ? 'Lesson' : 'Lessons'}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="flex items-center gap-1 text-cyan-300 font-bold">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {durationInfo.formatted}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-cyan-300 font-bold text-[11px] group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
