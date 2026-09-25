import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, MessageSquare, FileText, Video, 
  Trash2, Plus, CheckCircle, ExternalLink, Calendar, 
  Clock, AlertTriangle, Sparkles, Upload, LogOut, Check
} from 'lucide-react';
import { PaperResource, VideoLesson, UserReport, StreamId, ResourceCategory } from '../types';
import { extractYoutubeId } from '../utils/drive';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onAddPaper: (paper: PaperResource) => void;
  onAddVideo: (video: VideoLesson) => void;
  papers: PaperResource[];
  videos: VideoLesson[];
  onDeletePaper?: (paperId: string) => void;
  onDeleteVideo?: (videoId: string) => void;
}

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  onAddPaper,
  onAddVideo,
  papers,
  videos,
  onDeletePaper,
  onDeleteVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'upload-paper' | 'upload-video' | 'manage'>('reports');
  const [reports, setReports] = useState<UserReport[]>([]);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Paper Form State
  const [paperSubject, setPaperSubject] = useState('Physics');
  const [paperStream, setPaperStream] = useState<StreamId>('maths');
  const [paperCategory, setPaperCategory] = useState<ResourceCategory>('past-papers');
  const [paperYear, setPaperYear] = useState<number>(2026);
  const [paperTitleEn, setPaperTitleEn] = useState('');
  const [paperDriveLink, setPaperDriveLink] = useState('');
  const [paperSchemeLink, setPaperSchemeLink] = useState('');
  const [paperSource, setPaperSource] = useState('Department of Examinations, Sri Lanka');
  const [paperTerm, setPaperTerm] = useState('All Island');

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

  // Load and auto-purge user reports (max 3 days retention)
  const refreshReports = () => {
    try {
      const raw = localStorage.getItem('studypro_user_reports');
      const all: UserReport[] = raw ? JSON.parse(raw) : [];
      const now = Date.now();
      // Keep only reports created within the last 3 days
      const valid = all.filter((r) => now - r.createdAt < THREE_DAYS_MS);

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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
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
      'Information & Comm. Tech (ICT)': 'sub-ict',
      'Agricultural Science': 'sub-agri',
    };

    const newPaper: PaperResource = {
      id: 'custom_paper_' + Date.now(),
      titleEn: paperTitleEn.trim() || `G.C.E. A/L ${paperYear} ${paperSubject} Examination Paper`,
      category: paperCategory,
      stream: paperStream,
      subjectId: subjectIdMap[paperSubject] || 'sub-physics',
      subjectNameEn: paperSubject,
      year: Number(paperYear),
      term: paperCategory === 'fwc-papers' ? paperTerm : undefined,
      schoolOrSource: paperSource.trim() || 'Department of Examinations, Sri Lanka',
      driveLink: paperDriveLink.trim(),
      markingSchemeDriveLink: paperSchemeLink.trim() || paperDriveLink.trim(),
      fileSize: 'PDF Document',
      downloadsCount: 1,
    };

    onAddPaper(newPaper);
    showSuccess(`Paper "${newPaper.titleEn}" published live successfully!`);

    // Reset fields
    setPaperTitleEn('');
    setPaperDriveLink('');
    setPaperSchemeLink('');
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
      'Information & Comm. Tech (ICT)': 'sub-ict',
      'Agricultural Science': 'sub-agri',
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
  };

  const formatExpiryTime = (createdAt: number) => {
    const elapsed = Date.now() - createdAt;
    const remainingMs = Math.max(0, THREE_DAYS_MS - elapsed);
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingDays = Math.floor(remainingHours / 24);

    if (remainingDays >= 1) {
      return `Auto-deletes in ${remainingDays}d ${remainingHours % 24}h`;
    }
    return `Auto-deletes in ${remainingHours} hours`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div 
        className="w-full max-w-5xl h-[92vh] max-h-[850px] bg-[#070D1E] border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.35)] text-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#091228] border-b border-cyan-500/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">Study Pro Admin Dashboard</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  @asman
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Real-time uploads & student help desk console</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Logout from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-cyan-950/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="px-6 py-2.5 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shrink-0 animate-in slide-in-from-top duration-200">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-cyan-500/20 bg-[#060B18] px-3 sm:px-6 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-3 text-xs font-black transition-all cursor-pointer border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'reports'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>User Reports ({reports.length})</span>
            {reports.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('upload-paper')}
            className={`px-4 py-3 text-xs font-black transition-all cursor-pointer border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'upload-paper'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Upload Past Paper (Drive)</span>
          </button>

          <button
            onClick={() => setActiveTab('upload-video')}
            className={`px-4 py-3 text-xs font-black transition-all cursor-pointer border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'upload-video'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4 text-rose-400" />
            <span>Upload Video (YouTube)</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-3 text-xs font-black transition-all cursor-pointer border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'manage'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Manage Portal Content</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: User Reports & Help Desk Messages */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>
                    Auto-Retention Policy: Reports are saved for <strong className="text-white">maximum 3 days</strong> and automatically deleted.
                  </span>
                </div>
                <button
                  onClick={refreshReports}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 rounded-lg border border-slate-700 font-bold self-start cursor-pointer"
                >
                  Refresh Messages
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-400">No new user reports.</p>
                  <p className="text-xs">When students submit the "Contact Us" form on the home screen, their messages appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reports.map((r) => (
                    <div 
                      key={r.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        r.resolved 
                          ? 'bg-slate-900/60 border-slate-800 opacity-75' 
                          : 'bg-[#0A142D] border-cyan-500/30 shadow-md shadow-cyan-950/40'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-white">{r.username}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                              {r.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400/90 font-bold">
                            {formatExpiryTime(r.createdAt)}
                          </span>
                        </div>

                        {r.contactInfo && (
                          <div className="text-[11px] text-cyan-300/80 font-mono">
                            Contact: {r.contactInfo}
                          </div>
                        )}

                        <p className="text-xs text-slate-200 leading-relaxed bg-[#050A17] p-3 rounded-xl border border-slate-800">
                          {r.message}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                        <span className="text-slate-500 font-mono">
                          {new Date(r.createdAt).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleReportResolve(r.id)}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                              r.resolved 
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{r.resolved ? 'Resolved' : 'Mark Done'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteReport(r.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 transition-colors cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Upload Past Paper (Drive Link) */}
          {activeTab === 'upload-paper' && (
            <form onSubmit={handlePaperSubmit} className="max-w-3xl space-y-4">
              <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2 font-mono">
                <Upload className="w-4 h-4" />
                <span>Publish examination resources directly into the site with Google Drive link.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Combined Mathematics">Combined Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Information & Comm. Tech (ICT)">Information & Comm. Tech (ICT)</option>
                    <option value="Agricultural Science">Agricultural Science</option>
                  </select>
                </div>

                {/* Stream */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Stream
                  </label>
                  <select
                    value={paperStream}
                    onChange={(e) => setPaperStream(e.target.value as StreamId)}
                    className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value="maths">Physical Science (Combined Maths)</option>
                    <option value="bio">Biological Science (Bio)</option>
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Exam Year
                  </label>
                  <input
                    type="number"
                    min={1975}
                    max={2030}
                    value={paperYear}
                    onChange={(e) => setPaperYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Paper Section
                  </label>
                  <select
                    value={paperCategory}
                    onChange={(e) => setPaperCategory(e.target.value as ResourceCategory)}
                    className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value="past-papers">National Past Papers (G.C.E. A/L)</option>
                    <option value="fwc-papers">FWC & School Term Test Papers</option>
                    <option value="theory-notes">Theory Revision & Short Notes</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                  Resource Title (English)
                </label>
                <input
                  type="text"
                  required
                  value={paperTitleEn}
                  onChange={(e) => setPaperTitleEn(e.target.value)}
                  placeholder={`e.g. G.C.E. A/L ${paperYear} ${paperSubject} Examination Paper & Scheme`}
                  className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* Google Drive Links */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-mono font-bold text-cyan-300 mb-1">
                    Google Drive Link (Question Paper) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={paperDriveLink}
                    onChange={(e) => setPaperDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... or folder link"
                    className="w-full px-3 py-2.5 bg-[#050A17] border border-cyan-500/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-300 mb-1">
                    Google Drive Link (Marking Scheme / Answers)
                  </label>
                  <input
                    type="url"
                    value={paperSchemeLink}
                    onChange={(e) => setPaperSchemeLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... (leave empty to use same link)"
                    className="w-full px-3 py-2.5 bg-[#050A17] border border-emerald-500/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  />
                </div>
              </div>

              {/* Extra Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    School / Source Authority
                  </label>
                  <input
                    type="text"
                    value={paperSource}
                    onChange={(e) => setPaperSource(e.target.value)}
                    placeholder="e.g. Department of Examinations or FWC Thondaimanaru"
                    className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                {paperCategory === 'fwc-papers' && (
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                      Term Tag
                    </label>
                    <select
                      value={paperTerm}
                      onChange={(e) => setPaperTerm(e.target.value)}
                      className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    >
                      <option value="1st Term">1st Term Examination</option>
                      <option value="2nd Term">2nd Term Examination</option>
                      <option value="3rd Term">3rd Term Examination</option>
                      <option value="4th Term">4th Term Examination</option>
                      <option value="5th Term">5th Term Examination</option>
                      <option value="6th Term">6th Term Examination</option>
                      <option value="All Island">All Island Pilot Exam</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Paper to Study Pro</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Upload Video Lesson (YouTube Link) */}
          {activeTab === 'upload-video' && (
            <form onSubmit={handleVideoSubmit} className="max-w-3xl space-y-4">
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2 font-mono">
                <Video className="w-4 h-4 text-rose-400" />
                <span>Paste YouTube link or Video ID to add distraction-free video lessons.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={videoSubject}
                    onChange={(e) => setVideoSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Combined Mathematics">Combined Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Information & Comm. Tech (ICT)">Information & Comm. Tech (ICT)</option>
                    <option value="Agricultural Science">Agricultural Science</option>
                  </select>
                </div>

                {/* Stream */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Stream
                  </label>
                  <select
                    value={videoStream}
                    onChange={(e) => setVideoStream(e.target.value as StreamId)}
                    className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value="maths">Physical Science (Maths)</option>
                    <option value="bio">Biological Science (Bio)</option>
                  </select>
                </div>

                {/* Unit Number */}
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
                    className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                  />
                </div>

                {/* Unit Name */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Unit Name / Topic
                  </label>
                  <input
                    type="text"
                    value={videoUnitName}
                    onChange={(e) => setVideoUnitName(e.target.value)}
                    placeholder="e.g. Unit 01 - Measurement & Mechanics"
                    className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* YouTube Link */}
              <div>
                <label className="block text-xs font-mono font-bold text-rose-300 mb-1">
                  YouTube Video Link or ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={videoYoutubeInput}
                  onChange={(e) => setVideoYoutubeInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/... or video ID"
                  className="w-full px-3 py-2.5 bg-[#050A17] border border-rose-500/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono"
                />
                {videoYoutubeInput && (
                  <p className="text-[11px] text-cyan-300 font-mono mt-1">
                    Extracted Video ID: <span className="font-bold">{extractYoutubeId(videoYoutubeInput)}</span>
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  required
                  value={videoTitleEn}
                  onChange={(e) => setVideoTitleEn(e.target.value)}
                  placeholder="e.g. Complete Measurement Theory, Formulas & Worked Examples"
                  className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* Teacher & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Teacher / Lecturer
                  </label>
                  <input
                    type="text"
                    value={videoTeacher}
                    onChange={(e) => setVideoTeacher(e.target.value)}
                    placeholder="e.g. Asman Linzy / Senior Faculty"
                    className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                  Lesson Summary
                </label>
                <textarea
                  rows={3}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Video Lesson</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Manage Content */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Overview of all resources active in Study Pro portal.</span>
              </div>

              {/* Papers List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider">
                  Active Examination Papers ({papers.length})
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {papers.slice(0, 15).map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-[#091228] border border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{p.titleEn}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {p.subjectNameEn} · {p.year} · {p.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={p.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-cyan-400"
                          title="Open Drive Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {onDeletePaper && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${p.titleEn}"?`)) {
                                onDeletePaper(p.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Delete Paper"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos List */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider">
                  Active Video Lessons ({videos.length})
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {videos.map((v) => (
                    <div key={v.id} className="p-3 rounded-xl bg-[#091228] border border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{v.titleEn}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {v.subjectNameEn} · Unit {v.unitNumber} · YouTube: {v.youtubeId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={v.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Open YouTube"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {onDeleteVideo && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${v.titleEn}"?`)) {
                                onDeleteVideo(v.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400"
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

        </div>
      </div>
    </div>
  );
};
