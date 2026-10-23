import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ArrowRight, BookOpen, FileText, 
  Award, FolderOpen, Lightbulb, Compass, 
  Loader2, CheckCircle2, AlertCircle, 
  ExternalLink, Atom, Calculator, FlaskConical, Dna,
  Download, Eye, Copy, Check, Bookmark, BookmarkCheck,
  Folder, MessageSquare, HelpCircle, Send, RotateCcw,
  Sparkles, Zap, Bot, User as UserIcon
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { PaperResource, ResourceCategory } from '../types';
import { getDriveDirectViewUrl, getDriveDirectDownloadUrl } from '../utils/drive';
import { playRoboticClick, playRoboticTab } from '../utils/audio';
import { 
  BIOLOGY_SECTIONS, 
  CHEMISTRY_SECTIONS, 
  PHYSICS_SECTIONS, 
  COMBINED_MATHS_SECTIONS,
  AcademicResourceSection
} from './ResourcesFoldersView';

export interface SubFolderItem extends AcademicResourceSection {
  subjectId: 'biology' | 'chemistry' | 'physics' | 'c-maths';
  subjectNameEn: string;
  subjectNameTa: string;
  themeColor: string;
}

export const ALL_SUB_FOLDERS: SubFolderItem[] = [
  ...BIOLOGY_SECTIONS.map((s) => ({
    ...s,
    subjectId: 'biology' as const,
    subjectNameEn: 'Biology',
    subjectNameTa: 'உயிரியல்',
    themeColor: 'border-rose-200 dark:border-rose-900/60 hover:border-rose-500',
  })),
  ...CHEMISTRY_SECTIONS.map((s) => ({
    ...s,
    subjectId: 'chemistry' as const,
    subjectNameEn: 'Chemistry',
    subjectNameTa: 'இரசாயனவியல்',
    themeColor: 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500',
  })),
  ...PHYSICS_SECTIONS.map((s) => ({
    ...s,
    subjectId: 'physics' as const,
    subjectNameEn: 'Physics',
    subjectNameTa: 'பௌதிகவியல்',
    themeColor: 'border-blue-200 dark:border-blue-900/60 hover:border-blue-500',
  })),
  ...COMBINED_MATHS_SECTIONS.map((s) => ({
    ...s,
    subjectId: 'c-maths' as const,
    subjectNameEn: 'Combined Mathematics',
    subjectNameTa: 'இணைந்த கணிதம்',
    themeColor: 'border-purple-200 dark:border-purple-900/60 hover:border-purple-500',
  })),
];

interface AiSearchViewProps {
  papers: PaperResource[];
  videos?: any[];
  onNavigateToTab: (tab: ResourceCategory, filterParams?: { subject?: string; term?: string }) => void;
  onPreviewPaper: (paper: PaperResource, mode: 'paper' | 'scheme') => void;
  onPlayVideo?: (video: any) => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (id: string) => void;
  isVideoUnlocked?: boolean;
  onRequireUnlockVideo?: () => void;
  isFolderUnlocked: (folderId: string) => boolean; // Add this
}

interface AiSearchResult {
  guidance: string;
  targetCategory: ResourceCategory;
  targetSubject: string;
  searchKeywords: string;
  highlightFolder: string;
  matchedFileIds?: string[];
  preferredFormat?: 'both' | 'scheme' | 'paper' | 'folder';
  hasDoubt?: boolean;
  clarificationQuestion?: string;
  clarificationChips?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  query: string;
  searchResult?: AiSearchResult;
  matchingPapers?: PaperResource[];
  matchingSubFolders?: SubFolderItem[];
  hasDoubt?: boolean;
  clarificationQuestion?: string;
  clarificationChips?: string[];
}

export type PaperTypeClassification = 'national-past' | 'moratuwa-pilot' | 'provincial-model' | 'term-fwc' | 'other';

export const classifyPaperType = (paper: PaperResource): PaperTypeClassification => {
  const title = (paper.titleEn || '').toLowerCase();
  const titleTa = (paper.titleTa || '').toLowerCase();
  const source = (paper.schoolOrSource || '').toLowerCase();
  const pilot = (paper.pilotType || '').toLowerCase();
  const district = (paper.districtOrProvince || '').toLowerCase();
  const id = (paper.id || '').toLowerCase();

  // 1. Moratuwa University
  if (
    title.includes('moratuwa') || 
    titleTa.includes('மொறட்டுவ') ||
    source.includes('moratuwa') || 
    pilot.includes('moratuwa') || 
    id.includes('moratuwa')
  ) {
    return 'moratuwa-pilot';
  }

  // 2. Provincial & Benchmark Pilot
  if (
    pilot.includes('provincial') ||
    pilot.includes('pilot') ||
    pilot.includes('leading schools') ||
    district.includes('province') ||
    district.includes('pilot') ||
    district.includes('colombo') ||
    district.includes('jaffna') ||
    title.includes('pilot') ||
    title.includes('model') ||
    titleTa.includes('முன்னோடி') ||
    titleTa.includes('மாதிரி') ||
    titleTa.includes('மாகாண') ||
    source.includes('provincial') ||
    source.includes('royal college') ||
    source.includes('kalinga') ||
    source.includes('dream way') ||
    paper.category === 'pilot-papers'
  ) {
    return 'provincial-model';
  }

  // 3. FWC & Term Tests
  if (
    paper.category === 'fwc-papers' ||
    paper.category === 'term-papers' ||
    title.includes('fwc') ||
    title.includes('term') ||
    title.includes('thondaimanaru') ||
    titleTa.includes('தவணை')
  ) {
    return 'term-fwc';
  }

  // 4. National Past Papers
  if (paper.category === 'past-papers') {
    return 'national-past';
  }

  return 'other';
};

const SAMPLE_PROMPTS = [
  { label: '2024 Physics (Past + Moratuwa + Provincial)', prompt: '2024 Physics National past paper, University of Moratuwa pilot paper, and Northern Province model paper' },
  { label: '2023 Chemistry (Past + Moratuwa + Provincial NP)', prompt: '2023 Chemistry past paper, Moratuwa pilot paper and Northern Province model paper' },
  { label: '2022 Combined Maths (Past + Moratuwa + WP Model)', prompt: '2022 Combined Mathematics past paper, University of Moratuwa pilot paper and Western Province model paper' },
  { label: '2024 Biology (Past + Moratuwa + Provincial)', prompt: '2024 Biology past paper, Moratuwa pilot paper and provincial model examination paper' },
  { label: 'University of Moratuwa All-Year Pilot Archive', prompt: 'University of Moratuwa Combined Maths, Physics, Chemistry, Biology pilot exam master papers' },
  { label: 'Northern & Western Provincial Model Papers', prompt: 'Northern Province NP and Western Province model examination papers' },
  { label: 'Biology NIE Textbooks & Unit Notes', prompt: 'Biology Unit Notes and official NIE Resource Books folder' },
];

