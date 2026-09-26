import React from 'react';
import { 
  Folder, FolderOpen, ChevronRight, Sparkles, BookOpen, 
  ExternalLink, FileText, Download, Eye, Bookmark, 
  Atom, FlaskConical, Calculator, Dna, ArrowRight, ShieldCheck, Library
} from 'lucide-react';
import { PaperResource } from '../types';
import { playRoboticFolder, playRoboticClick } from '../utils/audio';

interface ResourcesFoldersViewProps {
  selectedSubject: string;
  onSelectSubject: (subjId: string) => void;
  resources: PaperResource[];
  onPreview: (res: PaperResource, mode?: 'paper' | 'scheme') => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (id: string) => void;
}

export interface ResourceFolderDef {
  id: string;
  name: string;
  nameTa: string;
  subjectId: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgGradient: string;
  borderTheme: string;
  pillColor: string;
  units: string;
  description: string;
  driveLink: string;
}

export const RESOURCE_FOLDERS: ResourceFolderDef[] = [
  {
    id: 'biology-folder',
    name: 'Biology',
    nameTa: 'Biology Resources · உயிரியல் வளங்கள்',
    subjectId: 'biology',
    icon: Dna,
    accentColor: 'text-rose-500',
    bgGradient: 'from-rose-500/10 via-pink-500/5 to-white',
    borderTheme: 'border-rose-200 hover:border-rose-400',
    pillColor: 'bg-rose-100 text-rose-800',
    units: 'Units 1 – 10: Cell Bio, Plant & Animal Physiology, Genetics, Ecology',
    description: 'Complete unit notes, histological diagrams, biological mechanisms and high-yield revision summaries.',
    driveLink: 'https://drive.google.com/drive/folders/1jQL3RY0gJrcOq-SxZfbqrmwao3EnVACM',
  },
  {
    id: 'physics-folder',
    name: 'Physics',
    nameTa: 'Physics Resources · பௌதிகவியல் வளங்கள்',
    subjectId: 'physics',
    icon: Atom,
    accentColor: 'text-blue-500',
    bgGradient: 'from-blue-500/10 via-sky-500/5 to-white',
    borderTheme: 'border-blue-200 hover:border-blue-400',
    pillColor: 'bg-blue-100 text-blue-800',
    units: 'Units 1 – 11: Mechanics, Hydro, Waves, Fields, Thermal & Electronics',
    description: 'Master formula handbooks, unit derivations, hydrodynamics notes and practical experiment guides.',
    driveLink: 'https://drive.google.com/drive/folders/1T-zfsSFwpA16EVtvoimLUSnZzj4J1EtT',
  },
  {
    id: 'chemistry-folder',
    name: 'Chemistry',
    nameTa: 'Chemistry Resources · இரசாயனவியல் வளங்கள்',
    subjectId: 'chemistry',
    icon: FlaskConical,
    accentColor: 'text-emerald-500',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-white',
    borderTheme: 'border-emerald-200 hover:border-emerald-400',
    pillColor: 'bg-emerald-100 text-emerald-800',
    units: 'Units 1 – 14: Atomic Structure, Kinetics, Equilibrium & Organic Pathways',
    description: 'Organic reaction conversion charts, inorganic color summaries, standard enthalpy data & equilibrium cheat sheets.',
    driveLink: 'https://drive.google.com/drive/folders/1dJjXv4nREJDzdREIYNdR9fwlv0KAlhRb',
  },
  {
    id: 'maths-folder',
    name: 'Combined Maths',
    nameTa: 'Combined Maths Resources · இணைந்த கணித வளங்கள்',
    subjectId: 'c-maths',
    icon: Calculator,
    accentColor: 'text-purple-500',
    bgGradient: 'from-purple-500/10 via-indigo-500/5 to-white',
    borderTheme: 'border-purple-200 hover:border-purple-400',
    pillColor: 'bg-purple-100 text-purple-800',
    units: 'Pure & Applied Maths: Algebra, Calculus, Trigonometry & Mechanics',
    description: 'Integration standard substitutions, coordinate geometry proofs, dynamics laws and vector mechanics sheets.',
    driveLink: 'https://drive.google.com/drive/folders/1ZdIODWG_-rzNw-782VuLRrIJS247xtXi',
  },
];

