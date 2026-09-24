import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  Download,
  Eye,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Search,
  Bookmark,
  ChevronRight,
  Filter,
  X,
  BookOpen
} from 'lucide-react';
import { PaperResource } from '../types';
import { getDriveDirectViewUrl, getDriveDirectDownloadUrl } from '../utils/drive';

interface PastPaperFoldersViewProps {
  selectedSubject: string;
  onSelectSubject: (subjectId: string) => void;
  selectedYear: string;
  onSelectYear: (year: string) => void;
  papers: PaperResource[];
  onPreview: (resource: PaperResource, mode?: 'paper' | 'scheme') => void;
  isBookmarked?: (id: string) => boolean;
  onToggleBookmark?: (id: string) => void;
}

interface SubjectFolderConfig {
  id: string;
  nameEn: string;
  nameTa: string;
  icon: string;
  badge: string;
  colorTheme: 'blue' | 'emerald' | 'rose' | 'purple';
  description: string;
}

const SUBJECT_FOLDERS: SubjectFolderConfig[] = [
  {
    id: 'chemistry',
    nameEn: 'Chemistry Past Papers',
    nameTa: 'இரசாயனவியல் வினாத்தாள்கள்',
    icon: '🧪',
    badge: '1980–2026 Master Archive (46+ Years)',
    colorTheme: 'emerald',
    description: '1980 முதல் 2026 வரையிலான அனைத்து இரசாயனவியல் வினாத்தாள்களும், MCQs விடைகளும், மாதிரி புள்ளியிடல் திட்டங்களும்.',
  },
  {
    id: 'physics',
    nameEn: 'Physics Past Papers',
    nameTa: 'பௌதிகவியல் வினாத்தாள்கள்',
    icon: '⚛️',
    badge: '2020–2023 Available',
    colorTheme: 'blue',
    description: 'தேசிய க.பொ.த (உயர்தரம்) பௌதிகவியல் Paper 1 & Paper 2 வினாத்தாள்களும் உத்தியோகபூர்வ புள்ளியிடல் திட்டங்களும்.',
  },
  {
    id: 'biology',
    nameEn: 'Biology Past Papers',
    nameTa: 'உயிரியல் வினாத்தாள்கள்',
    icon: '🧬',
    badge: '1994–2026 Master Archive (32+ Years)',
    colorTheme: 'rose',
    description: '1994 முதல் 2026 வரையிலான அனைத்து உயிரியல் வினாத்தாள்களும், Paper 1 MCQs விடைகளும், Paper 2 புள்ளியிடல் திட்டங்களும்.',
  },
  {
    id: 'c-maths',
    nameEn: 'Combined Maths Past Papers',
    nameTa: 'இணைந்த கணிதம் வினாத்தாள்கள்',
    icon: '📐',
    badge: 'Pure & Applied Maths',
    colorTheme: 'purple',
    description: 'இணைந்த கணிதம் தூய கணிதம் & பிரயோக கணிதம் வினாத்தாள்களும் முழுமையான படிமுறைத் தீர்வுகளும்.',
  },
];

