import React from 'react';
import { 
  Folder, FolderOpen, CheckCircle2, FileText, Sparkles, 
  X, ChevronRight, BookOpen, ExternalLink, Eye, Award, Atom, FlaskConical, Calculator
} from 'lucide-react';
import { PaperResource } from '../types';

export interface TermFolderDef {
  id: string; // 'all' | '1st Term' | '2nd Term' | '3rd Term' | '4th Term' | '5th Term' | '6th Term' | 'FWC Pilot'
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
    description: 'Mechanics, Straight Lines, Atomic Structure & Cell Biology Units',
    badge: 'FWC All Subjects',
    colorTheme: 'blue',
  },
  {
    id: '2nd Term',
    name: '2nd Term',
    stage: 'Grade 12 • Term 2',
    description: 'Waves & Optics, Differentiation, Energetics & Mid-Year Evaluation',
    badge: 'FWC All Subjects',
    colorTheme: 'amber',
  },
  {
    id: '3rd Term',
    name: '3rd Term',
    stage: 'Grade 12 • Term 3',
    description: 'Integration, Circles, Electrostatics, Organic Basics Promotion',
    badge: 'FWC All Subjects',
    colorTheme: 'emerald',
  },
  {
    id: '4th Term',
    name: '4th Term',
    stage: 'Grade 13 • Term 4',
    description: 'Matrices, Induction, Chemical Kinetics, Genetics & Pre-Board Tests',
    badge: 'FWC All Subjects',
    colorTheme: 'indigo',
  },
  {
    id: '5th Term',
    name: '5th Term',
    stage: 'Grade 13 • Term 5',
    description: 'Complex Numbers, Electronics, Electrochemistry, Ecology Tests',
    badge: 'FWC All Subjects',
    colorTheme: 'rose',
  },
  {
    id: '6th Term',
    name: '6th Term / Trial',
    stage: 'Grade 13 • Final Trial',
    description: 'Full Syllabus Pilot Papers & Island-wide Trial Benchmarks',
    badge: 'FWC All Subjects',
    colorTheme: 'slate',
  },
];

interface TermFoldersViewProps {
  selectedTerm: string;
  onSelectTerm: (termId: string) => void;
  selectedSubject: string;
  onSelectSubject: (subjectId: string) => void;
  selectedStream?: string;
  papers: PaperResource[];
}