export const ResourcesFoldersView: React.FC<ResourcesFoldersViewProps> = ({
  selectedSubject,
  onSelectSubject,
  resources,
  onPreview,
  isBookmarked,
  onToggleBookmark,
}) => {
  const getSubjectCount = (subjId: string) => {
    return resources.filter((r) => r.subjectId === subjId).length;
  };

  const handleFolderClick = (subjId: string) => {
    playRoboticFolder();
    onSelectSubject(selectedSubject === subjId ? 'all' : subjId);
    setTimeout(() => {
      const el = document.getElementById('resources-files-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const activeFolder = RESOURCE_FOLDERS.find((f) => f.subjectId === selectedSubject);
  const displayedResources = selectedSubject === 'all' 
    ? resources 
    : resources.filter((r) => r.subjectId === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Top Banner with Moving Highlight */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold border border-blue-500/30">
              <Library className="w-3.5 h-3.5" />
              <span>G.C.E. A/L Comprehensive Academic Resources</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Subject Resource Folders & Theory Guides
            </h2>
            <div className="text-xs font-bold text-sky-200">
              உயிரியல், பௌதிகவியல், இரசாயனவியல் மற்றும் இணைந்த கணிதக் கற்றல் வளங்கள்
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Curated A/L syllabus revision materials, formula sheets, short notes, unit summaries, and step-by-step problem guides. Select any subject folder below:
            </p>
          </div>

          {selectedSubject !== 'all' && (
            <button
              onClick={() => {
                playRoboticClick();
                onSelectSubject('all');
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
            >
              <span>View All 4 Folders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Dedicated Subject Folders Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-blue-600" />
            <span>Select a Subject Folder</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Touch folder to explore files</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESOURCE_FOLDERS.map((folder) => {
            const isSelected = selectedSubject === folder.subjectId;
            const count = getSubjectCount(folder.subjectId);
            const Icon = folder.icon;

            return (
              <div
                key={folder.id}
                onClick={() => handleFolderClick(folder.subjectId)}
                className={`relative rounded-3xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between group border select-none ${
                  isSelected
                    ? 'bg-white border-[#0066FF] shadow-xl ring-2 ring-blue-500/25 transform -translate-y-1'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Bar with Icon & Count */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#0066FF] text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-[#0066FF]'
                      }`}
                    >
                      {isSelected ? (
                        <FolderOpen className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>

                    <span
                      className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl ${
                        isSelected
                          ? 'bg-blue-100 text-[#0066FF]'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-[#0066FF]'
                      }`}
                    >
                      {count} files
                    </span>
                  </div>

                  {/* Folder Title */}
                  <h4 className="text-base font-black text-slate-900 group-hover:text-[#0066FF] transition-colors">
                    {folder.name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    {folder.nameTa}
                  </p>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {folder.description}
                  </p>
                </div>

                {/* Bottom Row Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`font-bold ${isSelected ? 'text-[#0066FF]' : 'text-slate-500'}`}>
                    {isSelected ? 'Folder Opened' : 'Open Folder'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={folder.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        playRoboticClick();
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Open Google Drive Folder"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform ${
                      isSelected ? 'text-[#0066FF] translate-x-0.5' : 'text-slate-400 group-hover:text-[#0066FF] group-hover:translate-x-0.5'
                    }`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Files List Section */}
      <div id="resources-files-section" className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              {activeFolder ? `${activeFolder.name} Documents` : 'All Academic Resources & Guides'}
            </h3>
            <span className="text-xs text-slate-500">
              ({displayedResources.length} items)
            </span>
          </div>

          {selectedSubject !== 'all' && (
            <button
              onClick={() => {
                playRoboticClick();
                onSelectSubject('all');
              }}
              className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer"
            >
              Reset to All Subjects
            </button>
          )}
        </div>

        {displayedResources.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs max-w-md mx-auto my-6">
            <BookOpen className="w-10 h-10 mx-auto text-blue-500 mb-3 opacity-60" />
            <h4 className="font-extrabold text-base text-slate-900 mb-1">No Files in this Folder Yet</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Curated notes and revision resources are being finalized for this section.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedResources.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between group transform hover:-translate-y-0.5"
              >
                <div>
                  {/* Subject Tag & Year */}
                  <div className="flex items-center justify-between gap-2 text-xs mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[#0066FF] bg-blue-50 px-2 py-0.5 rounded-md">
                        {res.subjectNameEn}
                      </span>
                      <span className="text-slate-400">· Resource</span>
                    </div>

                    <button
                      onClick={() => {
                        playRoboticClick();
                        onToggleBookmark(res.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isBookmarked(res.id)
                          ? 'text-amber-500 bg-amber-50'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={isBookmarked(res.id) ? 'Remove Bookmark' : 'Save to Bookmarks'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked(res.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Title */}
                  <h4 
                    onClick={() => {
                      playRoboticClick();
                      onPreview(res);
                    }}
                    className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors leading-snug mb-2 cursor-pointer"
                  >
                    {res.titleEn}
                  </h4>

                  {res.titleTa && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-2">
                      {res.titleTa}
                    </p>
                  )}

                  {res.unitOrTopic && (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 line-clamp-2 mb-3">
                      {res.unitOrTopic}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => {
                      playRoboticClick();
                      onPreview(res);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0066FF] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Read Guide</span>
                  </button>

                  <a
                    href={res.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playRoboticClick()}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Open in Google Drive"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