export const PastPaperFoldersView: React.FC<PastPaperFoldersViewProps> = ({
  selectedSubject,
  onSelectSubject,
  selectedYear,
  onSelectYear,
  papers,
  onPreview,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out master container placeholders from list so individual years render neatly
  const actualPapers = useMemo(() => {
    return papers.filter(
      (p) =>
        p.id !== 'past-chem-master-1980-2026' &&
        p.id !== 'past-bio-master-1994-2026' &&
        p.id !== 'past-master-folder'
    );
  }, [papers]);

  // Paper count by subject
  const getSubjectCount = (subjId: string) => {
    return actualPapers.filter((p) => p.subjectId === subjId).length;
  };

  // Filter papers based on active subject, year, and search
  const displayedPapers = useMemo(() => {
    return actualPapers.filter((p) => {
      if (selectedSubject !== 'all' && p.subjectId !== selectedSubject) {
        return false;
      }
      if (selectedYear !== 'all' && String(p.year) !== selectedYear) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.titleEn.toLowerCase().includes(q) || (p.titleTa && p.titleTa.toLowerCase().includes(q));
        const matchSubject = p.subjectNameEn.toLowerCase().includes(q) || (p.subjectNameTa && p.subjectNameTa.toLowerCase().includes(q));
        const matchYear = String(p.year).includes(q);
        const matchUnit = p.unitOrTopic && p.unitOrTopic.toLowerCase().includes(q);
        return matchTitle || matchSubject || matchYear || matchUnit;
      }
      return true;
    }).sort((a, b) => b.year - a.year);
  }, [actualPapers, selectedSubject, selectedYear, searchQuery]);

  // Unique years for the currently chosen subject
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    const pool = selectedSubject === 'all'
      ? actualPapers
      : actualPapers.filter((p) => p.subjectId === selectedSubject);
    pool.forEach((p) => set.add(p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [actualPapers, selectedSubject]);

  const activeFolder = SUBJECT_FOLDERS.find((f) => f.id === selectedSubject);

  return (
    <div className="space-y-6">
      {/* 1. Main Subject Folders Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold border border-blue-400/20">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>National Examination Paper Folders (தேசிய கடந்த கால வினாத்தாள் தொகுப்புகள்)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Choose Subject Folder (பாடத்தைத் தொட்டுத் திறக்கவும்)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Click on <b>Physics, Chemistry, Biology, or Combined Maths</b> below. Touch any paper to <b>Download</b> or <b>Preview</b> instantly!
          </p>
        </div>

        {/* 4 Big Subject Folders (Physics, Chemistry, Biology, Combined Maths) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5">
          {SUBJECT_FOLDERS.map((folder) => {
            const isSelected = selectedSubject === folder.id;
            const count = getSubjectCount(folder.id);

            const themeStyles = {
              emerald: {
                border: isSelected ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-950/60' : 'border-emerald-500/30 bg-slate-900/80 hover:border-emerald-400',
                badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                button: isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-500 hover:text-white',
              },
              blue: {
                border: isSelected ? 'border-blue-400 ring-2 ring-blue-400/40 bg-blue-950/60' : 'border-blue-500/30 bg-slate-900/80 hover:border-blue-400',
                badge: 'bg-blue-500/20 text-sky-300 border-blue-500/30',
                button: isSelected ? 'bg-[#0066FF] text-white' : 'bg-blue-600/30 text-sky-300 hover:bg-[#0066FF] hover:text-white',
              },
              rose: {
                border: isSelected ? 'border-rose-400 ring-2 ring-rose-400/40 bg-rose-950/60' : 'border-rose-500/30 bg-slate-900/80 hover:border-rose-400',
                badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                button: isSelected ? 'bg-rose-600 text-white' : 'bg-rose-600/30 text-rose-300 hover:bg-rose-600 hover:text-white',
              },
              purple: {
                border: isSelected ? 'border-purple-400 ring-2 ring-purple-400/40 bg-purple-950/60' : 'border-purple-500/30 bg-slate-900/80 hover:border-purple-400',
                badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                button: isSelected ? 'bg-purple-600 text-white' : 'bg-purple-600/30 text-purple-300 hover:bg-purple-600 hover:text-white',
              },
            }[folder.colorTheme];

            return (
              <div
                key={folder.id}
                onClick={() => {
                  onSelectSubject(isSelected ? 'all' : folder.id);
                  onSelectYear('all');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1 ${themeStyles.border}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
                      {folder.icon}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${themeStyles.badge}`}>
                      {count} Papers
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white group-hover:text-sky-300 transition-colors">
                    {folder.nameEn}
                  </h3>
                  <div className="text-xs text-slate-300 font-bold mb-2">
                    {folder.nameTa}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {folder.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    {folder.badge}
                  </span>
                  <button
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${themeStyles.button}`}
                  >
                    <span>{isSelected ? 'Opened' : 'Open Folder'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Inside Folder Navigation & Year Filter Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Active Folder Indicator / Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Folder:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  onSelectSubject('all');
                  onSelectYear('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSubject === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                📚 All Subjects
              </button>
              {SUBJECT_FOLDERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    onSelectSubject(f.id);
                    onSelectYear('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedSubject === f.id
                      ? 'bg-[#0066FF] text-white shadow-xs ring-2 ring-blue-500/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.nameEn.replace(' Past Papers', '')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters if active */}
          {(selectedSubject !== 'all' || selectedYear !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                onSelectSubject('all');
                onSelectYear('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Big Touch-Friendly Year Chips */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-500 shrink-0">
              Touch Year:
            </span>
            <button
              onClick={() => onSelectYear('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedYear === 'all'
                  ? 'bg-[#0066FF] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Years ({displayedPapers.length})
            </button>
            {availableYears.map((yr) => {
              const isSelected = selectedYear === String(yr);
              return (
                <button
                  key={yr}
                  onClick={() => onSelectYear(isSelected ? 'all' : String(yr))}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <span>{yr}</span>
                  {yr === 1983 && <span className="text-[10px] text-amber-300">★</span>}
                </button>
              );
            })}
          </div>

          {/* Quick Search Bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search year (e.g. 1983)..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* 2.5 Master Google Drive Folder Showcase (1980–2026 Chemistry Complete Archive) */}
      {(selectedSubject === 'chemistry' || selectedSubject === 'all') && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <FolderOpen className="w-4 h-4 text-emerald-400" />
                <span>Google Drive Master Folder Archive (1980–2026)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                1980–2026 G.C.E. A/L Chemistry Complete Past Papers & Schemes
              </h3>
              <div className="text-xs font-bold text-emerald-300">
                1980–2026 க.பொ.த (உயர்தரம்) இரசாயனவியல் முழுமையான கடந்தகால வினாத்தாள்கள் & விடைக்குறிப்புகள் [Master Folder]
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All 1980 to 2026 Chemistry past papers with complete MCQs keys, structured essays, and marking schemes are provided separately inside this official Google Drive master folder.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-500/30 font-bold text-emerald-200">
                  📁 46+ Years (1980–2026)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-500/30 font-bold text-emerald-200">
                  📄 All Papers Separated Inside
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-500/30 font-bold text-emerald-200">
                  📝 Question Papers + Answer Schemes
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <a
                href="https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open Google Drive Folder</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  const masterRes = papers.find((p) => p.id === 'past-chem-master-1980-2026');
                  if (masterRes) onPreview(masterRes, 'paper');
                }}
                className="px-5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Browse Folder Contents in App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2.6 Master Google Drive Folder Showcase (1994–2026 Biology Complete Archive) */}
      {(selectedSubject === 'biology' || selectedSubject === 'all') && (
        <div className="bg-gradient-to-r from-rose-950 via-pink-950 to-slate-900 border-2 border-rose-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                <FolderOpen className="w-4 h-4 text-rose-400" />
                <span>Google Drive Master Folder Archive (1994–2026)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                1994–2026 G.C.E. A/L Biology Complete Past Papers & Schemes
              </h3>
              <div className="text-xs font-bold text-rose-300">
                1994–2026 க.பொ.த (உயர்தரம்) உயிரியல் முழுமையான கடந்தகால வினாத்தாள்கள் & விடைக்குறிப்புகள் [Master Folder]
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All 1994 to 2026 Biology past papers with complete MCQs keys, structured essays, essay questions, and official marking schemes are provided separately inside this official Google Drive master folder.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-rose-900/60 border border-rose-500/30 font-bold text-rose-200">
                  🧬 32+ Years (1994–2026)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-900/60 border border-rose-500/30 font-bold text-rose-200">
                  📄 All Papers Separated Inside
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-900/60 border border-rose-500/30 font-bold text-rose-200">
                  📝 Question Papers + Answer Schemes
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <a
                href="https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open Google Drive Folder</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  const masterRes = papers.find((p) => p.id === 'past-bio-master-1994-2026');
                  if (masterRes) onPreview(masterRes, 'paper');
                }}
                className="px-5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 border border-rose-500/30 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-rose-400" />
                <span>Browse Folder Contents in App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Simplified, Touch & Download Paper Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>
            Showing <b>{displayedPapers.length}</b> Examination Papers & Marking Schemes
          </span>
          {activeFolder && (
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active Folder: {activeFolder.nameEn}
            </span>
          )}
        </div>

        {displayedPapers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Folder className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              No Papers Found in this Filter
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No papers matched year {selectedYear}. Try clicking "All Years" or selecting another subject folder.
            </p>
            <button
              onClick={() => {
                onSelectYear('all');
                onSelectSubject('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Show All Past Papers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedPapers.map((paper) => {
              const directDriveUrl = getDriveDirectViewUrl(paper.driveLink);
              const directDownloadUrl = getDriveDirectDownloadUrl(paper.driveLink);
              const schemeDownloadUrl = paper.markingSchemeDriveLink
                ? getDriveDirectDownloadUrl(paper.markingSchemeDriveLink)
                : directDownloadUrl;
              const hasMarkingScheme = Boolean(paper.markingSchemeDriveLink);
              const is1983 = paper.id === 'past-chem-1983';

              return (
                <div
                  key={paper.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 relative overflow-hidden group"
                >
                  {/* Top Subject Color Bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${
                      paper.subjectId === 'chemistry'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : paper.subjectId === 'physics'
                        ? 'bg-gradient-to-r from-blue-600 to-sky-400'
                        : paper.subjectId === 'biology'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-400'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-400'
                    }`}
                  />

                  <div>
                    {/* Header Row: Big Year Badge + Subject + Bookmark */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-black text-sm tracking-wider shadow-xs">
                          {paper.year}
                        </span>
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#0066FF] border border-blue-100">
                          {paper.subjectNameEn}
                        </span>
                        {hasMarkingScheme && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Scheme Included</span>
                          </span>
                        )}
                      </div>

                      {onToggleBookmark && isBookmarked && (
                        <button
                          onClick={() => onToggleBookmark(paper.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isBookmarked(paper.id)
                              ? 'text-amber-500 bg-amber-50'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Bookmark this paper"
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked(paper.id) ? 'fill-current' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Titles */}
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-[#0066FF] transition-colors">
                      {paper.titleEn}
                    </h3>
                    {paper.titleTa && (
                      <div className="text-xs font-bold text-slate-600 mt-1">
                        {paper.titleTa}
                      </div>
                    )}

                    {/* Source & Description */}
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {paper.unitOrTopic || 'Official G.C.E. Advanced Level National Examination Paper & Model Answers.'}
                    </p>
                  </div>

                  {/* High-Impact Touch Action Buttons for Students */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    {/* If 1983 Chemistry: Special Model Solutions Button */}
                    {is1983 && (
                      <button
                        onClick={() => onPreview(paper, 'scheme')}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-100" />
                        <span>✨ View 60 MCQs & 24-Page Jaffna Model Answers</span>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {/* 1. Download Question Paper */}
                      <a
                        href={directDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        title="Download Question Paper PDF directly"
                      >
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">📥 Download Paper</span>
                      </a>

                      {/* 2. Download Marking Scheme */}
                      <a
                        href={schemeDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        title="Download Official Marking Scheme directly"
                      >
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">📝 Download Scheme</span>
                      </a>
                    </div>

                    {/* 3. Read / In-App Preview Row */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => onPreview(paper, 'paper')}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Read Paper Online</span>
                      </button>

                      <a
                        href={directDriveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Drive</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