export const TermFoldersView: React.FC<TermFoldersViewProps> = ({
  selectedTerm,
  onSelectTerm,
  selectedSubject,
  onSelectSubject,
  selectedStream = 'all',
  papers,
}) => {
  // Compute counts per term
  const getTermCount = (termId: string) => {
    if (termId === 'all') return papers.length;
    return papers.filter((p) => {
      const matchesTerm =
        p.term === termId ||
        (termId === '4th Term' && (p.term === '4th Term' || p.term === '4th & 5th Term')) ||
        (termId === '5th Term' && (p.term === '5th Term' || p.term === '4th & 5th Term')) ||
        (termId === '4th & 5th Term' && (p.term === '4th Term' || p.term === '5th Term' || p.term === '4th & 5th Term')) ||
        (termId === '6th Term' && (p.term === '6th Term' || p.term === 'Trial Exam')) ||
        (termId === 'Trial Exam' && (p.term === 'Trial Exam' || p.term === '6th Term')) ||
        (termId === 'FWC Pilot' && p.term === 'FWC Pilot');
      const matchesSubject = selectedSubject === 'all' || p.subjectId === selectedSubject;
      return matchesTerm && matchesSubject;
    }).length;
  };

  const getSubjectCount = (subjectId: string) => {
    if (subjectId === 'all') return papers.length;
    return papers.filter((p) => p.subjectId === subjectId).length;
  };

  const subjectsList = React.useMemo(() => {
    if (selectedStream === 'bio') {
      return [
        { id: 'all', name: 'All Bio Stream Subjects', icon: '🧬' },
        { id: 'biology', name: 'Biology (FWC 1–6)', icon: '🧬' },
        { id: 'chemistry', name: 'Chemistry (FWC 1–6)', icon: '🧪' },
        { id: 'physics', name: 'Physics (FWC 1–6)', icon: '⚛️' },
      ];
    }
    if (selectedStream === 'maths') {
      return [
        { id: 'all', name: 'All Maths Stream Subjects', icon: '📐' },
        { id: 'c-maths', name: 'Combined Maths (FWC 1–6)', icon: '📐' },
        { id: 'physics', name: 'Physics (FWC 1–6)', icon: '⚛️' },
        { id: 'chemistry', name: 'Chemistry (FWC 1–6)', icon: '🧪' },
      ];
    }
    return [
      { id: 'all', name: 'All Subjects', icon: '📚' },
      { id: 'c-maths', name: 'Combined Maths (FWC 1–6)', icon: '📐' },
      { id: 'physics', name: 'Physics (FWC 1–6)', icon: '⚛️' },
      { id: 'chemistry', name: 'Chemistry (FWC 1–6)', icon: '🧪' },
      { id: 'biology', name: 'Biology (FWC 1–6)', icon: '🧬' },
    ];
  }, [selectedStream]);

  const fwcMathsTerms = [
    { term: '1st Term', title: '1st Term', link: 'https://drive.google.com/drive/folders/1ZdIODWG_-rzNw-782VuLRrIJS247xtXi', desc: 'Straight Line, Quadratic Equations, Vectors' },
    { term: '2nd Term', title: '2nd Term', link: 'https://drive.google.com/drive/folders/11Y60n4zScvLaAV0vRr6y4PMAF--K4yVl', desc: 'Polynomials, Differentiation, Relative Velocity' },
    { term: '3rd Term', title: '3rd Term', link: 'https://drive.google.com/drive/folders/1oZzHP8Z91dZStDkShYmaVTT8Qx3-C8ot', desc: 'Integration, Circles, Trigonometry & Dynamics' },
    { term: '4th Term', title: '4th Term', link: 'https://drive.google.com/drive/folders/1MLd8j8mv-kzp3i9F0nYiImKPzv2QxkeB', desc: 'Advanced Integration, Matrices, Circular Motion' },
    { term: '5th Term', title: '5th Term', link: 'https://drive.google.com/drive/folders/1PFOUKIZwLVYYcgi63xWx3rrp4IVK2oyt', desc: 'Complex Numbers, Permutations, Probability' },
    { term: '6th Term', title: '6th Term', link: 'https://drive.google.com/drive/folders/1LWwF3fRTyQF5zC-u2-4fOhblleSlqLj0', desc: 'Full Syllabus Pure & Applied Final Trial' },
  ];

  const fwcPhyTerms = [
    { term: '1st Term', title: '1st Term', link: 'https://drive.google.com/drive/folders/1T-zfsSFwpA16EVtvoimLUSnZzj4J1EtT', desc: 'Units, Measurement & Mechanics' },
    { term: '2nd Term', title: '2nd Term', link: 'https://drive.google.com/drive/folders/1XZpyDTz5R9CHMI85naJwV1oI09ZczLcL', desc: 'Waves, Optics & Thermal Physics' },
    { term: '3rd Term', title: '3rd Term', link: 'https://drive.google.com/drive/folders/1bjX3TohWsKNM9iIwCkbTnG1rTRs633wQ', desc: 'Electrostatics & Current Electricity' },
    { term: '4th Term', title: '4th Term', link: 'https://drive.google.com/drive/folders/1RQkVxuuI9LN6uNPU1gy5KtAt-4M8uFJe', desc: 'Magnetic Fields & Induction' },
    { term: '5th Term', title: '5th Term', link: 'https://drive.google.com/drive/folders/1TnqyZFTygnq8tVeRtUlzzlmRGGI7kB1t', desc: 'Matter, Radiation & Electronics' },
    { term: '6th Term', title: '6th Term', link: 'https://drive.google.com/drive/folders/1VT2y8QjbhPbN7-qaRu6UsnOpsHaKd2IL', desc: 'Full Syllabus Final Pilot' },
  ];

  const fwcChemTerms = [
    { term: '1st Term', title: '1st Term', link: 'https://drive.google.com/drive/folders/1dJjXv4nREJDzdREIYNdR9fwlv0KAlhRb', desc: 'Atomic Structure, Bonding & Calculations' },
    { term: '2nd Term', title: '2nd Term', link: 'https://drive.google.com/drive/folders/1FiiFjycD0hhXbjVWxQT9HM4ZRfLG9a8Z', desc: 'Gaseous State, Energetics & s, p-Block' },
    { term: '3rd Term', title: '3rd Term', link: 'https://drive.google.com/drive/folders/1yZgJxvCnQmFNbW0_bUYtQlSZKYDnWPHs', desc: 'Basic Organic Chemistry & Hydrocarbons' },
    { term: '4th Term', title: '4th Term', link: 'https://drive.google.com/drive/folders/161x3AguSqk5ZLzszNeYH1WSLQ6onLXJ0', desc: 'Chemical Kinetics & Equilibrium' },
    { term: '5th Term', title: '5th Term', link: 'https://drive.google.com/drive/folders/1hbe1Mqc9Uxf42ym-xj9zc2sWlz2cpN26', desc: 'Electrochemistry & Coordination Chemistry' },
    { term: '6th Term', title: '6th Term', link: 'https://drive.google.com/drive/folders/1vxZPCwiH5KWg_NBrN-7rM6BaGflAHcZ1', desc: 'Industrial Chemistry & Full Syllabus Pilot' },
  ];

  const fwcBioTerms = [
    { term: '1st Term', title: '1st Term', link: 'https://drive.google.com/drive/folders/1jQL3RY0gJrcOq-SxZfbqrmwao3EnVACM', desc: 'Cellular Basis of Life' },
    { term: '2nd Term', title: '2nd Term', link: 'https://drive.google.com/drive/folders/1Y5jypHrqlJHtrGOLqbtSgktDYTqbQ9RC', desc: 'Plant Form & Transport' },
    { term: '3rd Term', title: '3rd Term', link: 'https://drive.google.com/drive/folders/1ORaHmZ-WqRAK_JXl2dmpwDtnrDGp0AMp', desc: 'Animal Physiology Year-End' },
    { term: '4th Term', title: '4th Term', link: 'https://drive.google.com/drive/folders/1OGE7_yeXCqDQ0ShnG2vayARAzTut0bEe', desc: 'Genetics & Molecular Bio' },
    { term: '5th Term', title: '5th Term', link: 'https://drive.google.com/drive/folders/1RHktt0TMN19nJhsQFJPlFhXZsbQ4y_Y_', desc: 'Ecology & Environmental Bio' },
    { term: '6th Term', title: '6th Term', link: 'https://drive.google.com/drive/folders/19OOuzs1xAMz3QAGoNYG0MSPRJs4QHQSB', desc: 'Full Syllabus Final Pilot' },
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
            — Select a folder to view papers & marking schemes
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

      {/* Grid of 7 Term Folders (FWC Pilot + 1st to 6th Term) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {TERM_FOLDERS.map((folder) => {
          const isSelected = selectedTerm === folder.id;
          const count = getTermCount(folder.id);
          const hasUploadedBadge = folder.badge;

          return (
            <div
              key={folder.id}
              onClick={() => onSelectTerm(isSelected ? 'all' : folder.id)}
              className={`relative rounded-2xl p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group border select-none ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-50/90 to-white border-blue-500 shadow-md ring-2 ring-blue-500/20 transform -translate-y-0.5'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
              }`}
            >
              {/* Top Row: Icon + Count */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#0066FF] text-white shadow-xs'
                        : 'bg-blue-50 text-[#0066FF] group-hover:bg-blue-100'
                    }`}
                  >
                    {isSelected ? (
                      <FolderOpen className="w-4 h-4" />
                    ) : (
                      <Folder className="w-4 h-4" />
                    )}
                  </div>

                  <span
                    className={`text-[11px] font-extrabold font-mono px-2 py-0.5 rounded-lg ${
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
                  className={`text-xs sm:text-sm font-black tracking-tight mb-0.5 ${
                    isSelected ? 'text-[#0066FF]' : 'text-slate-900 group-hover:text-[#0066FF]'
                  }`}
                >
                  {folder.name}
                </h3>

                {/* Subtitle / Stage */}
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mb-2 line-clamp-1">
                  {folder.stage}
                </p>

                {/* Highlight Badge */}
                {hasUploadedBadge && (
                  <div className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200/80 px-1.5 py-0.5 rounded-md mb-1 max-w-full truncate">
                    <Sparkles className="w-2.5 h-2.5 text-[#0066FF] shrink-0" />
                    <span className="truncate">{folder.badge}</span>
                  </div>
                )}
              </div>

              {/* Bottom Action Hint */}
              <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span
                  className={`font-bold ${
                    isSelected ? 'text-[#0066FF]' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {isSelected ? 'Open' : 'View'}
                </span>
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${
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

      {/* Interactive FWC Combined Maths Complete 1–6 Terms Showcase Banner */}
      {selectedStream !== 'bio' && (selectedSubject === 'c-maths' || selectedSubject === 'all') && (
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-2 border-purple-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                <Calculator className="w-4 h-4 text-purple-400" />
                <span>Thondaimanaru Field Work Centre (FWC) Combined Mathematics Archive</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                FWC Combined Maths Terms 1, 2, 3, 4, 5 & 6 Examination Papers & Step Solutions
              </h3>
              <div className="text-xs font-bold text-purple-300">
                தொண்டைமானாறு கள நிலையம் (FWC) இணைந்த கணிதம் தவணை 1 முதல் 6 வரையிலான முழுமையான வினாத்தாள்களும் படிமுறைத் தீர்வுகளும்
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All 6 terms of FWC Combined Mathematics (Pure & Applied) examination papers are uploaded with official step-by-step marking schemes and solutions. Touch any term below to jump straight to its folder:
              </p>

              {/* Term Fast-Jumper Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {fwcMathsTerms.map((m) => (
                  <button
                    key={m.term}
                    onClick={() => {
                      onSelectTerm(m.term);
                      onSelectSubject('c-maths');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      selectedTerm === m.term
                        ? 'bg-purple-400 text-slate-950 border-purple-300 shadow-sm font-black ring-2 ring-purple-300/40'
                        : 'bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border-purple-500/30'
                    }`}
                  >
                    <span>📁</span>
                    <span>{m.title}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <a
                href="https://drive.google.com/drive/folders/1ZdIODWG_-rzNw-782VuLRrIJS247xtXi"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open FWC Maths Term 1 Drive</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  onSelectSubject('c-maths');
                  onSelectTerm('all');
                }}
                className="px-5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 border border-purple-500/30 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-purple-400" />
                <span>View All FWC Maths Papers</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive FWC Physics Complete 1–6 Terms Showcase Banner */}
      {(selectedSubject === 'physics' || selectedSubject === 'all') && (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold border border-blue-500/30">
                <Atom className="w-4 h-4 text-sky-400" />
                <span>Thondaimanaru Field Work Centre (FWC) Physics Archive</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                FWC Physics Terms 1, 2, 3, 4, 5 & 6 Examination Papers & Schemes
              </h3>
              <div className="text-xs font-bold text-sky-300">
                தொண்டைமானாறு கள நிலையம் (FWC) பௌதிகவியல் தவணை 1 முதல் 6 வரையிலான முழுமையான வினாத்தாள்களும் புள்ளியிடல் திட்டங்களும்
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All 6 terms of FWC Physics examination papers are uploaded with official step-by-step marking schemes. Touch any term below to jump straight to its folder:
              </p>

              {/* Term Fast-Jumper Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {fwcPhyTerms.map((p) => (
                  <button
                    key={p.term}
                    onClick={() => {
                      onSelectTerm(p.term);
                      onSelectSubject('physics');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      selectedTerm === p.term
                        ? 'bg-sky-400 text-slate-950 border-sky-300 shadow-sm font-black ring-2 ring-sky-300/40'
                        : 'bg-blue-900/60 hover:bg-blue-800/80 text-sky-200 border-blue-500/30'
                    }`}
                  >
                    <span>📁</span>
                    <span>{p.title}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <a
                href="https://drive.google.com/drive/folders/1T-zfsSFwpA16EVtvoimLUSnZzj4J1EtT"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-[#0066FF] hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open FWC Physics Term 1 Drive</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  onSelectSubject('physics');
                  onSelectTerm('all');
                }}
                className="px-5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 border border-blue-500/30 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-sky-400" />
                <span>View All FWC Physics Papers</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive FWC Chemistry Complete 1–6 Terms Showcase Banner */}
      {(selectedSubject === 'chemistry' || selectedSubject === 'all') && (
        <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                <span>Thondaimanaru Field Work Centre (FWC) Chemistry Archive</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                FWC Chemistry Terms 1, 2, 3, 4, 5 & 6 Examination Papers & Schemes
              </h3>
              <div className="text-xs font-bold text-emerald-300">
                தொண்டைமானாறு கள நிலையம் (FWC) இரசாயனவியல் தவணை 1 முதல் 6 வரையிலான முழுமையான வினாத்தாள்களும் புள்ளியிடல் திட்டங்களும்
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All 6 terms of FWC Chemistry examination papers are uploaded with official step-by-step marking schemes. Touch any term below to jump straight to its folder:
              </p>

              {/* Term Fast-Jumper Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {fwcChemTerms.map((c) => (
                  <button
                    key={c.term}
                    onClick={() => {
                      onSelectTerm(c.term);
                      onSelectSubject('chemistry');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      selectedTerm === c.term
                        ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-sm font-black ring-2 ring-emerald-300/40'
                        : 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border-emerald-500/30'
                    }`}
                  >
                    <span>📁</span>
                    <span>{c.title}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <a
                href="https://drive.google.com/drive/folders/1dJjXv4nREJDzdREIYNdR9fwlv0KAlhRb"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open FWC Chemistry Term 1 Drive</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  onSelectSubject('chemistry');
                  onSelectTerm('all');
                }}
                className="px-5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>View All FWC Chemistry Papers</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive FWC Biology Complete 1–6 Terms Showcase Banner */}
      {selectedStream !== 'maths' && (selectedSubject === 'biology' || selectedSubject === 'all') && (
        <div className="bg-gradient-to-r from-rose-950 via-pink-950 to-slate-900 border-2 border-rose-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                <Award className="w-4 h-4 text-rose-400" />
                <span>Thondaimanaru Field Work Centre (FWC) Biology Archive</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                FWC Biology Terms 1, 2, 3, 4, 5 & 6 Examination Papers & Schemes
              </h3>
              <div className="text-xs font-bold text-rose-300">
                தொண்டைமானாறு கள நிலையம் (FWC) உயிரியல் தவணை 1 முதல் 6 வரையிலான முழுமையான வினாத்தாள்களும் புள்ளியிடல் திட்டங்களும்
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All 6 terms of FWC Biology examination papers are uploaded with official step-by-step marking schemes. Touch any term below to jump straight to its folder:
              </p>

              {/* Term Fast-Jumper Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {fwcBioTerms.map((b) => (
                  <button
                    key={b.term}
                    onClick={() => {
                      onSelectTerm(b.term);
                      onSelectSubject('biology');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      selectedTerm === b.term
                        ? 'bg-rose-400 text-slate-950 border-rose-300 shadow-sm font-black ring-2 ring-rose-300/40'
                        : 'bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border-rose-500/30'
                    }`}
                  >
                    <span>📁</span>
                    <span>{b.title}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <a
                href="https://drive.google.com/drive/folders/1jQL3RY0gJrcOq-SxZfbqrmwao3EnVACM"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open FWC Biology Term 1 Drive</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  onSelectSubject('biology');
                  onSelectTerm('all');
                }}
                className="px-5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 border border-rose-500/30 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-rose-400" />
                <span>View All FWC Biology Papers</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
