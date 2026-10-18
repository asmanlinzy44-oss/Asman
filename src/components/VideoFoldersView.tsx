import React, { useState, useMemo } from 'react';
import { 
  Folder, Film, Lock, CheckCircle2, ChevronRight, Clock, 
  ArrowLeft, Search, Sparkles, Send, MessageCircle, UserCheck, 
  BookOpen, GraduationCap, ShieldCheck
} from 'lucide-react';
import { VideoFolder, VideoLesson, User, VideoAccessRequest } from '../types';
import { formatVideoDuration } from '../utils/drive';
import { VideoCard } from './VideoCard';
import { playRoboticClick, playRoboticFolder } from '../utils/audio';

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
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [requestNotice, setRequestNotice] = useState<{ id: string; msg: string } | null>(null);
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // Group and compute stats per folder
  const folderStats = useMemo(() => {
    const stats: Record<string, { count: number; totalMinutes: number; videos: VideoLesson[] }> = {};
    for (const folder of folders) {
      stats[folder.id] = { count: 0, totalMinutes: 0, videos: [] };
    }
    for (const v of videos) {
      if (v.folderId && stats[v.folderId]) {
        stats[v.folderId].count += 1;
        stats[v.folderId].totalMinutes += v.durationMinutes || 0;
        stats[v.folderId].videos.push(v);
      }
    }
    return stats;
  }, [folders, videos]);

  // Current active folder
  const currentFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [selectedFolderId, folders]);

  // Videos inside current folder, sorted logically
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

  // Filtered folders
  const filteredFolders = useMemo(() => {
    return folders.filter((f) => {
      if (subjectFilter !== 'all') {
        const matchesSubject =
          (f.subjectName && f.subjectName.toLowerCase().includes(subjectFilter.toLowerCase())) ||
          f.id.toLowerCase().includes(subjectFilter.toLowerCase());
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

  // Distinct subjects available
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    for (const f of folders) {
      if (f.subjectName) set.add(f.subjectName.toLowerCase());
    }
    return ['all', ...Array.from(set)];
  }, [folders]);

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

  const handleBackToFolders = () => {
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

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                A/L Theory Masterclass & Laboratory Portal
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <span>Theory Video Modules</span>
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">· பாட அலகுக் கோப்புறைகள்</span>
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
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer hover:bg-purple-100 transition-colors"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}

            <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-blue-500" />
              <span>{folders.length} Modules</span>
              <span className="text-slate-400">·</span>
              <span>{videos.length} Lectures</span>
            </div>
          </div>
        </div>

        {/* Clean Subject Filters & Fast Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {availableSubjects.map((sub) => {
              const isSelected = subjectFilter === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    playRoboticClick();
                    setSubjectFilter(sub);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sub === 'all' ? 'All Subjects' : sub}
                </button>
              );
            })}
          </div>

          <div className="relative sm:max-w-xs min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures, units, topics..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 2. VIEW: DRILL-DOWN INSIDE A SPECIFIC FOLDER */}
      {selectedFolderId && currentFolder ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBackToFolders}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 flex items-center gap-2 cursor-pointer transition-all shadow-xs group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to All Modules</span>
            </button>

            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>Theory Modules</span>
              <ChevronRight className="w-3 h-3" />
              <strong className="text-slate-900 dark:text-white">{currentFolder.name}</strong>
            </div>
          </div>

          {/* Module Banner Header */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">{currentFolder.icon || '📁'}</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-black font-mono uppercase tracking-wider text-blue-700 dark:text-sky-300">
                    {currentFolder.subjectName || 'Theory Module'}
                  </span>

                  {isFolderUnlocked(currentFolder) ? (
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
                  <p className="text-sm font-sans text-slate-600 dark:text-slate-400 font-medium">
                    {currentFolder.nameTa}
                  </p>
                )}
                {currentFolder.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                    {currentFolder.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-300 pt-2 flex-wrap">
                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Film className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                    <strong>{currentFolderVideos.length}</strong> Video Lectures
                  </span>

                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    Total Duration:{' '}
                    <strong>
                      {formatVideoDuration(
                        currentFolderVideos.reduce((sum, v) => sum + (v.durationMinutes || 0), 0)
                      )}
                    </strong>
                  </span>
                </div>
              </div>

              {!isFolderUnlocked(currentFolder) && (
                <div className="shrink-0 flex flex-col gap-2">
                  {user?.email ? (
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
                  )}
                </div>
              )}
            </div>
          </div>

          {/* If Folder is LOCKED: Render Bright, Premium, High-Converting Masterclass Showcase (NOT A DARK GLOOMY BOX) */}
          {!isFolderUnlocked(currentFolder) ? (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sky-50/60 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/90 dark:to-indigo-950/40 border-2 border-blue-200/80 dark:border-blue-900/60 shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in duration-200">
              {/* Background ambient accents */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

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

              {/* What's Inside: Actual Lecture Sneak Peek */}
              <div className="relative z-10 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                      Curriculum Sneak Peek • பாடநெறி விபரம்
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Lectures in this Workshop ({currentFolderVideos.length} In-Depth Classes)
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

              {/* Course Benefits Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-blue-200/60 dark:border-slate-700/60 text-center space-y-1">
                  <Film className="w-5 h-5 text-blue-600 dark:text-sky-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Full HD Video</p>
                  <p className="text-[10px] text-slate-500">Unrestricted Playback</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-purple-200/60 dark:border-slate-700/60 text-center space-y-1">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Full Derivations</p>
                  <p className="text-[10px] text-slate-500">Core Formulas</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-slate-700/60 text-center space-y-1">
                  <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Model Answers</p>
                  <p className="text-[10px] text-slate-500">Structured Marking</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700/60 text-center space-y-1">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Teacher Support</p>
                  <p className="text-[10px] text-slate-500">Direct WhatsApp</p>
                </div>
              </div>

              {/* Student Activation Section */}
              <div className="relative z-10 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 shadow-md">
                {user && user.email ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 font-bold flex items-center justify-center shrink-0">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.name || user.email} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            user.email.charAt(0).toUpperCase()
                          )}
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

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Your Gmail is connected. If you have paid the course fee, submit an instant access request below or contact Asman Linzy on WhatsApp.
                    </p>

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

                    {requestNotice && requestNotice.id === currentFolder.id && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                        {requestNotice.msg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <a
                        href="https://wa.me/94770000000?text=Hello%20Asman%20Linzy,%20I%20would%20like%20to%20enroll%20in%20the%20Video%20Masterclasses."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Enroll via WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={onRequireLogin}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        <UserCheck className="w-4 h-4 text-sky-500" />
                        <span>Switch Gmail</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Ready to Watch? Sign In with Google
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Connect with your registered Google (Gmail) account to access these theory lectures and workshops.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-2.5 pt-1">
                      <button
                        type="button"
                        onClick={onRequireLogin}
                        className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
                      >
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                          <svg className="w-full h-full" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                          </svg>
                        </div>
                        <span>Sign In with Google (Gmail மூலம் இணைய)</span>
                      </button>

                      <a
                        href="https://wa.me/94770000000?text=Hello%20Asman%20Linzy,%20I%20want%20to%20enroll%20in%20the%20Video%20Masterclasses."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Want to Enroll? Contact Asman Linzy on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Videos List within this Folder (Rendered when Unlocked) */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
                <span>Lectures in this Module ({currentFolderVideos.length})</span>
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
          )}
        </div>
      ) : (
        /* 3. VIEW: ALL FOLDERS / MODULES DIRECTORY (Clean, user-friendly cards) */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFolders.map((folder) => {
              const stats = folderStats[folder.id] || { count: 0, totalMinutes: 0, videos: [] };
              const isUnlocked = isFolderUnlocked(folder);
              const isPending = pendingFolderReqIds.has(folder.id) || pendingFolderReqIds.has('all');

              return (
                <div
                  key={folder.id}
                  onClick={() => handleFolderClick(folder.id)}
                  className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-xl p-5 sm:p-6 shadow-xs transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform text-blue-600 dark:text-sky-400">
                        {folder.icon || '📁'}
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
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                          {folder.subjectName || 'Theory Module'}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
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
                      <Film className="w-3.5 h-3.5 text-blue-500 dark:text-sky-400" />
                      {stats.count} Lectures
                    </span>

                    <span className="font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      {formatVideoDuration(stats.totalMinutes)}
                    </span>

                    <span className="text-blue-600 dark:text-sky-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-mono text-[11px]">
                      View ➜
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
