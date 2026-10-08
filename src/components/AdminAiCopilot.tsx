import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, CheckCircle2, AlertCircle, 
  FolderOpen, FileText, Trash2, Megaphone, ExternalLink, 
  Copy, Check, ArrowRight, Video, RefreshCw, Layers, 
  Zap, HelpCircle, ShieldCheck
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { PaperResource, VideoLesson, ResourceCategory, StreamId } from '../types';
import { ALL_SUB_FOLDERS } from './AiSearchView';
import { extractYoutubeId } from '../utils/drive';
import { playRoboticClick, playRoboticUnlock } from '../utils/audio';

interface AdminAiCopilotProps {
  papers: PaperResource[];
  videos: VideoLesson[];
  onAddPaper: (paper: PaperResource) => void;
  onUpdatePaper?: (paper: PaperResource) => void;
  onDeletePaper?: (paperId: string) => void;
  onAddVideo?: (video: VideoLesson) => void;
  vaultDriveLinks?: Record<string, string>;
  onUpdateVaultDriveLinks?: (links: Record<string, string>) => void;
  siteAnnouncement?: { active: boolean; text: string; type: 'info' | 'alert' | 'success' };
  onUpdateSiteAnnouncement?: (announcement: { active: boolean; text: string; type: 'info' | 'alert' | 'success' }) => void;
  onSwitchTab: (tab: 'papers' | 'resources' | 'videos' | 'reports' | 'announcement' | 'publish' | 'security', filterParams?: { category?: string; subject?: string }) => void;
  showSuccess: (msg: string) => void;
}

export interface CopilotActionReceipt {
  type: 'UPLOAD_PAPER' | 'OPEN_FOLDER' | 'DELETE_PAPER' | 'UPDATE_ANNOUNCEMENT' | 'ADD_VIDEO';
  title: string;
  detail: string;
  subject?: string;
  category?: string;
  year?: number;
  driveLink?: string;
  paperId?: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'admin' | 'ai';
  timestamp: string;
  text: string;
  actionReceipt?: CopilotActionReceipt;
  suggestedPrompts?: string[];
}

const DAILY_LIMIT = 100;

