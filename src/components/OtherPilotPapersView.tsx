import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Search,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  ExternalLink,
  BookOpen,
  Eye,
  Bookmark,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Award,
  Sparkles,
  Download,
  Plus
} from 'lucide-react';
import { PaperResource, StreamId } from '../types';
import { playRoboticFolder, playRoboticClick } from '../utils/audio';

export interface PilotSubjectConfig {
  id: string;
  name: string;
  fullName: string;
  nameTa: string;
  icon: React.ComponentType<{ className?: string }>;
  colorTheme: 'rose' | 'blue' | 'emerald' | 'purple';
  stream: StreamId;
  driveLink: string;
  driveFolderId: string;
  moratuwaTitleEn: string;
  moratuwaTitleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  highlights: string[];
}

export const PILOT_SUBJECTS: PilotSubjectConfig[] = [
  {
    id: 'c-maths',
    name: 'Combined Maths',
    fullName: 'G.C.E. (A/L) Combined Mathematics',
    nameTa: 'இணைந்த கணிதம்',
    icon: Calculator,
    colorTheme: 'purple',
    stream: 'maths',
    driveLink: 'https://drive.google.com/drive/folders/1mTde-mYzreBYJWKP3aQx6z-dznYw5PvD',
    driveFolderId: '1mTde-mYzreBYJWKP3aQx6z-dznYw5PvD',
    moratuwaTitleEn: 'University of Moratuwa Combined Maths Pilot & Model Exam Papers',
    moratuwaTitleTa: 'மொறட்டுவ பல்கலைக்கழக இணைந்த கணித மாதிரி வினாத்தாள்கள் & விடைக்குறிப்புகள்',
    descriptionEn: 'High-standard Pure & Applied Mathematics pilot and trial examination papers prepared by University of Moratuwa educators with complete step-by-step marking schemes.',
    descriptionTa: 'மொறட்டுவ பல்கலைக்கழக விரிவுரையாளர்களால் தயாரிக்கப்பட்ட உயர்தர மாதிரி மற்றும் முன்னோடி வினாத்தாள்கள், விரிவான படிமுறை விடைக்குறிப்புகள்.',
    highlights: ['Pure & Applied Mathematics', 'Step-by-Step Marking Schemes', 'Advanced Model Examinations'],
  },
  {
    id: 'physics',
    name: 'Physics',
    fullName: 'G.C.E. (A/L) Physics',
    nameTa: 'பௌதிகவியல்',
    icon: Atom,
    colorTheme: 'blue',
    stream: 'all',
    driveLink: 'https://drive.google.com/drive/folders/11WkIA9Xf9ImJj9OXM7duAJWmFfH-PcXW',
    driveFolderId: '11WkIA9Xf9ImJj9OXM7duAJWmFfH-PcXW',
    moratuwaTitleEn: 'University of Moratuwa Physics Pilot & Model Exam Papers',
    moratuwaTitleTa: 'மொறட்டுவ பல்கலைக்கழக பௌதிகவியல் மாதிரி வினாத்தாள்கள் & விடைக்குறிப்புகள்',
    descriptionEn: 'University of Moratuwa Physics pilot, trial, and model examination papers with standard MCQ answer keys and complete structured essay marking schemes.',
    descriptionTa: 'மொறட்டுவ பல்கலைக்கழக பௌதிகவியல் மாதிரி வினாத்தாள்கள், பல்தேர்வு விடைத்தாள்கள் மற்றும் அமைப்புக் கட்டுரை விடைக்குறிப்புகள்.',
    highlights: ['Paper 1 (MCQ) & Paper 2 (Essay)', 'Standard Scoring Schemes', 'High Standard University Pilot'],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    fullName: 'G.C.E. (A/L) Chemistry',
    nameTa: 'இரசாயனவியல்',
    icon: FlaskConical,
    colorTheme: 'emerald',
    stream: 'all',
    driveLink: 'https://drive.google.com/drive/folders/1FjU5zVMZ5-l4aqAbs-T4ux2qRX0S6zrU',
    driveFolderId: '1FjU5zVMZ5-l4aqAbs-T4ux2qRX0S6zrU',
    moratuwaTitleEn: 'University of Moratuwa Chemistry Pilot & Model Exam Papers',
    moratuwaTitleTa: 'மொறட்டுவ பல்கலைக்கழக இரசாயனவியல் மாதிரி வினாத்தாள்கள் & விடைக்குறிப்புகள்',
    descriptionEn: 'University of Moratuwa Chemistry pilot, trial, and model examination papers with standard marking schemes, reaction outlines, and numerical solutions.',
    descriptionTa: 'மொறட்டுவ பல்கலைக்கழக இரசாயனவியல் மாதிரி மற்றும் முன்னோடி வினாத்தாள்கள், சேதன மாற்றீடுகள் மற்றும் விடைக்குறிப்புகள்.',
    highlights: ['General, Organic & Inorganic Units', 'Full Step Marking Keys', 'University Pilot Series'],
  },
  {
    id: 'biology',
    name: 'Biology',
    fullName: 'G.C.E. (A/L) Biology',
    nameTa: 'உயிரியல்',
    icon: Dna,
    colorTheme: 'rose',
    stream: 'bio',
    driveLink: 'https://drive.google.com/drive/folders/1qxg_rnsbNwm7XnqeXS2ModZTdEfR3qJn',
    driveFolderId: '1qxg_rnsbNwm7XnqeXS2ModZTdEfR3qJn',
    moratuwaTitleEn: 'University of Moratuwa Biology Pilot & Model Exam Papers',
    moratuwaTitleTa: 'மொறட்டுவ பல்கலைக்கழக உயிரியல் மாதிரி வினாத்தாள்கள் & விடைக்குறிப்புகள்',
    descriptionEn: 'University of Moratuwa pilot, trial, and model examination papers prepared by expert educators with detailed answer keys, essay outlines, and marking points.',
    descriptionTa: 'மொறட்டுவ பல்கலைக்கழக உயிரியல் முன்னோடி வினாத்தாள்கள், மாதிரி கட்டுரை விடைகள் மற்றும் திருத்தக் குறிப்புகள்.',
    highlights: ['Pilot & Trial Examinations', 'Detailed Mark Schemes', 'High-Standard Questions'],
  },
];

