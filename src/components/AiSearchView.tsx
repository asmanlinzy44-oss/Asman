import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowRight, BookOpen, FileText, 
  Video, Award, FolderOpen, Lightbulb, Compass, 
  Send, Loader2, CheckCircle2, RefreshCw, AlertCircle, 
  ExternalLink, Atom, Calculator, FlaskConical, Dna
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { PaperResource, VideoLesson, ResourceCategory } from '../types';
import { ResourceCard } from './ResourceCard';
import { VideoCard } from './VideoCard';
import { playRoboticClick, playRoboticTab } from '../utils/audio';

interface AiSearchViewProps {
  papers: PaperResource[];
  videos: VideoLesson[];
  onNavigateToTab: (tab: ResourceCategory, filterParams?: { subject?: string; term?: string }) => void;
  onPreviewPaper: (paper: PaperResource, mode: 'paper' | 'scheme') => void;
  onPlayVideo: (video: VideoLesson) => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (id: string) => void;
  isVideoUnlocked: boolean;
  onRequireUnlockVideo: () => void;
}

interface AiSearchResult {
  guidance: string;
  targetCategory: ResourceCategory;
  targetSubject: string;
  searchKeywords: string;
  highlightFolder: string;
  recommendedTips: string[];
}

const SAMPLE_PROMPTS = [
  { label: '2023 Physics Marking Scheme', prompt: 'Find 2023 G.C.E. A/L Physics question paper and official marking scheme' },
  { label: 'Organic Chemistry Conversions', prompt: 'I need Organic Chemistry reaction mechanisms and conversion pathways notes' },
  { label: 'FWC 1st Term Papers', prompt: 'Show me FWC Thondaimanaru 1st term examination papers with answer schemes' },
  { label: 'Moratuwa Pilot Exams', prompt: 'University of Moratuwa pilot exams for Combined Maths and Physics' },
  { label: 'Hydrodynamics Video Class', prompt: 'Physics Unit 2 Hydrodynamics theory video lesson masterclass' },
  { label: 'Biology Unit 5 Physiology', prompt: 'Biology Human Physiology notes and NIE Resource Book guide' },
  { label: 'Pure Maths Trigonometry', prompt: 'Combined Mathematics pure maths trigonometry past papers and revision' },
];

