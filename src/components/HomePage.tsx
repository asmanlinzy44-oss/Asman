import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Zap, BookOpen, FileText, Award, School, 
  Video, ArrowRight, ExternalLink, Download, Clock, 
  CheckCircle2, Compass, ShieldCheck, Flame, Layers,
  Instagram, MessageSquare
} from 'lucide-react';
import { StreamId, ResourceCategory } from '../types';
import { ExamCountdown } from './ExamCountdown';
import { StudyProLogo } from './StudyProLogo';

interface HomePageProps {
  onNavigateToTab: (tab: ResourceCategory) => void;
  onOpenTimer: () => void;
  onOpenAuth: () => void;
  onOpenContactUs: () => void;
  onOpenAdminLogin: () => void;
  user: any;
}

const STREAMS_DATA: Array<{
  id: StreamId;
  name: string;
  badge: string;
  icon: string;
  pathway: string;
  subjects: string[];
  gradient: string;
  borderHover: string;
  bgGlow: string;
}> = [
  {
    id: 'maths',
    name: 'Physical Science (Maths Stream)',
    badge: 'Combined Maths',
    icon: '🧮',
    pathway: 'Engineering, Physical Sciences, Computing & Architecture',
    subjects: ['Combined Mathematics', 'Physics', 'Chemistry'],
    gradient: 'from-blue-600 to-indigo-600',
    borderHover: 'hover:border-blue-500 hover:shadow-blue-500/10',
    bgGlow: 'bg-blue-50/50',
  },
  {
    id: 'bio',
    name: 'Biological Science (Bio Stream)',
    badge: 'Biology & Chemistry',
    icon: '🧬',
    pathway: 'Medicine, Surgery, Dentistry, Biomedical & Health Sciences',
    subjects: ['Biology', 'Chemistry', 'Physics'],
    gradient: 'from-emerald-600 to-teal-600',
    borderHover: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
    bgGlow: 'bg-emerald-50/50',
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
    title: 'Theory & Short Notes',
    tag: 'High-Yield Summaries',
    badgeColor: 'bg-purple-100 text-purple-800',
    description: 'Structured revision digests, formula cheat sheets, and unit summaries distilled by expert educators.',
    icon: BookOpen,
    features: ['Key formulas & derivations', 'Quick revision cheat sheets', 'Downloadable PDF handouts'],
    buttonText: 'Read Theory Notes',
  },
  {
    id: 'theory-videos',
    title: 'Theory Video Masterclasses',
    tag: 'In-Website Video Player',
    badgeColor: 'bg-rose-100 text-rose-800',
    description: 'Distraction-free video lectures played directly in our custom player with chapter markers and personal note taking.',
    icon: Video,
    features: ['Unlisted YouTube lectures', 'Timestamp chapter markers', 'Integrated note-taking notebook'],
    buttonText: 'Watch Video Lessons',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToTab,
  onOpenTimer,
  onOpenAuth,
  onOpenContactUs,
  onOpenAdminLogin,
  user,
}) => {
  // Moving word cycler
  const rotatingWords = [
    'Past Papers & Schemes',
    'FWC Pilot Examinations',
    'School Term Tests',
    'Theory & Short Notes',
    'Video Masterclasses',
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 1. Top Moving Text Ticker with "Study Smart, Work Hard" Quote */}
      <div className="bg-slate-950 text-white overflow-hidden py-2.5 border-b border-slate-800 shadow-inner">
        <div className="animate-ticker flex items-center gap-10 whitespace-nowrap text-xs font-semibold">
          {/* Quote Item Prominently */}
          <span className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
            <span className="text-sm">💡</span>
            <span>"Study Smart, Work Hard" — Strive for your dream university entrance!</span>
          </span>

          <span className="text-slate-500 font-bold">✦</span>

          <span className="flex items-center gap-1.5 text-sky-400 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>STUDY PRO: Sri Lanka's Premier A/L Science Portal (Maths & Bio Streams)</span>
          </span>

          <span className="text-slate-500 font-bold">✦</span>

          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Latest: 2022–2027 G.C.E. A/L Physics 1st Term Papers & Schemes Uploaded</span>
          </span>

          <span className="text-slate-500 font-bold">✦</span>

          <span className="flex items-center gap-1.5 text-blue-300 font-medium">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Direct Google Drive Integration: Instant View & Download</span>
          </span>

          <span className="text-slate-500 font-bold">✦</span>

          <span className="flex items-center gap-1.5 text-purple-300 font-medium">
            <Video className="w-3.5 h-3.5" />
            <span>Distraction-Free Video Player: Watch unlisted lectures in-app</span>
          </span>

          {/* Repeat for seamless infinite scrolling */}
          <span className="text-slate-500 font-bold">✦</span>

          <span className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
            <span className="text-sm">💡</span>
            <span>"Study Smart, Work Hard" — Strive for your dream university entrance!</span>
          </span>

          <span className="text-slate-500 font-bold">✦</span>

          <span className="flex items-center gap-1.5 text-sky-400 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>STUDY PRO: Sri Lanka's Premier A/L Science Portal (Maths & Bio Streams)</span>
          </span>
        </div>
      </div>

      {/* 2. Hero Section (Newspaper/Magazine Headline & Clean Aesthetic) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-slate-50 border-b border-slate-200/80 px-4 pt-12 pb-14 sm:pt-16 sm:pb-18 text-center">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#0066FF 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Logo Showcase */}
          <div className="flex justify-center mb-4">
            <StudyProLogo size="xl" variant="light" />
          </div>

          {/* Premium Sub-kicker / Logo Introduction */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0066FF] text-xs font-bold mb-6 shadow-2xs">
            <Compass className="w-3.5 h-3.5" />
            <span>Official Sri Lankan G.C.E. Advanced Level Science Stream (Maths & Bio) Academic Archive</span>
          </div>

          {/* 3. Examination Countdown Widget: Positioned right below the logo introduction */}
          <div className="max-w-3xl mx-auto mb-8 text-left">
            <ExamCountdown />
          </div>

          {/* Dynamic Moving Headline */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Study Smart. Reach Your Highest Island Rank In
            <span className="block mt-2.5 min-h-[1.3em]">
              <span className="inline-block px-5 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 via-[#0066FF] to-indigo-600 text-white shadow-md transform transition-all duration-300">
                {rotatingWords[currentWordIndex]}
              </span>
            </span>
          </h1>

          {/* Highlight Quote Box */}
          <div className="max-w-xl mx-auto my-6 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center gap-3 text-slate-700">
            <span className="text-2xl">📖</span>
            <div className="text-left">
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 italic">
                "Study Smart, Work Hard — Consistency today determines your university entrance tomorrow."
              </p>
              <span className="text-[11px] text-slate-500 font-medium">— Study Pro Academic Panel</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            Choose what you want to explore from the sections below. Fast PDF previews, direct Google Drive storage access, and in-website theory video lessons.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigateToTab('past-papers')}
              className="px-6 py-3 rounded-2xl bg-[#0066FF] hover:bg-blue-600 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <FileText className="w-4 h-4" />
              <span>Explore Past Papers</span>
            </button>

            <button
              onClick={() => onNavigateToTab('fwc-papers')}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Award className="w-4 h-4" />
              <span>FWC & Term Tests</span>
            </button>

            <button
              onClick={() => onNavigateToTab('theory-videos')}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4 text-sky-400" />
              <span>Video Masterclasses</span>
            </button>

            <button
              onClick={onOpenTimer}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-[#0066FF]" />
              <span>Focus Timer (25m)</span>
            </button>

            <button
              onClick={onOpenContactUs}
              className="px-5 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#0066FF] font-extrabold text-sm border border-blue-200 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
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
        <section>
          <div className="text-center max-w-2xl mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0066FF] mb-1">
              <Layers className="w-4 h-4" />
              <span>A/L Science Curriculum</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Select Your Science Stream
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Specially dedicated to Physical Science (Combined Maths) and Biological Science (Biology) students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {STREAMS_DATA.map((st) => (
              <div
                key={st.id}
                onClick={() => onNavigateToTab('past-papers')}
                className={`p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1 ${st.borderHover}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl p-2.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-2xs">
                      {st.icon}
                    </span>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200/60">
                      {st.badge}
                    </span>
                  </div>

                  <h3 className="font-black text-xl text-slate-900 leading-snug group-hover:text-[#0066FF] transition-colors mb-1.5">
                    {st.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                    {st.pathway}
                  </p>

                  <div className="space-y-2 mb-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Core Subjects:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {st.subjects.map((sub, i) => (
                        <span key={i} className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0066FF]">
                  <span>Access {st.badge} Archive</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. The 5 Academic Mission Sections (Attractive Clean Magazine Hub - NO Cluttered Paper Cards) */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0066FF] mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Academic Resource Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Choose What You Want to Practice
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select any archive below to enter its dedicated search, filter, and download repository.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORY_SHOWCASE.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-400"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center group-hover:bg-[#0066FF] group-hover:text-white transition-colors shadow-2xs">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cat.badgeColor}`}>
                        {cat.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0066FF] transition-colors mb-2">
                      {cat.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {cat.description}
                    </p>

                    <div className="space-y-1.5 mb-6 pt-2 border-t border-slate-100">
                      {cat.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0066FF] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToTab(cat.id)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-[#0066FF] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs group-hover:shadow-md"
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
        <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
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
              onClick={() => onNavigateToTab('past-papers')}
              className="px-6 py-3.5 rounded-2xl bg-[#0066FF] hover:bg-blue-600 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Explore All Materials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenTimer}
              className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Start 25m Pomodoro</span>
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-14 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Secret Admin Panel Trigger */}
            <button
              onClick={onOpenAdminLogin}
              className="p-1 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group focus:outline-none"
              title="Study Pro (Click for Admin System)"
            >
              <StudyProLogo size="sm" variant="light" />
            </button>
            <span className="text-slate-400">| Sri Lankan G.C.E. A/L Academic Portal</span>
          </div>

          {/* Center Links: Instagram & Contact Us */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/asman_linzy/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-200 text-pink-700 font-bold text-xs hover:border-pink-400 hover:text-pink-800 transition-all group shadow-2xs"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600 group-hover:scale-110 transition-transform" />
              <span>@asman_linzy</span>
            </a>

            <button
              onClick={onOpenContactUs}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contact Us</span>
            </button>
          </div>

          <p>© {new Date().getFullYear()} Study Pro. Built for Sri Lankan Advanced Level Students.</p>
        </div>
      </footer>
    </div>
  );
};
