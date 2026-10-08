import React, { useState, useEffect } from 'react';
import { 
  FileText, Award, BookOpen, Video, Clock, MessageSquare, 
  ExternalLink, CheckCircle2, ChevronRight,
  ShieldCheck, Layers, ArrowRight, Compass, Instagram, FolderOpen,
  Info, AlertCircle
} from 'lucide-react';
import { User, ResourceCategory } from '../types';
import { PaperExpressLogo } from './PaperExpressLogo';
import { ExamCountdown } from './ExamCountdown';
import { EducationalGuides } from './EducationalGuides';
import { playRoboticTab, playRoboticClick } from '../utils/audio';

interface HomePageProps {
  onNavigateToTab: (tab: ResourceCategory) => void;
  onOpenTimer: () => void;
  onOpenAuth: () => void;
  onOpenContactUs?: () => void;
  onOpenLegal?: (type: 'privacy' | 'terms' | 'about' | 'disclaimer') => void;
  user: User | null;
  isDarkMode?: boolean;
}

const STREAMS_DATA = [
  {
    id: 'maths',
    name: 'Physical Science (Combined Maths)',
    nameTa: 'Physical Science (Combined Mathematics)',
    icon: '📐',
    badge: 'Combined Maths, Physics, Chemistry',
    desc: 'Pure & Applied Mathematics, Physics principles & Inorganic/Organic Chemistry master resources.',
    color: 'from-blue-600 to-indigo-700',
    borderHover: 'hover:border-blue-500',
    accentText: 'text-[#0066FF]',
    subjects: ['Combined Mathematics', 'Physics', 'Chemistry'],
    pathway: 'Engineering, Computing, Architecture & Physical Sciences',
  },
  {
    id: 'bio',
    name: 'Biological Science (Bio)',
    nameTa: 'Biological Science (Biology)',
    icon: '🧬',
    badge: 'Biology, Physics, Chemistry',
    desc: 'Cell biology, human physiology, genetics, ecology, physics & chemistry practical guides.',
    color: 'from-emerald-600 to-teal-700',
    borderHover: 'hover:border-emerald-500',
    accentText: 'text-emerald-600',
    subjects: ['Biology', 'Chemistry', 'Physics'],
    pathway: 'Medicine, Dentistry, Biomedical, Agriculture & Allied Health',
  },
];