export const AiSearchView: React.FC<AiSearchViewProps> = ({
  papers,
  videos,
  onNavigateToTab,
  onPreviewPaper,
  onPlayVideo,
  isBookmarked,
  onToggleBookmark,
  isVideoUnlocked,
  onRequireUnlockVideo,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<AiSearchResult | null>(null);
  const [matchingPapers, setMatchingPapers] = useState<PaperResource[]>([]);
  const [matchingVideos, setMatchingVideos] = useState<VideoLesson[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fallback intelligent natural language parsing engine
  const runLocalAiEngine = (query: string): AiSearchResult => {
    const q = query.toLowerCase();
    
    // Check if query is about videos
    if (q.includes('video') || q.includes('lecture') || q.includes('hydro') || q.includes('class') || q.includes('iupac')) {
      return {
        guidance: 'Looking for theory video masterclasses? We have dedicated in-website video tutorials covering Physics Hydrodynamics (Units 1–5) and Chemistry IUPAC lectures. You can watch them directly in our distraction-free player.',
        targetCategory: 'theory-videos',
        targetSubject: q.includes('chem') ? 'chemistry' : 'physics',
        searchKeywords: q.includes('hydro') ? 'hydro' : 'theory',
        highlightFolder: 'Theory Video Masterclasses (Physics Hydrodynamics Units 1–5)',
        recommendedTips: [
          'Enter student Index 4428 & Password 1016 to unlock video classes.',
          'Use video speed controls (1.25x / 1.5x) for efficient revision.',
        ]
      };
    }

    // Check if query is about Moratuwa or Pilot papers
    if (q.includes('moratuwa') || q.includes('pilot') || q.includes('model') || q.includes('trial')) {
      return {
        guidance: 'University of Moratuwa pilot examinations and provincial trials are high-standard evaluations tailored to develop critical problem-solving skills for both Physical and Biological Science streams.',
        targetCategory: 'pilot-papers',
        targetSubject: q.includes('bio') ? 'biology' : q.includes('chem') ? 'chemistry' : q.includes('phy') ? 'physics' : 'maths',
        searchKeywords: 'moratuwa',
        highlightFolder: 'Other Pilot Papers · University of Moratuwa Archive',
        recommendedTips: [
          'Moratuwa papers feature challenging Paper 2 Part B questions.',
          'Complete these papers under 3-hour exam condition to test real timing.',
        ]
      };
    }

    // Check if query is about FWC or Term tests
    if (q.includes('fwc') || q.includes('term') || q.includes('thondaimanaru') || q.includes('1st term') || q.includes('2nd term')) {
      const termMatch = q.includes('1st') ? '1st Term' : q.includes('2nd') ? '2nd Term' : q.includes('3rd') ? '3rd Term' : '1st Term';
      return {
        guidance: `FWC Thondaimanaru pilot exams and provincial term tests are organized into 1st to 6th term folders. The 1st Term folder contains 2022–2027 Physics past papers with official answer schemes.`,
        targetCategory: 'fwc-papers',
        targetSubject: q.includes('chem') ? 'chemistry' : q.includes('maths') ? 'maths' : 'physics',
        searchKeywords: termMatch,
        highlightFolder: `FWC & Term Tests · ${termMatch} Folder`,
        recommendedTips: [
          '1st Term papers provide ideal practice for school evaluations.',
          'Each paper includes an attached official marking scheme for self-scoring.',
        ]
      };
    }

    // Check if query is about resources / theory notes
    if (q.includes('resource') || q.includes('note') || q.includes('formula') || q.includes('handbook') || q.includes('organic') || q.includes('physiology')) {
      const subj = q.includes('bio') ? 'biology' : q.includes('chem') ? 'chemistry' : q.includes('maths') ? 'maths' : 'physics';
      const folderName = subj === 'biology' ? 'Biology Master Folder' : subj === 'chemistry' ? 'Chemistry Master Folder' : subj === 'maths' ? 'Combined Maths Master Folder' : 'Physics Master Folder';
      return {
        guidance: `Access our curated Academic Resources folders. Each of the 4 dedicated subject folders (Biology, Physics, Chemistry, Combined Maths) contains comprehensive unit guides, formula sheets, and direct Google Drive folders.`,
        targetCategory: 'theory-notes',
        targetSubject: subj,
        searchKeywords: subj,
        highlightFolder: `Resources Folders · ${folderName}`,
        recommendedTips: [
          'Review formula handbooks before starting past paper practice.',
          'All resources open directly in Google Drive for lightning-fast downloads.',
        ]
      };
    }

    // Default: National Past Papers
    return {
      guidance: 'National G.C.E. A/L past papers from 1981 to 2024 are the most essential preparation resource. Reviewing marking schemes alongside questions helps understand exact mark allocations from the Department of Examinations.',
      targetCategory: 'past-papers',
      targetSubject: q.includes('bio') ? 'biology' : q.includes('chem') ? 'chemistry' : q.includes('maths') ? 'maths' : 'physics',
      searchKeywords: 'past paper',
      highlightFolder: 'National Past Papers (1981–2024 Archive)',
      recommendedTips: [
        'Attempt Paper 1 MCQs within 2 hours without calculator.',
        'Study Part A and Part B essay marking schemes carefully for step-by-step marks.',
      ]
    };
  };

  const handleSearch = async (queryText?: string) => {
    const textToSearch = (queryText !== undefined ? queryText : promptInput).trim();
    if (!textToSearch) return;

    playRoboticClick();
    setIsLoading(true);
    setErrorMessage('');

    try {
      let aiResult: AiSearchResult | null = null;
      const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `The student is searching for G.C.E. A/L Science (Combined Maths, Physics, Chemistry, Biology) study resources on the Paper Express portal.
User Query / Prompt: "${textToSearch}"

Analyze what the student needs and return ONLY a valid JSON object matching this schema:
{
  "guidance": "Concise, friendly academic advice (in English or Tamil based on query) answering their conceptual question or explaining where the requested exam papers and schemes are located.",
  "targetCategory": "past-papers" | "fwc-papers" | "theory-notes" | "pilot-papers" | "theory-videos",
  "targetSubject": "physics" | "chemistry" | "maths" | "bio" | "all",
  "searchKeywords": "best keywords to search in paper titles (e.g. 2023 physics, 1st term, organic, etc.)",
  "highlightFolder": "Exact folder title (e.g. Physics 1st Term Papers, Biology Resource Folder, 2023 A/L Past Papers)",
  "recommendedTips": ["tip 1", "tip 2"]
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

      // If Gemini API wasn't configured or failed, use smart local engine
      if (!aiResult) {
        aiResult = runLocalAiEngine(textToSearch);
      }

      // Ensure aiResult object has safe properties
      const safeAiResult: AiSearchResult = {
        guidance: aiResult?.guidance || 'Here are the recommended study resources matching your query.',
        targetCategory: aiResult?.targetCategory || 'past-papers',
        targetSubject: (aiResult?.targetSubject || 'all').toLowerCase(),
        searchKeywords: aiResult?.searchKeywords || textToSearch,
        highlightFolder: aiResult?.highlightFolder || 'Study Resources Archive',
        recommendedTips: Array.isArray(aiResult?.recommendedTips) ? aiResult.recommendedTips : []
      };

      setSearchResult(safeAiResult);

      // Filter matching papers safely
      const qLower = (textToSearch || '').toLowerCase();
      const kwLower = (safeAiResult.searchKeywords || '').toLowerCase();
      const targetSubjLower = safeAiResult.targetSubject;
      const targetCat = safeAiResult.targetCategory;
      
      const matchedP = (papers || []).filter((p) => {
        if (!p) return false;
        const pCat = p.category || '';
        const matchesCategory = pCat === targetCat || 
          (targetCat === 'fwc-papers' && (pCat === 'fwc-papers' || pCat === 'term-papers'));

        const titleEn = (p.titleEn || '').toLowerCase();
        const titleTa = (p.titleTa || '').toLowerCase();
        const subjEn = (p.subjectNameEn || '').toLowerCase();
        const subjTa = (p.subjectNameTa || '').toLowerCase();
        const subjId = (p.subjectId || '').toLowerCase();
        const source = (p.schoolOrSource || '').toLowerCase();
        const unit = (p.unitOrTopic || '').toLowerCase();

        const titleMatch = (kwLower && titleEn.includes(kwLower)) || 
                           (qLower && titleEn.includes(qLower)) ||
                           (qLower && titleTa.includes(qLower)) ||
                           (targetSubjLower && subjEn.includes(targetSubjLower)) ||
                           (kwLower && source.includes(kwLower)) ||
                           (kwLower && unit.includes(kwLower));

        const subjectMatch = targetSubjLower === 'all' || 
                             subjId === targetSubjLower || 
                             (targetSubjLower && subjEn.includes(targetSubjLower)) ||
                             (targetSubjLower && subjTa.includes(targetSubjLower));

        return (matchesCategory && (titleMatch || subjectMatch)) || titleMatch;
      });

      // Filter matching videos safely
      const matchedV = (videos || []).filter((v) => {
        if (!v) return false;
        const vTitle = (v.titleEn || '').toLowerCase();
        const vSubj = (v.subjectNameEn || '').toLowerCase();
        const vTeacher = (v.teacherName || '').toLowerCase();
        const vUnit = (v.unitNameEn || '').toLowerCase();
        const vSubjId = (v.subjectId || '').toLowerCase();

        const titleMatch = (qLower && vTitle.includes(qLower)) || 
                           (kwLower && vTitle.includes(kwLower)) ||
                           (qLower && vTeacher.includes(qLower)) ||
                           (qLower && vUnit.includes(qLower));

        const subjMatch = targetSubjLower && (vSubj.includes(targetSubjLower) || vSubjId === targetSubjLower);

        return titleMatch || subjMatch || targetCat === 'theory-videos';
      });

      setMatchingPapers(matchedP.slice(0, 6));
      setMatchingVideos(matchedV.slice(0, 3));
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMessage('Could not process advance search. Please check your query.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 border border-blue-500/30 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-300 text-xs font-mono font-bold tracking-wider shadow-inner">
            <Search className="w-4 h-4 text-sky-400" />
            <span>PAPER EXPRESS ADVANCE STUDY & RESOURCE SEARCH</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Ask Anything & Find Exact Resource Folders Instantly
          </h1>

          <p className="text-xs sm:text-sm text-sky-200/90 leading-relaxed">
            Enter your study query or topic in natural English or Tamil (e.g. <em>"Physics 2023 marking scheme"</em>, <em>"Organic chemistry reaction mechanisms"</em>, or <em>"Moratuwa pilot papers"</em>). Paper Express smart search will analyze your query, provide academic tips, and guide you straight to the matching folder!
          </p>

          {/* Prompt Search Bar */}
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
                placeholder="Advance Search: e.g. 'I need 2023 physics question paper with marking scheme' or 'Hydrodynamics Unit 2 video'..."
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
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching...</span>
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

          {/* Quick Prompts */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-sky-300 font-bold">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span>Suggested Prompts:</span>
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

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search Reasoning Result Display */}
      {searchResult && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Search className="w-5 h-5 text-sky-300" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Paper Express Recommendation</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    Match Found
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target Destination: <strong className="text-blue-600 dark:text-sky-400 capitalize">{searchResult.targetCategory.replace('-', ' ')}</strong>
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
              <span>Go to {searchResult.highlightFolder}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Guidance Text */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <p className="font-medium">{searchResult.guidance}</p>
          </div>

          {/* Highlight Folder Quick Access Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-400 shrink-0">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-mono text-sky-300 font-bold uppercase tracking-wider">
                  Recommended Resource Folder
                </div>
                <div className="text-sm sm:text-base font-black text-white">
                  {searchResult.highlightFolder}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playRoboticTab();
                onNavigateToTab(searchResult.targetCategory);
              }}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Open Folder Directly</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>

          {/* Study Tips */}
          {searchResult.recommendedTips && searchResult.recommendedTips.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Paper Express Study Preparation Tips</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResult.recommendedTips.map((tip, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Past Papers & Resources Found */}
          {matchingPapers.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Matching Question Papers & Schemes ({matchingPapers.length})</span>
                </h4>
                <button
                  onClick={() => onNavigateToTab(searchResult.targetCategory)}
                  className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>View All in {searchResult.targetCategory.replace('-', ' ')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchingPapers.map((paper) => (
                  <ResourceCard
                    key={paper.id}
                    resource={paper}
                    onPreview={(res, mode) => onPreviewPaper(res, mode || 'paper')}
                    isBookmarked={isBookmarked(paper.id)}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Matching Video Lessons Found */}
          {matchingVideos.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-600" />
                  <span>Matching Video Lessons ({matchingVideos.length})</span>
                </h4>
                <button
                  onClick={() => onNavigateToTab('theory-videos')}
                  className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Open Video Lessons</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchingVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    user={null}
                    onPlay={onPlayVideo}
                    onRequireLogin={onRequireUnlockVideo}
                    isWatched={false}
                    isUnlocked={isVideoUnlocked}
                    onRequireUnlock={onRequireUnlockVideo}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
