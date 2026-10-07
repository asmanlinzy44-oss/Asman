import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ShieldCheck, MessageSquare, FileText, Video, 
  Trash2, Plus, CheckCircle, ExternalLink, Calendar, 
  Clock, AlertTriangle, Upload, LogOut, Check, Edit3, 
  Search, Filter, Lock, KeyRound, Eye, EyeOff, Save,
  RefreshCw, Database, Shield, BookOpen, Layers, ArrowLeft,
  Copy, Award, CheckCircle2, ChevronRight, MessageCircle, 
  Send, CheckCheck, Megaphone, FolderGit2, Sparkles, Folder
} from 'lucide-react';
import { collection, onSnapshot, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { PaperResource, VideoLesson, UserReport, StreamId, ResourceCategory, User } from '../types';
import { extractYoutubeId } from '../utils/drive';
import { cleanFirestoreData } from '../utils/firestoreClean';
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
  siteAnnouncement?: { active: boolean; text: string; type: 'info' | 'alert' | 'success' };
  onUpdateSiteAnnouncement?: (announcement: { active: boolean; text: string; type: 'info' | 'alert' | 'success' }) => void;
  vaultDriveLinks?: Record<string, string>;
  onUpdateVaultDriveLinks?: (links: Record<string, string>) => void;
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
  siteAnnouncement = { active: false, text: '', type: 'info' },
  onUpdateSiteAnnouncement,
  vaultDriveLinks = {},
  onUpdateVaultDriveLinks,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'papers' | 'resources' | 'videos' | 'reports' | 'announcement' | 'publish' | 'security'>('papers');
  const [reports, setReports] = useState<UserReport[]>([]);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Authentication Gate State
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Papers Tab: Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Currently Editing Paper
  const [editingPaper, setEditingPaper] = useState<PaperResource | null>(null);

  // Publish Form Type: Paper, Resource Note, Pilot Paper, or Video
  const [publishType, setPublishType] = useState<'paper' | 'resource' | 'pilot' | 'video'>('paper');

  // Unified Publish Form State
  const [itemSubject, setItemSubject] = useState('Physics');
  const [itemStream, setItemStream] = useState<StreamId>('maths');
  const [itemYear, setItemYear] = useState<number>(2026);
  const [itemTitleEn, setItemTitleEn] = useState('');
  const [itemTitleTa, setItemTitleTa] = useState('');
  const [itemDriveLink, setItemDriveLink] = useState('');
  const [itemSchemeLink, setItemSchemeLink] = useState('');
  const [itemSource, setItemSource] = useState('Department of Examinations, Sri Lanka');
  const [itemTerm, setItemTerm] = useState('All Island');
  const [itemPilotType, setItemPilotType] = useState('Moratuwa University');
  const [itemUnitOrTopic, setItemUnitOrTopic] = useState('');

  // Video Specific Form State
  const [videoUnitNumber, setVideoUnitNumber] = useState<number>(1);
  const [videoUnitName, setVideoUnitName] = useState('Unit 01 - Measurement');
  const [videoTeacher, setVideoTeacher] = useState('Asman Linzy');
  const [videoDuration, setVideoDuration] = useState<number>(45);
  const [videoYoutubeInput, setVideoYoutubeInput] = useState('');

  // Resource Vault Drive Links Form State
  const [vaultPhysics, setVaultPhysics] = useState(vaultDriveLinks['physics'] || '');
  const [vaultChemistry, setVaultChemistry] = useState(vaultDriveLinks['chemistry'] || '');
  const [vaultMaths, setVaultMaths] = useState(vaultDriveLinks['c-maths'] || '');
  const [vaultBiology, setVaultBiology] = useState(vaultDriveLinks['biology'] || '');

  // Announcement Form State
  const [announceActive, setAnnounceActive] = useState(siteAnnouncement.active);
  const [announceText, setAnnounceText] = useState(siteAnnouncement.text);
  const [announceType, setAnnounceType] = useState<'info' | 'alert' | 'success'>(siteAnnouncement.type);

  // Direct URL copy feedback
  const [copiedDirectUrl, setCopiedDirectUrl] = useState(false);

  // Sync vault links local state when props change
  useEffect(() => {
    setVaultPhysics(vaultDriveLinks['physics'] || '');
    setVaultChemistry(vaultDriveLinks['chemistry'] || '');
    setVaultMaths(vaultDriveLinks['c-maths'] || '');
    setVaultBiology(vaultDriveLinks['biology'] || '');
  }, [vaultDriveLinks]);

  // Sync announcement local state when props change
  useEffect(() => {
    setAnnounceActive(siteAnnouncement.active);
    setAnnounceText(siteAnnouncement.text);
    setAnnounceType(siteAnnouncement.type);
  }, [siteAnnouncement]);

  // Real-time WhatsApp-style Inquiries listener from Cloud Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inquiries'), (snap) => {
      const inqList: UserReport[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          username: d.name || d.username || 'Student',
          contactInfo: d.contactInfo || d.email || undefined,
          category: d.category || d.subject || 'General Inquiry',
          message: d.message || '',
          createdAt: typeof d.createdAt === 'number' ? d.createdAt : (d.timestamp ? new Date(d.timestamp).getTime() : Date.now()),
          resolved: !!d.resolved,
        };
      });

      inqList.sort((a, b) => b.createdAt - a.createdAt);
      setReports(inqList);
    }, (err) => {
      console.warn('Inquiries live sync notice:', err);
    });

    return () => unsub();
  }, []);

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

  // Delete Inquiry
  const handleDeleteReport = async (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      showSuccess('Student message deleted from cloud database.');
    } catch (err) {
      console.warn('Inquiry delete error:', err);
    }
  };

  // Toggle Inquiry status
  const handleToggleReportResolve = async (id: string) => {
    const target = reports.find((r) => r.id === id);
    const newStatus = target ? !target.resolved : true;
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, resolved: newStatus } : r));

    try {
      await updateDoc(doc(db, 'inquiries', id), { resolved: newStatus });
      showSuccess(newStatus ? 'Message marked as resolved.' : 'Message marked as pending review.');
    } catch (err) {
      console.warn('Inquiry update error:', err);
    }
  };

  // Save Subject Master Vault Links
  const handleSaveVaultLinks = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateVaultDriveLinks) {
      onUpdateVaultDriveLinks({
        physics: vaultPhysics.trim(),
        chemistry: vaultChemistry.trim(),
        'c-maths': vaultMaths.trim(),
        biology: vaultBiology.trim(),
      });
      showSuccess('Master Subject Vault Drive Links updated live across all 4 subjects!');
    }
  };

  // Save Site Announcement Banner
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSiteAnnouncement) {
      onUpdateSiteAnnouncement({
        active: announceActive,
        text: announceText.trim(),
        type: announceType,
      });
      showSuccess('Live Announcement Banner broadcasted across the website!');
    }
  };

  // Handle Publish Submit
  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subjectIdMap: Record<string, string> = {
      'Physics': 'sub-physics',
      'Chemistry': 'sub-chemistry',
      'Combined Mathematics': 'sub-combined-maths',
      'Biology': 'sub-biology',
    };

    if (publishType === 'video') {
      const cleanId = extractYoutubeId(videoYoutubeInput.trim());
      if (!cleanId || cleanId.length < 5) {
        alert('Please enter a valid YouTube Video URL or 11-character Video ID.');
        return;
      }

      const newVideo: VideoLesson = {
        id: 'custom_vid_' + Date.now(),
        titleEn: itemTitleEn.trim() || `${itemSubject} Unit ${videoUnitNumber} Masterclass`,
        stream: itemStream,
        subjectId: subjectIdMap[itemSubject] || 'sub-physics',
        subjectNameEn: itemSubject,
        unitNumber: Number(videoUnitNumber),
        unitNameEn: videoUnitName.trim() || `Unit ${videoUnitNumber}`,
        youtubeUrl: `https://www.youtube.com/watch?v=${cleanId}`,
        youtubeId: cleanId,
        durationMinutes: Number(videoDuration) || 45,
        teacherName: videoTeacher.trim() || 'Asman Linzy',
        descriptionEn: 'Full syllabus masterclass with derivations and exam questions.',
        isUnlisted: false,
        chapters: [
          { time: '00:00', seconds: 0, title: 'Introduction & Core Concepts' },
          { time: '15:00', seconds: 900, title: 'Formulas & Derivations' },
          { time: '30:00', seconds: 1800, title: 'Past Paper Questions' },
        ],
        viewsCount: 1,
        uploadedAt: 'Today',
      };

      onAddVideo(newVideo);
      showSuccess(`Video lesson "${newVideo.titleEn}" published live to cloud database!`);
      setItemTitleEn('');
      setVideoYoutubeInput('');
      setActiveTab('videos');
      return;
    }

    // Otherwise paper / resource / pilot
    if (!itemDriveLink.trim()) {
      alert('Please enter a valid Google Drive link for the material.');
      return;
    }

    let assignedCategory: ResourceCategory = 'past-papers';
    if (publishType === 'resource') {
      assignedCategory = 'theory-notes';
    } else if (publishType === 'pilot') {
      assignedCategory = 'pilot-papers';
    } else {
      assignedCategory = itemTerm !== 'All Island' ? 'fwc-papers' : 'past-papers';
    }

    const newPaper: PaperResource = {
      id: 'custom_res_' + Date.now(),
      titleEn: itemTitleEn.trim() || `G.C.E. A/L ${itemYear} ${itemSubject} ${assignedCategory === 'theory-notes' ? 'Resource Notes' : 'Examination Paper'}`,
      titleTa: itemTitleTa.trim() || undefined,
      category: assignedCategory,
      stream: itemStream,
      subjectId: subjectIdMap[itemSubject] || 'sub-physics',
      subjectNameEn: itemSubject,
      year: Number(itemYear),
      term: assignedCategory === 'fwc-papers' ? itemTerm : undefined,
      pilotType: assignedCategory === 'pilot-papers' ? (itemPilotType.trim() || 'Moratuwa University') : undefined,
      schoolOrSource: itemSource.trim() || (assignedCategory === 'pilot-papers' ? (itemPilotType.trim() || 'University of Moratuwa') : 'Department of Examinations, Sri Lanka'),
      driveLink: itemDriveLink.trim(),
      markingSchemeDriveLink: itemSchemeLink.trim() || itemDriveLink.trim(),
      fileSize: 'PDF Document',
      downloadsCount: 1,
      unitOrTopic: itemUnitOrTopic.trim() || undefined,
    };

    onAddPaper(newPaper);
    showSuccess(`Published "${newPaper.titleEn}" live to cloud database for all visitors!`);

    // Reset fields
    setItemTitleEn('');
    setItemTitleTa('');
    setItemDriveLink('');
    setItemSchemeLink('');
    setItemUnitOrTopic('');
    if (publishType === 'resource') {
      setActiveTab('resources');
    } else {
      setActiveTab('papers');
    }
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
    showSuccess(`Updated "${editingPaper.titleEn}" live in cloud database for all visitors!`);
    setEditingPaper(null);
  };

  // Filtered Exam Papers (Excludes pure theory-notes/useful-resources to avoid clutter)
  const examPapers = useMemo(() => {
    if (!Array.isArray(papers)) return [];
    return papers.filter((p) => p && p.category !== 'theory-notes' && p.category !== 'useful-resources');
  }, [papers]);

  // Filtered Academic Resources (Theory Notes, Booklets)
  const academicResources = useMemo(() => {
    if (!Array.isArray(papers)) return [];
    return papers.filter((p) => p && (p.category === 'theory-notes' || p.category === 'useful-resources'));
  }, [papers]);

  // Filtered papers for Papers Tab
  const filteredPapers = useMemo(() => {
    return examPapers.filter((p) => {
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
        const sEn = (p.subjectNameEn || '').toLowerCase();
        const src = (p.schoolOrSource || '').toLowerCase();
        const yr = String(p.year || '');
        return tEn.includes(q) || sEn.includes(q) || src.includes(q) || yr.includes(q);
      }
      return true;
    });
  }, [examPapers, filterCategory, filterSubject, searchQuery]);

  const copyDirectAdminUrl = () => {
    const url = 'https://paperexpress.vercel.app/#admin';
    navigator.clipboard.writeText(url);
    setCopiedDirectUrl(true);
    setTimeout(() => setCopiedDirectUrl(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 google-anno-skip">
      <div 
        className="w-full max-w-5xl bg-[#070D1E] rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col h-[94vh] sm:h-[88vh] overflow-hidden animate-in zoom-in-95 duration-200 google-anno-skip"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-[#0B1528] via-[#091A38] to-[#0B1528] border-b border-cyan-500/20 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
                  <span>Paper Express Master Control</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                  /#admin
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" /> Live Cloud
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Full site control: Exam Papers, Subject Vaults, Resources, Video Lessons, Announcements & Student Chat
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
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Log Out Admin Session"
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
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer border border-slate-700"
              title="Close Console"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTHENTICATION GATE (When not logged in) */}
        {!isAdminLoggedIn ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex items-center justify-center">
            <div className="max-w-md w-full bg-[#091228] p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-black text-white tracking-tight">Administrator Verification</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enter your master passcode or sign in with your verified administrator Google account.
                </p>
              </div>

              {passcodeError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  {passcodeError}
                </div>
              )}

              <form onSubmit={handlePasscodeUnlock} className="space-y-4">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    required
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="Enter admin passcode (e.g. admin2026 / asman44)..."
                    className="w-full pl-10 pr-10 py-3 bg-[#050A17] border border-cyan-500/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isVerifying ? 'Verifying...' : 'Unlock Admin Console'}</span>
                </button>
              </form>

              {onGoogleLogin && (
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      playRoboticClick();
                      onGoogleLogin();
                    }}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 p-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                      <svg className="w-full h-full" viewBox="0 0 24 24">
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
                    </div>
                    <span>Sign in with Admin Google Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navigation Tabs Bar */}
            <div className="bg-[#050B17] px-4 sm:px-6 border-b border-cyan-500/20 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => {
                    playRoboticTab();
                    setActiveTab('papers');
                    setEditingPaper(null);
                  }}
                  className={`px-3 sm:px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'papers'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Exam Papers ({examPapers.length})</span>
                </button>

                <button
                  onClick={() => {
                    playRoboticTab();
                    setActiveTab('resources');
                    setEditingPaper(null);
                  }}
                  className={`px-3 sm:px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'resources'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Resources & Vaults ({academicResources.length})</span>
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
                      ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Student Chat ({reports.length})</span>
                  {reports.filter(r => !r.resolved).length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => {
                    playRoboticTab();
                    setActiveTab('announcement');
                    setEditingPaper(null);
                  }}
                  className={`px-3 sm:px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'announcement'
                      ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Live Notice</span>
                </button>

                <button
                  onClick={() => {
                    playRoboticTab();
                    setActiveTab('publish');
                    setEditingPaper(null);
                  }}
                  className={`px-3.5 sm:px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'publish'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-cyan-400 hover:text-cyan-200'
                  }`}
                >
                  <Plus className="w-4 h-4 text-cyan-300" />
                  <span>Publish Content</span>
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
            </div>

            {/* SUCCESS BANNER */}
            {successBanner && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in slide-in-from-top-2 shrink-0">
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* TAB 1: ALL EXAM PAPERS (Past Papers, FWC, Pilot Papers) */}
              {activeTab === 'papers' && (
                <div className="space-y-4">
                  {/* EDIT PAPER MODAL VIEW */}
                  {editingPaper && (
                    <div className="bg-[#091228] border-2 border-cyan-500/50 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingPaper(null)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
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
                      </div>

                      <form onSubmit={handleSaveEditedPaper} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Title (English)</label>
                            <input
                              type="text"
                              required
                              value={editingPaper.titleEn}
                              onChange={(e) => setEditingPaper({ ...editingPaper, titleEn: e.target.value })}
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Subject</label>
                            <input
                              type="text"
                              value={editingPaper.subjectNameEn}
                              onChange={(e) => setEditingPaper({ ...editingPaper, subjectNameEn: e.target.value })}
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Exam Year</label>
                            <input
                              type="number"
                              value={editingPaper.year}
                              onChange={(e) => setEditingPaper({ ...editingPaper, year: Number(e.target.value) })}
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-mono font-bold text-cyan-300 mb-1">Question Paper Drive Link *</label>
                            <input
                              type="text"
                              required
                              value={editingPaper.driveLink}
                              onChange={(e) => setEditingPaper({ ...editingPaper, driveLink: e.target.value })}
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/40 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">Marking Scheme Link</label>
                            <input
                              type="text"
                              value={editingPaper.markingSchemeDriveLink || ''}
                              onChange={(e) => setEditingPaper({ ...editingPaper, markingSchemeDriveLink: e.target.value })}
                              className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/40 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => setEditingPaper(null)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Live Changes</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

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
                          className="w-full pl-9 pr-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-cyan-300 focus:outline-none font-mono"
                        >
                          <option value="all">All Exam Categories</option>
                          <option value="past-papers">National Past Papers</option>
                          <option value="fwc-papers">FWC & Term Tests</option>
                          <option value="pilot-papers">Pilot Papers</option>
                        </select>

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
                            setActiveTab('publish');
                            setPublishType('paper');
                          }}
                          className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Paper</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Showing {filteredPapers.length} of {examPapers.length} active examination papers</span>
                      <span className="text-cyan-400">Live Cloud Synced</span>
                    </div>
                  </div>

                  {/* PAPERS LIST */}
                  <div className="space-y-2">
                    {filteredPapers.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-[#091228] rounded-2xl border border-slate-800">
                        No papers found matching the filter criteria.
                      </div>
                    ) : (
                      filteredPapers.map((p) => (
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

                            <h5 className="font-bold text-white text-sm truncate">{p.titleEn}</h5>
                            <p className="text-[11px] text-slate-400 font-mono truncate">{p.schoolOrSource}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <a
                              href={p.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 text-slate-400 transition-colors"
                              title="Open Drive Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>

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

                            {onDeletePaper && (
                              <button
                                onClick={() => {
                                  playRoboticClick();
                                  if (confirm(`Are you sure you want to permanently delete "${p.titleEn}"?`)) {
                                    onDeletePaper(p.id);
                                    showSuccess(`Paper "${p.titleEn}" deleted from live database.`);
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
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ACADEMIC RESOURCES & VAULTS (Resources Page Control) */}
              {activeTab === 'resources' && (
                <div className="space-y-6">
                  {/* Master Subject Vaults Drive Link Manager */}
                  <form onSubmit={handleSaveVaultLinks} className="bg-[#091228] p-5 sm:p-6 rounded-3xl border border-blue-500/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-5 h-5 text-blue-400" />
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-white">4 Main Subjects Master Vaults (Resources Page)</h4>
                          <p className="text-xs text-slate-400">Control the Google Drive All-in-One Master folders for each of the 4 science subjects.</p>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Vault Links</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-mono font-bold text-blue-300 mb-1">
                          Physics All-in-One Vault Drive Link
                        </label>
                        <input
                          type="text"
                          value={vaultPhysics}
                          onChange={(e) => setVaultPhysics(e.target.value)}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="w-full px-3 py-2 bg-[#050A17] border border-blue-500/30 rounded-xl text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-mono font-bold text-emerald-300 mb-1">
                          Chemistry All-in-One Vault Drive Link
                        </label>
                        <input
                          type="text"
                          value={vaultChemistry}
                          onChange={(e) => setVaultChemistry(e.target.value)}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="w-full px-3 py-2 bg-[#050A17] border border-emerald-500/30 rounded-xl text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-mono font-bold text-purple-300 mb-1">
                          Combined Mathematics All-in-One Vault Drive Link
                        </label>
                        <input
                          type="text"
                          value={vaultMaths}
                          onChange={(e) => setVaultMaths(e.target.value)}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="w-full px-3 py-2 bg-[#050A17] border border-purple-500/30 rounded-xl text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-mono font-bold text-rose-300 mb-1">
                          Biology All-in-One Vault Drive Link
                        </label>
                        <input
                          type="text"
                          value={vaultBiology}
                          onChange={(e) => setVaultBiology(e.target.value)}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="w-full px-3 py-2 bg-[#050A17] border border-rose-500/30 rounded-xl text-white font-mono"
                        />
                      </div>
                    </div>
                  </form>

                  {/* Uploaded Resource Booklets / Theory Notes List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-bold text-white">Custom Uploaded Resource Notes & Booklets ({academicResources.length})</h4>
                      </div>
                      <button
                        onClick={() => {
                          playRoboticTab();
                          setActiveTab('publish');
                          setPublishType('resource');
                        }}
                        className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload New Resource Note</span>
                      </button>
                    </div>

                    {academicResources.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-[#091228] rounded-2xl border border-slate-800">
                        No custom resource notes uploaded yet. Click "Upload New Resource Note" above to add notes, formulas, or practical booklets.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {academicResources.map((res) => (
                          <div key={res.id} className="p-3.5 rounded-2xl bg-[#091228] border border-slate-800 flex items-center justify-between gap-3 text-xs">
                            <div className="space-y-1 truncate">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                                  {res.subjectNameEn}
                                </span>
                                <span className="text-slate-400 font-mono text-[10px]">{res.year || 2025}</span>
                              </div>
                              <h5 className="font-bold text-white truncate">{res.titleEn}</h5>
                              <p className="text-[11px] text-slate-500 truncate">{res.schoolOrSource}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={res.driveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-400"
                                title="Open Drive Link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              {onDeletePaper && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete resource note "${res.titleEn}"?`)) {
                                      onDeletePaper(res.id);
                                      showSuccess('Resource note deleted from live database.');
                                    }
                                  }}
                                  className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 cursor-pointer"
                                  title="Delete Resource Note"
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

              {/* TAB 3: VIDEO LESSONS (Videos Page Control) */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-rose-400" />
                      <h4 className="text-sm font-bold text-white">Active Video Masterclasses ({videos.length})</h4>
                    </div>
                    <button
                      onClick={() => {
                        playRoboticTab();
                        setActiveTab('publish');
                        setPublishType('video');
                      }}
                      className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload New Video</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {videos.map((v) => (
                      <div key={v.id} className="p-3.5 rounded-2xl bg-[#091228] border border-slate-800 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-1 truncate">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                              {v.subjectNameEn}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">Unit {v.unitNumber} · {v.durationMinutes} mins</span>
                          </div>
                          <h5 className="font-bold text-white truncate">{v.titleEn}</h5>
                          <p className="text-[11px] text-slate-500 font-mono">Teacher: {v.teacherName} · ID: {v.youtubeId}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={v.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400"
                            title="Open on YouTube"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          {onDeleteVideo && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove video "${v.titleEn}"?`)) {
                                  onDeleteVideo(v.id);
                                  showSuccess('Video lesson removed from live database.');
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 cursor-pointer"
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
              )}

              {/* TAB 4: HELP DESK / STUDENT MESSAGES (WhatsApp-style Inbox) */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between gap-2 font-mono">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>Live WhatsApp-style Student Inquiries Inbox & Help Desk (Real-time Cloud Sync)</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      {reports.filter(r => !r.resolved).length} Pending
                    </span>
                  </div>

                  {reports.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-500 bg-[#091228] rounded-2xl border border-slate-800 space-y-2">
                      <MessageCircle className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="font-bold text-slate-400">No active student messages at this moment.</p>
                      <p className="text-[11px] text-slate-600">When any student submits "Contact Us" on your website, it appears here in real-time instantly!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((r) => {
                        const cleanPhone = (r.contactInfo || '').replace(/[^0-9+]/g, '');
                        const hasPhone = cleanPhone.length >= 7;
                        const isEmail = (r.contactInfo || '').includes('@');

                        return (
                          <div 
                            key={r.id} 
                            className={`p-4 rounded-2xl border transition-all space-y-3 ${
                              r.resolved 
                                ? 'bg-[#091228]/80 border-slate-800 opacity-75' 
                                : 'bg-gradient-to-br from-[#091828] via-[#091228] to-[#07151f] border-emerald-500/40 shadow-[0_4px_20px_rgba(16,185,129,0.06)]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                                  {(r.username || 'S').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-white text-sm">
                                      {r.username || 'Anonymous Student'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-800/50">
                                      {r.category}
                                    </span>
                                    {r.resolved ? (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-800/50 flex items-center gap-1">
                                        <CheckCheck className="w-3 h-3" /> Resolved
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 text-[10px] font-mono border border-amber-800/50 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> New Message
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                    {r.contactInfo ? r.contactInfo : 'No contact provided'} · {new Date(r.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {hasPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                                    title="Reply directly on WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">WhatsApp</span>
                                  </a>
                                )}
                                {isEmail && (
                                  <a
                                    href={`mailto:${r.contactInfo}?subject=Paper Express Reply: ${r.category}`}
                                    className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                                    title="Reply via Email"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Email</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#050B17] border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                              {r.message}
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                              <button
                                onClick={() => handleToggleReportResolve(r.id)}
                                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                  r.resolved 
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                                    : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40'
                                }`}
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>{r.resolved ? 'Mark as Unresolved' : 'Mark as Resolved'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm('Delete this message from cloud database?')) {
                                    handleDeleteReport(r.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer"
                                title="Delete student message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: LIVE SITE ANNOUNCEMENT BANNER */}
              {activeTab === 'announcement' && (
                <form onSubmit={handleSaveAnnouncement} className="max-w-2xl bg-[#091228] p-5 sm:p-6 rounded-3xl border border-amber-500/30 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Megaphone className="w-5 h-5" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white">Live Site Notice & Announcement Bar</h4>
                      <p className="text-xs text-slate-400">Broadcast an immediate notification banner at the very top of Paper Express for all students.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#050A17] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-300">Show Announcement to Visitors</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={announceActive}
                          onChange={(e) => setAnnounceActive(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Notice Banner Style</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setAnnounceType('info')}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            announceType === 'info' ? 'bg-blue-600 text-white border-blue-400' : 'bg-[#091228] text-slate-400 border-slate-800'
                          }`}
                        >
                          Blue Info
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnnounceType('alert')}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            announceType === 'alert' ? 'bg-rose-600 text-white border-rose-400' : 'bg-[#091228] text-slate-400 border-slate-800'
                          }`}
                        >
                          Rose Alert
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnnounceType('success')}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            announceType === 'success' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-[#091228] text-slate-400 border-slate-800'
                          }`}
                        >
                          Green Success
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Announcement Text
                      </label>
                      <textarea
                        rows={3}
                        value={announceText}
                        onChange={(e) => setAnnounceText(e.target.value)}
                        placeholder="e.g. ⚡ 2024 Pilot Papers have been uploaded! Check the Pilot Papers tab."
                        className="w-full px-3 py-2 bg-[#091228] border border-cyan-500/30 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Broadcast Live Announcement</span>
                  </button>
                </form>
              )}

              {/* TAB 6: UNIFIED PUBLISH WIZARD */}
              {activeTab === 'publish' && (
                <div className="max-w-3xl space-y-5">
                  {/* Segmented Option Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#050A17] border border-cyan-500/30 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setPublishType('paper')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        publishType === 'paper' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Exam Paper</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPublishType('resource')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        publishType === 'resource' ? 'bg-purple-600 text-white font-black shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Resource Note</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPublishType('pilot')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        publishType === 'pilot' ? 'bg-indigo-600 text-white font-black shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pilot Paper</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPublishType('video')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        publishType === 'video' ? 'bg-rose-500 text-white font-black shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Video Lesson</span>
                    </button>
                  </div>

                  {/* Form Body */}
                  <form onSubmit={handlePublishSubmit} className="bg-[#091228] p-5 sm:p-6 rounded-3xl border border-cyan-500/30 space-y-4">
                    <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold">
                      <Plus className="w-4 h-4" />
                      <span>
                        {publishType === 'paper' && 'Publish New Examination Paper (Past Paper / Term Test)'}
                        {publishType === 'resource' && 'Publish New Academic Resource / Theory Booklet (Resources Page)'}
                        {publishType === 'pilot' && 'Publish New Pilot Examination Paper'}
                        {publishType === 'video' && 'Publish New YouTube Video Masterclass'}
                      </span>
                    </div>

                    {/* Common Metadata Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Subject</label>
                        <select
                          value={itemSubject}
                          onChange={(e) => setItemSubject(e.target.value)}
                          className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white font-mono"
                        >
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Combined Mathematics">Combined Mathematics</option>
                          <option value="Biology">Biology</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Stream</label>
                        <select
                          value={itemStream}
                          onChange={(e) => setItemStream(e.target.value as StreamId)}
                          className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white font-mono"
                        >
                          <option value="maths">Physical Science (Maths)</option>
                          <option value="bio">Biological Science (Bio)</option>
                          <option value="all">All Science Streams</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Year</label>
                        <input
                          type="number"
                          value={itemYear}
                          onChange={(e) => setItemYear(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Title (English) <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={itemTitleEn}
                        onChange={(e) => setItemTitleEn(e.target.value)}
                        placeholder="e.g. 2024 Combined Maths All-Island Pilot Exam Paper"
                        className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white"
                      />
                    </div>

                    {/* Conditional Fields based on publishType */}
                    {publishType === 'paper' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Exam Term</label>
                          <select
                            value={itemTerm}
                            onChange={(e) => setItemTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white font-mono"
                          >
                            <option value="All Island">All Island National Past Paper</option>
                            <option value="FWC Pilot">FWC Pilot Exam (Thondaimanaru)</option>
                            <option value="1st Term">1st Term Examination</option>
                            <option value="2nd Term">2nd Term Examination</option>
                            <option value="3rd Term">3rd Term Examination</option>
                            <option value="Trial Exam">Trial / Final Model Exam</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Institution / Authority</label>
                          <input
                            type="text"
                            value={itemSource}
                            onChange={(e) => setItemSource(e.target.value)}
                            placeholder="e.g. Department of Examinations / Royal College"
                            className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>
                    )}

                    {publishType === 'pilot' && (
                      <div>
                        <label className="block text-xs font-mono font-bold text-indigo-300 mb-1">Pilot Organization / University</label>
                        <input
                          type="text"
                          value={itemPilotType}
                          onChange={(e) => setItemPilotType(e.target.value)}
                          placeholder="e.g. Moratuwa University / Colombo Hindu College / GMSA Ampara"
                          className="w-full px-3 py-2 bg-[#050A17] border border-indigo-500/30 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                    )}

                    {publishType === 'video' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Unit Number</label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={videoUnitNumber}
                              onChange={(e) => setVideoUnitNumber(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-[#050A17] border border-rose-500/30 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Duration (Min)</label>
                            <input
                              type="number"
                              value={videoDuration}
                              onChange={(e) => setVideoDuration(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-[#050A17] border border-rose-500/30 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Teacher Name</label>
                            <input
                              type="text"
                              value={videoTeacher}
                              onChange={(e) => setVideoTeacher(e.target.value)}
                              className="w-full px-3 py-2 bg-[#050A17] border border-rose-500/30 rounded-xl text-xs text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-rose-300 mb-1">
                            YouTube URL or 11-Character Video ID <span className="text-rose-400">*</span>
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
                      </div>
                    ) : (
                      /* Drive Links for Paper / Resource / Pilot */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono font-bold text-cyan-300 mb-1">
                            Google Drive Document Link <span className="text-cyan-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={itemDriveLink}
                            onChange={(e) => setItemDriveLink(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/40 rounded-xl text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">
                            Marking Scheme Link (Optional)
                          </label>
                          <input
                            type="text"
                            value={itemSchemeLink}
                            onChange={(e) => setItemSchemeLink(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full px-3 py-2 bg-[#050A17] border border-emerald-500/40 rounded-xl text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Publish Live to All Website Visitors</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 7: SECURITY & SETTINGS */}
              {activeTab === 'security' && (
                <div className="max-w-2xl space-y-5">
                  <div className="p-5 rounded-2xl bg-[#091228] border border-cyan-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-cyan-400" />
                      <h4 className="text-sm font-bold text-white">Direct Admin URL Access</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All buttons and links have been removed from the visible website. This Admin Console is exclusively accessible by appending <code className="bg-[#050A17] text-cyan-300 px-2 py-0.5 rounded-md font-mono border border-cyan-500/30">/#admin</code> to your URL.
                    </p>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#050A17] border border-cyan-500/30 font-mono text-xs text-cyan-300">
                      <span className="flex-1 truncate">https://paperexpress.vercel.app/#admin</span>
                      <button
                        onClick={copyDirectAdminUrl}
                        className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedDirectUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedDirectUrl ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#091228] border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">Cloud Database Real-time Status</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Google Cloud Firestore is connected with real-time listeners (<code className="text-cyan-300 font-mono">onSnapshot</code>). Any changes made in this panel are broadcasted instantly across all phones and computers worldwide.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-[#050A17] border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Exam Papers</span>
                        <span className="font-bold text-cyan-400 text-sm">{examPapers.length}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#050A17] border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Resources</span>
                        <span className="font-bold text-purple-400 text-sm">{academicResources.length}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#050A17] border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Videos</span>
                        <span className="font-bold text-rose-400 text-sm">{videos.length}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#050A17] border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Inquiries</span>
                        <span className="font-bold text-emerald-400 text-sm">{reports.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
