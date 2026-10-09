/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Filter, BookOpen, Video, FileText, 
  ArrowLeft, ExternalLink, Download, Lock, CheckCircle, KeyRound, Unlock,
  UserCheck, AlertCircle, Megaphone, X, ChevronUp
} from 'lucide-react';
import { 
  PaperResource, VideoLesson, User, ResourceCategory, 
  StreamId, UserNote, PaidStudentAccess 
} from './types';
import { INITIAL_PAPERS, INITIAL_VIDEOS, SUBJECTS, STREAMS, CATEGORIES } from './data/mockData';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ResourceCard } from './components/ResourceCard';
import { VideoCard } from './components/VideoCard';
import { BookmarksModal } from './components/BookmarksModal';
import { StudyTimerModal } from './components/StudyTimerModal';
import { TermFoldersView } from './components/TermFoldersView';
import { PastPaperFoldersView } from './components/PastPaperFoldersView';
import { ContactUsModal } from './components/ContactUsModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { VideoLockModal } from './components/VideoLockModal';
import { ResourcesFoldersView } from './components/ResourcesFoldersView';
import { OtherPilotPapersView } from './components/OtherPilotPapersView';
import { UserProfileModal } from './components/UserProfileModal';
import { DomainAuthModal } from './components/DomainAuthModal';
import { LegalModal, LegalModalType } from './components/LegalModal';
import { EducationalGuides } from './components/EducationalGuides';
import { AiSearchView } from './components/AiSearchView';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { cleanFirestoreData } from './utils/firestoreClean';
import { handleFirestoreError, OperationType } from './utils/firestoreErrors';
import { playRoboticTab, playRoboticClick, playRoboticUnlock, playRoboticError } from './utils/audio';

