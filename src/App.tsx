/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, BookOpen, Video, FileText, 
  ArrowLeft, ExternalLink, Download, Lock, CheckCircle
} from 'lucide-react';
import { 
  PaperResource, VideoLesson, User, ResourceCategory, 
  StreamId, UserNote 
} from './types';
import { INITIAL_PAPERS, INITIAL_VIDEOS, SUBJECTS, STREAMS, CATEGORIES } from './data/mockData';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { AuthModal } from './components/AuthModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ResourceCard } from './components/ResourceCard';
import { VideoCard } from './components/VideoCard';
import { BookmarksModal } from './components/BookmarksModal';
import { StudyTimerModal } from './components/StudyTimerModal';
import { TermFoldersView } from './components/TermFoldersView';
import { PastPaperFoldersView } from './components/PastPaperFoldersView';

export default function App() {
  // Local storage persisted state - ensure newly uploaded past papers, physics papers and terms are always loaded
  const [papers, setPapers] = useState<PaperResource[]>(() => {
    const isPastPapersLoaded = localStorage.getItem('studypro_pastpapers_1975_2026_phy_v6');
    if (!isPastPapersLoaded) {
      localStorage.setItem('studypro_pastpapers_1975_2026_phy_v6', 'true');
      localStorage.setItem('studypro_papers_data', JSON.stringify(INITIAL_PAPERS));
      return INITIAL_PAPERS;
    }
    const saved = localStorage.getItem('studypro_papers_data');
    if (!saved) return INITIAL_PAPERS;
    try {
      const parsed: PaperResource[] = JSON.parse(saved);
      // Ensure all INITIAL_PAPERS exist in case new papers were added
      const existingIds = new Set(parsed.map((p) => p.id));
      const missingPapers = INITIAL_PAPERS.filter((p) => !existingIds.has(p.id));
      if (missingPapers.length > 0) {
        const merged = [...INITIAL_PAPERS];
        localStorage.setItem('studypro_papers_data', JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_PAPERS;
    }
  });

  const [videos, setVideos] = useState<VideoLesson[]>(() => {
    const isVideosLoaded = localStorage.getItem('studypro_chem_video_v1');
    if (!isVideosLoaded) {
      localStorage.setItem('studypro_chem_video_v1', 'true');
      localStorage.setItem('studypro_videos_data', JSON.stringify(INITIAL_VIDEOS));
      return INITIAL_VIDEOS;
    }
    const saved = localStorage.getItem('studypro_videos_data');
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('studypro_user_session');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return {
          ...u,
          bookmarks: (u.bookmarks || []).filter((id: string) => !id.startsWith('pp-') && !id.startsWith('fwc-') && !id.startsWith('term-') && !id.startsWith('tn-') && !id.startsWith('ur-')),
          watchedVideoIds: [],
        };
      } catch {
        // ignore parse error
      }
    }
    // Default student profile
    return {
      id: 'student_guest',
      name: 'A/L Scholar',
      email: 'student@studypro.lk',
      alYear: 2025,
      stream: 'maths',
      district: 'Jaffna',
      school: 'Hartley College',
      role: 'student',
      bookmarks: [],
      watchedVideoIds: [],
      notes: [],
    };
  });

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<ResourceCategory | 'home'>('home');
  const [selectedStream, setSelectedStream] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'papers' | 'schemes'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState('');
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Active Viewers
  const [previewResource, setPreviewResource] = useState<PaperResource | null>(null);
  const [previewMode, setPreviewMode] = useState<'paper' | 'scheme'>('paper');
  const [customPdfUrl, setCustomPdfUrl] = useState<string>('');
  const [customPdfTitle, setCustomPdfTitle] = useState<string>('');
  const [activeVideo, setActiveVideo] = useState<VideoLesson | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('studypro_papers_data', JSON.stringify(papers));
  }, [papers]);

  useEffect(() => {
    localStorage.setItem('studypro_videos_data', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('studypro_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('studypro_user_session');
    }
  }, [user]);

  // Handlers
  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleToggleBookmark = (resourceId: string) => {
    if (!user) {
      setAuthReason('Please sign in to save papers and notes to your student profile.');
      setIsAuthOpen(true);
      return;
    }

    setUser((prev) => {
      if (!prev) return prev;
      const exists = prev.bookmarks.includes(resourceId);
      const updatedBookmarks = exists
        ? prev.bookmarks.filter((id) => id !== resourceId)
        : [...prev.bookmarks, resourceId];
      return { ...prev, bookmarks: updatedBookmarks };
    });
  };

  const handleToggleWatchedVideo = (videoId: string) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return prev;
      const exists = prev.watchedVideoIds.includes(videoId);
      const updated = exists
        ? prev.watchedVideoIds.filter((id) => id !== videoId)
        : [...prev.watchedVideoIds, videoId];
      return { ...prev, watchedVideoIds: updated };
    });
  };

  const handleSaveVideoNote = (note: UserNote) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notes: [...prev.notes, note],
      };
    });
  };

  const handlePlayVideo = (video: VideoLesson) => {
    if (!user) {
      setAuthReason('Theory video lectures are reserved for registered students. Sign in for instant access.');
      setIsAuthOpen(true);
      return;
    }
    setActiveVideo(video);
  };

  const handleOpenPdfPreview = (driveUrl: string, title: string) => {
    setCustomPdfUrl(driveUrl);
    setCustomPdfTitle(title);
    setPreviewResource(null);
  };

  const handleOpenPreview = (res: PaperResource, mode: 'paper' | 'scheme' = 'paper') => {
    setPreviewResource(res);
    setPreviewMode(mode);
  };

  // Filtered Papers for dedicated category archives
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      // Tab Category Filter: Combine FWC Papers and Term Tests seamlessly
      if (activeTab !== 'home' && activeTab !== 'theory-videos') {
        if (activeTab === 'fwc-papers') {
          if (p.category !== 'fwc-papers' && p.category !== 'term-papers') {
            return false;
          }
        } else if (p.category !== activeTab) {
          return false;
        }
      }

      // Format Filter (All vs Question Papers vs Marking Schemes)
      if (selectedFormat === 'schemes') {
        const hasScheme =
          Boolean(p.markingSchemeDriveLink) ||
          p.titleEn.toLowerCase().includes('marking scheme') ||
          p.titleEn.toLowerCase().includes('answers') ||
          p.titleEn.toLowerCase().includes('scheme');
        if (!hasScheme) return false;
      } else if (selectedFormat === 'papers') {
        const isSolelyScheme =
          (p.titleEn.toLowerCase().includes('marking scheme') ||
            p.titleEn.toLowerCase().includes('answers') ||
            p.titleEn.toLowerCase().includes('scheme')) &&
          !p.markingSchemeDriveLink;
        if (isSolelyScheme) return false;
      }

      // Term Folder Filter (e.g. FWC Pilot, 1st Term, 2nd Term, 3rd Term...)
      if (selectedTerm !== 'all') {
        const matchesTerm =
          p.term === selectedTerm ||
          (selectedTerm === '4th & 5th Term' &&
            (p.term === '4th Term' || p.term === '5th Term' || p.term === '4th & 5th Term')) ||
          (selectedTerm === '4th Term' && (p.term === '4th Term' || p.term === '4th & 5th Term')) ||
          (selectedTerm === '5th Term' && (p.term === '5th Term' || p.term === '4th & 5th Term')) ||
          (selectedTerm === 'Trial Exam' && (p.term === 'Trial Exam' || p.term === '6th Term')) ||
          (selectedTerm === '6th Term' && (p.term === 'Trial Exam' || p.term === '6th Term')) ||
          (selectedTerm === 'FWC Pilot' && p.term === 'FWC Pilot');
        if (!matchesTerm) {
          return false;
        }
      }

      if (selectedStream !== 'all' && p.stream !== selectedStream && p.stream !== 'all') {
        return false;
      }
      if (selectedSubject !== 'all' && p.subjectId !== selectedSubject) {
        return false;
      }
      if (selectedYear !== 'all' && String(p.year) !== selectedYear) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = p.titleEn.toLowerCase().includes(query) || (p.titleTa && p.titleTa.toLowerCase().includes(query));
        const matchSubject =
          p.subjectNameEn.toLowerCase().includes(query) ||
          (p.subjectNameTa && p.subjectNameTa.toLowerCase().includes(query)) ||
          p.subjectId.toLowerCase().includes(query);
        const matchSource = p.schoolOrSource.toLowerCase().includes(query);
        const matchTopic = p.unitOrTopic?.toLowerCase().includes(query) || false;
        const matchYear = String(p.year).includes(query);
        
        // Match term keywords: "1st term", "1st", "term 1", "first term", "2nd term", etc.
        const pTermLower = (p.term || '').toLowerCase();
        const matchTerm =
          pTermLower.includes(query) ||
          (query.includes('1st') && pTermLower.includes('1st')) ||
          (query.includes('2nd') && pTermLower.includes('2nd')) ||
          (query.includes('3rd') && pTermLower.includes('3rd')) ||
          (query.includes('4th') && pTermLower.includes('4th')) ||
          (query.includes('5th') && pTermLower.includes('5th')) ||
          (query.includes('6th') && pTermLower.includes('6th'));

        return matchTitle || matchSubject || matchSource || matchTopic || matchYear || matchTerm;
      }
      return true;
    });
  }, [papers, activeTab, selectedFormat, selectedTerm, selectedStream, selectedSubject, selectedYear, searchQuery]);

  // Filtered Videos for dedicated Video Lessons archive
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      if (selectedStream !== 'all' && v.stream !== selectedStream) {
        return false;
      }
      if (selectedSubject !== 'all' && v.subjectId !== selectedSubject) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = v.titleEn.toLowerCase().includes(query);
        const matchSubject = v.subjectNameEn.toLowerCase().includes(query);
        const matchTeacher = v.teacherName.toLowerCase().includes(query);
        const matchUnit = v.unitNameEn.toLowerCase().includes(query);
        return matchTitle || matchSubject || matchTeacher || matchUnit;
      }
      return true;
    });
  }, [videos, selectedStream, selectedSubject, searchQuery]);

  const bookmarkedResourcesList = useMemo(() => {
    if (!user) return [];
    return papers.filter((p) => user.bookmarks.includes(p.id));
  }, [papers, user]);

  // Dynamic list of available years for current category
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    papers.forEach((p) => {
      if (
        activeTab === 'home' ||
        activeTab === 'theory-videos' ||
        p.category === activeTab ||
        (activeTab === 'fwc-papers' && p.category === 'term-papers')
      ) {
        yearsSet.add(p.year);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [papers, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header with Study Pro Branding and Clean Navigation */}
      <Header
        currentTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={user}
        onOpenAuth={() => {
          setAuthReason('');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        savedCount={user?.bookmarks.length || 0}
        onOpenSaved={() => setIsBookmarksOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
      />

      {/* 2. Router: Home Page (Attractive Hub) or Dedicated Category Archive */}
      {activeTab === 'home' ? (
        <HomePage
          onNavigateToTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenTimer={() => setIsTimerOpen(true)}
          onOpenAuth={() => {
            setAuthReason('');
            setIsAuthOpen(true);
          }}
          user={user}
        />
      ) : (
        /* Dedicated Category Archive (Past Papers, FWC, Term Tests, Theory Notes, Theory Videos) */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
          {/* Breadcrumb Navigation & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0066FF] hover:underline mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight capitalize">
                {activeTab === 'fwc-papers'
                  ? 'FWC Pilot & School Term Tests'
                  : activeTab === 'past-papers'
                  ? 'National G.C.E. A/L Past Papers'
                  : activeTab.replace('-', ' ')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {activeTab === 'fwc-papers'
                  ? 'Official archive combining FWC Thondaimanaru pilot exams, provincial trial assessments, and school 1st, 2nd & 3rd term tests with step-by-step marking schemes.'
                  : 'Explore authentic study documents with direct Google Drive view and fast download options.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>⏱️ Study Timer</span>
              </button>
            </div>
          </div>

          {/* Interactive Term Folders System for FWC Papers & Term Tests */}
          {activeTab === 'fwc-papers' && (
            <TermFoldersView
              selectedTerm={selectedTerm}
              onSelectTerm={(termId) => setSelectedTerm(termId)}
              selectedSubject={selectedSubject}
              onSelectSubject={(subjId) => setSelectedSubject(subjId)}
              papers={papers.filter((p) => p.category === 'fwc-papers' || p.category === 'term-papers')}
            />
          )}

          {/* Dedicated, Simple & Student-Friendly Folders System for National Past Papers */}
          {activeTab === 'past-papers' && (
            <PastPaperFoldersView
              selectedSubject={selectedSubject}
              onSelectSubject={(subjId) => setSelectedSubject(subjId)}
              selectedYear={selectedYear}
              onSelectYear={(yr) => setSelectedYear(yr)}
              papers={papers.filter((p) => p.category === 'past-papers')}
              onPreview={handleOpenPreview}
              isBookmarked={(id) => Boolean(user?.bookmarks?.includes(id))}
              onToggleBookmark={handleToggleBookmark}
            />
          )}

          {/* Filter Bar (Only for other tabs to keep past-papers ultra clean and simple) */}
          {activeTab !== 'past-papers' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Format Segmented Filter (All vs Question Papers vs Marking Schemes) */}
              {activeTab !== 'theory-videos' && (
                <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold border border-slate-200">
                  <button
                    onClick={() => setSelectedFormat('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedFormat === 'all'
                        ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All Materials
                  </button>
                  <button
                    onClick={() => setSelectedFormat('papers')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedFormat === 'papers'
                        ? 'bg-[#0066FF] text-white shadow-xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>📄 Question Papers</span>
                  </button>
                  <button
                    onClick={() => setSelectedFormat('schemes')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedFormat === 'schemes'
                        ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>📝 Marking Schemes</span>
                  </button>
                </div>
              )}

              {/* Term Selector for FWC / Term Tests */}
              {activeTab === 'fwc-papers' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">Term:</span>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="all">All Folders (FWC & All Terms)</option>
                    <option value="FWC Pilot">⭐ FWC Pilot Exams (Thondaimanaru)</option>
                    <option value="1st Term">📁 1st Term (Physics 2022–2027)</option>
                    <option value="2nd Term">📁 2nd Term</option>
                    <option value="3rd Term">📁 3rd Term (Year-End Exams)</option>
                    <option value="4th & 5th Term">📁 4th & 5th Term (Pre-Board)</option>
                    <option value="Trial Exam">📁 Trial / 6th Term Benchmark</option>
                  </select>
                </div>
              )}

              {/* Stream Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Stream:</span>
                <select
                  value={selectedStream}
                  onChange={(e) => {
                    setSelectedStream(e.target.value);
                    setSelectedSubject('all');
                  }}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Science Streams</option>
                  <option value="maths">Physical Science (Combined Maths)</option>
                  <option value="bio">Biological Science (Bio)</option>
                </select>
              </div>

              {/* Subject Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Subjects</option>
                  {SUBJECTS.filter((s) => selectedStream === 'all' || s.stream === selectedStream).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Selector for Papers */}
              {activeTab !== 'theory-videos' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">Year:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={String(yr)}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by subject (e.g. Physics), term (e.g. 1st term), year, topic..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
                />
              </div>
            </div>
          </div>
          )}

          {/* Results Grid (Only for other tabs; past-papers tab has its own dedicated student view) */}
          {activeTab !== 'past-papers' && (
            activeTab === 'theory-videos' ? (
              filteredVideos.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500 shadow-xs max-w-md mx-auto my-8">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-2xs">
                    <Video className="w-7 h-7" />
                  </div>
                  <p className="font-extrabold text-base text-slate-900 mb-1">No Video Lessons in This Category Yet</p>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Video lessons, topic walkthroughs, and theory tutorials are curated directly by educators. Check back soon for new additions.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      user={user}
                      onPlay={handlePlayVideo}
                      onRequireLogin={() => {
                        setAuthReason('Sign in to watch unlisted theory videos in our custom player.');
                        setIsAuthOpen(true);
                      }}
                      isWatched={user?.watchedVideoIds?.includes(video.id) || false}
                    />
                  ))}
                </div>
              )
            ) : (
              filteredPapers.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center text-slate-500 shadow-xs max-w-lg mx-auto my-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-2xs">
                    <FileText className="w-7 h-7" />
                  </div>
                  <p className="font-extrabold text-base text-slate-900 mb-1">
                    {selectedTerm !== 'all'
                      ? `No Documents in ${selectedTerm} Folder Yet`
                      : 'No Examination Papers Found'}
                  </p>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                    {selectedTerm !== 'all'
                      ? `You are viewing the ${selectedTerm} folder. Switch to the 1st Term folder to access the 2022–2027 Physics papers and marking schemes, or reset filters.`
                      : 'No examination papers match your current search and filter criteria. Try resetting your search keywords or filter options.'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {(selectedTerm !== 'all' || selectedSubject !== 'all' || selectedYear !== 'all' || searchQuery) && (
                      <button
                        onClick={() => {
                          setSelectedTerm('all');
                          setSelectedSubject('all');
                          setSelectedYear('all');
                          setSearchQuery('');
                          setSelectedFormat('all');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                    {selectedTerm !== '1st Term' && (
                      <button
                        onClick={() => {
                          setSelectedTerm('1st Term');
                          setSelectedSubject('physics');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        View 1st Term Physics (2022–2027)
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredPapers.map((paper) => (
                    <ResourceCard
                      key={paper.id}
                      resource={paper}
                      onPreview={(res, mode) => handleOpenPreview(res, mode)}
                      isBookmarked={user?.bookmarks?.includes(paper.id) || false}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>
              )
            )
          )}
        </div>
      )}

      {/* 3. Interactive Modals */}
      {/* Focus Timer Modal (Pomodoro) */}
      <StudyTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
      />

      {/* Bookmarks Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedResources={bookmarkedResourcesList}
        onRemoveBookmark={handleToggleBookmark}
        onPreview={(res) => handleOpenPreview(res, 'paper')}
      />

      {/* Auth / Student Sign In Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        initialReason={authReason}
      />

      {/* Google Drive PDF Preview Viewer */}
      <PdfViewerModal
        isOpen={!!previewResource || !!customPdfUrl}
        onClose={() => {
          setPreviewResource(null);
          setCustomPdfUrl('');
          setCustomPdfTitle('');
          setPreviewMode('paper');
        }}
        resource={previewResource}
        initialMode={previewMode}
        customDriveUrl={customPdfUrl}
        customTitle={customPdfTitle}
      />

      {/* In-Website YouTube Video Player Modal */}
      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        user={user}
        onSaveNote={handleSaveVideoNote}
        onToggleWatched={handleToggleWatchedVideo}
        isWatched={activeVideo ? user?.watchedVideoIds?.includes(activeVideo.id) : false}
        onOpenPdfPreview={handleOpenPdfPreview}
      />
    </div>
  );
}