const CATEGORY_SHOWCASE: Array<{
  id: ResourceCategory;
  title: string;
  tag: string;
  badgeColor: string;
  description: string;
  icon: any;
  features: string[];
  buttonText: string;
}> = [
  {
    id: 'past-papers',
    title: 'National Past Papers',
    tag: 'Department of Examinations',
    badgeColor: 'bg-blue-100 text-blue-800',
    description: 'Official G.C.E. Advanced Level examination papers with comprehensive official marking schemes and scoring criteria.',
    icon: FileText,
    features: ['Past papers from 1981 onwards', 'Part A & Part B structured answers', 'Direct Google Drive PDF download'],
    buttonText: 'Explore Past Papers',
  },
  {
    id: 'fwc-papers',
    title: 'FWC & Term Test Papers',
    tag: 'FWC Series & School Term Tests',
    badgeColor: 'bg-amber-100 text-amber-900',
    description: 'Premier island-wide FWC Thondaimanaru pilot exams, 1st to 6th term test folders, and evaluation papers with official marking schemes.',
    icon: Award,
    features: ['1st to 6th Term organized folders', '2022–2027 Physics 1st Term Papers & Schemes', 'Search by subject & term with attached solutions'],
    buttonText: 'Open FWC & Term Folders',
  },
  {
    id: 'theory-notes',
    title: 'Resources',
    tag: 'Biology · Physics · Chemistry · C.Maths',
    badgeColor: 'bg-purple-100 text-purple-800',
    description: 'Curated G.C.E. A/L subject folders for Biology, Physics, Chemistry, and Combined Maths with unit guides, formula handbooks, and direct Google Drive folders.',
    icon: BookOpen,
    features: ['4 Dedicated Folders: Biology, Physics, Chemistry & C.Maths', 'Comprehensive unit summaries & master formula sheets', 'Direct Google Drive folders with instant read & download'],
    buttonText: 'Open Resources Folders',
  },
  {
    id: 'pilot-papers',
    title: 'Other Pilot Papers',
    tag: 'Moratuwa & Model Exams',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    description: 'University of Moratuwa pilot examinations, provincial trial assessments, and high-standard model question papers with full step marking schemes.',
    icon: FolderOpen,
    features: ['University of Moratuwa Pilot Collections for all 4 subjects', 'Standardized Paper 1 & Paper 2 answer schemes', 'Direct Google Drive folder access with in-app preview'],
    buttonText: 'Open Pilot Papers Folders',
  },
  {
    id: 'theory-videos',
    title: 'Theory Video Masterclasses',
    tag: 'In-Website Video Player',
    badgeColor: 'bg-rose-100 text-rose-800',
    description: 'Distraction-free video lectures played directly in our custom player with chapter markers and student passcode protection.',
    icon: Video,
    features: ['Physics Hydrodynamics Units 1–5 & Chemistry IUPAC', 'Distraction-free in-app lecture theater', 'Protected student index & passcode verification'],
    buttonText: 'Watch Video Lessons',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToTab,
  onOpenTimer,
  onOpenAuth,
  onOpenContactUs,
  onOpenLegal,
  user,
  isDarkMode = false,
}) => {
  // Moving word cycler
  const rotatingWords = [
    'Past Papers & Schemes',
    'FWC Pilot Examinations',
    'Other Pilot Papers (Moratuwa)',
    'School Term Tests (1st to 6th)',
    'Academic Resources (4 Subjects)',
    'Theory Video Masterclasses',
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleNav = (tab: ResourceCategory) => {
    playRoboticTab();
    onNavigateToTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 1. Top Moving Text Ticker with High-Yield Announcements */}
      <div className="bg-slate-950 text-white overflow-hidden py-2.5 border-b border-slate-800 shadow-inner">
        <div className="animate-ticker flex items-center gap-10 whitespace-nowrap text-xs font-semibold">
          {/* Quote Item Prominently */}
          <span className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
            <span className="text-sm">💡</span>
            <span>"Study Smart, Work Hard" — Strive for your dream university entrance!</span>
          </span>

          <span className="text-slate-600 font-bold">•</span>

          <span className="flex items-center gap-1.5 text-sky-400 font-bold">
            <span>PAPER EXPRESS: Sri Lanka's Premier A/L Science Portal (Maths & Bio Streams)</span>
          </span>

          <span className="text-slate-600 font-bold">•</span>

          <span className="flex items-center gap-1.5 text-purple-300 font-bold bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
            <BookOpen className="w-3.5 h-3.5 text-purple-300" />
            <span>New Resources Section: 4 Folders for Biology, Physics, Chemistry & Combined Maths</span>
          </span>

          <span className="text-slate-600 font-bold">•</span>

          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Physics Hydrodynamics Unit 2 Theory Video Classes 1 to 5 Now Available!</span>
          </span>

          <span className="text-slate-600 font-bold">•</span>

          <span className="flex items-center gap-1.5 text-blue-300 font-medium">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Direct Google Drive Integration: Instant View & Download</span>
          </span>

          <span className="text-slate-600 font-bold">•</span>

          <span className="flex items-center gap-1.5 text-amber-300 font-medium">
            <Award className="w-3.5 h-3.5" />
            <span>FWC & Term Folders: 1st, 2nd, 3rd, 4th, 5th, 6th Term Tests</span>
          </span>

          {/* Repeat for seamless infinite scrolling */}
          <span className="text-slate-600 font-bold">•</span>

          <span className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
            <span className="text-sm">💡</span>
            <span>"Study Smart, Work Hard" — Strive for your dream university entrance!</span>
          </span>

          <span className="text-slate-600 font-bold">•</span>

          <span className="flex items-center gap-1.5 text-sky-400 font-bold">
            <span>PAPER EXPRESS: Sri Lanka's Premier A/L Science Portal (Maths & Bio Streams)</span>
          </span>
        </div>
      </div>

      {/* 2. Hero Section (Newspaper/Magazine Headline & Clean Aesthetic) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800 px-4 pt-12 pb-14 sm:pt-16 sm:pb-18 text-center transition-colors">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#0066FF 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Logo Showcase */}
          <div className="flex justify-center mb-4">
            <PaperExpressLogo size="xl" variant={isDarkMode ? 'dark' : 'light'} />
          </div>

          {/* Premium Sub-kicker / Logo Introduction */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-[#0066FF] dark:text-sky-300 text-xs font-bold mb-6 shadow-2xs">
            <Compass className="w-3.5 h-3.5" />
            <span>Official Sri Lankan G.C.E. Advanced Level Science Stream (Maths & Bio) Academic Archive</span>
          </div>

          {/* 3. Examination Countdown Widget */}
          <div className="max-w-3xl mx-auto mb-8">
            <ExamCountdown />
          </div>

          {/* Dynamic Moving Headline */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            Study Smart. Reach Your Highest Island Rank In
            <span className="block mt-2.5 min-h-[1.3em]">
              <span className="inline-block px-5 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 via-[#0066FF] to-indigo-600 text-white shadow-md transform transition-all duration-300 animate-pulse">
                {rotatingWords[currentWordIndex]}
              </span>
            </span>
          </h1>

          {/* Highlight Quote Box */}
          <div className="max-w-xl mx-auto my-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-center gap-3 text-slate-700 dark:text-slate-300">
            <span className="text-2xl">📖</span>
            <div className="text-left">
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white italic">
                "Study Smart, Work Hard — Consistency today determines your university entrance tomorrow."
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">— Paper Express Academic Panel</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            Choose what you want to explore from the sections below. Fast PDF previews, direct Google Drive storage access, and in-website theory video lessons.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleNav('past-papers')}
              className="px-6 py-3 rounded-2xl bg-[#0066FF] hover:bg-blue-600 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <FileText className="w-4 h-4" />
              <span>Explore Past Papers</span>
            </button>

            <button
              onClick={() => handleNav('fwc-papers')}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Award className="w-4 h-4" />
              <span>FWC & Term Tests</span>
            </button>

            <button
              onClick={() => handleNav('theory-notes')}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Resources (4 Folders)</span>
            </button>

            <button
              onClick={() => handleNav('theory-videos')}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4 text-sky-400" />
              <span>Video Masterclasses</span>
            </button>

            <button
              onClick={() => {
                playRoboticClick();
                onOpenTimer();
              }}
              className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-300 dark:border-slate-700 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-[#0066FF]" />
              <span>Focus Timer (25m)</span>
            </button>

            <button
              onClick={() => {
                playRoboticClick();
                if (onOpenContactUs) onOpenContactUs();
              }}
              className="px-5 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0066FF] dark:text-sky-400 font-extrabold text-sm border border-blue-200 dark:border-blue-900 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#0066FF]" />
              <span>Contact Us</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        {/* 4. Stream Selection Portals (Science Only: Maths & Bio) */}
        <section className="reveal-on-scroll">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0066FF] mb-1">
              <Layers className="w-4 h-4" />
              <span>A/L Science Curriculum</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Select Your Science Stream
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Specially dedicated to Physical Science (Combined Maths) and Biological Science (Biology) students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {STREAMS_DATA.map((st, idx) => (
              <div
                key={st.id}
                onClick={() => handleNav('past-papers')}
                className={`reveal-on-scroll reveal-delay-${idx + 1} p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1 hover-card-elevate ${st.borderHover}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-2xs">
                      {st.icon}
                    </span>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-sky-400 border border-blue-200/60 dark:border-blue-900">
                      {st.badge}
                    </span>
                  </div>

                  <h3 className="font-black text-xl text-slate-900 dark:text-white leading-snug group-hover:text-[#0066FF] dark:group-hover:text-sky-400 transition-colors mb-1.5">
                    {st.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 leading-relaxed">
                    {st.pathway}
                  </p>

                  <div className="space-y-2 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Core Subjects:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {st.subjects.map((sub, i) => (
                        <span key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold text-[#0066FF] dark:text-sky-400">
                  <span>Access {st.badge} Archive</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. The 4 Academic Catalogs */}
        <section className="space-y-6 reveal-on-scroll">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0066FF] dark:text-sky-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Academic Resource Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Choose What You Want to Practice
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select any archive below to enter its dedicated search, filter, and download repository.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORY_SHOWCASE.map((cat, idx) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={cat.id}
                  className={`reveal-on-scroll reveal-delay-${(idx % 3) + 1} bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-400 dark:hover:border-blue-500 hover-card-elevate`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-sky-400 flex items-center justify-center group-hover:bg-[#0066FF] group-hover:text-white transition-colors shadow-2xs">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cat.badgeColor}`}>
                        {cat.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-[#0066FF] dark:group-hover:text-sky-400 transition-colors mb-2">
                      {cat.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {cat.description}
                    </p>

                    <div className="space-y-1.5 mb-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {cat.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0066FF] dark:text-sky-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleNav(cat.id)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-[#0066FF] dark:hover:bg-[#0066FF] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs group-hover:shadow-md"
                  >
                    <span>{cat.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. Elite Study Advantage & Cloud Storage Banner */}
        <section className="reveal-on-scroll bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-extrabold uppercase tracking-wider mb-3 border border-blue-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Reliable Academic Infrastructure</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Direct Google Drive Integration & In-Website Video
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              All PDF examination resources open directly in Google Drive for lightning-fast downloads and offline reading. Theory videos run inside our distraction-free player without YouTube ads or algorithm distractions.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleNav('fwc-papers')}
              className="px-6 py-3.5 rounded-2xl bg-[#0066FF] hover:bg-blue-600 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Explore FWC Folders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNav('theory-notes')}
              className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Explore Resources Folders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Comprehensive Official A/L Academic Guide & Syllabus Insights */}
        <EducationalGuides />
      </div>

      {/* Comprehensive Professional Publisher & AdSense Compliant Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 pt-12 pb-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Publisher Mission */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <PaperExpressLogo size="sm" variant="dark" />
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Paper Express is an independent non-profit academic portal providing verified G.C.E. Advanced Level past papers, marking schemes, and revision guides for Physical Science and Biological Science streams across Sri Lanka.
              </p>
              <div className="pt-2">
                <a
                  href="https://www.instagram.com/asman_linzy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-500/30 text-pink-300 font-bold text-xs hover:border-pink-400 hover:text-pink-200 transition-all group"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span>@asman_linzy</span>
                </a>
              </div>
            </div>

            {/* Col 2: Academic Sections */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Academic Portals</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => handleNav('past-papers')} className="hover:text-white transition-colors cursor-pointer text-left">
                    📄 National Past Papers (1981–2024)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('fwc-papers')} className="hover:text-white transition-colors cursor-pointer text-left">
                    ⭐ FWC Pilot & 1st–6th Term Tests
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('theory-notes')} className="hover:text-white transition-colors cursor-pointer text-left">
                    📁 Subject Resources (4 Folders)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('pilot-papers')} className="hover:text-white transition-colors cursor-pointer text-left">
                    🏛️ University of Moratuwa Pilot Exams
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Publisher & Transparency Policies (Required by Google AdSense) */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Policy & Legal Transparency</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button 
                    onClick={() => {
                      playRoboticClick();
                      if (onOpenLegal) onOpenLegal('privacy');
                    }} 
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Privacy Policy & Cookies</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      playRoboticClick();
                      if (onOpenLegal) onOpenLegal('terms');
                    }} 
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Terms of Service</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      playRoboticClick();
                      if (onOpenLegal) onOpenLegal('about');
                    }} 
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>About Paper Express</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      playRoboticClick();
                      if (onOpenLegal) onOpenLegal('disclaimer');
                    }} 
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Academic Fair Use Disclaimer</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      playRoboticClick();
                      if (onOpenContactUs) onOpenContactUs();
                    }} 
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Contact Support & Help Desk</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: AdSense Disclosure & Publisher Rights */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">AdSense & Cookie Disclosure</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Third-party vendors, including Google, use cookies to serve ads based on prior visits. You can opt out of personalized ads at{' '}
                <a 
                  href="https://adssettings.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sky-400 hover:underline font-bold inline-flex items-center gap-0.5"
                >
                  Ads Settings <ExternalLink className="w-3 h-3 inline" />
                </a>.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
                Official past examination materials belong to the Department of Examinations, Sri Lanka. Hosted under educational fair use.
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <p>© {new Date().getFullYear()} Paper Express (paperexpress.vercel.app). All rights reserved.</p>
            <p>Designed for Sri Lankan G.C.E. Advanced Level Science Students (Maths & Bio Stream).</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