interface OtherPilotPapersViewProps {
  selectedSubject?: string;
  onSelectSubject?: (subjId: string) => void;
  papers: PaperResource[];
  onPreview: (res: PaperResource, mode?: 'paper' | 'scheme') => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (id: string) => void;
  onOpenAdminUpload?: () => void;
  isAdmin?: boolean;
}

export const OtherPilotPapersView: React.FC<OtherPilotPapersViewProps> = ({
  selectedSubject = 'all',
  onSelectSubject,
  papers,
  onPreview,
  isBookmarked,
  onToggleBookmark,
  onOpenAdminUpload,
  isAdmin = false,
}) => {
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(() => {
    if (selectedSubject && selectedSubject !== 'all') {
      return selectedSubject;
    }
    return null;
  });

  const [selectedPilotType, setSelectedPilotType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const activeSubject = useMemo(() => {
    return PILOT_SUBJECTS.find((s) => s.id === activeSubjectId) || null;
  }, [activeSubjectId]);

  // Extract all available pilot paper types
  const pilotTypes = useMemo(() => {
    const types = new Set<string>();
    types.add('Moratuwa University');
    papers.forEach((p) => {
      if (p.category === 'pilot-papers' && p.pilotType) {
        types.add(p.pilotType);
      }
    });
    return Array.from(types);
  }, [papers]);

  const handleOpenSubject = (subjectId: string) => {
    playRoboticFolder();
    setActiveSubjectId(subjectId);
    setSearchQuery('');
    setSelectedPilotType('all');
    if (onSelectSubject) {
      onSelectSubject(subjectId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAll = () => {
    playRoboticClick();
    setActiveSubjectId(null);
    setSearchQuery('');
    setSelectedPilotType('all');
    if (onSelectSubject) {
      onSelectSubject('all');
    }
  };

  const handleCopyLink = (link: string, id: string) => {
    playRoboticClick();
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Filter individual pilot papers
  const subjectPilotPapers = useMemo(() => {
    return papers.filter((p) => {
      if (p.category !== 'pilot-papers') return false;
      if (activeSubjectId) {
        const matchesSubject =
          p.subjectId === activeSubjectId ||
          (activeSubjectId === 'c-maths' && (p.subjectId === 'sub-combined-maths' || p.subjectId === 'c-maths')) ||
          (activeSubjectId === 'physics' && (p.subjectId === 'sub-physics' || p.subjectId === 'physics')) ||
          (activeSubjectId === 'chemistry' && (p.subjectId === 'sub-chemistry' || p.subjectId === 'chemistry')) ||
          (activeSubjectId === 'biology' && (p.subjectId === 'sub-biology' || p.subjectId === 'biology'));
        if (!matchesSubject) return false;
      }
      if (selectedPilotType !== 'all') {
        const pType = p.pilotType || 'Moratuwa University';
        if (pType !== selectedPilotType) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          p.titleEn.toLowerCase().includes(q) ||
          (p.titleTa && p.titleTa.toLowerCase().includes(q)) ||
          p.subjectNameEn.toLowerCase().includes(q) ||
          p.schoolOrSource.toLowerCase().includes(q) ||
          (p.pilotType && p.pilotType.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [papers, activeSubjectId, selectedPilotType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* View 1: Main 4 Subject Folders Hub */}
      {!activeSubject ? (
        <div className="space-y-6">
          {/* Header Description */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50/60 rounded-2xl border border-indigo-100 p-5 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-800 text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>University & Pilot Examinations Archive</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Other Pilot Papers · முன்னோடி மாதிரி வினாத்தாள்கள்
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Dedicated repository for University of Moratuwa pilot examinations, provincial trial assessments, and high-standard model question papers organized across 4 primary A/L subjects.
                </p>
              </div>

              {isAdmin && onOpenAdminUpload && (
                <button
                  onClick={() => {
                    playRoboticClick();
                    onOpenAdminUpload();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload New Pilot Paper</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Primary Subject Folder Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {PILOT_SUBJECTS.map((subj) => {
              const IconComponent = subj.icon;
              const colorClasses = {
                purple: {
                  bg: 'bg-purple-500/10 hover:bg-purple-500/15',
                  border: 'border-purple-200 hover:border-purple-400',
                  iconBg: 'bg-purple-600 text-white',
                  text: 'text-purple-700',
                  badge: 'bg-purple-100 text-purple-800',
                },
                blue: {
                  bg: 'bg-blue-500/10 hover:bg-blue-500/15',
                  border: 'border-blue-200 hover:border-blue-400',
                  iconBg: 'bg-blue-600 text-white',
                  text: 'text-blue-700',
                  badge: 'bg-blue-100 text-blue-800',
                },
                emerald: {
                  bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
                  border: 'border-emerald-200 hover:border-emerald-400',
                  iconBg: 'bg-emerald-600 text-white',
                  text: 'text-emerald-700',
                  badge: 'bg-emerald-100 text-emerald-800',
                },
                rose: {
                  bg: 'bg-rose-500/10 hover:bg-rose-500/15',
                  border: 'border-rose-200 hover:border-rose-400',
                  iconBg: 'bg-rose-600 text-white',
                  text: 'text-rose-700',
                  badge: 'bg-rose-100 text-rose-800',
                },
              }[subj.colorTheme];

              return (
                <div
                  key={subj.id}
                  onClick={() => handleOpenSubject(subj.id)}
                  className={`group relative rounded-2xl bg-white border ${colorClasses.border} p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    {/* Header: Icon & Folder Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl ${colorClasses.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${colorClasses.badge}`}>
                        Pilot Folder
                      </span>
                    </div>

                    {/* Title & Tamil */}
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {subj.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5 font-tamil">
                        {subj.nameTa}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                        {subj.descriptionEn}
                      </p>
                    </div>

                    {/* Moratuwa Highlights */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Moratuwa Collection Included</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {subj.highlights.slice(0, 2).map((h, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Open Folder Action */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    <span className="flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4" />
                      <span>Open Subject Papers</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Overview of Moratuwa Pilot Exam Series */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-extrabold text-slate-900">
                About University of Moratuwa Pilot Papers (மொறட்டுவ மாதிரி வினாத்தாள்கள்)
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              University of Moratuwa pilot examinations are conducted annually for G.C.E. Advanced Level candidates. These papers are renowned for their benchmark question standards, detailed mark allocation schemes, and syllabus coverage across Pure Mathematics, Applied Mathematics, Physics, Chemistry, and Biology. You can view each subject collection with full Google Drive folder access and step-by-step marking schemes.
            </p>
          </div>
        </div>
      ) : (
        /* View 2: Specific Subject Pilot Papers Page */
        <div className="space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div>
              <button
                onClick={handleBackToAll}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All 4 Subject Folders</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  {React.createElement(activeSubject.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {activeSubject.fullName}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 font-tamil">
                    {activeSubject.nameTa} · முன்னோடி மற்றும் மாதிரி வினாத்தாள்கள்
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleCopyLink(activeSubject.driveLink, 'subj-drive')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Copy Google Drive Folder Link"
              >
                {copiedLink === 'subj-drive' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Drive Link</span>
                  </>
                )}
              </button>

              <a
                href={activeSubject.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Google Drive</span>
              </a>
            </div>
          </div>

          {/* Primary Featured Box: University of Moratuwa Pilot Collection Folder */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-blue-50/70 border border-amber-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase">
                    <Award className="w-3.5 h-3.5" />
                    Primary Pilot Collection
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    University of Moratuwa
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {activeSubject.moratuwaTitleEn}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 font-tamil mt-0.5">
                    {activeSubject.moratuwaTitleTa}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeSubject.descriptionEn}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {activeSubject.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{h}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Moratuwa Master Collection */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                <button
                  onClick={() => {
                    const moratuwaRes: PaperResource = {
                      id: `pilot-moratuwa-${activeSubject.id}-master`,
                      titleEn: activeSubject.moratuwaTitleEn,
                      titleTa: activeSubject.moratuwaTitleTa,
                      category: 'pilot-papers',
                      pilotType: 'Moratuwa University',
                      stream: activeSubject.stream,
                      subjectId: activeSubject.id,
                      subjectNameEn: activeSubject.name,
                      subjectNameTa: activeSubject.nameTa,
                      year: 2025,
                      term: 'Trial / Final',
                      schoolOrSource: 'University of Moratuwa',
                      schoolOrSourceTa: 'மொறட்டுவ பல்கலைக்கழகம்',
                      driveLink: activeSubject.driveLink,
                      markingSchemeDriveLink: activeSubject.driveLink,
                      fileSize: 'Complete Pilot Exam Archive',
                      downloadsCount: 15400,
                      unitOrTopic: activeSubject.descriptionEn,
                    };
                    onPreview(moratuwaRes, 'paper');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Moratuwa Papers</span>
                </button>

                <a
                  href={activeSubject.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span>Open Folder in Drive</span>
                </a>

                <button
                  onClick={() => {
                    const id = `pilot-moratuwa-${activeSubject.id}-master`;
                    onToggleBookmark(id);
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isBookmarked(`pilot-moratuwa-${activeSubject.id}-master`)
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-extrabold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>
                    {isBookmarked(`pilot-moratuwa-${activeSubject.id}-master`) ? 'Bookmarked' : 'Save to Bookmarks'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar & Types Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Pilot Paper Type Selector */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pilot Type:</span>
                </span>
                <button
                  onClick={() => setSelectedPilotType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedPilotType === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Types ({subjectPilotPapers.length})
                </button>
                {pilotTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedPilotType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedPilotType === type
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeSubject.name} pilot papers...`}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* List of Pilot Examination Papers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Available Pilot Papers & Model Examinations ({subjectPilotPapers.length})</span>
              </h4>
              {isAdmin && onOpenAdminUpload && (
                <button
                  onClick={() => {
                    playRoboticClick();
                    onOpenAdminUpload();
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another pilot paper</span>
                </button>
              )}
            </div>

            {subjectPilotPapers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">No matching pilot papers found</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try clearing your search query or check back soon as more pilot examination papers are added.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedPilotType('all');
                  }}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {subjectPilotPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase">
                            {paper.pilotType || 'Pilot Exam'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {paper.year}
                          </span>
                        </div>

                        <button
                          onClick={() => onToggleBookmark(paper.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isBookmarked(paper.id)
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                          title="Bookmark"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h5 className="text-sm font-extrabold text-slate-900 line-clamp-2">
                        {paper.titleEn}
                      </h5>
                      {paper.titleTa && (
                        <p className="text-xs text-slate-500 font-tamil line-clamp-1">
                          {paper.titleTa}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {paper.unitOrTopic || paper.schoolOrSource}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-medium truncate">
                        {paper.schoolOrSource}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onPreview(paper, 'paper')}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <a
                          href={paper.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Open Google Drive Link"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
