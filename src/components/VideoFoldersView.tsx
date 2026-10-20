import React, { useState, useMemo } from 'react';
import { 
  Folder, Film, Lock, CheckCircle2, ChevronRight, Clock, 
  ArrowLeft, Search, Sparkles, Send, MessageCircle, UserCheck, 
  BookOpen, GraduationCap, ShieldCheck, Plus, Layers, FolderPlus
} from 'lucide-react';
import { VideoFolder, VideoLesson, User, VideoAccessRequest } from '../types';
import { formatVideoDuration } from '../utils/drive';
import { VideoCard } from './VideoCard';
import { playRoboticClick, playRoboticFolder } from '../utils/audio';
import { 
  getRootFolders, 
  getChildFolders, 
  getFolderPath, 
  getAllVideosForFolderRecursive,
  PRIMARY_ROOT_SUBJECT_IDS 
} from '../utils/folderHierarchy';

interface VideoFoldersViewProps {
  videos: VideoLesson[];
  folders: VideoFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onAddSubfolder?: (parentFolderId: string) => void;
  user: User | null;
  onPlayVideo: (video: VideoLesson) => void;
  onRequireLogin: () => void;
  isEffectiveVideoUnlocked: boolean;
  isVideoLessonUnlocked: (video: VideoLesson) => boolean;
  isFolderUnlocked: (folder: VideoFolder) => boolean;
  onUnlockFolderWithCode?: (code: string, folderId?: string) => Promise<{ success: boolean; message?: string }>;
  onRequireUnlock?: (video: VideoLesson) => void;
  isAdmin?: boolean;
  onOpenAdminFolders?: () => void;
  accessRequests?: VideoAccessRequest[];
  onRequestAccess?: (params: { folderId?: string; folderName?: string; videoId?: string; videoTitle?: string; message?: string }) => Promise<{ success: boolean; message: string }>;
  onApproveAccessRequest?: (requestId: string) => Promise<boolean> | boolean;
}