export default function App() {
  // Local storage persisted state - ensure newly uploaded past papers, physics papers, terms and hydro videos are always loaded
  const [papers, setPapers] = useState<PaperResource[]>(() => {
    const PAPERS_CACHE_KEY = 'studypro_all_in_one_v22';
    const rawDeleted = localStorage.getItem('studypro_deleted_paper_ids');
    const deletedIds = new Set<string>(rawDeleted ? JSON.parse(rawDeleted) : []);

    const isPastPapersLoaded = localStorage.getItem(PAPERS_CACHE_KEY);
    if (!isPastPapersLoaded) {
      localStorage.setItem(PAPERS_CACHE_KEY, 'true');
      const initial = INITIAL_PAPERS.filter((p) => !deletedIds.has(p.id));
      localStorage.setItem('studypro_papers_data', JSON.stringify(initial));
      return initial;
    }
    const saved = localStorage.getItem('studypro_papers_data');
    if (!saved) return INITIAL_PAPERS.filter((p) => !deletedIds.has(p.id));
    try {
      const parsed: PaperResource[] = JSON.parse(saved);
      const activeSaved = parsed.filter((p) => !deletedIds.has(p.id));
      const existingIds = new Set(activeSaved.map((p) => p.id));
      const missingPapers = INITIAL_PAPERS.filter((p) => !existingIds.has(p.id) && !deletedIds.has(p.id));
      if (missingPapers.length > 0) {
        const merged = [...missingPapers, ...activeSaved];
        localStorage.setItem('studypro_papers_data', JSON.stringify(merged));
        return merged;
      }
      return activeSaved;
    } catch {
      return INITIAL_PAPERS.filter((p) => !deletedIds.has(p.id));
    }
  });

  const [videos, setVideos] = useState<VideoLesson[]>(() => {
    const VIDEOS_CACHE_KEY = 'studypro_hydro_videos_unit2_v18';
    const isVideosLoaded = localStorage.getItem(VIDEOS_CACHE_KEY);
    if (!isVideosLoaded) {
      localStorage.setItem(VIDEOS_CACHE_KEY, 'true');
      localStorage.setItem('studypro_videos_data', JSON.stringify(INITIAL_VIDEOS));
      return INITIAL_VIDEOS;
    }
    const saved = localStorage.getItem('studypro_videos_data');
    if (!saved) return INITIAL_VIDEOS;
    try {
      const parsed: VideoLesson[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((v) => v.id));
      const missingVideos = INITIAL_VIDEOS.filter((v) => !existingIds.has(v.id));
      if (missingVideos.length > 0) {
        const merged = [...INITIAL_VIDEOS];
        localStorage.setItem('studypro_videos_data', JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_VIDEOS;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('studypro_user_session');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.id && u.id !== 'student_guest') {
          return {
            ...u,
            bookmarks: u.bookmarks || [],
            watchedVideoIds: u.watchedVideoIds || [],
            notes: u.notes || [],
          };
        }
      } catch {
        // ignore parse error
      }
    }
    return null;
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
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isDomainAuthModalOpen, setIsDomainAuthModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    return hash.includes('admin') || path.includes('admin') || search.includes('admin');
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('studypro_admin_session') === 'true';
  });

  // Paid Students Video Access List (Authorized Gmail Accounts)
  const [videoAccessEmails, setVideoAccessEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('studypro_paid_video_emails');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['asmanlinzy44@gmail.com'];
  });

  const [paidAccessList, setPaidAccessList] = useState<PaidStudentAccess[]>(() => {
    try {
      const saved = localStorage.getItem('studypro_paid_video_access_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{
      email: 'asmanlinzy44@gmail.com',
      studentName: 'Asman Linzy (Founder & Super Admin)',
      grantedAt: '2026-01-01T00:00:00.000Z',
      note: 'Permanent Platform Administrator'
    }];
  });

  // Student Video Lock & Masterclass Access Calculation
  const currentUserAccess = useMemo(() => {
    if (!user || !user.email) return null;
    const currentEmail = user.email.toLowerCase().trim();
    return paidAccessList.find((item) => item.email.toLowerCase().trim() === currentEmail) || null;
  }, [user, paidAccessList]);

  // Granular check if a specific VideoLesson is unlocked for this student
  const isVideoLessonUnlocked = useCallback((video: VideoLesson): boolean => {
    if (isAdminLoggedIn) return true;
    if (!user || !user.email) return false;
    const currentEmail = user.email.toLowerCase().trim();
    if (currentEmail === 'asmanlinzy44@gmail.com') return true;

    // Check detailed student access record
    if (currentUserAccess) {
      if (!currentUserAccess.accessScope || currentUserAccess.accessScope === 'all') {
        return true;
      }
      if (currentUserAccess.accessScope === 'custom') {
        // 1. Specific Video ID match
        if (currentUserAccess.allowedVideoIds && currentUserAccess.allowedVideoIds.includes(video.id)) {
          return true;
        }
        // 2. Allowed Subject match
        if (currentUserAccess.allowedSubjectIds && currentUserAccess.allowedSubjectIds.includes(video.subjectId)) {
          if (currentUserAccess.allowedUnits && currentUserAccess.allowedUnits.length > 0) {
            return currentUserAccess.allowedUnits.includes(video.unitNumber);
          }
          return true;
        }
        // 3. Allowed Unit Number match
        if (currentUserAccess.allowedUnits && currentUserAccess.allowedUnits.includes(video.unitNumber)) {
          return true;
        }
        // 4. Topic / Keyword match (e.g. "hydro" for Hydrodynamics)
        const label = (currentUserAccess.accessLabel || '').toLowerCase();
        const vidText = `${video.titleEn} ${video.unitNameEn} ${video.subjectNameEn}`.toLowerCase();
        if (label.includes('hydro') && (vidText.includes('hydro') || video.unitNumber === 2)) {
          return true;
        }
        if (label.includes('chem') && (video.subjectId.includes('chem') || vidText.includes('chem') || video.unitNumber === 6)) {
          return true;
        }
        return false;
      }
    }

    // Fallback: check email whitelist
    return videoAccessEmails.some((e) => e.toLowerCase().trim() === currentEmail);
  }, [isAdminLoggedIn, user, currentUserAccess, videoAccessEmails]);

  const hasVideoAccess = useMemo(() => {
    if (isAdminLoggedIn) return true;
    if (!user || !user.email) return false;
    const currentEmail = user.email.toLowerCase().trim();
    if (currentEmail === 'asmanlinzy44@gmail.com') return true;
    return videoAccessEmails.some((e) => e.toLowerCase().trim() === currentEmail);
  }, [user, videoAccessEmails, isAdminLoggedIn]);

  const [isVideoUnlocked, setIsVideoUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('studypro_video_unlocked') === 'true';
  });

  const isEffectiveVideoUnlocked = hasVideoAccess || isVideoUnlocked;

  const [isVideoLockOpen, setIsVideoLockOpen] = useState(false);
  const [targetUnlockVideo, setTargetUnlockVideo] = useState<VideoLesson | null>(null);
  const [inlineIndex, setInlineIndex] = useState('');
  const [inlinePassword, setInlinePassword] = useState('');
  const [inlineError, setInlineError] = useState('');

  // Live Site Broadcast Announcement
  const [siteAnnouncement, setSiteAnnouncement] = useState<{ active: boolean; text: string; type: 'info' | 'alert' | 'success' }>(() => {
    try {
      const saved = localStorage.getItem('studypro_site_announcement');
      return saved ? JSON.parse(saved) : { active: false, text: '', type: 'info' };
    } catch {
      return { active: false, text: '', type: 'info' };
    }
  });

  // Master Subject Vault Drive Links (Physics, Chemistry, Combined Maths, Biology)
  const [vaultDriveLinks, setVaultDriveLinks] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('studypro_vault_drive_links');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Dark Mode Theme (Persisted in localStorage)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('studypro_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('studypro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('studypro_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    playRoboticClick();
    setIsDarkMode((prev) => !prev);
  };

  // Legal & Compliance Modals (Privacy Policy, Terms, About, Disclaimer - Required by Google AdSense)
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(() => {
    if (typeof window === 'undefined') return null;
    const hash = (window.location.hash || '').toLowerCase();
    if (hash.includes('privacy')) return 'privacy';
    if (hash.includes('term')) return 'terms';
    if (hash.includes('about')) return 'about';
    if (hash.includes('disclaimer')) return 'disclaimer';
    return null;
  });

  // Listen for #admin, #ai-search and legal URL routes to automatically open corresponding modal
  useEffect(() => {
    const handleAdminRoute = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      if (
        hash.includes('admin') || 
        path.includes('admin') || 
        search.includes('admin')
      ) {
        setIsAdminPanelOpen(true);
      }
      if (hash.includes('ai-search') || hash.includes('aisearch')) {
        setActiveTab('ai-search');
      } else if (hash.includes('privacy')) {
        setLegalModalType('privacy');
      } else if (hash.includes('term')) {
        setLegalModalType('terms');
      } else if (hash.includes('about')) {
        setLegalModalType('about');
      } else if (hash.includes('disclaimer')) {
        setLegalModalType('disclaimer');
      }
    };

    handleAdminRoute();
    window.addEventListener('hashchange', handleAdminRoute);
    window.addEventListener('popstate', handleAdminRoute);

    // Continuous check to capture manual address bar typing on mobile & desktop
    const interval = setInterval(handleAdminRoute, 400);

    return () => {
      window.removeEventListener('hashchange', handleAdminRoute);
      window.removeEventListener('popstate', handleAdminRoute);
      clearInterval(interval);
    };
  }, []);

  // Smooth Reading Progress Bar & Scroll-To-Top Trigger
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
      setShowScrollTop(window.scrollY > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // IntersectionObserver for dynamic viewport reveal animations
    let observer: IntersectionObserver | null = null;
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      const observeElements = () => {
        const elements = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
        elements.forEach((el) => observer?.observe(el));
      };

      observeElements();
      const intervalId = setInterval(observeElements, 1200);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearInterval(intervalId);
        observer?.disconnect();
      };
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    playRoboticClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseAdminPanel = () => {
    setIsAdminPanelOpen(false);
    if (window.location.hash.toLowerCase().includes('admin')) {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminPanelOpen(false);
    localStorage.removeItem('studypro_admin_session');
    if (window.location.hash.toLowerCase().includes('admin')) {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleAddPaper = async (newPaper: PaperResource) => {
    setPapers((prev) => [newPaper, ...prev]);
    // Remove from local deleted blacklist if previously deleted
    const rawDeleted = localStorage.getItem('studypro_deleted_paper_ids');
    if (rawDeleted) {
      try {
        const deletedIds: string[] = JSON.parse(rawDeleted);
        const filtered = deletedIds.filter((id) => id !== newPaper.id);
        localStorage.setItem('studypro_deleted_paper_ids', JSON.stringify(filtered));
      } catch {}
    }

    try {
      const paperRef = doc(db, 'papers', newPaper.id);
      const cleaned = cleanFirestoreData({
        ...newPaper,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await setDoc(paperRef, cleaned);
      try {
        await deleteDoc(doc(db, 'deleted_papers', newPaper.id));
      } catch {}
    } catch (err) {
      console.warn('Firestore paper add notice:', err);
    }
  };

  const handleUpdatePaper = async (updatedPaper: PaperResource) => {
    setPapers((prev) => prev.map((p) => (p.id === updatedPaper.id ? updatedPaper : p)));
    try {
      const paperRef = doc(db, 'papers', updatedPaper.id);
      const cleaned = cleanFirestoreData({
        ...updatedPaper,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(paperRef, cleaned);
    } catch (err) {
      console.warn('Firestore paper update notice:', err);
    }
  };

  const handleDeletePaper = async (paperId: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== paperId));
    try {
      const rawDeleted = localStorage.getItem('studypro_deleted_paper_ids');
      const deletedIds: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
      if (!deletedIds.includes(paperId)) {
        deletedIds.push(paperId);
        localStorage.setItem('studypro_deleted_paper_ids', JSON.stringify(deletedIds));
      }

      try {
        await deleteDoc(doc(db, 'papers', paperId));
      } catch {}
      try {
        await setDoc(doc(db, 'deleted_papers', paperId), {
          id: paperId,
          deletedAt: new Date().toISOString(),
        });
      } catch {}
    } catch (err) {
      console.warn('Firestore paper delete notice:', err);
    }
  };

  const handleAddVideo = async (newVideo: VideoLesson) => {
    setVideos((prev) => [newVideo, ...prev]);
    const rawDeleted = localStorage.getItem('studypro_deleted_video_ids');
    if (rawDeleted) {
      try {
        const deletedIds: string[] = JSON.parse(rawDeleted);
        const filtered = deletedIds.filter((id) => id !== newVideo.id);
        localStorage.setItem('studypro_deleted_video_ids', JSON.stringify(filtered));
      } catch {}
    }

    try {
      const cleaned = cleanFirestoreData({
        ...newVideo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'videos', newVideo.id), cleaned);
      try {
        await deleteDoc(doc(db, 'deleted_videos', newVideo.id));
      } catch {}
    } catch (err) {
      console.warn('Firestore video add notice:', err);
    }
  };

  const handleUpdateVideo = async (updatedVideo: VideoLesson) => {
    setVideos((prev) => prev.map((v) => (v.id === updatedVideo.id ? updatedVideo : v)));
    try {
      const cleaned = cleanFirestoreData({
        ...updatedVideo,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'videos', updatedVideo.id), cleaned);
    } catch (err) {
      console.warn('Firestore video update notice:', err);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    try {
      const rawDeleted = localStorage.getItem('studypro_deleted_video_ids');
      const deletedIds: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
      if (!deletedIds.includes(videoId)) {
        deletedIds.push(videoId);
        localStorage.setItem('studypro_deleted_video_ids', JSON.stringify(deletedIds));
      }
      try {
        await deleteDoc(doc(db, 'videos', videoId));
      } catch {}
      try {
        await setDoc(doc(db, 'deleted_videos', videoId), {
          id: videoId,
          deletedAt: new Date().toISOString(),
        });
      } catch {}
    } catch (err) {
      console.warn('Firestore video delete notice:', err);
    }
  };

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

  // Real-time synchronization of Live Papers & Deletion Blacklist from Cloud Firestore
  useEffect(() => {
    let firestorePapers = new Map<string, PaperResource>();
    const deletedPaperIds = new Set<string>();

    const rawLocalDeleted = localStorage.getItem('studypro_deleted_paper_ids');
    if (rawLocalDeleted) {
      try {
        const localIds: string[] = JSON.parse(rawLocalDeleted);
        localIds.forEach((id) => deletedPaperIds.add(id));
      } catch {}
    }

    const recomputePapers = () => {
      setPapers((currentPapers) => {
        // Base starting set from INITIAL_PAPERS, excluding deleted
        const base = INITIAL_PAPERS.filter((p) => !deletedPaperIds.has(p.id));
        // Replace base with any modified paper from Firestore
        const mergedBase = base.map((p) => (firestorePapers.has(p.id) ? firestorePapers.get(p.id)! : p));
        const existingIds = new Set(mergedBase.map((p) => p.id));

        // Add newly uploaded papers from Firestore
        const newlyAdded: PaperResource[] = [];
        firestorePapers.forEach((paper, id) => {
          if (!existingIds.has(id) && !deletedPaperIds.has(id)) {
            newlyAdded.push(paper);
          }
        });

        // Also keep any active custom papers in local state that haven't been deleted
        currentPapers.forEach((p) => {
          if (!existingIds.has(p.id) && !deletedPaperIds.has(p.id) && !firestorePapers.has(p.id)) {
            newlyAdded.push(p);
          }
        });

        return [...newlyAdded, ...mergedBase];
      });
    };

    // 1. Listen in real-time to deleted_papers collection
    const unsubDeleted = onSnapshot(collection(db, 'deleted_papers'), (snap) => {
      snap.docs.forEach((d) => deletedPaperIds.add(d.id));
      recomputePapers();
    }, (err) => {
      console.warn('Deleted papers realtime sync notice:', err);
    });

    // 2. Listen in real-time to papers collection
    const unsubPapers = onSnapshot(collection(db, 'papers'), (snap) => {
      firestorePapers = new Map();
      snap.docs.forEach((d) => {
        const p = d.data() as PaperResource;
        if (p && p.id) {
          firestorePapers.set(p.id, p);
        }
      });
      recomputePapers();
    }, (err) => {
      console.warn('Live papers realtime sync notice:', err);
    });

    return () => {
      unsubDeleted();
      unsubPapers();
    };
  }, []);

  // Real-time synchronization of Live Videos & Deletion Blacklist from Cloud Firestore
  useEffect(() => {
    let firestoreVideos = new Map<string, VideoLesson>();
    const deletedVideoIds = new Set<string>();

    const rawLocalDeleted = localStorage.getItem('studypro_deleted_video_ids');
    if (rawLocalDeleted) {
      try {
        const localIds: string[] = JSON.parse(rawLocalDeleted);
        localIds.forEach((id) => deletedVideoIds.add(id));
      } catch {}
    }

    const recomputeVideos = () => {
      setVideos((currentVideos) => {
        const base = INITIAL_VIDEOS.filter((v) => !deletedVideoIds.has(v.id));
        const mergedBase = base.map((v) => (firestoreVideos.has(v.id) ? firestoreVideos.get(v.id)! : v));
        const existingIds = new Set(mergedBase.map((v) => v.id));

        const newlyAdded: VideoLesson[] = [];
        firestoreVideos.forEach((vid, id) => {
          if (!existingIds.has(id) && !deletedVideoIds.has(id)) {
            newlyAdded.push(vid);
          }
        });

        currentVideos.forEach((v) => {
          if (!existingIds.has(v.id) && !deletedVideoIds.has(v.id) && !firestoreVideos.has(v.id)) {
            newlyAdded.push(v);
          }
        });

        return [...newlyAdded, ...mergedBase];
      });
    };

    const unsubDeletedVideos = onSnapshot(collection(db, 'deleted_videos'), (snap) => {
      snap.docs.forEach((d) => deletedVideoIds.add(d.id));
      recomputeVideos();
    }, (err) => {
      console.warn('Deleted videos realtime sync notice:', err);
    });

    const unsubVideos = onSnapshot(collection(db, 'videos'), (snap) => {
      firestoreVideos = new Map();
      snap.docs.forEach((d) => {
        const v = d.data() as VideoLesson;
        if (v && v.id) {
          firestoreVideos.set(v.id, v);
        }
      });
      recomputeVideos();
    }, (err) => {
      console.warn('Live videos realtime sync notice:', err);
    });

    return () => {
      unsubDeletedVideos();
      unsubVideos();
    };
  }, []);

  // Real-time synchronization of Site Announcement and Vault Drive Links
  useEffect(() => {
    const unsubAnnounce = onSnapshot(doc(db, 'settings', 'announcement'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.active === 'boolean') {
          const announce = {
            active: data.active,
            text: data.text || '',
            type: (data.type as 'info' | 'alert' | 'success') || 'info',
          };
          setSiteAnnouncement(announce);
          localStorage.setItem('studypro_site_announcement', JSON.stringify(announce));
        }
      }
    }, (err) => console.warn('Announcement sync notice:', err));

    const unsubVaults = onSnapshot(doc(db, 'settings', 'vault_links'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data) {
          const links: Record<string, string> = {};
          if (data.biology) links['biology'] = data.biology;
          if (data.physics) links['physics'] = data.physics;
          if (data.chemistry) links['chemistry'] = data.chemistry;
          if (data['c-maths']) links['c-maths'] = data['c-maths'];
          setVaultDriveLinks(links);
          localStorage.setItem('studypro_vault_drive_links', JSON.stringify(links));
        }
      }
    }, (err) => console.warn('Vault links sync notice:', err));

    return () => {
      unsubAnnounce();
      unsubVaults();
    };
  }, []);

  const handleUpdateSiteAnnouncement = async (announce: { active: boolean; text: string; type: 'info' | 'alert' | 'success' }) => {
    setSiteAnnouncement(announce);
    localStorage.setItem('studypro_site_announcement', JSON.stringify(announce));
    try {
      await setDoc(doc(db, 'settings', 'announcement'), announce);
    } catch (err) {
      console.warn('Save announcement error:', err);
    }
  };

  const handleUpdateVaultDriveLinks = async (links: Record<string, string>) => {
    setVaultDriveLinks(links);
    localStorage.setItem('studypro_vault_drive_links', JSON.stringify(links));
    try {
      await setDoc(doc(db, 'settings', 'vault_links'), links);
    } catch (err) {
      console.warn('Save vault links error:', err);
    }
  };

  // Real-time synchronization of Paid Student Video Access list
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'videoAccess'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.emails)) {
          const merged = Array.from(new Set(['asmanlinzy44@gmail.com', ...data.emails.map((e: string) => e.toLowerCase().trim())]));
          setVideoAccessEmails(merged);
          localStorage.setItem('studypro_paid_video_emails', JSON.stringify(merged));
        }
        if (Array.isArray(data.accessList)) {
          setPaidAccessList(data.accessList);
          localStorage.setItem('studypro_paid_video_access_list', JSON.stringify(data.accessList));
        }
      }
    }, (err) => {
      console.warn('Video access live sync notice:', err);
    });
    return () => unsub();
  }, []);

  const handleGrantVideoAccess = async (
    email: string, 
    studentName?: string, 
    note?: string,
    extra?: Partial<PaidStudentAccess>
  ) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return false;

    const newEntry: PaidStudentAccess = {
      email: cleanEmail,
      studentName: studentName?.trim() || undefined,
      grantedAt: extra?.grantedAt || new Date().toISOString(),
      grantedBy: user?.email || 'asmanlinzy44@gmail.com',
      note: note?.trim() || undefined,
      accessScope: extra?.accessScope || 'all',
      allowedSubjectIds: extra?.allowedSubjectIds,
      allowedVideoIds: extra?.allowedVideoIds,
      allowedUnits: extra?.allowedUnits,
      accessLabel: extra?.accessLabel || (extra?.accessScope === 'custom' ? 'Custom Modules' : 'All Videos'),
    };

    const updatedEmails = Array.from(new Set([...videoAccessEmails, cleanEmail]));
    const existingList = paidAccessList.filter(item => item.email.toLowerCase().trim() !== cleanEmail);
    const updatedList = [newEntry, ...existingList];

    setVideoAccessEmails(updatedEmails);
    setPaidAccessList(updatedList);

    localStorage.setItem('studypro_paid_video_emails', JSON.stringify(updatedEmails));
    localStorage.setItem('studypro_paid_video_access_list', JSON.stringify(updatedList));

    try {
      await setDoc(doc(db, 'settings', 'videoAccess'), {
        emails: updatedEmails,
        accessList: updatedList,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      const cleanDocId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      await setDoc(doc(db, 'video_access', cleanDocId), newEntry, { merge: true });
    } catch (err) {
      console.warn('Sync video access error:', err);
    }

    return true;
  };

  const handleRevokeVideoAccess = async (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'asmanlinzy44@gmail.com') return false;

    const updatedEmails = videoAccessEmails.filter(e => e.toLowerCase().trim() !== cleanEmail);
    const updatedList = paidAccessList.filter(item => item.email.toLowerCase().trim() !== cleanEmail);

    setVideoAccessEmails(updatedEmails);
    setPaidAccessList(updatedList);

    localStorage.setItem('studypro_paid_video_emails', JSON.stringify(updatedEmails));
    localStorage.setItem('studypro_paid_video_access_list', JSON.stringify(updatedList));

    try {
      await setDoc(doc(db, 'settings', 'videoAccess'), {
        emails: updatedEmails,
        accessList: updatedList,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      const cleanDocId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      await deleteDoc(doc(db, 'video_access', cleanDocId));
    } catch (err) {
      console.warn('Revoke video access error:', err);
    }

    return true;
  };

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const isOwnerAdmin = fbUser.email === 'asmanlinzy44@gmail.com';
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);

          let userData: User;
          if (snap.exists()) {
            const data = snap.data();
            let fetchedNotes: UserNote[] = [];
            try {
              const notesSnap = await getDocs(collection(db, 'users', fbUser.uid, 'notes'));
              fetchedNotes = notesSnap.docs.map((d) => d.data() as UserNote);
            } catch (notesErr) {
              console.warn('Notes fetch notice:', notesErr);
            }

            const defaultName = data.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'A/L Student';
            userData = {
              id: fbUser.uid,
              name: defaultName,
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || data.photoURL || '',
              alYear: data.alYear || 2026,
              stream: data.stream || 'bio',
              district: data.district || '',
              school: data.school || '',
              role: isOwnerAdmin ? 'admin' : (data.role || 'student'),
              bookmarks: data.bookmarks || [],
              watchedVideoIds: data.watchedVideoIds || [],
              notes: fetchedNotes.length > 0 ? fetchedNotes : (data.notes || []),
            };

            // Keep admin role in sync if owner
            if (isOwnerAdmin && data.role !== 'admin') {
              try {
                await updateDoc(userRef, { role: 'admin', updatedAt: new Date().toISOString() });
              } catch {}
            }
          } else {
            // First time Google user: initialize profile in Firestore
            const defaultName = fbUser.displayName || fbUser.email?.split('@')[0] || 'A/L Student';
            userData = {
              id: fbUser.uid,
              name: defaultName,
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || '',
              alYear: 2026,
              stream: 'bio',
              district: '',
              school: '',
              role: isOwnerAdmin ? 'admin' : 'student',
              bookmarks: [],
              watchedVideoIds: [],
              notes: [],
            };
            try {
              await setDoc(userRef, {
                ...userData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            } catch (err) {
              console.warn('Profile creation notice:', err);
            }
          }

          setUser(userData);
          if (isOwnerAdmin || userData.role === 'admin') {
            setIsAdminLoggedIn(true);
            localStorage.setItem('studypro_admin_session', 'true');
          }
          localStorage.setItem('studypro_user_session', JSON.stringify(userData));
        } catch (err) {
          console.warn('Error syncing Firebase user profile:', err);
          const fallbackUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'A/L Student',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || '',
            alYear: 2026,
            stream: 'bio',
            district: '',
            school: '',
            role: isOwnerAdmin ? 'admin' : 'student',
            bookmarks: [],
            watchedVideoIds: [],
            notes: [],
          };
          setUser(fallbackUser);
          if (isOwnerAdmin) {
            setIsAdminLoggedIn(true);
            localStorage.setItem('studypro_admin_session', 'true');
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    if (newUser.email === 'asmanlinzy44@gmail.com' || newUser.role === 'admin') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('studypro_admin_session', 'true');
    }
    try {
      localStorage.setItem('studypro_user_session', JSON.stringify(newUser));
      localStorage.setItem(
        'studypro_user_storage',
        JSON.stringify({
          userId: newUser.id,
          name: newUser.name,
          email: newUser.email,
          stream: newUser.stream,
          alYear: newUser.alYear,
          bookmarks: newUser.bookmarks,
          savedAt: new Date().toISOString(),
        })
      );
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setIsAdminLoggedIn(false);
    localStorage.removeItem('studypro_admin_session');
    localStorage.removeItem('studypro_user_session');
    localStorage.removeItem('studypro_user_storage');
  };

  // Direct Real Google Sign In (Using device Google Accounts via official popup)
  const handleDirectGoogleLogin = async () => {
    playRoboticClick();
    setIsAuthLoading(true);
    setAuthNotice(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        playRoboticUnlock();
      }
    } catch (err: any) {
      console.warn('Direct Google Sign In popup notice:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, do not show error
      } else if (err.code === 'auth/popup-blocked') {
        setAuthNotice('Popup blocked by browser. Please allow popups for Google Sign-In.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Subsequent popup triggered, safely ignore
      } else if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        setIsDomainAuthModalOpen(true);
        setAuthNotice('Vercel domain authorization required. Click to view 1-minute fix.');
      } else {
        setAuthNotice(err.message || 'Google authentication error. Please try again.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleToggleBookmark = async (resourceId: string) => {
    if (!user) {
      handleDirectGoogleLogin();
      return;
    }

    const exists = user.bookmarks.includes(resourceId);
    const updatedBookmarks = exists
      ? user.bookmarks.filter((id) => id !== resourceId)
      : [...user.bookmarks, resourceId];

    const updatedUser = { ...user, bookmarks: updatedBookmarks };
    setUser(updatedUser);

    try {
      localStorage.setItem('studypro_user_session', JSON.stringify(updatedUser));
      localStorage.setItem(
        'studypro_user_storage',
        JSON.stringify({
          userId: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          stream: updatedUser.stream,
          alYear: updatedUser.alYear,
          bookmarks: updatedBookmarks,
          savedAt: new Date().toISOString(),
        })
      );
    } catch {}

    // Save bookmarks to Google Account in Firestore
    const targetUid = auth.currentUser?.uid || user.id;
    if (targetUid) {
      try {
        await setDoc(
          doc(db, 'users', targetUid),
          {
            bookmarks: updatedBookmarks,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Error saving bookmark to Google Account:', err);
      }
    }
  };

  // Student Profile Updates (Name, School, Batch, Stream, District)
  const handleUpdateProfile = async (updatedFields: Partial<User>) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      ...updatedFields,
    };
    setUser(updatedUser);
    handleLogin(updatedUser);

    // Persist to Google Firestore Account
    const targetUid = auth.currentUser?.uid || user.id;
    if (targetUid) {
      try {
        await setDoc(
          doc(db, 'users', targetUid),
          {
            name: updatedUser.name,
            school: updatedUser.school || '',
            district: updatedUser.district || '',
            alYear: updatedUser.alYear,
            stream: updatedUser.stream,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Error saving updated profile to Google Account in Firestore:', err);
      }
    }
  };

  const handleToggleWatchedVideo = async (videoId: string) => {
    if (!user) return;
    const exists = user.watchedVideoIds.includes(videoId);
    const updated = exists
      ? user.watchedVideoIds.filter((id) => id !== videoId)
      : [...user.watchedVideoIds, videoId];

    setUser((prev) => (prev ? { ...prev, watchedVideoIds: updated } : null));

    if (auth.currentUser && auth.currentUser.uid === user.id) {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          watchedVideoIds: updated,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Error syncing watched video to Firestore:', err);
      }
    }
  };

  const handleSaveVideoNote = async (note: UserNote) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, notes: [...prev.notes, note] } : null));

    if (auth.currentUser && auth.currentUser.uid === user.id) {
      try {
        await setDoc(doc(db, 'users', user.id, 'notes', note.id), {
          ...note,
          userId: user.id,
          createdAt: note.createdAt || new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.id}/notes/${note.id}`);
      }
    }
  };

  const handlePlayVideo = (video: VideoLesson) => {
    if (!isVideoLessonUnlocked(video)) {
      setTargetUnlockVideo(video);
      setIsVideoLockOpen(true);
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
      const pTitle = (p.titleEn || '').toLowerCase();
      if (selectedFormat === 'schemes') {
        const hasScheme =
          Boolean(p.markingSchemeDriveLink) ||
          pTitle.includes('marking scheme') ||
          pTitle.includes('answers') ||
          pTitle.includes('scheme');
        if (!hasScheme) return false;
      } else if (selectedFormat === 'papers') {
        const isSolelyScheme =
          (pTitle.includes('marking scheme') ||
            pTitle.includes('answers') ||
            pTitle.includes('scheme')) &&
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

      if (selectedStream !== 'all') {
        if (selectedStream === 'bio') {
          // Bio Stream: Only Biology, Chemistry, Physics (no Combined Maths, no Agricultural Science)
          const isBioSubject = p.subjectId === 'biology' || p.subjectId === 'chemistry' || p.subjectId === 'physics';
          if (!isBioSubject && p.stream !== 'bio' && p.stream !== 'all') {
            return false;
          }
          if (p.subjectId === 'c-maths' || p.stream === 'maths') {
            return false;
          }
        } else if (selectedStream === 'maths') {
          // Maths Stream: Only Combined Maths, Physics, Chemistry (no Biology)
          const isMathsSubject = p.subjectId === 'c-maths' || p.subjectId === 'physics' || p.subjectId === 'chemistry';
          if (!isMathsSubject && p.stream !== 'maths' && p.stream !== 'all') {
            return false;
          }
          if (p.subjectId === 'biology' || p.stream === 'bio') {
            return false;
          }
        }
      }
      if (selectedSubject !== 'all' && p.subjectId !== selectedSubject) {
        return false;
      }
      if (selectedYear !== 'all' && String(p.year) !== selectedYear) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const pTitleLower = (p.titleEn || '').toLowerCase();
        const pTitleTaLower = (p.titleTa || '').toLowerCase();
        const pSubjEnLower = (p.subjectNameEn || '').toLowerCase();
        const pSubjTaLower = (p.subjectNameTa || '').toLowerCase();
        const pSubjIdLower = (p.subjectId || '').toLowerCase();
        const pSourceLower = (p.schoolOrSource || '').toLowerCase();
        const pTopicLower = (p.unitOrTopic || '').toLowerCase();

        const matchTitle = pTitleLower.includes(query) || pTitleTaLower.includes(query);
        const matchSubject =
          pSubjEnLower.includes(query) ||
          pSubjTaLower.includes(query) ||
          pSubjIdLower.includes(query);
        const matchSource = pSourceLower.includes(query);
        const matchTopic = pTopicLower.includes(query);
        const matchYear = String(p.year || '').includes(query);
        
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
      if (selectedStream !== 'all') {
        if (selectedStream === 'bio') {
          const isBioSubject = v.subjectId === 'biology' || v.subjectId === 'chemistry' || v.subjectId === 'physics';
          if (!isBioSubject && v.stream !== 'bio' && v.stream !== 'all') return false;
          if (v.subjectId === 'c-maths' || v.stream === 'maths') return false;
        } else if (selectedStream === 'maths') {
          const isMathsSubject = v.subjectId === 'c-maths' || v.subjectId === 'physics' || v.subjectId === 'chemistry';
          if (!isMathsSubject && v.stream !== 'maths' && v.stream !== 'all') return false;
          if (v.subjectId === 'biology' || v.stream === 'bio') return false;
        }
      }
      if (selectedSubject !== 'all' && v.subjectId !== selectedSubject) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (v.titleEn || '').toLowerCase().includes(query);
        const matchSubject = (v.subjectNameEn || '').toLowerCase().includes(query);
        const matchTeacher = (v.teacherName || '').toLowerCase().includes(query);
        const matchUnit = (v.unitNameEn || '').toLowerCase().includes(query);
        return matchTitle || matchSubject || matchTeacher || matchUnit;
      }
      return true;
    });
  }, [videos, selectedStream, selectedSubject, searchQuery]);

  // Dedicated Subject Options based on Stream:
  // Bio Stream: Only Biology, Chemistry, Physics (no Agricultural Science, no Combined Maths)
  // Maths Stream: Only Combined Mathematics, Physics, Chemistry (no Biology)
  // All Streams: Combined Mathematics, Physics, Chemistry, Biology
  const visibleSubjectOptions = useMemo(() => {
    if (selectedStream === 'bio') {
      return [
        { id: 'biology', nameEn: 'Biology', nameTa: 'Biology' },
        { id: 'chemistry', nameEn: 'Chemistry', nameTa: 'Chemistry' },
        { id: 'physics', nameEn: 'Physics', nameTa: 'Physics' },
      ];
    }
    if (selectedStream === 'maths') {
      return [
        { id: 'c-maths', nameEn: 'Combined Mathematics', nameTa: 'Combined Mathematics' },
        { id: 'physics', nameEn: 'Physics', nameTa: 'Physics' },
        { id: 'chemistry', nameEn: 'Chemistry', nameTa: 'Chemistry' },
      ];
    }
    return [
      { id: 'c-maths', nameEn: 'Combined Mathematics', nameTa: 'Combined Mathematics' },
      { id: 'physics', nameEn: 'Physics', nameTa: 'Physics' },
      { id: 'chemistry', nameEn: 'Chemistry', nameTa: 'Chemistry' },
      { id: 'biology', nameEn: 'Biology', nameTa: 'Biology' },
    ];
  }, [selectedStream]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200">
      {/* 0. Glowing Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none transition-all duration-150"
        style={{
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #0052D4, #0066FF, #00C6FF, #38BDF8)',
          boxShadow: scrollProgress > 0 ? '0 0 10px rgba(0, 102, 255, 0.7), 0 0 20px rgba(56, 189, 248, 0.5)' : 'none',
        }}
      />

      {/* 0. Live Site Broadcast Announcement Bar (Controlled from Admin Panel) */}
      {siteAnnouncement.active && siteAnnouncement.text.trim() && (
        <div className={`px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 relative z-40 transition-all ${
          siteAnnouncement.type === 'alert'
            ? 'bg-rose-600 text-white shadow-md'
            : siteAnnouncement.type === 'success'
            ? 'bg-emerald-600 text-white shadow-md'
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md'
        }`}>
          <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
          <span className="leading-snug">{siteAnnouncement.text}</span>
          <button 
            onClick={() => setSiteAnnouncement(prev => ({ ...prev, active: false }))}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2 cursor-pointer"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header with Paper Express Branding and Clean Navigation */}
      <Header
        currentTab={activeTab}
        onTabChange={(tab) => {
          playRoboticTab();
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={user}
        onGoogleLogin={handleDirectGoogleLogin}
        onLogout={handleLogout}
        onOpenProfile={() => {
          playRoboticClick();
          setIsProfileOpen(true);
        }}
        onOpenAdminPanel={() => {
          playRoboticClick();
          setIsAdminPanelOpen(true);
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        savedCount={user?.bookmarks.length || 0}
        onOpenSaved={() => {
          playRoboticClick();
          setIsBookmarksOpen(true);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* 2. Router: Home Page (Attractive Hub) or Dedicated Category Archive */}
      {activeTab === 'home' ? (
        <HomePage
          onNavigateToTab={(tab) => {
            playRoboticTab();
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenTimer={() => {
            playRoboticClick();
            setIsTimerOpen(true);
          }}
          onOpenAuth={handleDirectGoogleLogin}
          onOpenContactUs={() => {
            playRoboticClick();
            setIsContactOpen(true);
          }}
          onOpenLegal={(type) => setLegalModalType(type)}
          user={user}
          isDarkMode={isDarkMode}
        />
      ) : (
        /* Dedicated Category Archive (Past Papers, FWC, Term Tests, Theory Notes, Theory Videos) */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
          {/* Breadcrumb Navigation & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <button
                onClick={() => {
                  playRoboticTab();
                  setActiveTab('home');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0066FF] hover:underline mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight capitalize">
                {activeTab === 'fwc-papers'
                  ? 'FWC Pilot & School Term Tests'
                  : activeTab === 'past-papers'
                  ? 'National G.C.E. A/L Past Papers'
                  : activeTab === 'theory-notes'
                  ? 'Academic Resources (Biology · Physics · Chemistry · Combined Maths)'
                  : activeTab === 'pilot-papers'
                  ? 'Other Pilot Papers · University & Model Examinations'
                  : activeTab === 'theory-videos'
                  ? 'Theory Video Masterclasses'
                  : activeTab === 'ai-search'
                  ? 'Paper Express Advance Search'
                  : activeTab.replace('-', ' ')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'fwc-papers'
                  ? 'Official archive combining FWC Thondaimanaru pilot exams, provincial trial assessments, and school 1st, 2nd & 3rd term tests with step-by-step marking schemes.'
                  : activeTab === 'theory-notes'
                  ? 'Curated subject folders for Biology, Physics, Chemistry, and Combined Maths. Unit summaries, formula handbooks, short guides, and Google Drive folders.'
                  : activeTab === 'pilot-papers'
                  ? 'University of Moratuwa pilot exams, provincial trials, and model examination papers for Combined Mathematics, Physics, Chemistry, and Biology.'
                  : activeTab === 'theory-videos'
                  ? 'Distraction-free A/L theory masterclasses. Unlocked with student index and password.'
                  : activeTab === 'ai-search'
                  ? 'Paper Express Advance Search. Search with natural language queries in English or Tamil, find past papers, video lessons, and discover exact resources and study folders instantly.'
                  : 'Explore authentic study documents with direct Google Drive view and fast download options.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>⏱️ Study Timer</span>
              </button>
            </div>
          </div>

          {/* Dedicated Advance Search View (Paper Express) */}
          {activeTab === 'ai-search' && (
            <AiSearchView
              papers={papers}
              videos={videos}
              onNavigateToTab={(tab) => {
                playRoboticTab();
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPreviewPaper={(paper, mode) => handleOpenPreview(paper, mode)}
              onPlayVideo={(video) => handlePlayVideo(video)}
              isBookmarked={(id) => Boolean(user?.bookmarks?.includes(id))}
              onToggleBookmark={handleToggleBookmark}
              isVideoUnlocked={isEffectiveVideoUnlocked}
              onRequireUnlockVideo={() => setIsVideoLockOpen(true)}
            />
          )}

          {/* Interactive Term Folders System for FWC Papers & Term Tests */}
          {activeTab === 'fwc-papers' && (
            <TermFoldersView
              selectedTerm={selectedTerm}
              onSelectTerm={(termId) => setSelectedTerm(termId)}
              selectedSubject={selectedSubject}
              onSelectSubject={(subjId) => setSelectedSubject(subjId)}
              selectedStream={selectedStream}
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
              selectedStream={selectedStream}
              papers={papers.filter((p) => p.category === 'past-papers')}
              onPreview={handleOpenPreview}
              isBookmarked={(id) => Boolean(user?.bookmarks?.includes(id))}
              onToggleBookmark={handleToggleBookmark}
            />
          )}

          {/* Dedicated 4 Folders System for Resources (Biology, Physics, Chemistry, Combined Maths) */}
          {activeTab === 'theory-notes' && (
            <ResourcesFoldersView
              selectedSubject={selectedSubject}
              onSelectSubject={(subjId) => setSelectedSubject(subjId)}
              resources={papers.filter((p) => p.category === 'theory-notes' || p.category === 'useful-resources')}
              onPreview={handleOpenPreview}
              isBookmarked={(id) => Boolean(user?.bookmarks?.includes(id))}
              onToggleBookmark={handleToggleBookmark}
              vaultDriveLinks={vaultDriveLinks}
            />
          )}

          {/* Dedicated 4 Folders System for Other Pilot Papers (Moratuwa, etc.) */}
          {activeTab === 'pilot-papers' && (
            <OtherPilotPapersView
              selectedSubject={selectedSubject}
              onSelectSubject={(subjId) => setSelectedSubject(subjId)}
              papers={papers}
              onPreview={handleOpenPreview}
              isBookmarked={(id) => Boolean(user?.bookmarks?.includes(id))}
              onToggleBookmark={handleToggleBookmark}
              onOpenAdminUpload={() => setIsAdminPanelOpen(true)}
              isAdmin={isAdminLoggedIn}
            />
          )}

          {/* Filter Bar (Only for fwc-papers to keep past-papers, resources, pilot-papers & ai-search ultra clean) */}
          {activeTab !== 'past-papers' && activeTab !== 'theory-notes' && activeTab !== 'pilot-papers' && activeTab !== 'ai-search' && (
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
                    <option value="1st Term">📁 1st Term (FWC Terms 1–6)</option>
                    <option value="2nd Term">📁 2nd Term (FWC Terms 1–6)</option>
                    <option value="3rd Term">📁 3rd Term (FWC Terms 1–6)</option>
                    <option value="4th Term">📁 4th Term (FWC Terms 1–6)</option>
                    <option value="5th Term">📁 5th Term (FWC Terms 1–6)</option>
                    <option value="6th Term">📁 6th Term / Final Trial (FWC Terms 1–6)</option>
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

              {/* Subject Selector: Bio stream shows Biology, Chemistry, Physics; Maths stream shows Combined Maths, Physics, Chemistry */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Subjects</option>
                  {visibleSubjectOptions.map((s) => (
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

          {/* Results Grid (Only for other tabs; past-papers, theory-notes, pilot-papers and ai-search have their own dedicated views) */}
          {activeTab !== 'past-papers' && activeTab !== 'theory-notes' && activeTab !== 'pilot-papers' && activeTab !== 'ai-search' && (
            activeTab === 'theory-videos' ? (
              <div className="space-y-6">
                {/* 1. Access Status Banner */}
                {isAdminLoggedIn || (hasVideoAccess && (!currentUserAccess || currentUserAccess.accessScope === 'all')) ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 dark:text-emerald-200 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Unlock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                          Paid Student Video Masterclasses Unlocked (All Lessons Active 🟢)
                        </p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                          Active session for: <strong className="font-mono">{user?.email || 'Platform Administrator'}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : currentUserAccess && currentUserAccess.accessScope === 'custom' ? (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-200 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                          <span>Partial Course Access Active: {currentUserAccess.accessLabel || 'Selected Units Only'}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] font-mono border border-amber-500/30">Custom Scope</span>
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300">
                          Enrolled session for <strong className="font-mono">{user?.email}</strong>. Unlocked lectures can be played ▶️. Other course topics show Locked 🔐.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Dedicated Attractive Cyber Lock Screen for unauthorized or unauthenticated users */
                  <div className="relative max-w-md mx-auto my-6 overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-white p-7 animate-in fade-in duration-200 google-anno-skip">
                    <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

                    <div className="text-center relative z-10 mb-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-mono font-bold tracking-wider mb-4 shadow-inner">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>LOCKED 🔐 · PAID STUDENTS ONLY</span>
                      </div>

                      <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-red-500 opacity-30 blur-md animate-pulse" />
                        <div className="relative w-14 h-14 rounded-2xl bg-slate-900/90 border border-amber-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                          <Lock className="w-7 h-7 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                        </div>
                      </div>

                      <h3 className="text-xl font-black tracking-tight text-white">
                        Locked 🔐 Video Lessons
                      </h3>
                      <p className="text-xs text-amber-200/90 font-semibold mt-1">
                        Exclusive Access for Paid & Enrolled Students Only
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Physics Hydrodynamics (Units 1–5) & Chemistry IUPAC Lectures
                      </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                      {user && user.email ? (
                        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 text-center space-y-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span>Logged in as: <strong className="text-white font-mono">{user.email}</strong></span>
                          </div>

                          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs text-left leading-relaxed">
                            <p className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Access Not Activated (Locked 🔐)</span>
                            </p>
                            <p className="text-[11px] text-slate-300">
                              This Gmail account has not been granted paid masterclass access yet. If you have completed payment, please contact Asman Linzy to activate access in the Admin Panel.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                playRoboticClick();
                                setIsContactOpen(true);
                              }}
                              className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Megaphone className="w-4 h-4" />
                              <span>Contact Admin</span>
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                playRoboticClick();
                                await handleLogout();
                                setTimeout(() => handleDirectGoogleLogin(), 300);
                              }}
                              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4 text-sky-400" />
                              <span>Switch Gmail</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-center space-y-3">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Video lessons are available exclusively for paid students. Please sign in with your authorized <strong>Google / Gmail</strong> account to unlock lectures.
                          </p>

                          <button
                            type="button"
                            onClick={handleDirectGoogleLogin}
                            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer group active:scale-[0.98]"
                          >
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                              <svg className="w-full h-full" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                              </svg>
                            </div>
                            <span>Sign In with Google (Gmail)</span>
                          </button>

                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                playRoboticClick();
                                setIsContactOpen(true);
                              }}
                              className="text-xs text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            >
                              <span>Want to enroll? Contact Asman Linzy to get access</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Collapsible Admin Passcode Override */}
                      <details className="text-[11px] text-slate-400 group">
                        <summary className="cursor-pointer hover:text-slate-300 py-1 transition-colors select-none">
                          Admin Passcode Override (Optional)
                        </summary>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (
                              (inlineIndex.trim() === '4428' && inlinePassword.trim() === '1016') ||
                              inlinePassword.trim() === 'admin2026' ||
                              inlinePassword.trim() === 'asman44'
                            ) {
                              playRoboticUnlock();
                              setIsVideoUnlocked(true);
                              localStorage.setItem('studypro_video_unlocked', 'true');
                              setInlineIndex('');
                              setInlinePassword('');
                              setInlineError('');
                            } else {
                              playRoboticError();
                              setInlineError('Invalid Index or Passcode.');
                            }
                          }}
                          className="mt-2 space-y-2"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={inlineIndex}
                              onChange={(e) => {
                                setInlineIndex(e.target.value);
                                setInlineError('');
                              }}
                              placeholder="Index"
                              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                            />
                            <input
                              type="password"
                              value={inlinePassword}
                              onChange={(e) => {
                                setInlinePassword(e.target.value);
                                setInlineError('');
                              }}
                              placeholder="Passcode"
                              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                            />
                          </div>

                          {inlineError && (
                            <div className="p-1.5 bg-rose-950/70 border border-rose-500/50 rounded-lg text-rose-300 text-[10px] font-bold">
                              {inlineError}
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Verify
                          </button>
                        </form>
                      </details>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Protected Theory Video Masterclasses</span>
                        <span className="font-mono font-bold text-sky-400">Paper Express</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extensive Curriculum Syllabus Overview */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                      Course Syllabus & Academic Scope
                    </span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      A/L Theory Masterclass Lectures Overview
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Our in-app video lectures provide rigorous, derivation-by-derivation coverage of critical G.C.E. A/L Science syllabus units.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 space-y-2.5">
                      <div className="font-extrabold text-sm text-blue-950 dark:text-sky-200">
                        🌊 Physics Unit 2: Hydrodynamics (Units 1–5)
                      </div>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                        <li><strong>Unit 1: Streamline Flow & Viscosity:</strong> Velocity gradient, Newton’s law of viscous force, coefficient of viscosity, Poiseuille’s formula derivation.</li>
                        <li><strong>Unit 2: Equation of Continuity:</strong> Conservation of mass in non-viscous incompressible fluid, volume flow rate (Av = const).</li>
                        <li><strong>Unit 3: Bernoulli’s Principle:</strong> Conservation of mechanical energy in streamline fluid flow, pressure head, velocity head, elevation head.</li>
                        <li><strong>Unit 4: Engineering Applications:</strong> Pitot tube, Venturi meter, Torricelli’s law of efflux, dynamic lift on aerofoil.</li>
                        <li><strong>Unit 5: Capillarity & Surface Tension:</strong> Intermolecular forces, angle of contact, Jurin’s law, excess pressure in spherical bubbles.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2.5">
                      <div className="font-extrabold text-sm text-emerald-950 dark:text-emerald-200">
                        🧪 Chemistry Unit 7: IUPAC & Organic Mechanisms
                      </div>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                        <li><strong>Systematic IUPAC Nomenclature:</strong> Principal functional group hierarchy, longest continuous carbon chain, locant numbering rules.</li>
                        <li><strong>Electrophilic Addition:</strong> Markovnikov’s rule, carbocation stability intermediates, halogenation of alkenes & alkynes.</li>
                        <li><strong>Nucleophilic Substitution:</strong> SN1 vs SN2 kinetics, steric hindrance, optical inversion (Walden inversion).</li>
                        <li><strong>Elimination Reactions:</strong> E1 vs E2 pathways, Zaitsev’s rule, alkene stability determination.</li>
                        <li><strong>Aromatic Substitution:</strong> Benzene ring delocalization, electrophilic aromatic substitution (nitration, halogenation, Friedel-Crafts).</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Masterclass Video Cards Grid */}
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                      Masterclass Video Lessons · விரிவுரைகள்
                    </span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      Browse Masterclass Lectures
                    </h4>
                  </div>

                  {filteredVideos.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 shadow-xs max-w-md mx-auto my-8">
                      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-2xs">
                        <Video className="w-7 h-7" />
                      </div>
                      <p className="font-extrabold text-base text-slate-900 dark:text-white mb-1">No Video Lessons in This Category</p>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                        Video lessons are curated directly by educators. Check back soon for new additions.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredVideos.map((video) => {
                        const isUnlocked = isVideoLessonUnlocked(video);
                        return (
                          <VideoCard
                            key={video.id}
                            video={video}
                            user={user}
                            onPlay={handlePlayVideo}
                            onRequireLogin={() => {
                              setTargetUnlockVideo(video);
                              setIsVideoLockOpen(true);
                            }}
                            isWatched={user?.watchedVideoIds?.includes(video.id) || false}
                            isUnlocked={isUnlocked}
                            onRequireUnlock={() => {
                              setTargetUnlockVideo(video);
                              setIsVideoLockOpen(true);
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div id="fwc-papers-results">
                {filteredPapers.length === 0 ? (
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
                )}
              </div>
            )
          )}

          {/* Category View Compliance Footer */}
          <footer className="mt-16 pt-8 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Paper Express</span>
              <span>· Sri Lankan G.C.E. A/L Academic Portal</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button 
                onClick={() => setLegalModalType('privacy')} 
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Privacy Policy & Cookies
              </button>
              <button 
                onClick={() => setLegalModalType('terms')} 
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => setLegalModalType('about')} 
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                About Us
              </button>
              <button 
                onClick={() => setLegalModalType('disclaimer')} 
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Disclaimer
              </button>
              <button 
                onClick={() => setIsContactOpen(true)} 
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Contact Support
              </button>
            </div>

            <div>© {new Date().getFullYear()} Paper Express</div>
          </footer>
        </div>
      )}

      {/* 3. Interactive Modals */}
      {/* Video Index & Password Lock Modal */}
      <VideoLockModal
        isOpen={isVideoLockOpen}
        onClose={() => {
          setIsVideoLockOpen(false);
          setTargetUnlockVideo(null);
        }}
        onUnlock={() => {
          setIsVideoUnlocked(true);
          localStorage.setItem('studypro_video_unlocked', 'true');
          setIsVideoLockOpen(false);
          if (targetUnlockVideo) {
            setActiveVideo(targetUnlockVideo);
            setTargetUnlockVideo(null);
          }
        }}
        targetVideoTitle={targetUnlockVideo?.titleEn}
        currentUser={user}
        userAccessScopeLabel={
          currentUserAccess?.accessScope === 'custom'
            ? (currentUserAccess.accessLabel || 'Selected Topics Only')
            : undefined
        }
        onGoogleLogin={handleDirectGoogleLogin}
        onLogoutAndSwitch={async () => {
          await handleLogout();
          setIsVideoLockOpen(false);
          setTimeout(() => {
            handleDirectGoogleLogin();
          }, 300);
        }}
        onOpenContactUs={() => {
          setIsContactOpen(true);
        }}
      />
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

      {/* Student Contact Us & Help Desk Modal */}
      <ContactUsModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        currentUser={user}
      />

      {/* Student User Profile & Local Storage Vault Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateProfile}
      />

      {/* Administrator Dashboard & Content Management */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={handleCloseAdminPanel}
        onLogout={handleAdminLogout}
        onAddPaper={handleAddPaper}
        onUpdatePaper={handleUpdatePaper}
        onDeletePaper={handleDeletePaper}
        onAddVideo={handleAddVideo}
        onUpdateVideo={handleUpdateVideo}
        onDeleteVideo={handleDeleteVideo}
        papers={papers}
        videos={videos}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          localStorage.setItem('studypro_admin_session', 'true');
        }}
        currentUser={user}
        onGoogleLogin={handleDirectGoogleLogin}
        siteAnnouncement={siteAnnouncement}
        onUpdateSiteAnnouncement={handleUpdateSiteAnnouncement}
        vaultDriveLinks={vaultDriveLinks}
        onUpdateVaultDriveLinks={handleUpdateVaultDriveLinks}
        videoAccessEmails={videoAccessEmails}
        paidAccessList={paidAccessList}
        onGrantVideoAccess={handleGrantVideoAccess}
        onRevokeVideoAccess={handleRevokeVideoAccess}
      />

      {/* Vercel Firebase Domain Authorization Guide Modal */}
      <DomainAuthModal
        isOpen={isDomainAuthModalOpen}
        onClose={() => setIsDomainAuthModalOpen(false)}
        projectId="inlaid-doodad-65p7n"
      />

      {/* Legal & AdSense Compliance Modal (Privacy Policy, Terms, About, Disclaimer) */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Clean Global Loading / Auth Notice */}
      {isAuthLoading && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 google-anno-skip">
          <svg className="w-5 h-5 shrink-0 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-xs font-bold">Connecting to Google Account...</span>
        </div>
      )}

      {authNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 text-amber-900 shadow-2xl border border-amber-300 animate-in fade-in slide-in-from-bottom-2 max-w-md google-anno-skip">
          <span className="text-xs font-medium">{authNotice}</span>
          {authNotice.includes('Domain') || authNotice.includes('Vercel') ? (
            <button
              onClick={() => setIsDomainAuthModalOpen(true)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer shrink-0"
            >
              Fix in 1 Min
            </button>
          ) : null}
          <button
            onClick={() => setAuthNotice(null)}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 hover:bg-[#0066FF] hover:text-white dark:hover:bg-[#0066FF] text-slate-700 dark:text-slate-200 shadow-xl border border-slate-200/90 dark:border-slate-800 transition-all duration-300 backdrop-blur-md group hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in slide-in-from-bottom-3"
          title="Scroll to top"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span className="hidden sm:inline">Top</span>
          </div>
        </button>
      )}
    </div>
  );
}
