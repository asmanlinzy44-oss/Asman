import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowRight, BookOpen, FileText, 
  Award, FolderOpen, Lightbulb, Compass, 
  Loader2, CheckCircle2, AlertCircle, 
  ExternalLink, Atom, Calculator, FlaskConical, Dna,
  Download, Eye, Copy, Check, Bookmark, BookmarkCheck,
  Folder
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
}

interface AiSearchResult {
  guidance: string;
  targetCategory: ResourceCategory;
  targetSubject: string;
  searchKeywords: string;
  highlightFolder: string;
  matchedFileIds?: string[];
  preferredFormat?: 'both' | 'scheme' | 'paper' | 'folder';
}

const SAMPLE_PROMPTS = [
  { label: '2023 Physics Marking Scheme', prompt: '2023 Physics question paper and official marking scheme' },
  { label: 'Biology NIE Resource Books', prompt: 'Biology Unit Notes and official NIE Resource Books folder' },
  { label: 'Moratuwa Pilot Combined Maths', prompt: 'University of Moratuwa Combined Maths pilot paper 2024' },
  { label: 'Chemistry 2000+ MCQ Bank', prompt: 'Chemistry 2000+ classified MCQ master bank questions' },
  { label: 'Physics 42 Practicals Handbook', prompt: 'Physics 42 mandatory experiments practical handbook' },
  { label: 'Organic Chemistry Notes', prompt: 'Organic Chemistry reaction mechanisms notes and conversions handbook' },
  { label: 'Pure Maths Trigonometry Notes', prompt: 'Combined Mathematics Pure Maths trigonometry and practice books' },
];

const THINKING_STEPS = [
  'Analyzing student query & extracting intent (English / தமிழ் / Tanglish)...',
  'Scanning National Past Papers (1981–2024), FWC & Pilot archives...',
  'Locating exact question papers and official marking schemes...',
  'Extracting verified Google Drive view & direct download links...',
];

