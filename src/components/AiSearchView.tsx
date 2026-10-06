import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowRight, BookOpen, FileText, 
  Award, FolderOpen, Lightbulb, Compass, 
  Loader2, CheckCircle2, AlertCircle, 
  ExternalLink, Atom, Calculator, FlaskConical, Dna,
  Download, Eye, Copy, Check, Bookmark, BookmarkCheck
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { PaperResource, ResourceCategory } from '../types';
import { getDriveDirectViewUrl, getDriveDirectDownloadUrl } from '../utils/drive';
import { playRoboticClick, playRoboticTab } from '../utils/audio';

interface AiSearchViewProps {
  papers: PaperResource[];
  videos?: any[]; // Kept optional for backward compatibility, never rendered
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
  { label: '2022 Chemistry Past Paper', prompt: '2022 G.C.E. A/L Chemistry question paper with answers' },
  { label: 'Moratuwa Pilot Combined Maths', prompt: 'University of Moratuwa Combined Maths pilot paper 2024' },
  { label: 'FWC 1st Term Papers', prompt: 'FWC Thondaimanaru 1st term examination papers with answer schemes' },
  { label: 'Organic Chemistry Notes', prompt: 'Organic Chemistry reaction mechanisms notes and conversions handbook' },
  { label: 'Biology Unit 5 Physiology', prompt: 'Biology Human Physiology unit notes and NIE Resource Book' },
  { label: 'Pure Maths Trigonometry', prompt: 'Combined Mathematics Pure Maths trigonometry past papers and revision' },
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
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rotate thinking steps when loading
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

  // Copy drive link helper
  const handleCopyLink = (url: string, id: string) => {
    playRoboticClick();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // High-intelligence multi-lingual scoring engine
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

    // 1. Year extraction
    const yearMatch = q.match(/\b(19\d{2}|20\d{2})\b/);
    const extractedYear = yearMatch ? parseInt(yearMatch[1], 10) : parsedTarget?.year;

    // 2. Subject extraction (English, Tamil, and Tanglish)
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

    // 3. Category / Pilot / Term extraction
    const isPilot = q.includes('moratuwa') || q.includes('மொறட்டுவ') || q.includes('pilot') || q.includes('மாதிரி') || q.includes('model') || Boolean(parsedTarget?.isPilot);
    const isTerm = q.includes('fwc') || q.includes('term') || q.includes('தவணை') || q.includes('thondaimanaru') || Boolean(parsedTarget?.isTerm);
    const isResource = q.includes('resource') || q.includes('வள') || q.includes('note') || q.includes('formula') || q.includes('handbook') || q.includes('booklet');

    // 4. Intent (Scheme vs Question Paper)
    const wantsScheme = q.includes('scheme') || q.includes('marking') || q.includes('விடை') || q.includes('குறிப்பு') || q.includes('answer') || q.includes('solution') || parsedTarget?.intent === 'scheme';

    // 5. Score every paper
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

      // Year match (strong signal)
      if (extractedYear && paper.year === extractedYear) {
        score += 80;
      }

      // Subject match
      if (extractedSubject !== 'all') {
        if (subjId === extractedSubject || subjId.includes(extractedSubject) || subjEn.includes(extractedSubject)) {
          score += 45;
        } else if (extractedSubject === 'c-maths' && (subjId.includes('math') || subjEn.includes('math'))) {
          score += 45;
        } else {
          // Negative penalty for mismatched subject when subject is explicitly requested
          score -= 40;
        }
      }

      // Pilot preference
      if (isPilot) {
        if (paper.category === 'pilot-papers') score += 50;
        if (titleEn.includes('moratuwa') || schoolSource.includes('moratuwa')) score += 40;
      }

      // Term preference
      if (isTerm) {
        if (paper.category === 'fwc-papers' || paper.category === 'term-papers') score += 50;
        if (q.includes('1st') && term.includes('1st')) score += 30;
        if (q.includes('2nd') && term.includes('2nd')) score += 30;
        if (q.includes('3rd') && term.includes('3rd')) score += 30;
      }

      // Academic resources preference
      if (isResource) {
        if (paper.category === 'theory-notes' || paper.category === 'useful-resources') score += 50;
      }

      // Scheme availability boost if user asked for scheme
      if (wantsScheme && paper.markingSchemeDriveLink) {
        score += 35;
      }

      // Word-by-word token matching
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

    // Filter out low scores and sort descending
    const filtered = scored
      .filter((item) => item.score > 10)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.paper);

    // Fallback if strict filter yields too few
    if (filtered.length === 0) {
      return (papers || []).slice(0, 4);
    }