export const AdminAiCopilot: React.FC<AdminAiCopilotProps> = ({
  papers,
  videos,
  onAddPaper,
  onUpdatePaper,
  onDeletePaper,
  onAddVideo,
  vaultDriveLinks = {},
  onUpdateVaultDriveLinks,
  siteAnnouncement,
  onUpdateSiteAnnouncement,
  onSwitchTab,
  showSuccess,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dailyChatCount, setDailyChatCount] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Daily limit key based on today's YYYY-MM-DD
  const getTodayKey = () => {
    const today = new Date().toISOString().slice(0, 10);
    return `paperexpress_admin_copilot_${today}`;
  };

  // Load chat count and history on mount
  useEffect(() => {
    try {
      const todayKey = getTodayKey();
      const storedCount = localStorage.getItem(todayKey);
      setDailyChatCount(storedCount ? parseInt(storedCount, 10) : 0);

      const storedHistory = localStorage.getItem('paperexpress_copilot_history');
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      } else {
        // Welcoming initial assistant message
        setMessages([
          {
            id: 'welcome',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `வணக்கம் Admin! நான் உங்கள் Paper Express AI Copilot. நீங்கள் என்னிடம் தமிழ், Tanglish அல்லது English-ல் பேசி எந்தவொரு Exam Paper அல்லது Resource-ஐயும் நேரடியாக Upload செய்யலாம், Folder-களை திறக்கலாம் அல்லது Manage செய்யலாம்!

⚡ தினசரி வரம்பு: 100 Chats (Daily limit: 100 chats).

உதாரணமாக:
• "2024 Biology Marking Scheme upload pannu link: https://drive.google.com/..."
• "Moratuwa Pilot Combined Maths 2023 paper add pannu https://..."
• "Open Physics resource sub-folders"
• "Delete paper 2019 Chemistry"
• "Put live announcement: New 2024 Marking Schemes Available Now!"`,
            suggestedPrompts: [
              'Upload 2024 Biology Marking Scheme (Drive link...)',
              'Open University of Moratuwa Pilot Archive',
              'Show total uploaded papers count',
              'Post Live Notice: New 2024 Schemes Uploaded'
            ]
          }
        ]);
      }
    } catch (e) {
      console.warn('Failed loading copilot history from storage:', e);
    }
  }, []);

  // Save history on changes
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('paperexpress_copilot_history', JSON.stringify(messages.slice(-30)));
      } catch (e) {}
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const incrementDailyCount = () => {
    const todayKey = getTodayKey();
    const newCount = dailyChatCount + 1;
    setDailyChatCount(newCount);
    try {
      localStorage.setItem(todayKey, newCount.toString());
    } catch (e) {}
    return newCount;
  };

  const handleCopy = (text: string, id: string) => {
    playRoboticClick();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // High-precision Local NLP Action Processor (Extracts links, subjects, categories, and actions)
  const processLocalAgent = (input: string): { reply: string; receipt?: CopilotActionReceipt; suggestedPrompts?: string[] } => {
    const q = input.trim();
    const lower = q.toLowerCase();

    // 1. Extract Google Drive URL if present
    const driveLinkMatch = q.match(/https:\/\/(?:drive\.google\.com\/[^\s]+|docs\.google\.com\/[^\s]+)/i);
    const driveLink = driveLinkMatch ? driveLinkMatch[0] : '';

    // 2. Extract YouTube URL if present
    const ytMatch = q.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/[^\s]+|youtu\.be\/[^\s]+)/i);
    const youtubeUrl = ytMatch ? ytMatch[0] : '';

    // 3. Extract Subject
    let subject = 'Physics';
    let subjectId = 'physics';
    let stream: StreamId = 'maths';

    if (lower.includes('bio') || lower.includes('உயிரியல்') || lower.includes('botany') || lower.includes('zoology')) {
      subject = 'Biology';
      subjectId = 'biology';
      stream = 'bio';
    } else if (lower.includes('chem') || lower.includes('இரசாயன') || lower.includes('வேதியியல்')) {
      subject = 'Chemistry';
      subjectId = 'chemistry';
      stream = 'bio';
    } else if (lower.includes('math') || lower.includes('கணித') || lower.includes('pure') || lower.includes('applied')) {
      subject = 'Combined Mathematics';
      subjectId = 'c-maths';
      stream = 'maths';
    } else if (lower.includes('phy') || lower.includes('பௌதிக') || lower.includes('இயற்பியல்')) {
      subject = 'Physics';
      subjectId = 'physics';
      stream = 'maths';
    }

    // 4. Extract Year
    const yearMatch = lower.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

    // 5. Detect Action: OPEN FOLDER / VAULT
    const isOpenFolder = 
      (lower.includes('open') || lower.includes('thira') || lower.includes('திற') || lower.includes('kaatu') || lower.includes('show') || lower.includes('view') || lower.includes('goto')) &&
      (lower.includes('folder') || lower.includes('vault') || lower.includes('கோப்பு') || lower.includes('களஞ்சியம்') || lower.includes('archive') || lower.includes('pilot') || lower.includes('resource') || lower.includes('paper'));

    if (isOpenFolder && !lower.includes('upload') && !lower.includes('add') && !driveLink) {
      // Find matching vault or sub-folder
      let targetCategory: 'papers' | 'resources' = 'papers';
      let folderTitle = `${subject} Archive`;
      let folderUrl = vaultDriveLinks[subjectId] || 'https://drive.google.com';

      if (lower.includes('pilot') || lower.includes('moratuwa')) {
        folderTitle = `University of Moratuwa Pilot Archive (${subject})`;
        targetCategory = 'papers';
      } else if (lower.includes('resource') || lower.includes('vault') || lower.includes('sub folder') || lower.includes('theory')) {
        folderTitle = `${subject} Dedicated Sub-Folders Vault`;
        targetCategory = 'resources';
      }

      onSwitchTab(targetCategory, { subject: subjectId });

      return {
        reply: `📂 "${folderTitle}" திறக்கப்பட்டது! Admin Panel-ல் இதற்கான பட்டியல் filter செய்யப்பட்டு காட்டப்பட்டுள்ளது. இதோ நேரடி Google Drive இணைப்பு:`,
        receipt: {
          type: 'OPEN_FOLDER',
          title: folderTitle,
          detail: `Navigated to ${targetCategory.toUpperCase()} tab for ${subject}.`,
          subject,
          driveLink: folderUrl
        }
      };
    }

    // 6. Detect Action: DELETE PAPER
    const isDelete = lower.includes('delete') || lower.includes('remove') || lower.includes('azhi') || lower.includes('நீக்கு');
    if (isDelete) {
      // Find matching paper
      const targetPaper = papers.find((p) => {
        const titleMatch = (p.titleEn || '').toLowerCase().includes(subject.toLowerCase()) || (p.subjectNameEn || '').toLowerCase().includes(subject.toLowerCase());
        const yearMatch2 = yearMatch ? p.year === year : true;
        return titleMatch && yearMatch2;
      });

      if (targetPaper && onDeletePaper) {
        onDeletePaper(targetPaper.id);
        return {
          reply: `🗑️ Paper "${targetPaper.titleEn}" (${targetPaper.year} ${targetPaper.subjectNameEn}) Database-ல் இருந்து வெற்றிகரமாக நீக்கப்பட்டது!`,
          receipt: {
            type: 'DELETE_PAPER',
            title: `Deleted: ${targetPaper.titleEn}`,
            detail: `Removed from cloud database. ID: ${targetPaper.id}`,
            subject: targetPaper.subjectNameEn,
            year: targetPaper.year,
            paperId: targetPaper.id
          }
        };
      } else {
        return {
          reply: `நீக்குவதற்கான பொருத்தமான Paper கண்டறியப்படவில்லை. தயவுசெய்து சரியான வருடம் மற்றும் பாடத்தைக் குறிப்பிடுங்கள் (உதா: "Delete 2019 Physics paper").`
        };
      }
    }

    // 7. Detect Action: LIVE NOTICE / ANNOUNCEMENT
    const isAnnouncement = lower.includes('announcement') || lower.includes('notice') || lower.includes('அறிவிப்பு') || lower.includes('banner');
    if (isAnnouncement && onUpdateSiteAnnouncement) {
      const cleanNoticeText = q
        .replace(/^(?:put|set|post|add|publish|update)\s+(?:live\s+)?(?:notice|announcement)[:\s]*/i, '')
        .trim();

      const finalNotice = cleanNoticeText || 'New G.C.E. A/L Official Marking Schemes & Examination Papers Published!';
      onUpdateSiteAnnouncement({ active: true, text: finalNotice, type: 'info' });

      return {
        reply: `📢 இணையதளத்தில் நேரடி அறிவிப்பு (Live Announcement Banner) வெற்றிகரமாக வெளியிடப்பட்டது!`,
        receipt: {
          type: 'UPDATE_ANNOUNCEMENT',
          title: 'Live Site Notice Published',
          detail: finalNotice
        }
      };
    }

    // 8. Detect Action: ADD VIDEO
    if (youtubeUrl && onAddVideo) {
      const cleanYtId = extractYoutubeId(youtubeUrl);
      if (cleanYtId) {
        const newVideo: VideoLesson = {
          id: 'copilot_vid_' + Date.now(),
          titleEn: `${subject} Unit Masterclass ${year}`,
          stream,
          subjectId: subjectId === 'c-maths' ? 'sub-maths' : `sub-${subjectId}`,
          subjectNameEn: subject,
          unitNumber: 1,
          unitNameEn: 'Theory Lecture & Derivations',
          youtubeUrl: `https://www.youtube.com/watch?v=${cleanYtId}`,
          youtubeId: cleanYtId,
          durationMinutes: 45,
          teacherName: 'Paper Express Faculty',
          descriptionEn: 'Official theory lecture with detailed derivation explanations.',
          isUnlisted: false,
          chapters: [
            { time: '00:00', seconds: 0, title: 'Introduction & Core Concepts' },
            { time: '20:00', seconds: 1200, title: 'Exam Derivations & Past Questions' }
          ],
          viewsCount: 1,
          uploadedAt: 'Today',
        };

        onAddVideo(newVideo);
        showSuccess(`Video lesson "${newVideo.titleEn}" published via Copilot!`);

        return {
          reply: `🎥 புதிய Theory Video Masterclass (${subject}) வெற்றிகரமாக பதிவேற்றப்பட்டது!`,
          receipt: {
            type: 'ADD_VIDEO',
            title: newVideo.titleEn,
            detail: `YouTube Video ID: ${cleanYtId}`,
            subject,
            driveLink: newVideo.youtubeUrl
          }
        };
      }
    }

    // 9. Detect Action: UPLOAD / PUBLISH PAPER OR SCHEME
    const isUpload = 
      lower.includes('upload') || 
      lower.includes('add') || 
      lower.includes('publish') || 
      lower.includes('சேர்') || 
      lower.includes('பதிவேற்று') || 
      lower.includes('podu') || 
      Boolean(driveLink);

    if (isUpload) {
      // Check if drive link is missing
      if (!driveLink) {
        return {
          reply: `தாங்கள் கோரிய ஆவணம்: **${year} ${subject}**.\n\n⚠️ தயவுசெய்து இந்த ஆவணத்திற்கான **Google Drive Link**-ஐ (https://drive.google.com/...) வழங்குங்கள்! நான் உடனடியாக இதை சரியான Folder-ல் பதிவேற்றி விடுகிறேன்.`,
          suggestedPrompts: [
            `Upload ${year} ${subject} with link https://drive.google.com/...`,
            `Open ${subject} resources folder instead`
          ]
        };
      }

      // Determine Category
      let category: ResourceCategory = 'past-papers';
      let term: string | undefined = undefined;
      let pilotType: string | undefined = undefined;
      let schoolSource = 'Department of Examinations, Sri Lanka';

      if (lower.includes('pilot') || lower.includes('moratuwa') || lower.includes('மாதிரி')) {
        category = 'pilot-papers';
        pilotType = 'University of Moratuwa';
        schoolSource = 'University of Moratuwa Pilot Exam Syndicate';
      } else if (lower.includes('fwc') || lower.includes('term') || lower.includes('தவணை') || lower.includes('thondaimanaru')) {
        category = 'fwc-papers';
        term = lower.includes('1st') ? '1st Term' : lower.includes('2nd') ? '2nd Term' : lower.includes('3rd') ? '3rd Term' : 'FWC Pilot';
        schoolSource = 'FWC Thondaimanaru / Provincial Examinations';
      } else if (lower.includes('resource') || lower.includes('note') || lower.includes('வள') || lower.includes('mcq') || lower.includes('practical')) {
        category = 'theory-notes';
        schoolSource = 'National Institute of Education (NIE)';
      }

      const wantsScheme = lower.includes('scheme') || lower.includes('marking') || lower.includes('விடை') || lower.includes('புள்ளி');

      const titleEn = `G.C.E. A/L ${year} ${subject} ${category === 'theory-notes' ? 'Resource Material' : wantsScheme ? 'Marking Scheme' : 'Examination Paper'}`;
      const titleTa = `க.பொ.த உயர்தரம் ${year} ${subject} ${wantsScheme ? 'புள்ளித்திட்டம் மற்றும் வழிகாட்டல்' : 'வினாத்தாள்'}`;

      const newPaper: PaperResource = {
        id: 'copilot_res_' + Date.now(),
        titleEn,
        titleTa,
        category,
        stream,
        subjectId: subjectId === 'c-maths' ? 'sub-maths' : `sub-${subjectId}`,
        subjectNameEn: subject,
        year,
        term,
        pilotType,
        schoolOrSource: schoolSource,
        driveLink,
        markingSchemeDriveLink: driveLink,
        fileSize: 'PDF Document',
        downloadsCount: 1,
      };

      onAddPaper(newPaper);
      playRoboticUnlock();
      showSuccess(`Paper "${newPaper.titleEn}" published live via AI Copilot!`);

      return {
        reply: `🎉 **வெற்றிகரமாக பதிவேற்றப்பட்டது! (Successfully Uploaded)**\n\nபுதிய ஆவணம்: **${newPaper.titleEn}**\n• பாடம்: **${subject}**\n• வகை: **${category.toUpperCase()}**\n• வருடம்: **${year}**\n\nஆவணம் நேரடியாக Cloud Database மற்றும் இணையதளத்தின் பொருத்தமான Folder-ல் இணைக்கப்பட்டுள்ளது. கீழே உள்ள அட்டையிலிருந்து முன்னோட்டம் பார்க்கலாம்:`,
        receipt: {
          type: 'UPLOAD_PAPER',
          title: newPaper.titleEn,
          detail: `Uploaded to category: ${category} · Stream: ${stream.toUpperCase()}`,
          subject,
          category,
          year,
          driveLink: newPaper.driveLink,
          paperId: newPaper.id
        }
      };
    }

    // 10. General Informational Query / Status
    if (lower.includes('count') || lower.includes('total') || lower.includes('எத்தனை') || lower.includes('status')) {
      const bioCount = papers.filter((p) => (p.subjectNameEn || '').toLowerCase().includes('bio')).length;
      const phyCount = papers.filter((p) => (p.subjectNameEn || '').toLowerCase().includes('phy')).length;
      const chemCount = papers.filter((p) => (p.subjectNameEn || '').toLowerCase().includes('chem')).length;
      const mathCount = papers.filter((p) => (p.subjectNameEn || '').toLowerCase().includes('math')).length;

      return {
        reply: `📊 **தற்போதைய ஆவணங்கள் விபரம்:**\n• மொத்தம்: **${papers.length} Papers & Schemes**\n• Biology: **${bioCount}** ஆவணங்கள்\n• Chemistry: **${chemCount}** ஆவணங்கள்\n• Physics: **${phyCount}** ஆவணங்கள்\n• Combined Maths: **${mathCount}** ஆவணங்கள்\n• Video Lessons: **${videos.length}** விரிவுரைகள்\n\nநீங்கள் புதிய ஆவணத்தை பதிவேற்ற விரும்பினால் அதன் Drive Link மற்றும் விபரங்களை என்னிடம் கூறுங்கள்!`
      };
    }

    // Default friendly conversational reply
    return {
      reply: `நான் உங்கள் கட்டளையை புரிந்துகொண்டேன்! ஏதேனும் ஆவணத்தை Upload செய்ய விரும்பினால் Drive Link-உடன் குறிப்பிடுங்கள். உதாரணமாக:\n• "2024 Chemistry Marking Scheme upload pannu link: https://drive.google.com/..."\n• "Open Biology folder"\n• "Delete paper 2020 Physics"`,
      suggestedPrompts: [
        'Upload 2024 Physics Question Paper',
        'Open Combined Maths Pilot Vault',
        'Show all papers count'
      ]
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!rawText) return;

    // Check daily limit (100 chats/day)
    if (dailyChatCount >= DAILY_LIMIT) {
      alert(`இன்றைய 100 Chat வரம்பு முடிந்தது! (Daily limit of 100 chats reached). நள்ளிரவு 12:00 மணிக்கு இது தானாக Reset ஆகும்.`);
      return;
    }

    playRoboticClick();
    incrementDailyCount();

    const adminMsg: CopilotMessage = {
      id: `admin_${Date.now()}`,
      sender: 'admin',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: rawText,
    };

    setMessages((prev) => [...prev, adminMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Attempt Gemini API if key is present
      const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');
      let processed: { reply: string; receipt?: CopilotActionReceipt } | null = null;

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `You are the Paper Express Autonomous AI Copilot inside the Administrator Console.
You have FULL rights to execute uploads, delete papers, open folders, and update site announcements for Sri Lankan G.C.E. Advanced Level Science Stream.
Admin Query: "${rawText}"

Language note: Admin may speak in Tamil, Tanglish (e.g. "biology 2024 marking scheme upload pannu link: https://..."), or English. Understand all intents seamlessly.

Identify:
1. Is this an UPLOAD request? (Needs drive link, subject, year, category).
2. Is this an OPEN FOLDER request? (Wants to open or view resources/pilot/past papers).
3. Is this a DELETE request?
4. Is this an ANNOUNCEMENT request?

Respond with a JSON object:
{
  "intent": "UPLOAD" | "OPEN_FOLDER" | "DELETE" | "ANNOUNCEMENT" | "CHAT",
  "replyText": "Helpful friendly reply in Tamil or English explaining the action",
  "subject": "Physics" | "Chemistry" | "Combined Mathematics" | "Biology",
  "category": "past-papers" | "pilot-papers" | "fwc-papers" | "theory-notes",
  "year": 2024,
  "driveLink": "extracted drive URL if any",
  "wantsScheme": boolean
}`,
            config: {
              responseMimeType: 'application/json',
            }
          });

          if (response && response.text) {
            let clean = response.text.trim();
            if (clean.startsWith('```')) {
              clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            }
            const parsed = JSON.parse(clean);

            // If parsed intent is upload and drive link is present, perform upload
            if (parsed.intent === 'UPLOAD' && parsed.driveLink) {
              const subj = parsed.subject || 'Physics';
              const yr = Number(parsed.year) || 2024;
              const cat: ResourceCategory = parsed.category || 'past-papers';
              const isScheme = Boolean(parsed.wantsScheme);

              const newPaper: PaperResource = {
                id: 'copilot_gemini_' + Date.now(),
                titleEn: `G.C.E. A/L ${yr} ${subj} ${isScheme ? 'Official Marking Scheme' : 'Examination Paper'}`,
                titleTa: `க.பொ.த உயர்தரம் ${yr} ${subj} ${isScheme ? 'விடைக் குறிப்பு' : 'வினாத்தாள்'}`,
                category: cat,
                stream: subj === 'Combined Mathematics' || subj === 'Physics' ? 'maths' : 'bio',
                subjectId: subj === 'Combined Mathematics' ? 'sub-maths' : `sub-${subj.toLowerCase()}`,
                subjectNameEn: subj,
                year: yr,
                schoolOrSource: cat === 'pilot-papers' ? 'University of Moratuwa' : 'Department of Examinations, Sri Lanka',
                driveLink: parsed.driveLink,
                markingSchemeDriveLink: parsed.driveLink,
                fileSize: 'PDF Document',
                downloadsCount: 1,
              };

              onAddPaper(newPaper);
              playRoboticUnlock();
              showSuccess(`Paper "${newPaper.titleEn}" published via Gemini AI Copilot!`);

              processed = {
                reply: parsed.replyText || `🎉 **வெற்றிகரமாக பதிவேற்றப்பட்டது!**\n\n"${newPaper.titleEn}" cloud database-ல் வெற்றிகரமாக சேர்க்கப்பட்டது!`,
                receipt: {
                  type: 'UPLOAD_PAPER',
                  title: newPaper.titleEn,
                  detail: `Published to ${cat} database by Gemini Copilot.`,
                  subject: subj,
                  category: cat,
                  year: yr,
                  driveLink: newPaper.driveLink,
                  paperId: newPaper.id
                }
              };
            }
          }
        } catch (apiErr) {
          console.warn('Gemini copilot api notice, using local engine:', apiErr);
        }
      }

      // Fallback to ultra-reliable local NLP engine
      if (!processed) {
        processed = processLocalAgent(rawText);
      }

      const aiMsg: CopilotMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: processed.reply,
        actionReceipt: processed.receipt,
        suggestedPrompts: processed.receipt ? undefined : [
          'Upload 2024 Chemistry Marking Scheme',
          'Open Physics Sub-Folders Vault',
          'Show total uploaded papers'
        ]
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Copilot processing error:', err);
      const errMsg: CopilotMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'மன்னிக்கவும், உங்கள் கோரிக்கையை செயலாக்குவதில் பிழை ஏற்பட்டது. தயவுசெய்து Drive link மற்றும் விவரங்களை மீண்டும் சரிபார்த்து அனுப்பவும்.'
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = () => {
    playRoboticClick();
    if (confirm('AI Copilot உரையாடல் வரலாற்றை அழிக்கவா? (Clear conversation history?)')) {
      setMessages([
        {
          id: 'welcome_reset',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `வரலாறு அழிக்கப்பட்டது! நான் புதிய பணிகளுக்கு தயார். Drive Link-உடன் விபரங்களை கொடுங்கள்!`,
          suggestedPrompts: [
            'Upload 2024 Biology Marking Scheme (Drive link...)',
            'Open University of Moratuwa Pilot Archive',
            'Show total uploaded papers count'
          ]
        }
      ]);
      localStorage.removeItem('paperexpress_copilot_history');
    }
  };

  const remainingChats = Math.max(0, DAILY_LIMIT - dailyChatCount);

  return (
    <div className="flex flex-col h-full bg-[#050B17] text-white rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl">
      {/* Top Banner: AI Copilot Header & Daily Limit Counter */}
      <div className="bg-[#091228] px-4 sm:px-6 py-3.5 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>PAPER EXPRESS AI COPILOT</span>
                <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-400/30">
                  AUTONOMOUS UPLOAD AGENT
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Tamil · Tanglish · English Natural Resource Uploader & Manager
            </p>
          </div>
        </div>

        {/* Daily Limit Tracker Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-inner">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="text-right">
              <div className="text-[10px] font-mono font-bold text-slate-400">
                DAILY LIMIT (100 CHATS)
              </div>
              <div className="text-xs font-mono font-black text-cyan-300 flex items-center gap-1.5">
                <span>{remainingChats} Left Today</span>
                <span className="text-[10px] text-slate-500 font-normal">({dailyChatCount}/100)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
            title="Clear Copilot History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-xs sm:text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-md ${
                msg.sender === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-xs'
                  : 'bg-[#091228] border border-cyan-500/20 text-slate-200 rounded-tl-xs'
              }`}
            >
              {/* Header Timestamp */}
              <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
                <span className="font-bold text-cyan-300">
                  {msg.sender === 'admin' ? 'You (Administrator)' : 'AI Copilot Agent'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Content */}
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </div>

              {/* ACTION RECEIPT CARD (If an Action was executed) */}
              {msg.actionReceipt && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#050B17] border border-emerald-500/40 space-y-2.5 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>ACTION EXECUTED: {msg.actionReceipt.type}</span>
                    </div>
                    {msg.actionReceipt.category && (
                      <span className="px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
                        {msg.actionReceipt.category}
                      </span>
                    )}
                  </div>

                  <h5 className="font-black text-white text-sm">
                    {msg.actionReceipt.title}
                  </h5>

                  <p className="text-[11px] text-slate-400">
                    {msg.actionReceipt.detail}
                  </p>

                  {/* Action Buttons: Open in Drive & View in Admin Tab */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                    {msg.actionReceipt.driveLink && (
                      <>
                        <a
                          href={msg.actionReceipt.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => playRoboticClick()}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in Drive</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.actionReceipt!.driveLink!, msg.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                          title="Copy Drive Link"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Copy Link</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        playRoboticClick();
                        onSwitchTab('papers');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-cyan-500/30"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View in Papers Tab</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Suggested Follow-up Prompt Chips */}
              {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  {msg.suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950/70 border border-cyan-500/20 hover:border-cyan-400/40 text-cyan-300 text-[11px] font-medium transition-all cursor-pointer text-left flex items-center gap-1"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2.5 text-xs text-cyan-300 font-mono bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/20 w-fit animate-pulse">
            <Bot className="w-4 h-4 animate-spin text-cyan-400" />
            <span>AI Copilot is analyzing query & executing action...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="bg-[#091228] p-3 sm:p-4 border-t border-cyan-500/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing || dailyChatCount >= DAILY_LIMIT}
            placeholder={
              dailyChatCount >= DAILY_LIMIT
                ? "Daily limit of 100 chats reached. Resets at midnight."
                : "Ask AI Copilot to upload or manage: e.g. 'Upload 2024 Biology scheme drive link https://...'"
            }
            className="flex-1 py-3 pl-4 pr-24 bg-[#050B17] border border-cyan-500/30 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-mono"
          />

          <button
            type="submit"
            disabled={isProcessing || !inputText.trim() || dailyChatCount >= DAILY_LIMIT}
            className="absolute right-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 px-1">
          <span>Supports Tamil, Tanglish & English natural commands</span>
          <span className="text-cyan-400">{remainingChats} / 100 chats remaining today</span>
        </div>
      </div>
    </div>
  );
};