const DEEP_SEARCH_STEPS = [
  {
    phase: 'SEARCHING',
    title: 'Multi-Tier Intent & Entity Analysis',
    detail: 'Extracting subject, year, and scanning National Past, Moratuwa Pilot & Provincial Model repositories...',
  },
  {
    phase: 'DEEP SEARCH',
    title: 'Cross-Referencing National Past Papers & Official Schemes',
    detail: 'Searching 1981–2024 Department of Examinations past papers and verified step marking schemes...',
  },
  {
    phase: 'DEEP SEARCH',
    title: 'Auditing Moratuwa Pilot & Provincial Model Archives',
    detail: 'Scanning University of Moratuwa pilot exams, Northern Province, Central, Western & leading school models...',
  },
  {
    phase: 'VALIDATING',
    title: 'Drive Verification & Direct Link Generation',
    detail: 'Validating Google Drive direct links for Question Papers and Marking Schemes...',
  },
];

export const AiSearchView: React.FC<AiSearchViewProps> = ({
  papers,
  onNavigateToTab,
  onPreviewPaper,
  isBookmarked,
  onToggleBookmark,
  isFolderUnlocked,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sub-folder filter states
  const [subFolderFilterSubject, setSubFolderFilterSubject] = useState<'all' | 'biology' | 'chemistry' | 'physics' | 'c-maths'>('all');
  const [subFolderCategoryFilter, setSubFolderCategoryFilter] = useState<'all' | 'theory' | 'nie' | 'mcq' | 'practical' | 'essay' | 'seminar'>('all');
  const [subFolderSearch, setSubFolderSearch] = useState('');
  const [paperFilters, setPaperFilters] = useState<Record<string, string>>({});

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % DEEP_SEARCH_STEPS.length);
    }, 650);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleCopyLink = (url: string, id: string) => {
    playRoboticClick();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleClearChat = () => {
    playRoboticClick();
    setMessages([]);
    setErrorMessage('');
    setPromptInput('');
  };

  // High-intelligence multi-lingual scoring engine for papers with maximum accuracy across all 3 key pillars
  const scoreAndMatchPapers = (query: string, parsedTarget?: {
    subject?: string;
    year?: number;
    intent?: 'both' | 'scheme' | 'paper' | 'folder';
    isPilot?: boolean;
    isTerm?: boolean;
    termNumber?: string;
    keywords?: string;
  }): PaperResource[] => {
    const q = query.toLowerCase();

    // High precision year extraction
    const yearMatch = q.match(/\b(19\d{2}|20\d{2})\b/);
    const extractedYear = yearMatch ? parseInt(yearMatch[1], 10) : parsedTarget?.year;

    // High precision subject extraction
    let extractedSubject = parsedTarget?.subject || 'all';
    if (q.includes('physic') || q.includes('phy') || q.includes('பௌதிக') || q.includes('இயற்பியல்') || q.includes('mechanics') || q.includes('matter')) {
      extractedSubject = 'physics';
    } else if (q.includes('chem') || q.includes('இரசாயன') || q.includes('வேதியியல்') || q.includes('organic') || q.includes('inorganic') || q.includes('அங்கக')) {
      extractedSubject = 'chemistry';
    } else if (q.includes('math') || q.includes('கணித') || q.includes('pure') || q.includes('applied') || q.includes('திரிகோண') || q.includes('தூய') || q.includes('integration') || q.includes('calculus')) {
      extractedSubject = 'c-maths';
    } else if (q.includes('bio') || q.includes('உயிரியல்') || q.includes('physiology') || q.includes('nie') || q.includes('உடலியங்கியல்') || q.includes('genetics') || q.includes('botany')) {
      extractedSubject = 'biology';
    }

    const wantsMoratuwa = q.includes('moratuwa') || q.includes('மொறட்டுவ') || q.includes('mora');
    const wantsProvincial = q.includes('provinc') || q.includes('model') || q.includes('மாகாண') || q.includes('மாதிரி') || q.includes('northern') || q.includes('np') || q.includes('central') || q.includes('western') || q.includes('royal');
    const wantsPast = q.includes('past') || q.includes('கடந்த') || q.includes('national') || q.includes('தேசிய');
    const wantsTerm = q.includes('fwc') || q.includes('term') || q.includes('தவணை') || q.includes('thondaimanaru');
    const wantsScheme = q.includes('scheme') || q.includes('marking') || q.includes('விடை') || q.includes('குறிப்பு') || q.includes('answer') || q.includes('solution') || parsedTarget?.intent === 'scheme';

    const scored = (papers || []).map((paper) => {
      let score = 0;
      const titleEn = (paper.titleEn || '').toLowerCase();
      const titleTa = (paper.titleTa || '').toLowerCase();
      const subjEn = (paper.subjectNameEn || '').toLowerCase();
      const subjTa = (paper.subjectNameTa || '').toLowerCase();
      const subjId = (paper.subjectId || '').toLowerCase();
      const schoolSource = (paper.schoolOrSource || '').toLowerCase();
      const unit = (paper.unitOrTopic || '').toLowerCase();
      const term = (paper.term || '').toLowerCase();
      const pType = classifyPaperType(paper);

      // Filter out generic all-in-one papers as requested by user
      if (titleEn.includes('all in one resource')) {
        return { paper, score: -999, pType };
      }

      // 1. Subject Matching
      if (extractedSubject !== 'all') {
        const matchesSubj = 
          subjId === extractedSubject || 
          subjId.includes(extractedSubject) || 
          subjEn.includes(extractedSubject) ||
          (extractedSubject === 'c-maths' && (subjId.includes('math') || subjEn.includes('math')));
        
        if (matchesSubj) {
          score += 70;
        } else {
          score -= 75; // Strong penalty for wrong subject
        }
      }

      // 2. Year Matching (Master collections and Provincial models cover student's year)
      if (extractedYear) {
        if (paper.year === extractedYear) {
          score += 90; // Exact year match
        } else if (pType === 'moratuwa-pilot') {
          // Moratuwa Master archive contains pilot exams for 1994-2025: ALWAYS reward when year is typed!
          score += 85;
        } else if (paper.id.includes('master')) {
          score += 70;
        } else if (pType === 'provincial-model') {
          // Provincial model papers provide standard benchmark papers for preparation: reward positively!
          score += 55;
        } else {
          score -= 30;
        }
      }

      // 3. Category & Type Weighting
      if (pType === 'moratuwa-pilot') {
        score += 70;
        if (wantsMoratuwa) score += 60;
        if (titleEn.includes('master')) score += 25;
      } else if (pType === 'provincial-model') {
        score += 65;
        if (wantsProvincial) score += 60;
        if (q.includes('northern') && (titleEn.includes('northern') || schoolSource.includes('northern'))) score += 40;
        if (q.includes('royal') && (titleEn.includes('royal') || schoolSource.includes('royal'))) score += 40;
        if (q.includes('central') && (titleEn.includes('central') || schoolSource.includes('central'))) score += 40;
        if (q.includes('western') && (titleEn.includes('western') || schoolSource.includes('western'))) score += 40;
      } else if (pType === 'national-past') {
        score += 65;
        if (wantsPast) score += 60;
      } else if (pType === 'term-fwc') {
        if (wantsTerm) score += 60;
        if (q.includes('1st') && (term.includes('1st') || titleEn.includes('1st'))) score += 35;
        if (q.includes('2nd') && (term.includes('2nd') || titleEn.includes('2nd'))) score += 35;
        if (q.includes('3rd') && (term.includes('3rd') || titleEn.includes('3rd'))) score += 35;
      }

      // 4. Marking Scheme Intent
      if (wantsScheme && paper.markingSchemeDriveLink) {
        score += 30;
      }

      // 5. Token Matching
      const tokens = q.split(/\s+/).filter((t) => t.length > 2);
      tokens.forEach((token) => {
        if (titleEn.includes(token)) score += 25;
        if (titleTa.includes(token)) score += 30;
        if (subjEn.includes(token) || subjTa.includes(token)) score += 20;
        if (schoolSource.includes(token)) score += 25;
        if (unit.includes(token)) score += 15;
      });

      return { paper, score, pType };
    });

    const validPapers = scored.filter((item) => item.score > 40);

    const nationalMatches = validPapers
      .filter((i) => i.pType === 'national-past')
      .sort((a, b) => b.score - a.score)
      .map((i) => i.paper);

    const moratuwaMatches = validPapers
      .filter((i) => i.pType === 'moratuwa-pilot')
      .sort((a, b) => b.score - a.score)
      .map((i) => i.paper);

    const provincialMatches = validPapers
      .filter((i) => i.pType === 'provincial-model')
      .sort((a, b) => b.score - a.score)
      .map((i) => i.paper);

    const termMatches = validPapers
      .filter((i) => i.pType === 'term-fwc')
      .sort((a, b) => b.score - a.score)
      .map((i) => i.paper);

    // Multi-Pillar Balanced Assembly:
    // GUARANTEES National Past, Moratuwa Pilot & Provincial Model are ALL identified when any year is typed!
    const combined: PaperResource[] = [];
    const addedIds = new Set<string>();

    const addUnique = (p: PaperResource) => {
      if (p && !addedIds.has(p.id)) {
        addedIds.add(p.id);
        combined.push(p);
      }
    };

    if (wantsMoratuwa && !wantsPast && !wantsProvincial) {
      moratuwaMatches.forEach(addUnique);
      provincialMatches.slice(0, 4).forEach(addUnique);
      nationalMatches.slice(0, 4).forEach(addUnique);
    } else if (wantsProvincial && !wantsMoratuwa && !wantsPast) {
      provincialMatches.forEach(addUnique);
      moratuwaMatches.slice(0, 3).forEach(addUnique);
      nationalMatches.slice(0, 4).forEach(addUnique);
    } else {
      // General year / subject / past paper search: BALANCED TRIPLE-PILLAR ASSEMBLY
      // 1. National Past Papers for the year (Top 4)
      nationalMatches.slice(0, 4).forEach(addUnique);
      // 2. University of Moratuwa Pilot Exam Papers (Top 3)
      moratuwaMatches.slice(0, 3).forEach(addUnique);
      // 3. Provincial & Leading School Model Papers (Top 6)
      provincialMatches.slice(0, 6).forEach(addUnique);
      // 4. Term / FWC Papers (Top 2)
      termMatches.slice(0, 2).forEach(addUnique);
      // 5. Fill remaining from highest score if under 18
      validPapers
        .sort((a, b) => b.score - a.score)
        .slice(0, 24)
        .forEach((i) => addUnique(i.paper));
    }

    return combined.slice(0, 18);
  };

  // High-intelligence sub-folder scoring engine - extracts all dedicated sub-folders
  const scoreAndMatchSubFolders = (query: string, targetSubject: string): SubFolderItem[] => {
    const q = query.toLowerCase();
    const isAllInOneQuery = 
      q.includes('all in one') || 
      q.includes('resource') || 
      q.includes('வள') || 
      q.includes('folder') || 
      q.includes('நோட்ஸ்') || 
      q.includes('note') || 
      q.includes('book') ||
      q.includes('முழுமையான') ||
      q.includes('vault');

    const tokens = q.split(/\s+/).filter((t) => t.length > 2);

    const scored = ALL_SUB_FOLDERS.map((subFolder) => {
      let score = 0;
      const nameEn = (subFolder.nameEn || '').toLowerCase();
      const nameTa = (subFolder.nameTa || '').toLowerCase();
      const desc = (subFolder.description || '').toLowerCase();
      const highlights = (subFolder.fileHighlights || []).map((h) => (h || '').toLowerCase()).join(' ');
      const badge = (subFolder.badge || '').toLowerCase();

      // Subject relevance
      if (targetSubject !== 'all') {
        if (subFolder.subjectId === targetSubject) {
          score += 45;
        } else {
          score -= 30;
        }
      }

      // If user specifically asked for "all in one" or resources, give a strong base score to all sub-folders of the target subject
      if (isAllInOneQuery) {
        if (targetSubject === 'all' || subFolder.subjectId === targetSubject) {
          score += 40;
        }
      }

      // Exact token matching
      tokens.forEach((token) => {
        if (nameEn.includes(token)) score += 25;
        if (nameTa.includes(token)) score += 30;
        if (badge.includes(token)) score += 20;
        if (desc.includes(token)) score += 15;
        if (highlights.includes(token)) score += 15;
      });

      // Semantic keyword boosts
      if ((q.includes('mcq') || q.includes('பல்தேர்வு')) && subFolder.id.includes('mcq')) score += 60;
      if ((q.includes('practical') || q.includes('செய்முறை') || q.includes('experiment')) && subFolder.id.includes('practical')) score += 60;
      if ((q.includes('nie') || q.includes('resource book') || q.includes('வள நூல்')) && subFolder.id.includes('resource-books')) score += 60;
      if ((q.includes('theory') || q.includes('notes') || q.includes('unit') || q.includes('குறிப்பு')) && subFolder.id.includes('theory-books')) score += 55;
      if ((q.includes('essay') || q.includes('கட்டுரை')) && subFolder.id.includes('essay')) score += 55;
      if ((q.includes('seminar') || q.includes('கருத்தரங்கு')) && subFolder.id.includes('seminar')) score += 55;
      if ((q.includes('syllabus') || q.includes('பாடத்திட்ட')) && subFolder.id.includes('syllabus')) score += 55;
      if ((q.includes('teacher') || q.includes('ஆசிரியர்')) && subFolder.id.includes('teacher')) score += 55;
      if ((q.includes('practice') || q.includes('பயிற்சி') || q.includes('drill')) && subFolder.id.includes('practice')) score += 55;

      return { subFolder, score };
    });

    if (isAllInOneQuery && targetSubject !== 'all') {
      const subjectSubs = ALL_SUB_FOLDERS.filter((s) => s.subjectId === targetSubject);
      if (subjectSubs.length > 0) return subjectSubs;
    }

    if (isAllInOneQuery && targetSubject === 'all') {
      return ALL_SUB_FOLDERS;
    }

    const matched = scored
      .filter((item) => item.score > 30)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.subFolder);

    if (matched.length === 0 && (q.includes('note') || q.includes('resource') || q.includes('book') || q.includes('வள') || q.includes('guide'))) {
      return ALL_SUB_FOLDERS.filter((s) => targetSubject === 'all' || s.subjectId === targetSubject);
    }

    return matched;
  };

  // Ultra-smart local engine with Ambiguity & Doubt Resolution
  const runLocalAdvanceEngine = (
    query: string,
    previousContext?: { subject?: string; category?: ResourceCategory }
  ): AiSearchResult => {
    const q = query.toLowerCase();

    const yearMatch = q.match(/\b(19\d{2}|20\d{2})\b/);
    const yr = yearMatch ? yearMatch[1] : '';

    let targetSubj = previousContext?.subject || 'all';
    let subjName = targetSubj === 'physics'
      ? 'Physics (பௌதிகவியல்)'
      : targetSubj === 'chemistry'
      ? 'Chemistry (இரசாயனவியல்)'
      : targetSubj === 'c-maths'
      ? 'Combined Mathematics (இணைந்த கணிதம்)'
      : targetSubj === 'biology'
      ? 'Biology (உயிரியல்)'
      : 'Physical & Biological Science';

    if (q.includes('phy') || q.includes('பௌதிக') || q.includes('இயற்பியல்')) {
      subjName = 'Physics (பௌதிகவியல்)';
      targetSubj = 'physics';
    } else if (q.includes('chem') || q.includes('இரசாயன') || q.includes('வேதியியல்')) {
      subjName = 'Chemistry (இரசாயனவியல்)';
      targetSubj = 'chemistry';
    } else if (q.includes('math') || q.includes('கணித') || q.includes('pure') || q.includes('applied')) {
      subjName = 'Combined Mathematics (இணைந்த கணிதம்)';
      targetSubj = 'c-maths';
    } else if (q.includes('bio') || q.includes('உயிரியல்')) {
      subjName = 'Biology (உயிரியல்)';
      targetSubj = 'biology';
    }

    let cat: ResourceCategory = previousContext?.category || 'past-papers';
    let folder = 'National Past Papers Archive';

    const isAllInOne = 
      q.includes('all in one') || 
      q.includes('முழுமையான') || 
      q.includes('resource') || 
      q.includes('வள') || 
      q.includes('vault') || 
      q.includes('sub folder') ||
      q.includes('folder') ||
      q.includes('note');

    if (q.includes('moratuwa') || q.includes('மொறட்டுவ') || q.includes('mora')) {
      cat = 'pilot-papers';
      folder = `University of Moratuwa Pilot Archive (${subjName})`;
    } else if (q.includes('provinc') || q.includes('மாகாண') || q.includes('model') || q.includes('மாதிரி')) {
      cat = 'pilot-papers';
      folder = `Provincial & Leading School Model Papers Archive (${subjName})`;
    } else if (q.includes('fwc') || q.includes('term') || q.includes('தவணை')) {
      cat = 'fwc-papers';
      folder = `FWC & Provincial Term Tests Folder (${subjName})`;
    } else if (isAllInOne) {
      cat = 'theory-notes';
      folder = `${subjName} — Dedicated Sub-Folders & Academic Vault`;
    } else {
      cat = 'past-papers';
      folder = yr 
        ? `G.C.E. A/L ${yr} Past Papers, Moratuwa Pilot & Provincial Model Papers (${subjName})` 
        : `National Past, Moratuwa Pilot & Provincial Model Papers Archive (${subjName})`;
    }

    const wantsScheme = q.includes('scheme') || q.includes('marking') || q.includes('விடை') || q.includes('answer');

    let guidance = '';
    if (isAllInOne) {
      guidance = `கோரப்பட்ட ${subjName} All in One வளக் களஞ்சியத்திலுள்ள அனைத்து தனித்தனி துணைப் பிரிவுகளும் (Sub-Folders: Theory Books, NIE Textbooks, 2000+ MCQs, Practical Handbooks, Essays, Seminar Papers) கண்டறியப்பட்டு கீழே தனித்தனி நேரடி Google Drive இணைப்புகளுடன் பட்டியலிடப்பட்டுள்ளன.`;
    } else if (yr) {
      guidance = `நீங்கள் கோரிய ${yr} ${subjName} பாடத்திற்கான 3 பிரதான பரீட்சை ஆவணப் பிரிவுகளும் (Triple-Pillar Repositories) துல்லியமாக கண்டறியப்பட்டுள்ளன:\n1. 🏛️ தேசிய கடந்த கால வினாத்தாள்கள் & உத்தியோகபூர்வ விடைக் குறிப்புகள் (National Past Paper & Marking Scheme)\n2. 🎓 மொறட்டுவ பல்கலைக்கழக மாதிரி வினாத்தாள்கள் (University of Moratuwa Pilot Exam Papers & Solutions)\n3. 🌐 மாகாண மாதிரி வினாத்தாள்கள் (Provincial Model Papers: வட மாகாணம் NP, மேல் மாகாணம் WP, மத்திய மாகாணம், ரோயல் கல்லூரி)`;
    } else {
      guidance = `நீங்கள் கோரிய ${subjName} பாடத்திற்கான தேசிய கடந்த கால வினாத்தாள்கள், மொறட்டுவ பல்கலைக்கழக மாதிரி வினாத்தாள்கள் மற்றும் மாகாண மாதிரி வினாத்தாள்கள் (NP, WP, Central) துல்லியமாக கண்டறியப்பட்டு கீழே தனித்தனி நேரடி இணைப்புகளுடன் வழங்கப்பட்டுள்ளன.`;
    }

    if (!q.includes('பௌதிக') && !q.includes('இரசாயன') && !q.includes('கணித') && !q.includes('உயிரியல்') && !q.includes('விடை') && !q.includes('வள')) {
      if (isAllInOne) {
        guidance = `All individual sub-folders within the All in One Resource archive (Theory Books, NIE Resource Textbooks, 2000+ MCQ Master Bank, Practical Handbooks, Essays, Seminars) for ${subjName} are extracted below with separate direct Google Drive links.`;
      } else if (yr) {
        guidance = `Identified complete 3-tier examination repositories for ${yr} ${subjName}:\n1) 🏛️ National Past Papers & Official Department Marking Schemes\n2) 🎓 University of Moratuwa Pilot Examination Papers (1994–2025 Master Collection)\n3) 🌐 Provincial Model Examination Papers (Northern Province NP, Western Province WP, Central Province & Leading Schools).`;
      } else {
        guidance = `Found verified direct study materials across National Past Papers, University of Moratuwa Pilot Exams, and Provincial Model Papers for ${subjName}. Separate direct links for Question Papers and Marking Schemes are ready below.`;
      }
    }

    // Interactive Doubt & Clarification Checks (Asking back if user query is ambiguous)
    let hasDoubt = false;
    let clarificationQuestion = '';
    let clarificationChips: string[] = [];

    const hasYear = Boolean(yr);
    const mentionsPastExam = q.includes('paper') || q.includes('scheme') || q.includes('marking') || q.includes('விடை') || q.includes('வினாத்தாள்') || q.includes('past');
    const mentionsPilot = q.includes('moratuwa') || q.includes('pilot') || q.includes('மாதிரி');
    const mentionsTerm = q.includes('fwc') || q.includes('term') || q.includes('தவணை');
    const mentionsResource = q.includes('resource') || q.includes('note') || q.includes('வள') || q.includes('book') || q.includes('mcq') || q.includes('practical');

    // If student mentions specific year or click-chips, doubt is resolved!
    const isChipSelection = q.includes('202') || q.includes('199') || q.includes('198');

    if (mentionsPastExam && !hasYear && !mentionsPilot && !mentionsTerm && !isChipSelection) {
      hasDoubt = true;
      clarificationQuestion = `எந்த வருடத்துக்கான ${subjName} வினாத்தாள் அல்லது உத்தியோகபூர்வ விடைக் குறிப்பு (Marking Scheme) தேவை? கீழே உள்ளவற்றில் ஒன்றைத் தேர்ந்தெடுக்கவும்:`;
      const shortSubj = targetSubj === 'all' ? 'Exam' : targetSubj === 'physics' ? 'Physics' : targetSubj === 'chemistry' ? 'Chemistry' : targetSubj === 'c-maths' ? 'Maths' : 'Biology';
      clarificationChips = [
        `2024 ${shortSubj} Marking Scheme`,
        `2023 ${shortSubj} Past Paper & Scheme`,
        `2022 ${shortSubj} Marking Scheme`,
        `2021 ${shortSubj} Past Paper`,
      ];
    } else if (mentionsPilot && targetSubj === 'all' && !isChipSelection) {
      hasDoubt = true;
      clarificationQuestion = 'எந்தப் பாடத்திற்கான மொறட்டுவ மாதிரி வினாத்தாள் (Moratuwa Pilot Exam Paper) தேவை?';
      clarificationChips = [
        'Combined Maths Moratuwa Pilot',
        'Physics Moratuwa Pilot',
        'Chemistry Moratuwa Pilot',
        'Biology Moratuwa Pilot',
      ];
    } else if (mentionsTerm && !q.includes('1st') && !q.includes('2nd') && !q.includes('3rd') && !q.includes('4th') && !q.includes('5th') && !q.includes('6th') && !isChipSelection) {
      hasDoubt = true;
      clarificationQuestion = 'எந்தத் தவணைப் பரீட்சை வினாத்தாள் தேவை? (1st, 2nd, 3rd Term அல்லது FWC தொண்டைமானாறு)?';
      clarificationChips = [
        '1st Term Test Papers',
        '2nd Term Test Papers',
        '3rd Term Test Papers',
        'FWC Thondaimanaru Pilot',
      ];
    } else if (!hasYear && !mentionsPilot && !mentionsTerm && !mentionsResource && targetSubj === 'all' && !isChipSelection) {
      hasDoubt = true;
      clarificationQuestion = 'நீங்கள் தேடும் வினாத்தாள் அல்லது வளக் கோப்புறையைத் தெளிவுபடுத்த கீழே உள்ளவற்றில் ஒன்றைத் தேர்ந்தெடுக்கவும்:';
      clarificationChips = [
        '2024 Past Papers & Schemes',
        'Moratuwa Pilot Exams',
        'All in One 40 Sub-Folders',
        'FWC & Term Test Folders',
      ];
    }

    return {
      guidance,
      targetCategory: cat,
      targetSubject: targetSubj,
      searchKeywords: query,
      highlightFolder: folder,
      preferredFormat: wantsScheme ? 'scheme' : 'both',
      hasDoubt,
      clarificationQuestion,
      clarificationChips,
    };
  };

  const handleSearch = async (queryText?: string) => {
    const textToSearch = (queryText !== undefined ? queryText : promptInput).trim();
    if (!textToSearch) return;

    playRoboticClick();
    setIsLoading(true);
    setErrorMessage('');
    setCurrentStepIndex(0);

    // Retrieve previous conversational context if this is a follow-up or clarification response
    const lastAssistant = [...messages].reverse().find((m) => m.sender === 'assistant');
    const previousContext = lastAssistant?.searchResult ? {
      subject: lastAssistant.searchResult.targetSubject,
      category: lastAssistant.searchResult.targetCategory,
    } : undefined;

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      query: textToSearch,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPromptInput('');

    try {
      // Simulate live deep search status steps for visual feedback
      await new Promise((r) => setTimeout(r, 700));

      let aiResult: AiSearchResult | null = null;
      const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `You are the Paper Express Academic Deep Search Engine for Sri Lankan G.C.E. Advanced Level Science Stream (Physical Science & Biological Science).
Student Query: "${textToSearch}"
Previous Conversation Subject Context: "${previousContext?.subject || 'all'}"

CRITICAL INSTRUCTIONS & KNOWLEDGE BASE:
1. Multi-Pillar Identification (MANDATORY):
   - When a student specifies ANY examination year (e.g. 2024, 2023, 2022, 2021, 2020, etc.) or asks for past papers/pilot papers:
     You MUST acknowledge and surface all 3 Academic Pillars:
     • Pillar 1: 🏛️ National Past Papers & Official Department Marking Schemes
     • Pillar 2: 🎓 University of Moratuwa Pilot Examination Papers (The Moratuwa Master archive contains 1994–2025 pilot exams & step solutions)
     • Pillar 3: 🌐 Provincial Model Examination Papers (Northern Province NP, Western Province WP, Central Province, Royal College Colombo, and leading school trial models)
   - Do NOT restrict the search or explanation to only National Past Papers when a year is given! Explicitly state that Moratuwa pilot exams and Provincial model papers have also been identified.
   - For All in One resources: explain that all individual sub-folders (Theory Books, NIE Resource Textbooks, 2000+ MCQs, Practicals, Essays, Seminars) are provided below with separate direct links.

2. Doubt & Clarification Detection:
   - Evaluate if the student's question has ANY ambiguity (e.g. asking for "past paper" without any year or subject).
   - If ambiguous: set "hasDoubt": true, and provide a polite, helpful "clarificationQuestion" in Tamil or English, and 3-4 clickable "clarificationChips".
   - If year or subject is given: set "hasDoubt": false, "clarificationQuestion": "", "clarificationChips": [].

Respond ONLY with a valid JSON matching this schema:
{
  "guidance": "Clear, concise direct explanation in English or Tamil summarizing that National Past Papers, Moratuwa Pilot Exams, and Provincial Model Papers were all identified with direct links",
  "targetCategory": "past-papers" | "fwc-papers" | "theory-notes" | "pilot-papers",
  "targetSubject": "physics" | "chemistry" | "c-maths" | "biology" | "all",
  "searchKeywords": "precise keywords to match paper titles and sub-folders",
  "highlightFolder": "Target archive folder title reflecting National, Moratuwa & Provincial papers",
  "preferredFormat": "both" | "scheme" | "paper" | "folder",
  "hasDoubt": boolean,
  "clarificationQuestion": "Question asking the user to clarify if ambiguous",
  "clarificationChips": ["Option 1", "Option 2", "Option 3", "Option 4"]
}`,
            config: {
              responseMimeType: 'application/json',
            }
          });

          if (response && response.text) {
            let cleanText = response.text.trim();
            if (cleanText.startsWith('```')) {
              cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            }
            aiResult = JSON.parse(cleanText);
          }
        } catch (apiErr) {
          console.warn('Gemini API call, using enhanced local engine:', apiErr);
          aiResult = null;
        }
      }

      if (!aiResult) {
        aiResult = runLocalAdvanceEngine(textToSearch, previousContext);
      }

      const safeAiResult: AiSearchResult = {
        guidance: aiResult?.guidance || 'Found matching study materials and resource sub-folders. Direct file links are ready below.',
        targetCategory: aiResult?.targetCategory || 'past-papers',
        targetSubject: (aiResult?.targetSubject || 'all').toLowerCase(),
        searchKeywords: aiResult?.searchKeywords || textToSearch,
        highlightFolder: aiResult?.highlightFolder || 'Study Resources Archive',
        preferredFormat: aiResult?.preferredFormat || 'both',
        hasDoubt: Boolean(aiResult?.hasDoubt),
        clarificationQuestion: aiResult?.clarificationQuestion || '',
        clarificationChips: Array.isArray(aiResult?.clarificationChips) ? aiResult.clarificationChips : [],
      };

      // 1. Match papers
      const matchedP = scoreAndMatchPapers(textToSearch, {
        subject: safeAiResult.targetSubject,
        intent: safeAiResult.preferredFormat,
        keywords: safeAiResult.searchKeywords,
      });

      // 2. Match individual resource sub-folders
      const matchedSubs = scoreAndMatchSubFolders(textToSearch, safeAiResult.targetSubject);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        query: textToSearch,
        searchResult: safeAiResult,
        matchingPapers: matchedP,
        matchingSubFolders: matchedSubs,
        hasDoubt: safeAiResult.hasDoubt,
        clarificationQuestion: safeAiResult.clarificationQuestion,
        clarificationChips: safeAiResult.clarificationChips,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMessage('Could not process advance search. Please check your query.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectIcon = (subjId: string) => {
    switch (subjId) {
      case 'physics':
        return <Atom className="w-4 h-4 text-sky-400" />;
      case 'chemistry':
        return <FlaskConical className="w-4 h-4 text-emerald-400" />;
      case 'c-maths':
        return <Calculator className="w-4 h-4 text-purple-400" />;
      case 'biology':
        return <Dna className="w-4 h-4 text-rose-400" />;
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-blue-500/30 shadow-2xl google-anno-skip">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-300 text-xs font-mono font-bold tracking-wider shadow-inner">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>PAPER EXPRESS ADVANCE DEEP SEARCH ASSISTANT</span>
            </div>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Search</span>
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Conversational Deep Search with Live Clarification & Exact Links
          </h1>

          <p className="text-xs sm:text-sm text-sky-200/90 leading-relaxed">
            Search in any natural style (English, Tamil, Tanglish). If your question is broad or ambiguous, our Deep Search assistant will ask clarifying questions in real-time, pinpointing exact National Past Papers, Marking Schemes, and individual Google Drive sub-folders!
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompts (Visible when no messages or as quick bar) */}
      {messages.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-bold">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Try Instant Examples (Click to Search):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearch(sample.prompt)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CONVERSATION STREAM (Chat Mode) */}
      {messages.length > 0 && (
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-4">
              {/* 1. Student Message Bubble */}
              {msg.sender === 'user' && (
                <div className="flex items-start justify-end gap-3 animate-scroll-up">
                  <div className="max-w-2xl bg-gradient-to-r from-blue-600 to-[#0066FF] text-white rounded-3xl rounded-tr-sm p-4 sm:p-5 shadow-md space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-[10px] text-blue-200 font-mono font-bold">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span>You (Student)</span>
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold leading-snug">
                      {msg.query}
                    </p>
                  </div>
                </div>
              )}

              {/* 2. AI Assistant Deep Search Answer Bubble */}
              {msg.sender === 'assistant' && (
                <div className="flex items-start gap-3 animate-scroll-up">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>

                  <div className="flex-1 space-y-5 bg-white dark:bg-slate-900 rounded-3xl rounded-tl-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
                    {/* Header with Deep Search Status & Topic Target */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          {msg.hasDoubt ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1 border border-amber-500/30">
                              <HelpCircle className="w-3 h-3 text-amber-500" />
                              <span>STATUS: CLARIFICATION NEEDED</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>STATUS: DEEP SEARCH ACCURACY VERIFIED</span>
                            </span>
                          )}
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                            {msg.timestamp}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">
                          Archive Target: <span className="text-blue-600 dark:text-sky-400">{msg.searchResult?.highlightFolder}</span>
                        </h4>
                      </div>

                      {msg.searchResult && (
                        <button
                          type="button"
                          onClick={() => {
                            playRoboticTab();
                            onNavigateToTab(msg.searchResult!.targetCategory);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Open Full Tab</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* AI Guidance Text */}
                    <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {msg.searchResult?.guidance}
                    </div>

                    {/* 3. CLARIFICATION & DOUBT RESOLUTION CARD (Asking Back When Doubt Detected) */}
                    {msg.hasDoubt && msg.clarificationQuestion && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/40 text-amber-900 dark:text-amber-200 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          <HelpCircle className="w-4 h-4 text-amber-500" />
                          <span>Clarification Required / மேலதிக விளக்கம் தேவை:</span>
                        </div>

                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {msg.clarificationQuestion}
                        </p>

                        {/* Interactive Clarification Option Chips */}
                        {msg.clarificationChips && msg.clarificationChips.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {msg.clarificationChips.map((chip, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleSearch(chip)}
                                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 dark:bg-amber-500/25 dark:hover:bg-amber-500/40 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all transform hover:scale-102 active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1.5"
                              >
                                <span>{chip}</span>
                                <ArrowRight className="w-3 h-3 opacity-70" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. Identified Resource Sub-Folders */}
                    {msg.matchingSubFolders && msg.matchingSubFolders.length > 0 && (
                      <div className="space-y-4 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                          <h5 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Identified Resource Sub-Folders ({msg.matchingSubFolders.length})</span>
                          </h5>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Direct Drive access to theory notes, NIE handbooks, and MCQs
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {msg.matchingSubFolders.map((sub) => {
                            const isSubBookmarked = isBookmarked ? isBookmarked(`folder-${sub.id}`) : false;

                            return (
                              <div
                                key={sub.id}
                                className={`bg-slate-50/70 dark:bg-slate-800/60 rounded-2xl border ${sub.themeColor} p-4 space-y-3 hover-card-elevate`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-xl shadow-2xs shrink-0">
                                      {sub.icon}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300">
                                          {sub.subjectNameEn}
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                          {sub.badge}
                                        </span>
                                      </div>
                                      <h6 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                                        {sub.nameEn}
                                      </h6>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {sub.description}
                                </p>
                                
                                {isFolderUnlocked(sub.id) ? (
                                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                                    <a
                                      href={sub.driveLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => playRoboticClick()}
                                      className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                                    >
                                      <FolderOpen className="w-3.5 h-3.5" />
                                      <span>Open Google Drive</span>
                                      <ExternalLink className="w-3 h-3 text-sky-300" />
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        playRoboticTab();
                                        onNavigateToTab('theory-notes', { subject: sub.subjectId });
                                      }}
                                      className="py-1.5 px-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 font-bold text-xs border border-blue-200 dark:border-blue-900 transition-colors cursor-pointer"
                                      title="Open Vault"
                                    >
                                      Vault
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleCopyLink(sub.driveLink, `subfolder-${sub.id}`)}
                                      className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                                      title="Copy Drive Link"
                                    >
                                      {copiedId === `subfolder-${sub.id}` ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                                    <div className="py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 font-bold text-[11px] flex items-center gap-2">
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      <span>Locked (Requires Enrollment)</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 5. Identified Multi-Pillar Examination Papers & Marking Schemes */}
                    {msg.matchingPapers && msg.matchingPapers.length > 0 && (() => {
                      const nationalCount = msg.matchingPapers.filter((p) => classifyPaperType(p) === 'national-past').length;
                      const moratuwaCount = msg.matchingPapers.filter((p) => classifyPaperType(p) === 'moratuwa-pilot').length;
                      const provincialCount = msg.matchingPapers.filter((p) => classifyPaperType(p) === 'provincial-model').length;
                      const termCount = msg.matchingPapers.filter((p) => classifyPaperType(p) === 'term-fwc').length;
                      const activeFilter = paperFilters[msg.id] || 'all';

                      const displayedPapers = msg.matchingPapers.filter((paper) => {
                        if (activeFilter === 'all') return true;
                        const pt = classifyPaperType(paper);
                        if (activeFilter === 'national') return pt === 'national-past';
                        if (activeFilter === 'moratuwa') return pt === 'moratuwa-pilot';
                        if (activeFilter === 'provincial') return pt === 'provincial-model';
                        if (activeFilter === 'term') return pt === 'term-fwc';
                        return true;
                      });

                      return (
                        <div className="space-y-4 pt-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1 pb-1 border-b border-slate-100 dark:border-slate-800">
                            <div>
                              <h5 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                                <span>Identified Examination Papers & Schemes ({msg.matchingPapers.length})</span>
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                National Past Papers • University of Moratuwa Pilot • Provincial Model Papers
                              </p>
                            </div>

                            {/* Multi-Pillar Interactive Filter Chips */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  playRoboticClick();
                                  setPaperFilters((prev) => ({ ...prev, [msg.id]: 'all' }));
                                }}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  activeFilter === 'all'
                                    ? 'bg-blue-600 text-white shadow-xs font-black'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                <span>All</span>
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15 dark:bg-white/15">
                                  {msg.matchingPapers.length}
                                </span>
                              </button>

                              {nationalCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    playRoboticClick();
                                    setPaperFilters((prev) => ({ ...prev, [msg.id]: 'national' }));
                                  }}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    activeFilter === 'national'
                                      ? 'bg-blue-600 text-white shadow-xs font-black'
                                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-900'
                                  }`}
                                >
                                  <span>🏛️ National Past</span>
                                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/20">
                                    {nationalCount}
                                  </span>
                                </button>
                              )}

                              {moratuwaCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    playRoboticClick();
                                    setPaperFilters((prev) => ({ ...prev, [msg.id]: 'moratuwa' }));
                                  }}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    activeFilter === 'moratuwa'
                                      ? 'bg-purple-600 text-white shadow-xs font-black'
                                      : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                                  }`}
                                >
                                  <span>🎓 Moratuwa Pilot</span>
                                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/20">
                                    {moratuwaCount}
                                  </span>
                                </button>
                              )}

                              {provincialCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    playRoboticClick();
                                    setPaperFilters((prev) => ({ ...prev, [msg.id]: 'provincial' }));
                                  }}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    activeFilter === 'provincial'
                                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                  }`}
                                >
                                  <span>🌐 Provincial Model</span>
                                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20">
                                    {provincialCount}
                                  </span>
                                </button>
                              )}

                              {termCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    playRoboticClick();
                                    setPaperFilters((prev) => ({ ...prev, [msg.id]: 'term' }));
                                  }}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    activeFilter === 'term'
                                      ? 'bg-amber-600 text-white shadow-xs font-black'
                                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                                  }`}
                                >
                                  <span>📝 FWC / Term</span>
                                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20">
                                    {termCount}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3.5">
                            {displayedPapers.map((paper) => {
                              const directPaperViewUrl = getDriveDirectViewUrl(paper.driveLink);
                              const directSchemeViewUrl = getDriveDirectViewUrl(paper.markingSchemeDriveLink || paper.driveLink);
                              const isPaperBookmarked = isBookmarked ? isBookmarked(paper.id) : false;
                              const pType = classifyPaperType(paper);

                              return (
                                <div
                                  key={paper.id}
                                  className="bg-slate-50/70 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 hover-card-elevate"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0 mt-0.5">
                                        {getSubjectIcon(paper.subjectId)}
                                      </div>
                                      <div className="space-y-1 min-w-0 flex-1">
                                        {/* Distinct Pillar Badges */}
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          {pType === 'moratuwa-pilot' ? (
                                            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-purple-500/15 border border-purple-400/40 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                                              <span>🎓 University of Moratuwa Pilot Exam</span>
                                            </span>
                                          ) : pType === 'provincial-model' ? (
                                            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                                              <span>🌐 Provincial Model Exam {paper.districtOrProvince ? `• ${paper.districtOrProvince}` : ''}</span>
                                            </span>
                                          ) : pType === 'term-fwc' ? (
                                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                                              <span>📝 FWC & Term Test Paper</span>
                                            </span>
                                          ) : (
                                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/40 text-blue-700 dark:text-sky-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                                              <span>🏛️ National Past Paper (Official Scheme)</span>
                                            </span>
                                          )}

                                          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold font-mono">
                                            {paper.year}
                                          </span>
                                        </div>

                                        <h6 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                                          {paper.titleEn}
                                        </h6>
                                        {paper.titleTa && (
                                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                            {paper.titleTa}
                                          </p>
                                        )}

                                        {paper.schoolOrSource && (
                                          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                            Source: {paper.schoolOrSource}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                                      {onToggleBookmark && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            playRoboticClick();
                                            onToggleBookmark(paper.id);
                                          }}
                                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                            isPaperBookmarked
                                              ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
                                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                          }`}
                                          title={isPaperBookmarked ? 'Bookmarked' : 'Bookmark'}
                                        >
                                          <Bookmark className={`w-3.5 h-3.5 ${isPaperBookmarked ? 'fill-current' : ''}`} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Dual Links: Question Paper vs Marking Scheme */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                                    {/* Paper Box */}
                                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/70 dark:border-blue-900/50 flex items-center justify-between gap-2 shadow-2xs">
                                      <span className="text-xs font-bold text-blue-900 dark:text-sky-300 flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Question Paper</span>
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <a
                                          href={directPaperViewUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={() => playRoboticClick()}
                                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                                        >
                                          <span>Open</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => onPreviewPaper(paper, 'paper')}
                                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                                          title="Preview Paper"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Scheme Box */}
                                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/70 dark:border-emerald-900/50 flex items-center justify-between gap-2 shadow-2xs">
                                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Marking Scheme</span>
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <a
                                          href={directSchemeViewUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={() => playRoboticClick()}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                                        >
                                          <span>Scheme</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => onPreviewPaper(paper, 'scheme')}
                                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                                          title="Preview Scheme"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* LIVE DEEP SEARCH STATUS PROGRESS TRACKER */}
      {isLoading && (
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border-2 border-blue-500/40 shadow-2xl space-y-4 animate-scroll-up google-anno-skip">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-sky-400 shrink-0">
                <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 font-mono text-[10px] font-black uppercase tracking-wider border border-blue-400/30">
                    STATUS: {DEEP_SEARCH_STEPS[currentStepIndex].phase}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Step {currentStepIndex + 1} of {DEEP_SEARCH_STEPS.length}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  {DEEP_SEARCH_STEPS[currentStepIndex].title}
                </h3>
              </div>
            </div>

            {/* Glowing Deep Search Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-blue-400/30 text-xs font-mono font-bold text-sky-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
              <span>Deep Search Active</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-sky-200/90 font-medium">
            {DEEP_SEARCH_STEPS[currentStepIndex].detail}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-400 transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / DEEP_SEARCH_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 google-anno-skip">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STICKY INTERACTIVE SEARCH / CHAT INPUT BAR */}
      <div className="sticky bottom-4 z-30 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-blue-500/40 p-1.5 shadow-2xl"
        >
          <div className="pl-3 pr-2 text-slate-400 pointer-events-none">
            <Search className="w-5 h-5 text-[#0066FF] dark:text-sky-400" />
          </div>

          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder={
              messages.length > 0
                ? "Reply to clarify or ask follow-up: e.g. 'Show me 2022 scheme instead'..."
                : "Ask anything: e.g. '2023 physics marking scheme', 'chemistry 2000 mcq bank'..."
            }
            className="w-full py-3.5 pr-28 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {promptInput && (
              <button
                type="button"
                onClick={() => setPromptInput('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors text-xs"
                title="Clear"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !promptInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#0066FF] hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Deep Search</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div ref={chatBottomRef} />
    </div>
  );
};