export const AiSearchView: React.FC<AiSearchViewProps> = ({
  papers,
  onNavigateToTab,
  onPreviewPaper,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStepIndex, setThinkingStepIndex] = useState(0);
  const [searchResult, setSearchResult] = useState<AiSearchResult | null>(null);
  const [matchingPapers, setMatchingPapers] = useState<PaperResource[]>([]);
  const [matchingSubFolders, setMatchingSubFolders] = useState<SubFolderItem[]>([]);
  const [subFolderFilterSubject, setSubFolderFilterSubject] = useState<'all' | 'biology' | 'chemistry' | 'physics' | 'c-maths'>('all');
  const [subFolderCategoryFilter, setSubFolderCategoryFilter] = useState<'all' | 'theory' | 'nie' | 'mcq' | 'practical' | 'essay' | 'seminar'>('all');
  const [subFolderSearch, setSubFolderSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setThinkingStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setThinkingStepIndex((prev) => (prev + 1) % THINKING_STEPS.length);
    }, 650);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleCopyLink = (url: string, id: string) => {
    playRoboticClick();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // High-intelligence multi-lingual scoring engine for papers
  const scoreAndMatchPapers = (query: string, parsedTarget?: {
    subject?: string;
    year?: number;
    intent?: 'both' | 'scheme' | 'paper' | 'folder';
    isPilot?: boolean;
    isTerm?: boolean;
    termNumber?: string;
    keywords?: string;
  }) => {
    const q = query.toLowerCase();

    const yearMatch = q.match(/\b(19\d{2}|20\d{2})\b/);
    const extractedYear = yearMatch ? parseInt(yearMatch[1], 10) : parsedTarget?.year;

    let extractedSubject = parsedTarget?.subject || 'all';
    if (q.includes('physic') || q.includes('phy') || q.includes('பௌதிக') || q.includes('இயற்பியல்')) {
      extractedSubject = 'physics';
    } else if (q.includes('chem') || q.includes('இரசாயன') || q.includes('வேதியியல்') || q.includes('organic') || q.includes('inorganic') || q.includes('அங்கக')) {
      extractedSubject = 'chemistry';
    } else if (q.includes('math') || q.includes('கணித') || q.includes('pure') || q.includes('applied') || q.includes('திரிகோண') || q.includes('தூய')) {
      extractedSubject = 'c-maths';
    } else if (q.includes('bio') || q.includes('உயிரியல்') || q.includes('physiology') || q.includes('nie') || q.includes('உடலியங்கியல்')) {
      extractedSubject = 'biology';
    }

    const isPilot = q.includes('moratuwa') || q.includes('மொறட்டுவ') || q.includes('pilot') || q.includes('மாதிரி') || q.includes('model') || Boolean(parsedTarget?.isPilot);
    const isTerm = q.includes('fwc') || q.includes('term') || q.includes('தவணை') || q.includes('thondaimanaru') || Boolean(parsedTarget?.isTerm);
    const isResource = q.includes('resource') || q.includes('வள') || q.includes('note') || q.includes('formula') || q.includes('handbook') || q.includes('booklet');
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

      if (extractedYear && paper.year === extractedYear) {
        score += 80;
      }

      if (extractedSubject !== 'all') {
        if (subjId === extractedSubject || subjId.includes(extractedSubject) || subjEn.includes(extractedSubject)) {
          score += 45;
        } else if (extractedSubject === 'c-maths' && (subjId.includes('math') || subjEn.includes('math'))) {
          score += 45;
        } else {
          score -= 40;
        }
      }

      if (isPilot) {
        if (paper.category === 'pilot-papers') score += 50;
        if (titleEn.includes('moratuwa') || schoolSource.includes('moratuwa')) score += 40;
      }

      if (isTerm) {
        if (paper.category === 'fwc-papers' || paper.category === 'term-papers') score += 50;
        if (q.includes('1st') && term.includes('1st')) score += 30;
        if (q.includes('2nd') && term.includes('2nd')) score += 30;
        if (q.includes('3rd') && term.includes('3rd')) score += 30;
      }

      if (isResource) {
        if (paper.category === 'theory-notes' || paper.category === 'useful-resources') score += 50;
      }

      if (wantsScheme && paper.markingSchemeDriveLink) {
        score += 35;
      }

      const tokens = q.split(/\s+/).filter((t) => t.length > 2);
      tokens.forEach((token) => {
        if (titleEn.includes(token)) score += 15;
        if (titleTa.includes(token)) score += 20;
        if (subjEn.includes(token) || subjTa.includes(token)) score += 10;
        if (schoolSource.includes(token)) score += 10;
        if (unit.includes(token)) score += 15;
      });

      return { paper, score };
    });

    const filtered = scored
      .filter((item) => {
        const titleEn = (item.paper.titleEn || '').toLowerCase();
        // User specifically requested NOT to just show "all in one resource" as a single generic paper card
        if (titleEn.includes('all in one resource')) return false;
        return item.score > 15;
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.paper);

    return filtered.slice(0, 5);
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

    // If query is specifically "all in one resource" or all resources for a specific subject, return ALL 10 sub-folders!
    if (isAllInOneQuery && targetSubject !== 'all') {
      const subjectSubs = ALL_SUB_FOLDERS.filter((s) => s.subjectId === targetSubject);
      if (subjectSubs.length > 0) {
        return subjectSubs;
      }
    }

    // If query is "all in one" across all subjects, return ALL 40 sub-folders across Biology, Chemistry, Physics & C-Maths
    if (isAllInOneQuery && targetSubject === 'all') {
      return ALL_SUB_FOLDERS;
    }

    const matched = scored
      .filter((item) => item.score > 15)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.subFolder);

    // If query is about notes/resources, ensure relevant sub-folders are present
    if (matched.length === 0 && (q.includes('note') || q.includes('resource') || q.includes('book') || q.includes('வள') || q.includes('guide'))) {
      return ALL_SUB_FOLDERS.filter((s) => targetSubject === 'all' || s.subjectId === targetSubject);
    }

    // Return all matched sub-folders without artificial slice so student sees EVERY subfolder
    return matched;
  };

  // Ultra-smart local engine
  const runLocalAdvanceEngine = (query: string): AiSearchResult => {
    const q = query.toLowerCase();

    const yearMatch = q.match(/\b(19\d{2}|20\d{2})\b/);
    const yr = yearMatch ? yearMatch[1] : '';

    let subjName = 'Physical & Biological Science';
    let targetSubj = 'all';
    let cat: ResourceCategory = 'past-papers';
    let folder = 'National Past Papers Archive';

    if (q.includes('phy') || q.includes('பௌதிக')) {
      subjName = 'Physics (பௌதிகவியல்)';
      targetSubj = 'physics';
    } else if (q.includes('chem') || q.includes('இரசாயன')) {
      subjName = 'Chemistry (இரசாயனவியல்)';
      targetSubj = 'chemistry';
    } else if (q.includes('math') || q.includes('கணித')) {
      subjName = 'Combined Mathematics (இணைந்த கணிதம்)';
      targetSubj = 'c-maths';
    } else if (q.includes('bio') || q.includes('உயிரியல்')) {
      subjName = 'Biology (உயிரியல்)';
      targetSubj = 'biology';
    }

    const isAllInOne = 
      q.includes('all in one') || 
      q.includes('முழுமையான') || 
      q.includes('resource') || 
      q.includes('வள') || 
      q.includes('vault') || 
      q.includes('sub folder') ||
      q.includes('folder') ||
      q.includes('note');

    if (q.includes('moratuwa') || q.includes('மொறட்டுவ') || q.includes('pilot')) {
      cat = 'pilot-papers';
      folder = `University of Moratuwa Pilot Archive (${subjName})`;
    } else if (q.includes('fwc') || q.includes('term') || q.includes('தவணை')) {
      cat = 'fwc-papers';
      folder = `FWC & Provincial Term Tests Folder (${subjName})`;
    } else if (isAllInOne) {
      cat = 'theory-notes';
      folder = `${subjName} — All in One Sub-Folders & Academic Vault`;
    } else {
      cat = 'past-papers';
      folder = yr ? `G.C.E. A/L ${yr} Past Paper & Official Marking Scheme` : `National Past Papers Archive (${subjName})`;
    }

    const wantsScheme = q.includes('scheme') || q.includes('marking') || q.includes('விடை') || q.includes('answer');

    let guidance = '';
    if (isAllInOne) {
      guidance = `கோரப்பட்ட ${subjName} All in One வளக் களஞ்சியத்திலுள்ள அனைத்து தனித்தனி துணைப் பிரிவுகளும் (Sub-Folders: Theory Books, NIE Textbooks, 2000+ MCQs, Practical Handbooks, Essays, Seminar Papers) கண்டறியப்பட்டு கீழே தனித்தனி நேரடி Google Drive இணைப்புகளுடன் பட்டியலிடப்பட்டுள்ளன.`;
    } else {
      guidance = `நீங்கள் கோரிய ${subjName} ${yr ? `${yr} ` : ''}${wantsScheme ? 'உத்தியோகபூர்வ விடைக் குறிப்பு மற்றும் வினாத்தாள்' : 'பரீட்சை ஆவணங்கள் மற்றும் துணை வளக் கோப்புறைகள் (Sub-Folders)'} கண்டறியப்பட்டு கீழே தனித்தனி நேரடி இணைப்புகளுடன் வழங்கப்பட்டுள்ளன.`;
    }

    if (!q.includes('பௌதிக') && !q.includes('இரசாயன') && !q.includes('கணித') && !q.includes('உயிரியல்') && !q.includes('விடை') && !q.includes('வள')) {
      if (isAllInOne) {
        guidance = `All individual sub-folders within the All in One Resource archive (Theory Books, NIE Resource Textbooks, 2000+ MCQ Master Bank, Practical Handbooks, Essays, Seminars) for ${subjName} are extracted below with separate direct Google Drive links.`;
      } else {
        guidance = `Found matching verified study materials and dedicated sub-folders for ${subjName}${yr ? ` (${yr})` : ''}. Separate direct links for Question Papers, Marking Schemes, and individual Google Drive sub-folders are ready below.`;
      }
    }

    return {
      guidance,
      targetCategory: cat,
      targetSubject: targetSubj,
      searchKeywords: query,
      highlightFolder: folder,
      preferredFormat: wantsScheme ? 'scheme' : 'both',
    };
  };

  const handleSearch = async (queryText?: string) => {
    const textToSearch = (queryText !== undefined ? queryText : promptInput).trim();
    if (!textToSearch) return;

    playRoboticClick();
    setIsLoading(true);
    setErrorMessage('');
    setSearchResult(null);
    setMatchingPapers([]);
    setMatchingSubFolders([]);
    setSubFolderFilterSubject('all');
    setSubFolderCategoryFilter('all');
    setSubFolderSearch('');

    try {
      let aiResult: AiSearchResult | null = null;
      const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `The student is searching for G.C.E. A/L examination materials (Past papers, FWC term tests, Moratuwa pilot papers, theory notes, and individual academic resource sub-folders) on the Paper Express portal.
User Search Query: "${textToSearch}"

CRITICAL RULE FOR ALL-IN-ONE & RESOURCES:
Never treat "All in one resource" as just a single generic folder or single file. If the student searches for resources or all in one or subject materials, make clear that all individual sub-folders (Theory Books, Official NIE Resource Books, 2000+ MCQ Master Bank, Practical Handbooks, Essay Collections, Seminar Papers, Syllabus Guides) are provided below with separate direct links!

Available academic resource sub-folder types include:
- Theory Books (Unit Notes)
- Official Resource Books (NIE)
- 2000+ MCQ Master Bank
- Practical Handbooks & Experiments / Titrations
- Essay & Structure Collections
- Practice Books & Problem Sets
- Support Seminar Papers & Teacher Guides

Analyze the student query (which could be in colloquial English, Tamil, or Tanglish) and return ONLY a valid JSON object matching this schema:
{
  "guidance": "Concise direct response in English or Tamil confirming what files and individual sub-folders were found",
  "targetCategory": "past-papers" | "fwc-papers" | "theory-notes" | "pilot-papers",
  "targetSubject": "physics" | "chemistry" | "c-maths" | "biology" | "all",
  "searchKeywords": "precise keywords to match paper titles and sub-folders",
  "highlightFolder": "Exact folder or sub-folder title (e.g. 2023 Physics Past Paper & Scheme Archive or Biology Official NIE Resource Books)",
  "preferredFormat": "both" | "scheme" | "paper" | "folder"
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
          console.warn('Gemini API call failed, falling back to local engine:', apiErr);
          aiResult = null;
        }
      }

      if (!aiResult) {
        aiResult = runLocalAdvanceEngine(textToSearch);
      }

      const safeAiResult: AiSearchResult = {
        guidance: aiResult?.guidance || 'Found matching study materials and resource sub-folders. Direct file links are ready below.',
        targetCategory: aiResult?.targetCategory || 'past-papers',
        targetSubject: (aiResult?.targetSubject || 'all').toLowerCase(),
        searchKeywords: aiResult?.searchKeywords || textToSearch,
        highlightFolder: aiResult?.highlightFolder || 'Study Resources Archive',
        preferredFormat: aiResult?.preferredFormat || 'both',
      };

      // 1. Match papers
      const matchedP = scoreAndMatchPapers(textToSearch, {
        subject: safeAiResult.targetSubject,
        intent: safeAiResult.preferredFormat,
        keywords: safeAiResult.searchKeywords,
      });

      // 2. Match individual resource sub-folders
      const matchedSubs = scoreAndMatchSubFolders(textToSearch, safeAiResult.targetSubject);

      setSearchResult(safeAiResult);
      setMatchingPapers(matchedP);
      setMatchingSubFolders(matchedSubs);
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-7 sm:p-9 border border-blue-500/30 shadow-2xl google-anno-skip">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-300 text-xs font-mono font-bold tracking-wider shadow-inner">
            <Search className="w-4 h-4 text-sky-400" />
            <span>PAPER EXPRESS ADVANCE STUDY & RESOURCE SEARCH</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Ask in Any Style & Get Exact File & Sub-Folder Links Instantly
          </h1>

          <p className="text-xs sm:text-sm text-sky-200/90 leading-relaxed">
            Enter what you need in natural English or Tamil (e.g. <em>"2023 physics marking scheme"</em>, <em>"biology NIE resource books"</em>, <em>"chemistry 2000 mcq bank"</em>, or <em>"Moratuwa pilot maths"</em>). Our intelligent system pinpoints the exact question papers, marking schemes, and individual Google Drive sub-folders with separate direct links!
          </p>

          {/* Search Bar */}
          <div className="pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="relative flex items-center"
            >
              <div className="absolute left-4 text-slate-400 pointer-events-none">
                <Search className="w-5 h-5 text-sky-400" />
              </div>
              
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Advance Search: e.g. '2023 physics marking scheme', 'biology NIE resource books', 'chemistry 2000 mcq'..."
                className="w-full pl-12 pr-32 py-4 rounded-2xl bg-slate-950/80 border-2 border-blue-500/40 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20 shadow-inner transition-all"
              />

              <div className="absolute right-2.5 flex items-center gap-1.5">
                {promptInput && (
                  <button
                    type="button"
                    onClick={() => setPromptInput('')}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors text-xs"
                    title="Clear prompt"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !promptInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <span>Search</span>
                      <Search className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Suggested Prompts */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-sky-300 font-bold">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span>Quick Search Examples:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptInput(sample.prompt);
                    handleSearch(sample.prompt);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 border border-blue-400/20 hover:border-blue-400 text-sky-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading & Deep Thinking Animation */}
      {isLoading && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-blue-500/30 text-white shadow-xl space-y-5 animate-in fade-in duration-200 google-anno-skip">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-sky-400 shrink-0">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300">
                Paper Express Intelligent System Thinking
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Deep Analyzing Curriculum, Examination Archives & Sub-Folders...
              </h3>
            </div>
          </div>

          {/* Animated Thinking Steps */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800/80">
              <span className="font-mono font-bold text-sky-400">STATUS</span>
              <span>Step {thinkingStepIndex + 1} of {THINKING_STEPS.length}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-sky-200 flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping shrink-0" />
              <span>{THINKING_STEPS[thinkingStepIndex]}</span>
            </p>
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

      {/* Search Result Display */}
      {searchResult && !isLoading && (
        <div className="space-y-6">
          {/* AI Guidance & Destination Header */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5 animate-scroll-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Search className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Paper Express Analysis</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                      {matchingPapers.length + matchingSubFolders.length} Match{(matchingPapers.length + matchingSubFolders.length) !== 1 ? 'es' : ''} Located
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target Topic: <strong className="text-blue-600 dark:text-sky-400">{searchResult.highlightFolder}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playRoboticTab();
                  onNavigateToTab(searchResult.targetCategory);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Jump to Section</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* AI Direct Message */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <p className="font-semibold">{searchResult.guidance}</p>
            </div>
          </div>

          {/* 1. MATCHING RESOURCE SUB-FOLDERS SECTION */}
          {matchingSubFolders.length > 0 && (() => {
            const subjectsAvailable = Array.from(new Set(matchingSubFolders.map((s) => s.subjectId)));
            
            const filteredSubs = matchingSubFolders.filter((sub) => {
              // Subject filter
              if (subFolderFilterSubject !== 'all' && sub.subjectId !== subFolderFilterSubject) {
                return false;
              }
              // Category filter
              if (subFolderCategoryFilter !== 'all') {
                const subId = (sub.id || '').toLowerCase();
                if (subFolderCategoryFilter === 'theory' && !subId.includes('theory')) return false;
                if (subFolderCategoryFilter === 'nie' && !subId.includes('resource-books')) return false;
                if (subFolderCategoryFilter === 'mcq' && !subId.includes('mcq')) return false;
                if (subFolderCategoryFilter === 'practical' && !subId.includes('practical')) return false;
                if (subFolderCategoryFilter === 'essay' && !subId.includes('essay') && !subId.includes('structure')) return false;
                if (subFolderCategoryFilter === 'seminar' && !subId.includes('seminar') && !subId.includes('guide') && !subId.includes('syllabus')) return false;
              }
              // Local query filter
              if (subFolderSearch.trim()) {
                const q = subFolderSearch.toLowerCase().trim();
                const matchName = (sub.nameEn || '').toLowerCase().includes(q) || (sub.nameTa || '').toLowerCase().includes(q);
                const matchDesc = (sub.description || '').toLowerCase().includes(q);
                const matchHl = (sub.fileHighlights || []).some((h) => (h || '').toLowerCase().includes(q));
                const matchBadge = (sub.badge || '').toLowerCase().includes(q);
                if (!matchName && !matchDesc && !matchHl && !matchBadge) return false;
              }
              return true;
            });

            return (
              <div className="space-y-4 pt-1 animate-scroll-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span>Curated Resource Sub-Folders & Dedicated Vaults ({filteredSubs.length})</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Every specific sub-folder inside the master curriculum: Theory books, official NIE textbooks, 2000+ MCQs, practical handbooks, and seminar worksheets
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      playRoboticTab();
                      onNavigateToTab('theory-notes');
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1 self-start md:self-auto"
                  >
                    <span>Open All 4 Subject Vaults</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sub-Folder Filters & Search Controls */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    {/* Subject Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1 uppercase tracking-wider">
                        Subject:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          playRoboticClick();
                          setSubFolderFilterSubject('all');
                        }}
                        className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                          subFolderFilterSubject === 'all'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        All Subjects ({matchingSubFolders.length})
                      </button>

                      {subjectsAvailable.includes('biology') && (
                        <button
                          type="button"
                          onClick={() => {
                            playRoboticClick();
                            setSubFolderFilterSubject('biology');
                          }}
                          className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                            subFolderFilterSubject === 'biology'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50'
                          }`}
                        >
                          Biology ({matchingSubFolders.filter((s) => s.subjectId === 'biology').length})
                        </button>
                      )}

                      {subjectsAvailable.includes('chemistry') && (
                        <button
                          type="button"
                          onClick={() => {
                            playRoboticClick();
                            setSubFolderFilterSubject('chemistry');
                          }}
                          className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                            subFolderFilterSubject === 'chemistry'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50'
                          }`}
                        >
                          Chemistry ({matchingSubFolders.filter((s) => s.subjectId === 'chemistry').length})
                        </button>
                      )}

                      {subjectsAvailable.includes('physics') && (
                        <button
                          type="button"
                          onClick={() => {
                            playRoboticClick();
                            setSubFolderFilterSubject('physics');
                          }}
                          className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                            subFolderFilterSubject === 'physics'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-sky-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50'
                          }`}
                        >
                          Physics ({matchingSubFolders.filter((s) => s.subjectId === 'physics').length})
                        </button>
                      )}

                      {subjectsAvailable.includes('c-maths') && (
                        <button
                          type="button"
                          onClick={() => {
                            playRoboticClick();
                            setSubFolderFilterSubject('c-maths');
                          }}
                          className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                            subFolderFilterSubject === 'c-maths'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50'
                          }`}
                        >
                          Combined Maths ({matchingSubFolders.filter((s) => s.subjectId === 'c-maths').length})
                        </button>
                      )}
                    </div>

                    {/* In-Results Subfolder Filter Search */}
                    <div className="relative min-w-[200px] flex-1 max-w-xs">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={subFolderSearch}
                        onChange={(e) => setSubFolderSearch(e.target.value)}
                        placeholder="Filter sub-folders..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Category Type Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <span className="font-bold text-slate-400 dark:text-slate-500 mr-1 uppercase tracking-wider">
                      Type:
                    </span>
                    {[
                      { id: 'all', label: 'All Sub-Folders' },
                      { id: 'theory', label: '📘 Theory Notes' },
                      { id: 'nie', label: '📚 NIE Textbooks' },
                      { id: 'mcq', label: '📜 2000+ MCQs' },
                      { id: 'practical', label: '📕 Practicals' },
                      { id: 'essay', label: '✍️ Essays & Structures' },
                      { id: 'seminar', label: '🔖 Seminars & Guides' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          playRoboticClick();
                          setSubFolderCategoryFilter(cat.id as any);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          subFolderCategoryFilter === cat.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-Folders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSubs.map((sub, idx) => {
                    const isSubBookmarked = isBookmarked ? isBookmarked(`folder-${sub.id}`) : false;

                    return (
                      <div
                        key={sub.id}
                        className={`bg-white dark:bg-slate-900 rounded-3xl border ${sub.themeColor} p-5 shadow-sm hover:shadow-md transition-all space-y-3.5 hover-card-elevate reveal-delay-${(idx % 6) + 1}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-2xl shadow-2xs shrink-0">
                              {sub.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300">
                                  {sub.subjectNameEn}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {sub.badge}
                                </span>
                              </div>
                              <h5 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                                {sub.nameEn}
                              </h5>
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                {sub.nameTa}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {sub.fileHighlights.map((hl, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span>{hl}</span>
                            </span>
                          ))}
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                          <a
                            href={sub.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => playRoboticClick()}
                            className="flex-1 min-w-[170px] py-2 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Open in Google Drive</span>
                            <ExternalLink className="w-3 h-3 text-sky-300" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              playRoboticTab();
                              onNavigateToTab('theory-notes', { subject: sub.subjectId });
                            }}
                            className="py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-sky-300 font-bold text-xs border border-blue-200 dark:border-blue-900 transition-colors cursor-pointer flex items-center gap-1"
                            title="Jump to Academic Resource Vault"
                          >
                            <span>Subject Vault</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyLink(sub.driveLink, `subfolder-${sub.id}`)}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            title="Copy Drive Folder Link"
                          >
                            {copiedId === `subfolder-${sub.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {onToggleBookmark && (
                            <button
                              type="button"
                              onClick={() => {
                                playRoboticClick();
                                onToggleBookmark(`folder-${sub.id}`);
                              }}
                              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                isSubBookmarked
                                  ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white'
                              }`}
                              title={isSubBookmarked ? 'Bookmarked' : 'Bookmark Folder'}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSubBookmarked ? 'fill-current' : ''}`} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 2. MATCHING PAST PAPERS & MARKING SCHEMES */}
          {matchingPapers.length > 0 && (
            <div className="space-y-4 pt-2 animate-scroll-up">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                    <span>Identified Examination Files & Separate Direct Links ({matchingPapers.length})</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Question papers and official Department of Examinations marking schemes
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToTab(searchResult.targetCategory)}
                  className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>View Full Category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Matched File Cards */}
              <div className="space-y-4">
                {matchingPapers.map((paper) => {
                  const directPaperViewUrl = getDriveDirectViewUrl(paper.driveLink);
                  const directPaperDownloadUrl = getDriveDirectDownloadUrl(paper.driveLink);
                  const hasScheme = Boolean(paper.markingSchemeDriveLink);
                  const directSchemeViewUrl = hasScheme
                    ? getDriveDirectViewUrl(paper.markingSchemeDriveLink!)
                    : directPaperViewUrl;
                  const directSchemeDownloadUrl = hasScheme
                    ? getDriveDirectDownloadUrl(paper.markingSchemeDriveLink!)
                    : directPaperDownloadUrl;

                  const isSaved = isBookmarked(paper.id);

                  return (
                    <div
                      key={paper.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4 hover-card-elevate"
                    >
                      {/* Top Badges & Title */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300 font-bold flex items-center gap-1">
                              {getSubjectIcon(paper.subjectId)}
                              <span>{paper.subjectNameEn}</span>
                            </span>

                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                              {paper.year}
                            </span>

                            {paper.term && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                                {paper.term}
                              </span>
                            )}

                            {paper.pilotType && (
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-bold">
                                {paper.pilotType}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                            {paper.titleEn}
                          </h4>

                          {paper.titleTa && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                              {paper.titleTa}
                            </p>
                          )}

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {paper.schoolOrSource} {paper.unitOrTopic ? `• ${paper.unitOrTopic}` : ''}
                          </p>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={() => {
                            playRoboticClick();
                            onToggleBookmark(paper.id);
                          }}
                          className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 self-start ${
                            isSaved
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-[#0066FF] dark:text-sky-400'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                          title={isSaved ? 'Remove bookmark' : 'Bookmark this paper'}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* SEPARATE LINKS SECTION */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* 1. Question Paper Link Box */}
                        <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/50 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-blue-900 dark:text-sky-200 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                              <span>1. Question Paper Link (வினாத்தாள்)</span>
                            </span>
                            <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-sky-300">
                              Exam Paper
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={directPaperViewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => playRoboticClick()}
                              className="flex-1 py-2 px-3 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open Question Paper</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => onPreviewPaper(paper, 'paper')}
                              className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Preview in PDF viewer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>

                            <a
                              href={directPaperDownloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => playRoboticClick()}
                              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                              title="Direct Download Question Paper"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleCopyLink(paper.driveLink, `paper-${paper.id}`)}
                              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                              title="Copy Question Paper Link"
                            >
                              {copiedId === `paper-${paper.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* 2. Official Marking Scheme Link Box */}
                        <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/50 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>2. Marking Scheme Link (விடைக்குறிப்பு)</span>
                            </span>
                            <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                              Official Answers
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={directSchemeViewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => playRoboticClick()}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open Marking Scheme</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => onPreviewPaper(paper, 'scheme')}
                              className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Preview scheme in PDF viewer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>

                            <a
                              href={directSchemeDownloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => playRoboticClick()}
                              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                              title="Direct Download Marking Scheme"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleCopyLink(paper.markingSchemeDriveLink || paper.driveLink, `scheme-${paper.id}`)}
                              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                              title="Copy Scheme Link"
                            >
                              {copiedId === `scheme-${paper.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