export const VideoFoldersView: React.FC<VideoFoldersViewProps> = ({
  videos,
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddSubfolder,
  user,
  onPlayVideo,
  onRequireLogin,
  isVideoLessonUnlocked,
  isFolderUnlocked,
  onRequireUnlock,
  isAdmin = false,
  onOpenAdminFolders,
  accessRequests = [],
  onRequestAccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [requestNotice, setRequestNotice] = useState<{ id: string; msg: string } | null>(null);
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // Current active folder (if drilled down)
  const currentFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [selectedFolderId, folders]);

  // Breadcrumb path from Root down to current folder
  const breadcrumbPath = useMemo(() => {
    if (!selectedFolderId) return [];
    return getFolderPath(selectedFolderId, folders);
  }, [selectedFolderId, folders]);

  // Root Folders (The 4 Main Subjects: Biology, Physics, Chemistry, Combined Maths)
  const rootFolders = useMemo(() => {
    return getRootFolders(folders);
  }, [folders]);

  // Direct child subfolders of the current folder
  const currentChildSubfolders = useMemo(() => {
    if (!selectedFolderId) return [];
    return getChildFolders(selectedFolderId, folders);
  }, [selectedFolderId, folders]);

  // Videos directly inside current folder, sorted logically by lecture / part / lesson number
  const currentFolderVideos = useMemo(() => {
    if (!selectedFolderId) return [];
    const list = videos.filter((v) => v.folderId === selectedFolderId);

    const extractNum = (v: VideoLesson): number => {
      const partM = v.titleEn.match(/part\s*0*(\d+)/i) || (v.titleTa && v.titleTa.match(/பகுதி\s*0*(\d+)/));
      if (partM) return parseInt(partM[1], 10);

      const lecM = v.titleEn.match(/(?:lesson|lecture|class)\s*0*(\d+)/i) || (v.titleTa && v.titleTa.match(/(?:வகுப்பு|விரிவுரை)\s*0*(\d+)/));
      if (lecM) return parseInt(lecM[1], 10);

      const numM = v.titleEn.match(/(?:^|\b|#)0*(\d+)(?:\b|$)/);
      if (numM) return parseInt(numM[1], 10);

      return v.unitNumber || 999;
    };

    return [...list].sort((a, b) => {
      const numA = extractNum(a);
      const numB = extractNum(b);
      if (numA !== numB) return numA - numB;
      return a.titleEn.localeCompare(b.titleEn);
    });
  }, [selectedFolderId, videos]);

  // Search Results across all videos and folders
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedFolders = folders.filter((f) => {
      return (
        f.name.toLowerCase().includes(q) ||
        (f.nameTa && f.nameTa.toLowerCase().includes(q)) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        (f.subjectName && f.subjectName.toLowerCase().includes(q))
      );
    });

    const matchedVideos = videos.filter((v) => {
      return (
        v.titleEn.toLowerCase().includes(q) ||
        (v.titleTa && v.titleTa.toLowerCase().includes(q)) ||
        (v.teacherName && v.teacherName.toLowerCase().includes(q)) ||
        (v.unitNameEn && v.unitNameEn.toLowerCase().includes(q))
      );
    });

    return { folders: matchedFolders, videos: matchedVideos };
  }, [searchQuery, folders, videos]);

  // User pending requests set
  const userCleanEmail = user?.email?.toLowerCase().trim();
  const pendingFolderReqIds = useMemo(() => {
    if (!userCleanEmail) return new Set<string>();
    const set = new Set<string>();
    for (const r of accessRequests) {
      if (r.status === 'pending' && r.userEmail.toLowerCase().trim() === userCleanEmail) {
        if (r.folderId) set.add(r.folderId);
        else set.add('all');
      }
    }
    return set;
  }, [accessRequests, userCleanEmail]);

  const handleFolderClick = (folderId: string) => {
    playRoboticFolder();
    onSelectFolder(folderId);
  };

  const handleBackToParent = () => {
    playRoboticClick();
    if (!currentFolder || !currentFolder.parentId || currentFolder.parentId === 'none') {
      onSelectFolder(null);
    } else {
      onSelectFolder(currentFolder.parentId);
    }
  };

  const handleBackToRoot = () => {
    playRoboticClick();
    onSelectFolder(null);
  };

  const handleInstantRequestAccess = async (folder: VideoFolder) => {
    if (!onRequestAccess) return;
    setIsSubmittingReq(true);
    playRoboticClick();
    try {
      const res = await onRequestAccess({
        folderId: folder.id,
        folderName: folder.name,
        message: `Student requested access to ${folder.name} masterclasses.`
      });
      setRequestNotice({ id: folder.id, msg: res.message });
    } catch {
      setRequestNotice({ id: folder.id, msg: 'Request failed. Please contact Asman Linzy directly on WhatsApp.' });
    } finally {
      setIsSubmittingReq(false);
    }
  };

  // Helper theme styling per subject
  const getSubjectTheme = (subjectName?: string, folderId?: string) => {
    const s = (subjectName || folderId || '').toLowerCase();
    if (s.includes('bio')) {
      return {
        gradient: 'from-emerald-500/15 via-teal-500/10 to-emerald-950/20 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-slate-900',
        border: 'border-emerald-300 dark:border-emerald-700/60 hover:border-emerald-500',
        badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
        accentText: 'text-emerald-600 dark:text-emerald-400',
        btnGrad: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
        ring: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]',
        defaultIcon: '🧬',
      };
    }
    if (s.includes('chem')) {
      return {
        gradient: 'from-purple-500/15 via-indigo-500/10 to-purple-950/20 dark:from-purple-950/50 dark:via-indigo-950/30 dark:to-slate-900',
        border: 'border-purple-300 dark:border-purple-700/60 hover:border-purple-500',
        badge: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700',
        accentText: 'text-purple-600 dark:text-purple-400',
        btnGrad: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500',
        ring: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]',
        defaultIcon: '🧪',
      };
    }
    if (s.includes('math')) {
      return {
        gradient: 'from-cyan-500/15 via-blue-500/10 to-sky-950/20 dark:from-cyan-950/50 dark:via-blue-950/30 dark:to-slate-900',
        border: 'border-cyan-300 dark:border-cyan-700/60 hover:border-cyan-500',
        badge: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700',
        accentText: 'text-cyan-600 dark:text-cyan-400',
        btnGrad: 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500',
        ring: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]',
        defaultIcon: '📐',
      };
    }
    // Default Physics
    return {
      gradient: 'from-blue-500/15 via-sky-500/10 to-indigo-950/20 dark:from-blue-950/50 dark:via-sky-950/30 dark:to-slate-900',
      border: 'border-blue-300 dark:border-blue-700/60 hover:border-blue-500',
      badge: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-sky-300 border-blue-300 dark:border-blue-700',
      accentText: 'text-blue-600 dark:text-sky-400',
      btnGrad: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
      ring: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]',
      defaultIcon: '⚛️',
    };
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                A/L Science & Maths Masterclass Portal
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2 flex-wrap">
              <span>Video Lessons Directory</span>
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">· பாடப் பிரிவுகள் & விரிவுரைக் கோப்புறைகள்</span>
            </h3>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {isAdmin && onOpenAdminFolders && (
              <button
                type="button"
                onClick={() => {
                  playRoboticClick();
                  onOpenAdminFolders();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors shadow-xs"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Admin Folder Manager</span>
              </button>
            )}

            <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-blue-500" />
              <span>4 Main Subjects</span>
              <span className="text-slate-400">·</span>
              <span>{folders.length} Folders</span>
              <span className="text-slate-400">·</span>
              <span>{videos.length} Lectures</span>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons by topic, unit, teacher or keyword (e.g. Hydrodynamics, IUPAC, Practical, Kinetics)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 2. SEARCH RESULTS VIEW (when search query is present) */}
      {searchResults ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
              Search Results for "{searchQuery}" ({searchResults.videos.length} videos, {searchResults.folders.length} folders)
            </h4>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
            >
              Back to Explorer
            </button>
          </div>

          {searchResults.folders.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Matching Folders</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.folders.map((folder) => {
                  const subCount = getChildFolders(folder.id, folders).length;
                  const vCount = videos.filter((v) => v.folderId === folder.id).length;
                  const isUnlocked = isFolderUnlocked(folder);
                  return (
                    <div
                      key={folder.id}
                      onClick={() => {
                        setSearchQuery('');
                        handleFolderClick(folder.id);
                      }}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-all cursor-pointer shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{folder.icon || '📁'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          isUnlocked ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {isUnlocked ? 'Enrolled' : 'Paid Only'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{folder.name}</h4>
                      {folder.nameTa && <p className="text-xs text-slate-500 font-sans">{folder.nameTa}</p>}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                        <span>🎥 {vCount} Videos</span>
                        {subCount > 0 && <span>📂 {subCount} Subfolders</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {searchResults.videos.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Matching Lectures</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    user={user}
                    onPlay={onPlayVideo}
                    onRequireLogin={onRequireLogin}
                    isWatched={user?.watchedVideoIds?.includes(video.id) || false}
                    isUnlocked={isVideoLessonUnlocked(video)}
                    onRequireUnlock={() => {
                      if (onRequireUnlock) onRequireUnlock(video);
                      else onRequireLogin();
                    }}
                    accessStatusText="Enrolled Session"
                  />
                ))}
              </div>
            </div>
          )}

          {searchResults.folders.length === 0 && searchResults.videos.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Film className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching videos or folders found</h4>
              <p className="text-xs text-slate-400">Try searching for Physics, Chemistry, Biology, or specific topics.</p>
            </div>
          )}
        </div>
      ) : selectedFolderId && currentFolder ? (
        /* 3. DRILL-DOWN VIEW: INSIDE A SUBJECT OR SUBFOLDER */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Multi-Level Breadcrumb Navigation */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleBackToParent}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 flex items-center gap-2 cursor-pointer transition-all shadow-xs group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>
                {currentFolder.parentId && currentFolder.parentId !== 'none'
                  ? `Back to ${folders.find(f => f.id === currentFolder.parentId)?.name || 'Parent Folder'}`
                  : 'Back to All Subjects'}
              </span>
            </button>

            {/* Clickable Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 overflow-x-auto py-1 scrollbar-none">
              <button
                type="button"
                onClick={handleBackToRoot}
                className="hover:text-blue-600 dark:hover:text-sky-400 hover:underline cursor-pointer"
              >
                All Subjects
              </button>
              {breadcrumbPath.map((crumb, idx) => {
                const isLast = idx === breadcrumbPath.length - 1;
                return (
                  <React.Fragment key={crumb.id}>
                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    {isLast ? (
                      <strong className="text-slate-900 dark:text-white font-bold whitespace-nowrap">
                        {crumb.name}
                      </strong>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleFolderClick(crumb.id)}
                        className="hover:text-blue-600 dark:hover:text-sky-400 hover:underline cursor-pointer whitespace-nowrap"
                      >
                        {crumb.name}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Module Banner Header */}
          {(() => {
            const theme = getSubjectTheme(currentFolder.subjectName, currentFolder.id);
            const isUnlocked = isFolderUnlocked(currentFolder);

            return (
              <div className={`p-6 sm:p-8 rounded-3xl border-2 ${theme.border} bg-gradient-to-br ${theme.gradient} relative overflow-hidden shadow-md`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-3xl">{currentFolder.icon || theme.defaultIcon}</span>
                      <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-black font-mono uppercase tracking-wider ${theme.badge}`}>
                        {currentFolder.subjectName || 'Theory Module'}
                      </span>

                      {isUnlocked ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Enrolled & Active</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 font-mono">
                          <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Paid Student Access Only</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {currentFolder.name}
                    </h2>
                    {currentFolder.nameTa && (
                      <p className="text-sm font-sans text-slate-700 dark:text-slate-300 font-semibold">
                        {currentFolder.nameTa}
                      </p>
                    )}
                    {currentFolder.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        {currentFolder.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-300 pt-2 flex-wrap">
                      {currentChildSubfolders.length > 0 && (
                        <span className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                          <Folder className="w-3.5 h-3.5 text-purple-500" />
                          <strong>{currentChildSubfolders.length}</strong> Subfolders / Units
                        </span>
                      )}

                      <span className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <Film className="w-3.5 h-3.5 text-blue-500" />
                        <strong>{currentFolderVideos.length}</strong> Direct Lectures
                      </span>

                      {currentFolderVideos.length > 0 && (
                        <span className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                          <Clock className="w-3.5 h-3.5 text-sky-500" />
                          Duration:{' '}
                          <strong>
                            {formatVideoDuration(
                              currentFolderVideos.reduce((sum, v) => sum + (v.durationMinutes || 0), 0)
                            )}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col gap-2">
                    {/* Admin quick add subfolder button inside this folder */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          playRoboticClick();
                          if (onAddSubfolder) onAddSubfolder(currentFolder.id);
                          else if (onOpenAdminFolders) onOpenAdminFolders();
                        }}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Subfolder in {currentFolder.name}</span>
                      </button>
                    )}

                    {!isUnlocked && (
                      user?.email ? (
                        <button
                          type="button"
                          onClick={() => handleInstantRequestAccess(currentFolder)}
                          disabled={isSubmittingReq}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingReq ? 'Submitting...' : 'Request Access (அனுமதி கோர)'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onRequireLogin}
                          className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Sign In with Google</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SUBFOLDERS SECTION: If this folder has child subfolders (subfolders inside subfolder!) */}
          {currentChildSubfolders.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                <span className="flex items-center gap-2 text-sm font-black">
                  <Folder className="w-4 h-4 text-purple-500" />
                  <span>Subfolders / Unit Modules ({currentChildSubfolders.length})</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">Click any subfolder to open its lessons</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentChildSubfolders.map((subfolder) => {
                  const subVideos = videos.filter((v) => v.folderId === subfolder.id);
                  const subChildCount = getChildFolders(subfolder.id, folders).length;
                  const isUnlocked = isFolderUnlocked(subfolder);
                  const isPending = pendingFolderReqIds.has(subfolder.id) || pendingFolderReqIds.has('all');
                  const theme = getSubjectTheme(subfolder.subjectName || currentFolder.subjectName, subfolder.id);

                  return (
                    <div
                      key={subfolder.id}
                      onClick={() => handleFolderClick(subfolder.id)}
                      className={`group rounded-3xl border-2 ${theme.border} bg-white dark:bg-slate-900 hover:shadow-xl p-5 sm:p-6 shadow-xs transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 relative overflow-hidden`}
                    >
                      <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                            {subfolder.icon || '📂'}
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {isUnlocked ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[10px] font-bold font-mono flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Enrolled</span>
                              </span>
                            ) : isPending ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[10px] font-bold font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                <span>Pending</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[10px] font-bold font-mono flex items-center gap-1">
                                <Lock className="w-3 h-3 text-amber-600" />
                                <span>Paid Only</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                              Subfolder Unit
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                            {subfolder.name}
                          </h4>
                          {subfolder.nameTa && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1">
                              {subfolder.nameTa}
                            </p>
                          )}
                          {subfolder.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                              {subfolder.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 relative z-10">
                        <span className="font-mono flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                          <Film className="w-3.5 h-3.5 text-blue-500 dark:text-sky-400" />
                          {subVideos.length} Lectures
                        </span>

                        {subChildCount > 0 && (
                          <span className="font-mono flex items-center gap-1 text-purple-500 font-bold">
                            📂 {subChildCount} Nested Subfolders
                          </span>
                        )}

                        <span className="text-blue-600 dark:text-sky-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-mono text-[11px]">
                          Open ➜
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIDEOS SECTION: If folder has direct videos */}
          {(() => {
            const isUnlocked = isFolderUnlocked(currentFolder);

            if (!isUnlocked && currentFolderVideos.length > 0) {
              /* Locked showcase banner */
              return (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sky-50/60 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/90 dark:to-indigo-950/40 border-2 border-blue-200/80 dark:border-blue-900/60 shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in duration-200">
                  <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-400/50 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold tracking-wider shadow-xs">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>👑 PAID STUDENT MASTERCLASS • ENROLLED ACCESS ONLY</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {currentFolder.name} Masterclass Series
                    </h3>
                    <p className="text-sm font-semibold text-blue-700 dark:text-sky-300">
                      {currentFolder.nameTa || 'உயர்தர விசேட கோட்பாட்டு விரிவுரைகள்'}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Join our comprehensive lecture series with complete syllabus derivations, real laboratory apparatus experiments, and past paper model answers.
                    </p>
                  </div>

                  {/* Lecture Sneak Peek */}
                  <div className="relative z-10 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                          Curriculum Preview • பாடநெறி விபரம்
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          Lectures in this Folder ({currentFolderVideos.length} In-Depth Classes)
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3 text-amber-500" />
                        <span>Enrolled Access</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {currentFolderVideos.map((vid, idx) => (
                        <div
                          key={vid.id}
                          className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-start justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 text-[10px] font-mono font-bold">
                                Lecture {String(idx + 1).padStart(2, '0')}
                              </span>
                              {vid.durationMinutes ? (
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                  ⏱️ {formatVideoDuration(vid.durationMinutes)}
                                </span>
                              ) : null}
                            </div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {vid.titleEn}
                            </h5>
                            {vid.titleTa && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {vid.titleTa}
                              </p>
                            )}
                          </div>

                          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activation Card */}
                  <div className="relative z-10 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 shadow-md">
                    {user && user.email ? (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 font-bold flex items-center justify-center shrink-0">
                              {user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {user.name || 'Student Account'}
                              </div>
                              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                {user.email}
                              </div>
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 text-amber-800 dark:text-amber-300 text-xs font-bold font-mono flex items-center gap-1.5 self-start sm:self-auto">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Awaiting Activation</span>
                          </span>
                        </div>

                        {pendingFolderReqIds.has(currentFolder.id) || pendingFolderReqIds.has('all') ? (
                          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5 font-medium">
                            <Clock className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                            <div>
                              <p className="font-bold">✓ Access Request Submitted (அனுமதி கோரிக்கை சமர்ப்பிக்கப்பட்டது)</p>
                              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                                Your request is pending in Admin Asman Linzy's queue. Once approved, this module will unlock immediately!
                              </p>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleInstantRequestAccess(currentFolder)}
                            disabled={isSubmittingReq}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            <span>{isSubmittingReq ? 'Submitting...' : 'Request Access from Admin (அனுமதி கோரிக்கை அனுப்புக)'}</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          Ready to Watch? Sign In with Google
                        </h4>
                        <button
                          type="button"
                          onClick={onRequireLogin}
                          className="w-full max-w-sm mx-auto py-3 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <span>Sign In with Google (Gmail மூலம் இணைய)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Unlocked or open lectures list
            return (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
                  <span className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                    <Film className="w-4 h-4 text-blue-500" />
                    <span>Lectures in this Section ({currentFolderVideos.length})</span>
                  </span>
                  <span className="font-mono text-[11px]">Click any video to play directly</span>
                </div>

                {currentFolderVideos.length === 0 ? (
                  currentChildSubfolders.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                      <Film className="w-8 h-8 text-slate-400 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Videos in this Folder Yet</h4>
                      <p className="text-xs text-slate-400">Educators will publish lectures here shortly.</p>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onAddSubfolder) onAddSubfolder(currentFolder.id);
                            else if (onOpenAdminFolders) onOpenAdminFolders();
                          }}
                          className="mt-3 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Subfolder</span>
                        </button>
                      )}
                    </div>
                  ) : null
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {currentFolderVideos.map((video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        user={user}
                        onPlay={onPlayVideo}
                        onRequireLogin={onRequireLogin}
                        isWatched={user?.watchedVideoIds?.includes(video.id) || false}
                        isUnlocked={isVideoLessonUnlocked(video)}
                        onRequireUnlock={() => {
                          if (onRequireUnlock) onRequireUnlock(video);
                          else onRequireLogin();
                        }}
                        accessStatusText="Enrolled Session"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        /* 4. ROOT VIEW: THE 4 MAIN SUBJECTS DIRECTORY (Biology, Physics, Chemistry, Combined Maths) */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <div className="space-y-0.5">
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                <span>Primary Subject Masterclasses</span>
                <span className="text-xs font-normal text-slate-500">· 4 பிரதான பாடங்கள்</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a subject to explore its syllabus units, subfolders, and lecture masterclasses.
              </p>
            </div>

            {isAdmin && onOpenAdminFolders && (
              <button
                type="button"
                onClick={() => {
                  playRoboticClick();
                  onOpenAdminFolders();
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Folder</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rootFolders.map((root) => {
              const childSubfolders = getChildFolders(root.id, folders);
              const allVideosInTree = getAllVideosForFolderRecursive(root.id, folders, videos);
              const totalMins = allVideosInTree.reduce((sum, v) => sum + (v.durationMinutes || 0), 0);
              const theme = getSubjectTheme(root.subjectName, root.id);

              return (
                <div
                  key={root.id}
                  onClick={() => handleFolderClick(root.id)}
                  className={`group rounded-3xl border-2 ${theme.border} bg-gradient-to-br ${theme.gradient} hover:shadow-2xl ${theme.ring} p-6 sm:p-7 shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 relative overflow-hidden`}
                >
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                        {root.icon || theme.defaultIcon}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${theme.badge}`}>
                          Primary Subject
                        </span>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playRoboticClick();
                              if (onAddSubfolder) onAddSubfolder(root.id);
                              else if (onOpenAdminFolders) onOpenAdminFolders();
                            }}
                            className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold font-mono flex items-center gap-1 shadow-xs cursor-pointer"
                            title={`Add a subfolder directly under ${root.name}`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Subfolder</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors flex items-center gap-2">
                        <span>{root.name}</span>
                        {root.nameTa && (
                          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans">
                            · {root.nameTa}
                          </span>
                        )}
                      </h3>
                      {root.description && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                          {root.description}
                        </p>
                      )}
                    </div>

                    {/* Subfolders badges sneak peek */}
                    {childSubfolders.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Included Modules & Workshops ({childSubfolders.length}):
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {childSubfolders.slice(0, 3).map((sub) => (
                            <span
                              key={sub.id}
                              className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                            >
                              <span>{sub.icon || '📁'}</span>
                              <span className="truncate max-w-[150px]">{sub.name}</span>
                            </span>
                          ))}
                          {childSubfolders.length > 3 && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono text-slate-400">
                              +{childSubfolders.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 relative z-10">
                    <div className="flex items-center gap-4 font-mono font-bold">
                      <span className="flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-purple-500" />
                        {childSubfolders.length} Subfolders
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-blue-500" />
                        {allVideosInTree.length} Lectures
                      </span>
                      {totalMins > 0 && (
                        <span className="hidden sm:flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-sky-500" />
                          {formatVideoDuration(totalMins)}
                        </span>
                      )}
                    </div>

                    <span className={`px-4 py-2 rounded-xl bg-gradient-to-r ${theme.btnGrad} text-white font-black text-xs shadow-md group-hover:scale-105 transition-transform flex items-center gap-1 font-mono`}>
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