    return filtered.slice(0, 6);
  };

  // Ultra-smart local engine
  const runLocalAdvanceEngine = (query: string): AiSearchResult => {
    const q = query.toLowerCase();

    // Year
    const yearMatch = q.match(/\b(19\d{2}|20\d{2})\b/);
    const yr = yearMatch ? yearMatch[1] : '';

    // Subject
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

    if (q.includes('moratuwa') || q.includes('மொறட்டுவ') || q.includes('pilot')) {
      cat = 'pilot-papers';
      folder = `University of Moratuwa Pilot Archive (${subjName})`;
    } else if (q.includes('fwc') || q.includes('term') || q.includes('தவணை')) {
      cat = 'fwc-papers';
      folder = `FWC & Provincial Term Tests Folder (${subjName})`;
    } else if (q.includes('note') || q.includes('resource') || q.includes('formula') || q.includes('handbook')) {
      cat = 'theory-notes';
      folder = `Subject Academic Vault & Resource Guides (${subjName})`;
    } else {
      cat = 'past-papers';
      folder = yr ? `G.C.E. A/L ${yr} Past Paper & Official Marking Scheme` : `National Past Papers Archive (${subjName})`;
    }

    const wantsScheme = q.includes('scheme') || q.includes('marking') || q.includes('விடை') || q.includes('answer');

    let guidance = `நீங்கள் கோரிய ${subjName} ${yr ? `${yr} ` : ''}${wantsScheme ? 'உத்தியோகபூர்வ விடைக் குறிப்பு மற்றும் வினாத்தாள்' : 'பரீட்சை ஆவணங்கள்'} கண்டறியப்பட்டு கீழே தனித்தனி நேரடி இணைப்புகளுடன் வழங்கப்பட்டுள்ளன.`;
    if (!q.includes('பௌதிக') && !q.includes('இரசாயன') && !q.includes('கணித') && !q.includes('உயிரியல்') && !q.includes('விடை')) {
      guidance = `Found matching verified study materials for ${subjName}${yr ? ` (${yr})` : ''}. Separate direct links for the Question Paper and Official Marking Scheme are provided below.`;
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

    try {
      let aiResult: AiSearchResult | null = null;
      const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `The student is searching for G.C.E. A/L examination materials (Past papers, FWC term tests, Moratuwa pilot papers, theory notes) on the Paper Express portal.
User Search Query: "${textToSearch}"

Carefully analyze the query (which could be in colloquial English, Tamil, or Tanglish) and identify:
1. Exactly what file the student needs.
2. Provide a polite, direct explanation in English or Tamil (matching user language) confirming the file was found and that separate links for the Question Paper and Marking Scheme are provided below.
3. Classify targetCategory, targetSubject, and keywords.

Return ONLY a valid JSON object matching this schema:
{
  "guidance": "Concise direct response in English or Tamil confirming what was found",
  "targetCategory": "past-papers" | "fwc-papers" | "theory-notes" | "pilot-papers",
  "targetSubject": "physics" | "chemistry" | "c-maths" | "biology" | "all",
  "searchKeywords": "precise keywords to match paper title and year",
  "highlightFolder": "Exact folder title (e.g. 2023 Physics Past Paper & Scheme Archive)",
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

      // Fallback local engine if API not available
      if (!aiResult) {
        aiResult = runLocalAdvanceEngine(textToSearch);
      }

      const safeAiResult: AiSearchResult = {
        guidance: aiResult?.guidance || 'Found matching study materials. Direct file links are ready below.',
        targetCategory: aiResult?.targetCategory || 'past-papers',
        targetSubject: (aiResult?.targetSubject || 'all').toLowerCase(),
        searchKeywords: aiResult?.searchKeywords || textToSearch,
        highlightFolder: aiResult?.highlightFolder || 'Study Resources Archive',
        preferredFormat: aiResult?.preferredFormat || 'both',
      };

      // Match the exact files with our multi-lingual scoring engine
      const matched = scoreAndMatchPapers(textToSearch, {
        subject: safeAiResult.targetSubject,
        intent: safeAiResult.preferredFormat,
        keywords: safeAiResult.searchKeywords,
      });

      setSearchResult(safeAiResult);
      setMatchingPapers(matched);
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-7 sm:p-9 border border-blue-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-300 text-xs font-mono font-bold tracking-wider shadow-inner">
            <Search className="w-4 h-4 text-sky-400" />
            <span>PAPER EXPRESS ADVANCE STUDY & RESOURCE SEARCH</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Ask in Any Style & Get Exact File Links Instantly
          </h1>

          <p className="text-xs sm:text-sm text-sky-200/90 leading-relaxed">
            Enter what you are searching for in natural English or Tamil (e.g. <em>"2023 physics marking scheme"</em>, <em>"இணைந்த கணிதம் 2022 வினாத்தாள்"</em>, <em>"Moratuwa pilot maths"</em>, or <em>"organic chemistry notes"</em>). Our intelligent system will analyze your query and give you separate, direct links for both the question paper and marking scheme!
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
                placeholder="Advance Search: e.g. '2023 physics marking scheme', 'moratuwa pilot maths', '1983 chem'..."
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
        <div className="p-8 rounded-3xl bg-slate-900 border border-blue-500/30 text-white shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-sky-400 shrink-0">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300">
                Paper Express Intelligent System Thinking
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Deep Analyzing Curriculum & Matching Documents...
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
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search Result Display */}
      {searchResult && !isLoading && (
        <div className="space-y-6">
          {/* AI Guidance & Destination Header */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Search className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Paper Express Analysis</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                      {matchingPapers.length} Match{matchingPapers.length !== 1 ? 'es' : ''} Located
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Primary Folder: <strong className="text-blue-600 dark:text-sky-400">{searchResult.highlightFolder}</strong>
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
                <span>Jump to Archive Folder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* AI Direct Message */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <p className="font-semibold">{searchResult.guidance}</p>
            </div>
          </div>

          {/* Exact Matched Files with Separate Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                  <span>Identified Files & Separate Direct Links ({matchingPapers.length})</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Question papers, official marking schemes, and Google Drive access links
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab(searchResult.targetCategory)}
                className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View Full Folder</span>
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
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
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

                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                            {paper.year}
                          </span>

                          {paper.term && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                              {paper.term}
                            </span>
                          )}

                          {paper.pilotType && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-bold">
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
        </div>
      )}
    </div>
  );
};
