import React from 'react';
import { Folder, FolderOpen, CheckCircle2, FileText, Sparkles, X, ChevronRight, BookOpen } from 'lucide-react';
import { PaperResource } from '../types';

export interface TermFolderDef {
  id: string; // 'all' | '1st Term' | '2nd Term' | '3rd Term' | '4th Term' | '5th Term' | '6th Term'
  name: string;
  stage: string;
  description: string;
  badge?: string;
  colorTheme: 'blue' | 'amber' | 'emerald' | 'purple' | 'rose' | 'indigo' | 'slate';
}

export const TERM_FOLDERS: TermFolderDef[] = [
  {
    id: 'FWC Pilot',
    name: 'FWC Pilot Exams',
    stage: 'Thondaimanaru FWC',
    description: 'Official Field Work Centre Pilot & Model Papers with step-by-step schemes',
    badge: '⭐ Thondaimanaru FWC',
    colorTheme: 'purple',
  },
  {
    id: '1st Term',
    name: '1st Term',
    stage: 'Grade 12 • Term 1',
    description: 'Mechanics, Measurement, Kinematics & Foundation Units',
    badge: 'Physics 2022–2027 Uploaded',
    colorTheme: 'blue',
  },
  {
    id: '2nd Term',
    name: '2nd Term',
    stage: 'Grade 12 • Term 2',
    description: 'Oscillations & Waves, Thermal Physics & Mid-Year Evaluation',
    colorTheme: 'amber',
  },
  {
    id: '3rd Term',
    name: '3rd Term',
    stage: 'Grade 12 • Term 3',
    description: 'Electrostatics, Current Electricity & Grade 12 Year-End Exam',
    colorTheme: 'emerald',
  },
  {
    id: '4th & 5th Term',
    name: '4th & 5th Term',
    stage: 'Grade 13 • Pre-Board',
    description: 'Electromagnetism, Modern Physics & Pre-Board Island Benchmark Tests',
    colorTheme: 'indigo',
  },
  {
    id: 'Trial Exam',
    name: 'Trial / 6th Term',
    stage: 'Grade 13 • Final Pilot',
    description: 'Northern & Western Province Full Syllabus Trial Benchmarks',
    badge: 'Final Trial',
    colorTheme: 'rose',
  },
];

interface TermFoldersViewProps {
  selectedTerm: string;
  onSelectTerm: (termId: string) => void;
  selectedSubject: string;
  onSelectSubject: (subjectId: string) => void;
  papers: PaperResource[];
}

export const TermFoldersView: React.FC<TermFoldersViewProps> = ({
  selectedTerm,
  onSelectTerm,
  selectedSubject,
  onSelectSubject,
  papers,
}) => {
  // Compute counts per term
  const getTermCount = (termId: string) => {
    if (termId === 'all') return papers.length;
    return papers.filter((p) => {
      const matchesTerm =
        p.term === termId ||
        (termId === '4th & 5th Term' && (p.term === '4th Term' || p.term === '5th Term' || p.term === '4th & 5th Term')) ||
        (termId === 'Trial Exam' && (p.term === 'Trial Exam' || p.term === '6th Term'));
      const matchesSubject = selectedSubject === 'all' || p.subjectId === selectedSubject;
      return matchesTerm && matchesSubject;
    }).length;
  };

  const getSubjectCount = (subjectId: string) => {
    if (subjectId === 'all') return papers.length;
    return papers.filter((p) => p.subjectId === subjectId).length;
  };

  const subjectsList = [
    { id: 'all', name: 'All Subjects', icon: '📚' },
    { id: 'physics', name: 'Physics', icon: '⚛️' },
    { id: 'c-maths', name: 'Combined Maths', icon: '📐' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪' },
    { id: 'biology', name: 'Biology', icon: '🧬' },
    { id: 'ict', name: 'ICT', icon: '💻' },
  ];

  return (
    <div className="space-y-4">
      {/* Subject Quick Selector Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <span>Subject:</span>
          </span>
          {subjectsList.map((subj) => {
            const isSelected = selectedSubject === subj.id;
            const count = getSubjectCount(subj.id);
            return (
              <button
                key={subj.id}
                onClick={() => onSelectSubject(isSelected ? 'all' : subj.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#0066FF] text-white shadow-xs font-extrabold ring-2 ring-blue-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{subj.icon}</span>
                <span>{subj.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Folders Container Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0066FF]"></span>
            <span>Term Examination Folders</span>
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">
            — Select a folder to view papers & schemes
          </span>
        </div>

        {selectedTerm !== 'all' && (
          <button
            onClick={() => onSelectTerm('all')}
            className="text-xs font-bold text-[#0066FF] hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"
          >
            <span>View All Folders</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid of 6 Term Folders + All Terms option */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {TERM_FOLDERS.map((folder) => {
          const isSelected = selectedTerm === folder.id;
          const count = getTermCount(folder.id);
          const hasUploadedPhysics = folder.id === '1st Term';

          return (
            <div
              key={folder.id}
              onClick={() => onSelectTerm(isSelected ? 'all' : folder.id)}
              className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group border select-none ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-50/90 to-white border-blue-500 shadow-md ring-2 ring-blue-500/20 transform -translate-y-0.5'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
              }`}
            >
              {/* Top Row: Icon + Count */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#0066FF] text-white shadow-xs'
                        : 'bg-blue-50 text-[#0066FF] group-hover:bg-blue-100'
                    }`}
                  >
                    {isSelected ? (
                      <FolderOpen className="w-5 h-5" />
                    ) : (
                      <Folder className="w-5 h-5" />
                    )}
                  </div>

                  <span
                    className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-lg ${
                      count > 0
                        ? isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-[#0066FF]'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {count} {count === 1 ? 'doc' : 'docs'}
                  </span>
                </div>

                {/* Folder Title */}
                <h3
                  className={`text-sm font-black tracking-tight mb-0.5 ${
                    isSelected ? 'text-[#0066FF]' : 'text-slate-900 group-hover:text-[#0066FF]'
                  }`}
                >
                  {folder.name}
                </h3>

                {/* Subtitle / Stage */}
                <p className="text-[11px] text-slate-500 font-semibold mb-2 line-clamp-1">
                  {folder.stage}
                </p>

                {/* Highlight Badge */}
                {hasUploadedPhysics && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-md mb-1">
                    <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>2022–2027 Physics</span>
                  </div>
                )}
              </div>

              {/* Bottom Action Hint */}
              <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span
                  className={`font-bold ${
                    isSelected ? 'text-[#0066FF]' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {isSelected ? 'Folder Open' : 'Open Folder'}
                </span>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isSelected
                      ? 'text-[#0066FF] translate-x-0.5'
                      : 'text-slate-300 group-hover:text-[#0066FF] group-hover:translate-x-0.5'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Folder Breadcrumb / Feedback Banner */}
      {selectedTerm !== 'all' && (
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0066FF]">
                  Viewing Folder:
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {selectedTerm} Examination Archive
                </h3>
              </div>
              <p className="text-xs text-slate-600 truncate mt-0.5">
                {selectedSubject === 'all'
                  ? 'Showing all available subjects for this term'
                  : `Filtered by ${selectedSubject.toUpperCase()} subject`}
                {' · '}
                <span className="font-semibold text-slate-900">
                  {getTermCount(selectedTerm)} items found
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectTerm('all')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Back to All Folders</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
