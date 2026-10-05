import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ShieldCheck, MessageSquare, FileText, Video, 
  Trash2, Plus, CheckCircle, ExternalLink, Calendar, 
  Clock, AlertTriangle, Upload, LogOut, Check, Edit3, 
  Search, Filter, Lock, KeyRound, Eye, EyeOff, Save,
  RefreshCw, Database, Shield, BookOpen, Layers, ArrowLeft,
  Copy, Award, CheckCircle2, ChevronRight
} from 'lucide-react';
import { PaperResource, VideoLesson, UserReport, StreamId, ResourceCategory, User } from '../types';
import { extractYoutubeId } from '../utils/drive';
import { playRoboticClick, playRoboticTab, playRoboticUnlock } from '../utils/audio';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onAddPaper: (paper: PaperResource) => void;
  onUpdatePaper?: (paper: PaperResource) => void;
  onDeletePaper?: (paperId: string) => void;
  onAddVideo: (video: VideoLesson) => void;
  onUpdateVideo?: (video: VideoLesson) => void;
  onDeleteVideo?: (videoId: string) => void;
  papers: PaperResource[];
  videos: VideoLesson[];
  isAdminLoggedIn: boolean;
  onAdminLoginSuccess: () => void;
  currentUser?: User | null;
  onGoogleLogin?: () => void;
}

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const VALID_PASSCODES = ['admin2026', 'asman44', '1016', 'paperexpress', 'admin'];

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  onAddPaper,
  onUpdatePaper,
  onDeletePaper,
  onAddVideo,
  onUpdateVideo,
  onDeleteVideo,
  papers,
  videos,
  isAdminLoggedIn,
  onAdminLoginSuccess,
  currentUser,
  onGoogleLogin,
}) => {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'manage' | 'upload-paper' | 'videos' | 'reports' | 'security'>('manage');
  const [reports, setReports] = useState<UserReport[]>([]);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Authentication Gate State
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Manage Tab: Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Currently Editing Paper
  const [editingPaper, setEditingPaper] = useState<PaperResource | null>(null);

  // Add Paper Form State
  const [paperSubject, setPaperSubject] = useState('Physics');
  const [paperStream, setPaperStream] = useState<StreamId>('maths');
  const [paperCategory, setPaperCategory] = useState<ResourceCategory>('past-papers');
  const [paperYear, setPaperYear] = useState<number>(2026);
  const [paperTitleEn, setPaperTitleEn] = useState('');
  const [paperTitleTa, setPaperTitleTa] = useState('');
  const [paperDriveLink, setPaperDriveLink] = useState('');
  const [paperSchemeLink, setPaperSchemeLink] = useState('');
  const [paperSource, setPaperSource] = useState('Department of Examinations, Sri Lanka');
  const [paperTerm, setPaperTerm] = useState('All Island');
  const [paperPilotType, setPaperPilotType] = useState('Moratuwa University');
  const [paperUnitOrTopic, setPaperUnitOrTopic] = useState('');

  // Video Form State
  const [videoSubject, setVideoSubject] = useState('Physics');
  const [videoStream, setVideoStream] = useState<StreamId>('maths');
  const [videoUnitNumber, setVideoUnitNumber] = useState<number>(1);
  const [videoUnitName, setVideoUnitName] = useState('Unit 01 - Measurement');
  const [videoTitleEn, setVideoTitleEn] = useState('');
  const [videoYoutubeInput, setVideoYoutubeInput] = useState('');
  const [videoTeacher, setVideoTeacher] = useState('Asman Linzy');
  const [videoDuration, setVideoDuration] = useState<number>(45);
  const [videoDescription, setVideoDescription] = useState('Full syllabus masterclass with past paper derivations and exam questions.');

  // Copied Link feedback
  const [copiedDirectUrl, setCopiedDirectUrl] = useState(false);

  // Load and auto-purge user reports (max 3 days retention)
  const refreshReports = () => {
    try {
      const raw = localStorage.getItem('studypro_user_reports');
      const all: UserReport[] = raw ? JSON.parse(raw) : [];
      const now = Date.now();
      const valid = all.filter((r) => r && r.createdAt && (now - r.createdAt < THREE_DAYS_MS));
      if (valid.length !== all.length) {
        localStorage.setItem('studypro_user_reports', JSON.stringify(valid));
      }
      setReports(valid);
    } catch {
      setReports([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshReports();
      setSuccessBanner(null);
      setPasscodeError('');
      setPasscodeInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  // Passcode Verification
  const handlePasscodeUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setPasscodeError('');

    const input = passcodeInput.trim().toLowerCase();
    const customCode = localStorage.getItem('studypro_custom_admin_passcode')?.toLowerCase();

    if (VALID_PASSCODES.includes(input) || (customCode && input === customCode)) {
      playRoboticUnlock();
      onAdminLoginSuccess();
      showSuccess('Master Admin access verified successfully!');
      setIsVerifying(false);
      setPasscodeInput('');
    } else {
      setIsVerifying(false);
      setPasscodeError('Invalid Admin Passcode. Try admin2026, asman44, or login with Google.');
    }
  };

  // Delete / Resolve a report
  const handleDeleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    localStorage.setItem('studypro_user_reports', JSON.stringify(updated));
    showSuccess('Report removed from list.');
  };

  const handleToggleReportResolve = (id: string) => {
    const updated = reports.map((r) => r.id === id ? { ...r, resolved: !r.resolved } : r);
    setReports(updated);
    localStorage.setItem('studypro_user_reports', JSON.stringify(updated));
  };

  // Handle Paper Form Submit
  const handlePaperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperDriveLink.trim()) {
      alert('Please enter a valid Google Drive link for the paper.');
      return;
    }

    const subjectIdMap: Record<string, string> = {
      'Physics': 'sub-physics',
      'Chemistry': 'sub-chemistry',
      'Combined Mathematics': 'sub-combined-maths',
      'Biology': 'sub-biology',
    };

    const newPaper: PaperResource = {
      id: 'custom_paper_' + Date.now(),
      titleEn: paperTitleEn.trim() || `G.C.E. A/L ${paperYear} ${paperSubject} Examination Paper`,
      titleTa: paperTitleTa.trim() || undefined,
      category: paperCategory,
      stream: paperStream,
      subjectId: subjectIdMap[paperSubject] || 'sub-physics',
      subjectNameEn: paperSubject,
      year: Number(paperYear),
      term: paperCategory === 'fwc-papers' ? paperTerm : undefined,
      pilotType: paperCategory === 'pilot-papers' ? (paperPilotType.trim() || 'Moratuwa University') : undefined,
      schoolOrSource: paperSource.trim() || (paperCategory === 'pilot-papers' ? (paperPilotType.trim() || 'University of Moratuwa') : 'Department of Examinations, Sri Lanka'),
      driveLink: paperDriveLink.trim(),
      markingSchemeDriveLink: paperSchemeLink.trim() || paperDriveLink.trim(),
      fileSize: 'PDF Document',
      downloadsCount: 1,
      unitOrTopic: paperUnitOrTopic.trim() || undefined,
    };

    onAddPaper(newPaper);
    showSuccess(`Paper "${newPaper.titleEn}" published live successfully!`);

    // Reset fields
    setPaperTitleEn('');
    setPaperTitleTa('');
    setPaperDriveLink('');
    setPaperSchemeLink('');
    setPaperUnitOrTopic('');
    setActiveTab('manage');
  };

  // Handle Save Edited Paper
  const handleSaveEditedPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaper) return;

    if (!editingPaper.driveLink.trim()) {
      alert('Google Drive Link cannot be empty.');
      return;
    }

    if (onUpdatePaper) {
      onUpdatePaper(editingPaper);
    }
    showSuccess(`Paper "${editingPaper.titleEn}" updated live successfully!`);
    setEditingPaper(null);
  };

  // Handle Video Form Submit
  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractYoutubeId(videoYoutubeInput.trim());
    if (!cleanId || cleanId.length < 5) {
      alert('Please enter a valid YouTube Video URL or 11-character Video ID.');
      return;
    }

    const subjectIdMap: Record<string, string> = {
      'Physics': 'sub-physics',
      'Chemistry': 'sub-chemistry',
      'Combined Mathematics': 'sub-combined-maths',
      'Biology': 'sub-biology',
    };

    const newVideo: VideoLesson = {
      id: 'custom_vid_' + Date.now(),
      titleEn: videoTitleEn.trim() || `${videoSubject} Unit ${videoUnitNumber} Masterclass`,
      stream: videoStream,
      subjectId: subjectIdMap[videoSubject] || 'sub-physics',
      subjectNameEn: videoSubject,
      unitNumber: Number(videoUnitNumber),
      unitNameEn: videoUnitName.trim() || `Unit ${videoUnitNumber}`,
      youtubeUrl: `https://www.youtube.com/watch?v=${cleanId}`,
      youtubeId: cleanId,
      durationMinutes: Number(videoDuration) || 45,
      teacherName: videoTeacher.trim() || 'Asman Linzy',
      descriptionEn: videoDescription.trim(),
      isUnlisted: false,
      chapters: [
        { time: '00:00', seconds: 0, title: 'Introduction & Core Concepts' },
        { time: '15:00', seconds: 900, title: 'Formulas & Derivations' },
        { time: '30:00', seconds: 1800, title: 'Past Paper Exam Questions' },
      ],
      viewsCount: 1,
      uploadedAt: 'Today',
    };

    onAddVideo(newVideo);
    showSuccess(`Video lesson "${newVideo.titleEn}" published live successfully!`);

    // Reset fields
    setVideoTitleEn('');
    setVideoYoutubeInput('');
    setActiveTab('videos');
  };

  // Filtered papers for Manage Tab
  const filteredPapers = useMemo(() => {
    if (!Array.isArray(papers)) return [];
    return papers.filter((p) => {
      if (!p) return false;
      // Category filter
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      // Subject filter
      if (filterSubject !== 'all') {
        const pSub = (p.subjectNameEn || '').toLowerCase();
        if (filterSubject === 'physics' && !pSub.includes('physic')) return false;
        if (filterSubject === 'chemistry' && !pSub.includes('chem')) return false;
        if (filterSubject === 'maths' && !pSub.includes('math') && !pSub.includes('combined')) return false;
        if (filterSubject === 'biology' && !pSub.includes('bio')) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const tEn = (p.titleEn || '').toLowerCase();
        const tTa = (p.titleTa || '').toLowerCase();
        const sEn = (p.subjectNameEn || '').toLowerCase();
        const src = (p.schoolOrSource || '').toLowerCase();
        const pt = (p.pilotType || '').toLowerCase();
        const yr = String(p.year || '');
        return tEn.includes(q) || tTa.includes(q) || sEn.includes(q) || src.includes(q) || pt.includes(q) || yr.includes(q);
      }
      return true;
    });
  }, [papers, filterCategory, filterSubject, searchQuery]);

  const copyDirectAdminUrl = () => {
    playRoboticClick();
    const url = 'https://paperexpress.vercel.app/#admin';
    navigator.clipboard.writeText(url);
    setCopiedDirectUrl(true);
    setTimeout(() => setCopiedDirectUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div 
        className="w-full max-w-5xl h-[94vh] max-h-[880px] bg-[#070D1E] border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.35)] text-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#091228] border-b border-cyan-500/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">Paper Express Admin Console</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  /#admin
                </span>
                {isAdminLoggedIn && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Authorized
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                paperexpress.vercel.app/#admin · Real-time Content & Cloud Database Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={() => {
                  playRoboticClick();
                  onLogout();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Logout from Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={() => {
                playRoboticClick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-cyan-950/60 transition-colors cursor-pointer"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOT AUTHENTICATED: MASTER PASSCODE & GOOGLE GATE */}
        {!isAdminLoggedIn ? (
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="max-w-md w-full space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <Lock className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Master Administrator Access
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Direct URL: <span className="text-cyan-300 font-bold">paperexpress.vercel.app/#admin</span>
                </p>
              </div>

              {/* Method 1: Google One-Click Login */}
              {onGoogleLogin && (
                <div className="p-4 rounded-2xl bg-[#091228] border border-cyan-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>Method 1: Direct Google Authentication</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sign in with authorized administrator account (<strong className="text-cyan-300">asmanlinzy44@gmail.com</strong>).
                  </p>
                  <button
                    onClick={() => {
                      playRoboticClick();
                      onGoogleLogin();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google (Admin)</span>
                  </button>
                </div>
              )}

              {/* Method 2: Passcode Entry */}
              <form onSubmit={handlePasscodeUnlock} className="p-4 rounded-2xl bg-[#091228] border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Method 2: Admin Security Passcode</span>
                </div>
                <div className="relative">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={passcodeInput}
                    onChange={(e) => {
                      setPasscodeInput(e.target.value);
                      setPasscodeError('');
                    }}
                    placeholder="Enter admin passcode (e.g. admin2026 / asman44)..."
                    className="w-full px-3.5 py-2.5 bg-[#050A17] border border-cyan-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passcodeError && (
                  <p className="text-xs text-rose-400 font-mono">{passcodeError}</p>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || !passcodeInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Unlock Admin Dashboard'}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Return to Paper Express Homepage
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED: FULL ADMIN DASHBOARD */
          <>
            {/* TABS HEADER */}
            <div className="px-4 sm:px-6 bg-[#050A17] border-b border-cyan-500/20 flex items-center justify-between overflow-x-auto shrink-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => {
                    playRoboticTab();
                    setActiveTab('manage');
                    setEditingPaper(null);
                  }}
                  className={`px-3 sm:px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'manage'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Manage & Edit Papers ({papers.length})</span>
                </button>

                <button
                  onClick={() => {
                    playRoboticTab();
                    setActiveTab('upload-paper');
                    setEditingPaper(null);
                  }}
                  className={`px-3 sm:px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'upload-paper'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Paper</span>
                </button>

                <button
                  onClick={() => {
                    playRoboticTab();
                    setActiveTab('videos');
                    setEditingPaper(null);
                  }}
                  className={`px-3 sm:px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'videos'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Video Lessons ({videos.length})</span>
                </button>

                <button
                  onClick={() => {
                    playRoboticTab();
                    setActiveTab('reports');
                    setEditingPaper(null);
                  }}
                  className={`px-3 sm:px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'reports'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Help Desk ({reports.length})</span>
                </button>

                <button
                  onClick={() => {
                    playRoboticTab();
                    setActiveTab('security');
                    setEditingPaper(null);
                  }}
                  className={`px-3 sm:px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'security'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Security & URLs</span>
                </button>
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Database className="w-3.5 h-3.5" />
                <span>Cloud Firestore Live</span>
              </div>
            </div>

            {/* SUCCESS BANNER */}
            {successBanner && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{successBanner}</span>
                </div>
                <button
                  onClick={() => setSuccessBanner(null)}
                  className="text-emerald-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              
              {/* TAB 1: MANAGE & EDIT PAPERS */}
              {activeTab === 'manage' && (
                <div className="space-y-4">
                  {/* EDIT SUB-VIEW (When a paper is selected for editing) */}
                  {editingPaper ? (
                    <div className="bg-[#091228] border-2 border-cyan-500/50 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingPaper(null)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <div>
                            <h4 className="text-sm font-black text-white flex items-center gap-2">
                              <Edit3 className="w-4 h-4 text-cyan-400" />
                              <span>Edit Paper: {editingPaper.titleEn}</span>
                            </h4>
                            <p className="text-[11px] text-cyan-300 font-mono">
                              ID: {editingPaper.id}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setEditingPaper(null)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Cancel Edit
                        </button>
                      </div>

                      <form onSubmit={handleSaveEditedPaper} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Subject */}
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                              Subject
                            </label>
                            <select
                              value={editingPaper.subjectNameEn}
                              onChange={(e) => {
                                const newSub = e.target.value;
                                setEditingPaper({
                                  ...editingPaper,
                                  subjectNameEn: newSub,
                                  subjectId: 
                                    newSub === 'Physics' ? 'sub-physics' :
                                    newSub === 'Chemistry' ? 'sub-chemistry' :
                                    newSub === 'Biology' ? 'sub-biology' : 'sub-combined-maths',
                                  stream: newSub === 'Biology' ? 'bio' : newSub === 'Combined Mathematics' ? 'maths' : editingPaper.stream,
                                });
                              }}
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            >
                              <option value="Physics">Physics</option>
                              <option value="Chemistry">Chemistry</option>
                              <option value="Combined Mathematics">Combined Mathematics</option>
                              <option value="Biology">Biology</option>
                            </select>
                          </div>

                          {/* Category */}
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                              Category / Section
                            </label>
                            <select
                              value={editingPaper.category}
                              onChange={(e) => setEditingPaper({ ...editingPaper, category: e.target.value as ResourceCategory })}
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            >
                              <option value="past-papers">Past Papers (Archive)</option>
                              <option value="fwc-papers">FWC & Term Tests</option>
                              <option value="theory-notes">Resources (Theory & Notes)</option>
                              <option value="pilot-papers">Other Pilot Papers</option>
                            </select>
                          </div>

                          {/* Year */}
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                              Examination Year
                            </label>
                            <input
                              type="number"
                              min={1980}
                              max={2030}
                              value={editingPaper.year}
                              onChange={(e) => setEditingPaper({ ...editingPaper, year: Number(e.target.value) })}
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                            />
                          </div>
                        </div>

                        {/* Title English */}
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                            Paper Title (English) <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingPaper.titleEn}
                            onChange={(e) => setEditingPaper({ ...editingPaper, titleEn: e.target.value })}
                            className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                          />
                        </div>

                        {/* Title Tamil */}
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                            Paper Title (Tamil - Optional)
                          </label>
                          <input
                            type="text"
                            value={editingPaper.titleTa || ''}
                            onChange={(e) => setEditingPaper({ ...editingPaper, titleTa: e.target.value })}
                            placeholder="வினாத்தாள் தலைப்பு தமிழில்..."
                            className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-tamil"
                          />
                        </div>

                        {/* Conditional Term or Pilot Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                              Term / Series Tag
                            </label>
                            <input
                              type="text"
                              value={editingPaper.term || ''}
                              onChange={(e) => setEditingPaper({ ...editingPaper, term: e.target.value })}
                              placeholder="e.g. 1st Term / All Island / Trial"
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                              School / Source / Pilot Provider
                            </label>
                            <input
                              type="text"
                              value={editingPaper.schoolOrSource || ''}
                              onChange={(e) => setEditingPaper({ ...editingPaper, schoolOrSource: e.target.value })}
                              placeholder="e.g. University of Moratuwa / Royal College"
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            />
                          </div>
                        </div>

                        {/* Drive Links */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-mono font-bold text-cyan-300 mb-1">
                              Question Paper Google Drive Link <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={editingPaper.driveLink}
                              onChange={(e) => setEditingPaper({ ...editingPaper, driveLink: e.target.value })}
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">
                              Marking Scheme Drive Link (Optional)
                            </label>
                            <input
                              type="text"
                              value={editingPaper.markingSchemeDriveLink || ''}
                              onChange={(e) => setEditingPaper({ ...editingPaper, markingSchemeDriveLink: e.target.value })}
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => setEditingPaper(null)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Live Changes</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : null}

                  {/* SEARCH & FILTERS BAR */}
                  <div className="bg-[#091228] p-3.5 rounded-2xl border border-cyan-500/20 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search papers by title, year, school..."
                          className="w-full pl-9 pr-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {/* Category Filter */}
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-cyan-300 focus:outline-none font-mono"
                        >
                          <option value="all">All Categories</option>
                          <option value="past-papers">Past Papers</option>
                          <option value="fwc-papers">FWC & Term Tests</option>
                          <option value="theory-notes">Resources</option>
                          <option value="pilot-papers">Other Pilot Papers</option>
                        </select>

                        {/* Subject Filter */}
                        <select
                          value={filterSubject}
                          onChange={(e) => setFilterSubject(e.target.value)}
                          className="px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-cyan-300 focus:outline-none font-mono"
                        >
                          <option value="all">All Subjects</option>
                          <option value="physics">Physics</option>
                          <option value="chemistry">Chemistry</option>
                          <option value="maths">Combined Maths</option>
                          <option value="biology">Biology</option>
                        </select>

                        <button
                          onClick={() => {
                            playRoboticTab();
                            setActiveTab('upload-paper');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PAPERS LIST */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                      <span>Showing {filteredPapers.length} of {papers.length} total active papers</span>
                      <span>Real-time Edit & Delete Actions</span>
                    </div>

                    {filteredPapers.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-[#091228] rounded-2xl border border-slate-800">
                        No papers found matching "{searchQuery}". Try clearing filters.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredPapers.map((p) => (
                          <div 
                            key={p.id}
                            className="p-3.5 rounded-2xl bg-[#091228] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1 truncate">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                                  {p.subjectNameEn}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                                  {p.year}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                                  {p.category}
                                </span>
                                {p.term && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                                    {p.term}
                                  </span>
                                )}
                              </div>

                              <h5 className="font-bold text-white text-sm truncate">
                                {p.titleEn}
                              </h5>
                              {p.titleTa && (
                                <p className="text-[11px] text-slate-400 font-tamil truncate">
                                  {p.titleTa}
                                </p>
                              )}
                              <p className="text-[11px] text-slate-500 font-mono truncate">
                                {p.schoolOrSource}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {/* Open Drive */}
                              <a
                                href={p.driveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-400 text-slate-400 transition-colors"
                                title="Open Drive Link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>

                              {/* Edit Paper Button */}
                              <button
                                onClick={() => {
                                  playRoboticClick();
                                  setEditingPaper(p);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                title="Edit Paper"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {/* Delete Paper Button */}
                              {onDeletePaper && (
                                <button
                                  onClick={() => {
                                    playRoboticClick();
                                    if (confirm(`Are you sure you want to permanently delete "${p.titleEn}"?`)) {
                                      onDeletePaper(p.id);
                                      showSuccess(`Paper "${p.titleEn}" deleted successfully.`);
                                    }
                                  }}
                                  className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                                  title="Delete Paper"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ADD NEW PAPER */}
              {activeTab === 'upload-paper' && (
                <form onSubmit={handlePaperSubmit} className="max-w-3xl space-y-4">
                  <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2 font-mono">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Publish live past papers, FWC term tests, resources, or pilot papers to the portal.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Category / Section <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={paperCategory}
                        onChange={(e) => setPaperCategory(e.target.value as ResourceCategory)}
                        className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                      >
                        <option value="past-papers">Past Papers Archive</option>
                        <option value="fwc-papers">FWC & Term Tests</option>
                        <option value="theory-notes">Resources (Theory & Books)</option>
                        <option value="pilot-papers">Other Pilot Papers</option>
                      </select>
                    </div>

                    {/* Stream */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Academic Stream
                      </label>
                      <select
                        value={paperStream}
                        onChange={(e) => {
                          const newStream = e.target.value as StreamId;
                          setPaperStream(newStream);
                          if (newStream === 'bio' && paperSubject === 'Combined Mathematics') {
                            setPaperSubject('Biology');
                          } else if (newStream === 'maths' && paperSubject === 'Biology') {
                            setPaperSubject('Combined Mathematics');
                          }
                        }}
                        className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      >
                        <option value="maths">Physical Science (Maths)</option>
                        <option value="bio">Biological Science (Bio)</option>
                        <option value="all">Common (All Streams)</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Subject
                      </label>
                      <select
                        value={paperSubject}
                        onChange={(e) => setPaperSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      >
                        {paperStream === 'bio' ? (
                          <>
                            <option value="Biology">Biology</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Physics">Physics</option>
                          </>
                        ) : paperStream === 'maths' ? (
                          <>
                            <option value="Combined Mathematics">Combined Mathematics</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                          </>
                        ) : (
                          <>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Combined Mathematics">Combined Mathematics</option>
                            <option value="Biology">Biology</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Year & Term/Pilot Tag */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Examination Year
                      </label>
                      <input
                        type="number"
                        min={1980}
                        max={2030}
                        value={paperYear}
                        onChange={(e) => setPaperYear(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        {paperCategory === 'fwc-papers' ? 'Term Test Tag' : paperCategory === 'pilot-papers' ? 'Pilot Provider' : 'Exam Session'}
                      </label>
                      {paperCategory === 'fwc-papers' ? (
                        <select
                          value={paperTerm}
                          onChange={(e) => setPaperTerm(e.target.value)}
                          className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                        >
                          <option value="1st Term">1st Term Examination</option>
                          <option value="2nd Term">2nd Term Examination</option>
                          <option value="3rd Term">3rd Term Examination</option>
                          <option value="4th Term">4th Term Examination</option>
                          <option value="5th Term">5th Term Examination</option>
                          <option value="6th Term">6th Term Examination</option>
                          <option value="All Island">All Island Evaluation</option>
                        </select>
                      ) : paperCategory === 'pilot-papers' ? (
                        <input
                          type="text"
                          value={paperPilotType}
                          onChange={(e) => setPaperPilotType(e.target.value)}
                          placeholder="e.g. Moratuwa University / Royal College / WP"
                          className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                        />
                      ) : (
                        <input
                          type="text"
                          value={paperTerm}
                          onChange={(e) => setPaperTerm(e.target.value)}
                          placeholder="e.g. National Exam / Final / Official"
                          className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                        />
                      )}
                    </div>
                  </div>

                  {/* Title En */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                      Paper Title (English) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={paperTitleEn}
                      onChange={(e) => setPaperTitleEn(e.target.value)}
                      placeholder={`e.g. G.C.E. A/L ${paperYear} ${paperSubject} Past Paper`}
                      className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Title Ta */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                      Paper Title (Tamil - Optional)
                    </label>
                    <input
                      type="text"
                      value={paperTitleTa}
                      onChange={(e) => setPaperTitleTa(e.target.value)}
                      placeholder="எ.கா: உயர்தர பௌதிகவியல் கடந்த கால வினாத்தாள்..."
                      className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-tamil"
                    />
                  </div>

                  {/* School / Source */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                      School, Institution or Authority
                    </label>
                    <input
                      type="text"
                      value={paperSource}
                      onChange={(e) => setPaperSource(e.target.value)}
                      placeholder="e.g. Department of Examinations / Hartley College / Royal College"
                      className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Google Drive Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-cyan-300 mb-1">
                        Question Paper Google Drive Link <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={paperDriveLink}
                        onChange={(e) => setPaperDriveLink(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">
                        Marking Scheme Drive Link (Optional)
                      </label>
                      <input
                        type="text"
                        value={paperSchemeLink}
                        onChange={(e) => setPaperSchemeLink(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish Paper Live to Paper Express</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: VIDEO LESSONS */}
              {activeTab === 'videos' && (
                <div className="space-y-6">
                  {/* Form to Add Video */}
                  <form onSubmit={handleVideoSubmit} className="max-w-3xl bg-[#091228] p-5 rounded-2xl border border-rose-500/30 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-300 font-mono">
                      <Video className="w-4 h-4 text-rose-400" />
                      <span>Upload New Video Masterclass (YouTube Link / ID)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                          Subject
                        </label>
                        <select
                          value={videoSubject}
                          onChange={(e) => setVideoSubject(e.target.value)}
                          className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none font-mono"
                        >
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Combined Mathematics">Combined Mathematics</option>
                          <option value="Biology">Biology</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                          Unit Number
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={videoUnitNumber}
                          onChange={(e) => setVideoUnitNumber(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                          Duration (Min)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={300}
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-rose-300 mb-1">
                        YouTube Link or 11-Character ID <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={videoYoutubeInput}
                        onChange={(e) => setVideoYoutubeInput(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or 11-char ID"
                        className="w-full px-3 py-2 bg-[#050A17] border border-rose-500/40 rounded-xl text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Lesson Title <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={videoTitleEn}
                        onChange={(e) => setVideoTitleEn(e.target.value)}
                        placeholder="e.g. Hydrodynamics Complete Formulas & Worked Problems"
                        className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish Video Lesson</span>
                    </button>
                  </form>

                  {/* Existing Videos List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider">
                      Active Video Lessons ({videos.length})
                    </h4>
                    <div className="space-y-2">
                      {videos.map((v) => (
                        <div key={v.id} className="p-3.5 rounded-2xl bg-[#091228] border border-slate-800 flex items-center justify-between gap-3 text-xs">
                          <div className="space-y-0.5 truncate">
                            <span className="font-bold text-white block truncate">{v.titleEn}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {v.subjectNameEn} · Unit {v.unitNumber} · Teacher: {v.teacherName} · YouTube: {v.youtubeId}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={v.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400"
                              title="Open on YouTube"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {onDeleteVideo && (
                              <button
                                onClick={() => {
                                  playRoboticClick();
                                  if (confirm(`Remove video "${v.titleEn}"?`)) {
                                    onDeleteVideo(v.id);
                                    showSuccess('Video lesson removed.');
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 cursor-pointer"
                                title="Delete Video"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: HELP DESK & REPORTS */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2 font-mono">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span>Real-time student feedback, error reports, and inquiries. Auto-expires in 3 days.</span>
                  </div>

                  {reports.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-[#091228] rounded-2xl border border-slate-800">
                      No active reports or inquiries at this time. All clear!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reports.map((r) => (
                        <div key={r.id} className="p-4 rounded-2xl bg-[#091228] border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{r.username || 'Anonymous Student'} {r.contactInfo ? `(${r.contactInfo})` : ''}</span>
                            <span className="text-[11px] text-cyan-300 font-mono">{r.category}</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{r.message}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                            <button
                              onClick={() => handleToggleReportResolve(r.id)}
                              className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold ${
                                r.resolved ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {r.resolved ? '✓ Resolved' : 'Pending Review'}
                            </button>
                            <button
                              onClick={() => handleDeleteReport(r.id)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SECURITY & URLS */}
              {activeTab === 'security' && (
                <div className="max-w-2xl space-y-5">
                  <div className="p-5 rounded-2xl bg-[#091228] border border-cyan-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-cyan-400" />
                      <h4 className="text-sm font-bold text-white">Direct Admin URL Route</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Whenever you enter your domain with <code className="bg-[#050A17] text-cyan-300 px-2 py-0.5 rounded-md font-mono border border-cyan-500/30">/#admin</code>, this Admin Panel opens immediately!
                    </p>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#050A17] border border-cyan-500/30 font-mono text-xs text-cyan-300">
                      <span className="flex-1 truncate">https://paperexpress.vercel.app/#admin</span>
                      <button
                        onClick={copyDirectAdminUrl}
                        className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedDirectUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedDirectUrl ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#091228] border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-amber-400" />
                      <h4 className="text-sm font-bold text-white">Master Passcodes</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      You can log in anytime using your Google account (<strong className="text-cyan-300">asmanlinzy44@gmail.com</strong>) or using any of these preset passcodes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {VALID_PASSCODES.map((code) => (
                        <span key={code} className="px-3 py-1 rounded-lg bg-[#050A17] border border-slate-700 font-mono text-xs text-amber-300">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#091228] border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-cyan-400" />
                      <h4 className="text-sm font-bold text-white">Database & Synchronization</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All newly added papers, edits, and deletions synchronize in real-time with Google Cloud Firestore (<code className="text-cyan-300">papers</code> collection) and your browser's persistent cache.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
};
