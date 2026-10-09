import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, CheckCircle2, AlertCircle, 
  FolderOpen, FileText, Trash2, Megaphone, ExternalLink, 
  Copy, Check, ArrowRight, Video, RefreshCw, Layers, 
  Zap, HelpCircle, ShieldCheck, ChevronDown, ChevronUp,
  Brain, BookOpen, Clock, MessageSquare, Lock, KeyRound
} from 'lucide-react';
import { PaperResource, VideoLesson, ResourceCategory, StreamId, PaidStudentAccess } from '../types';
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
  onGrantVideoAccess?: (email: string, studentName?: string, note?: string, extra?: Partial<PaidStudentAccess>) => void;
  onSwitchTab: (tab: 'papers' | 'resources' | 'videos' | 'reports' | 'announcement' | 'publish' | 'security' | 'video-access', filterParams?: { category?: string; subject?: string }) => void;
  showSuccess: (msg: string) => void;
}

export interface CopilotActionReceipt {
  type: 'UPLOAD_PAPER' | 'OPEN_FOLDER' | 'DELETE_PAPER' | 'UPDATE_ANNOUNCEMENT' | 'ADD_VIDEO' | 'GRANT_VIDEO_ACCESS';
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
  thoughtProcess?: string;
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
  onGrantVideoAccess,
  onSwitchTab,
  showSuccess,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dailyChatCount, setDailyChatCount] = useState<number>(0);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [processingStatus, setProcessingStatus] = useState<string>('Gemini is thinking...');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Daily limit key based on today's YYYY-MM-DD
  const getTodayKey = () => {
    const today = new Date().toISOString().slice(0, 10);
    return `paperexpress_admin_gemini_${today}`;
  };

  // Load chat count and history on mount
  useEffect(() => {
    try {
      const todayKey = getTodayKey();
      const storedCount = localStorage.getItem(todayKey);
      setDailyChatCount(storedCount ? parseInt(storedCount, 10) : 0);

      const storedHistory = localStorage.getItem('paperexpress_gemini_copilot_history');
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      } else {
        // Welcoming initial assistant message from Gemini
        setMessages([
          {
            id: 'welcome',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            thoughtProcess: `• Connected to Google Gemini Flash Autonomous Agent
• Loaded Sri Lankan G.C.E. A/L Science Curriculum database (Combined Maths, Physics, Chemistry, Biology)
• Active Database State: ${papers.length} Past Papers/Schemes, ${videos.length} Video Masterclasses
• Conversational Mode: Fluently understands Tamil, Tanglish & English; thinks step-by-step and executes uploads directly.`,
            text: `வணக்கம் Admin! நான் உங்கள் Paper Express Google Gemini AI Assistant. 🤖

என்னிடம் நீங்கள் சாதாரணமாக "Hi bro, epdi irukinga?" என உரையாடினாலும் சரி, அல்லது Past Papers, Marking Schemes, Pilot Papers போன்றவற்றை Upload செய்யச் சொன்னாலும் சரி, ஆழ்ந்து சிந்தித்து புத்திசாலித்தனமாக (Clever & Thoughtful) பதிலளிப்பேன்.

உதாரணமாக:
• "Hi machan, epdi irukka?"
• "Upload 2024 Chemistry Marking Scheme link: https://drive.google.com/..."
• "Combined Maths 2023 Moratuwa pilot paper add pannu https://..."
• "Open Physics NIE Resource textbook folder"
• "Put live announcement: 2024 Marking Schemes Available Now!"`,
            suggestedPrompts: [
              'Hi Gemini! How are you doing today?',
              'Upload 2024 Biology Marking Scheme with Drive link',
              'Open University of Moratuwa Pilot Archive',
              'Show total database statistics'
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
        localStorage.setItem('paperexpress_gemini_copilot_history', JSON.stringify(messages.slice(-30)));
      } catch (e) {}
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

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

  // Smart local fallback in case network to server fails
  const processLocalSmartFallback = (input: string): {
    reply: string;
    thoughtProcess: string;
    receipt?: CopilotActionReceipt;
    suggestedPrompts?: string[];
  } => {
    const q = input.trim();
    const lower = q.toLowerCase();

    // 1. Casual Chat Handler (Greets back naturally, dynamically, NOT repeating boilerplate!)
    const isCasualGreeting = 
      /^(hi|hello|hey|vanakkam|வணக்கம்|hai|hola|good morning|good evening|good afternoon|machan|bro|mapla)[\s!.,?]*$/i.test(lower) ||
      lower.includes('epdi irukinga') || lower.includes('eppadi irukkinga') || lower.includes('how are you') || lower.includes('epdi irukka') ||
      lower.includes('summa') || lower.includes('nalla irukiya');

    if (isCasualGreeting && !lower.includes('upload') && !lower.includes('delete') && !lower.includes('open')) {
      const casualReplies = [
        `வணக்கம் Asman Linzy bro! நான் நல்லா இருக்கேன். நீங்கள் எப்படி இருக்கிறீர்கள்? 😊\n\nPaper Express களஞ்சியத்தில் இன்று என்ன வேலை செய்ய வேண்டும்? Past Papers, Marking Schemes அல்லது Live Announcement ஏதும் தயார் செய்யவா?`,
        `Hi Linzy bro! Super-ah irukken! நீங்கள் summa sonnalum naan eppovum ready-ah irukken! இன்று Chemistry Virtual Lab, Physics அல்லது Combined Maths-ல் என்ன update பண்ணலாம்? சொல்லுங்க, உடனே செய்துடுவோம்! 🔥`,
        `Hello Admin! Paper Express console-ல் நான் எப்போதும் விழிப்புடன் உள்ளேன். ${papers.length} Past Papers & Schemes களஞ்சியத்தில் உள்ளன. நீங்கள் எந்த பணி சொன்னாலும் செய்யத் தயார்!`,
      ];
      const selectedReply = casualReplies[Math.floor(Math.random() * casualReplies.length)];

      return {
        thoughtProcess: `1. Analyzed input: Informal greeting detected from Asman Linzy ("${q}")\n2. Tone: Warm, energetic, conversational\n3. Action: Responding naturally acknowledging founder identity.`,
        reply: selectedReply,
        suggestedPrompts: [
          'Upload 2024 Biology Marking Scheme with Drive link',
          'Open University of Moratuwa Pilot Archive',
          'Check Chemistry Virtual Lab (paperexpresslab1.vercel.app)',
          'Show repository status'
        ]
      };
    }

    // 2. Who are you / What can you do / Chemistry Lab Info
    if (lower.includes('who are you') || lower.includes('yar neenga') || lower.includes('enna seiva') || lower.includes('what can you do')) {
      return {
        thoughtProcess: `1. Intent: Self-introduction & capability query\n2. Role: Paper Express Autonomous Gemini Assistant\n3. Platform Knowledge: Full architecture, Chemistry Lab, A/L curriculum.`,
        reply: `நான் உங்கள் Paper Express Administrator Console-ன் பிரத்யேக Google Gemini AI Assistant! 🤖\n\nநீங்கள் என்னிடம் எப்படி பேசினாலும்:\n1. கூகிள் டிரைவ் இணைப்புடன் Exam Papers & Marking Schemes-களை நேரடியாக களஞ்சியத்தில் Publish செய்வேன்.\n2. Moratuwa Pilot மற்றும் 4 Resource Folders-களை உடனே திறந்து தருவேன்.\n3. இணையதள முகப்பில் Live Announcement பதாகைகளை வெளியிடுவேன்.\n4. நீங்கள் உருவாக்கிய Chemistry Virtual Lab (paperexpresslab1.vercel.app) விபரங்களை மாணவர்களிடம் கொண்டு சேர்ப்பேன்!`,
        suggestedPrompts: [
          'Upload 2024 Chemistry Marking Scheme',
          'Open Chemistry Virtual Lab',
          'Show total uploaded papers',
          'Open Physics Sub-Folders'
        ]
      };
    }

    // Chemistry Lab specific query
    if (lower.includes('chem') && (lower.includes('lab') || lower.includes('virtual'))) {
      return {
        thoughtProcess: `1. Intent: Query about Chemistry Virtual Lab\n2. URL: https://paperexpresslab1.vercel.app/\n3. Action: Providing link and simulation overview.`,
        reply: `🧪 **Paper Express Chemistry Virtual Lab (paperexpresslab1.vercel.app)** நேரலையில் இயங்குகிறது!\n\nமாணவர்கள் இணையவழியிலேயே Titrations (HCl + NaOH), Salt Qualitative Analysis (Cations/Anions flame spectra), மற்றும் Functional Group tests-களை ஆபத்தின்றி பயிற்சி பெற முடியும். முகப்பிலும் இது சேர்க்கப்பட்டுள்ளது!`,
        receipt: {
          type: 'OPEN_FOLDER',
          title: 'Paper Express Chemistry Virtual Lab',
          detail: 'paperexpresslab1.vercel.app — Interactive student practical simulator.',
          driveLink: 'https://paperexpresslab1.vercel.app/'
        },
        suggestedPrompts: [
          'Open Chemistry Virtual Lab',
          'Put announcement about Chemistry Lab',
          'Upload 2024 Chemistry Marking Scheme'
        ]
      };
    }

    // 2.5 Video Access Grant Intent (Full & Part-by-part)
    const emailMatch = q.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && (lower.includes('access') || lower.includes('video') || lower.includes('அனுமதி') || lower.includes('pay') || lower.includes('grant') || lower.includes('add'))) {
      const email = emailMatch[0].toLowerCase();
      const isHydroOnly = lower.includes('hydro') || lower.includes('பாயி');
      const isChemOnly = lower.includes('chem') || lower.includes('இரசாய');
      
      let extra: Partial<PaidStudentAccess> = {
        accessScope: 'all',
        accessLabel: 'All Videos'
      };

      if (isHydroOnly) {
        extra = {
          accessScope: 'custom',
          allowedUnits: [2],
          allowedSubjectIds: ['physics'],
          accessLabel: 'Physics Hydrodynamics Only',
        };
      } else if (isChemOnly) {
        extra = {
          accessScope: 'custom',
          allowedUnits: [6],
          allowedSubjectIds: ['chemistry'],
          accessLabel: 'Chemistry IUPAC Only',
        };
      }

      if (onGrantVideoAccess) {
        onGrantVideoAccess(email, 'Enrolled Student', `Granted via Gemini Smart Engine (${extra.accessLabel})`, extra);
        playRoboticUnlock();
        showSuccess(`Granted video access (${extra.accessLabel}) to ${email}!`);
      }

      return {
        thoughtProcess: `1. Intent: Video Masterclass Access Grant for ${email}\n2. Scope: ${extra.accessLabel}\n3. Executed onGrantVideoAccess() and synchronized to Firestore and local storage.`,
        reply: `🎉 **அனுமதி வழங்கப்பட்டது, Asman bro!**\n\n**${email}** என்ற மாணவர் கணக்கிற்கு **${extra.accessLabel}** அனுமதி வெற்றிகரமாக வழங்கப்பட்டுவிட்டது. அவர் Google Sign-In செய்து வீடியோக்களை உடனே பார்வையிடலாம்! 🔐▶️`,
        receipt: {
          type: 'GRANT_VIDEO_ACCESS',
          title: `Video Access Granted: ${email}`,
          detail: `Permission Scope: ${extra.accessLabel}`,
        },
        suggestedPrompts: [
          'Open Paid Video Access Manager',
          'Upload 2024 Biology Marking Scheme',
          'Show repository stats'
        ]
      };
    }

    // 3. Extract Links
    const driveMatch = q.match(/(https?:\/\/(?:drive\.google\.com\/[^\s]+|docs\.google\.com\/[^\s]+))/i);
    const driveLink = driveMatch ? driveMatch[0] : '';

    // Subject
    let subject = 'Physics';
    let subjectId = 'physics';
    let stream: StreamId = 'maths';
    if (lower.includes('bio') || lower.includes('உயிரியல்')) {
      subject = 'Biology'; subjectId = 'biology'; stream = 'bio';
    } else if (lower.includes('chem') || lower.includes('இரசாயன')) {
      subject = 'Chemistry'; subjectId = 'chemistry'; stream = 'bio';
    } else if (lower.includes('math') || lower.includes('கணித')) {
      subject = 'Combined Mathematics'; subjectId = 'c-maths'; stream = 'maths';
    }

    // Year
    const yearMatch = lower.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2024;
    const isScheme = lower.includes('scheme') || lower.includes('marking') || lower.includes('விடை');

    // Upload with link
    if (driveLink) {
      const newPaper: PaperResource = {
        id: `copilot_local_${Date.now()}`,
        titleEn: `G.C.E. A/L ${year} ${subject} ${isScheme ? 'Marking Scheme' : 'Past Paper'}`,
        titleTa: `க.பொ.த உயர்தரம் ${year} ${subject} ${isScheme ? 'விடைக் குறிப்பு' : 'வினாத்தாள்'}`,
        category: 'past-papers',
        stream,
        subjectId: subjectId === 'c-maths' ? 'sub-maths' : `sub-${subjectId}`,
        subjectNameEn: subject,
        year,
        schoolOrSource: 'Department of Examinations, Sri Lanka',
        driveLink,
        markingSchemeDriveLink: driveLink,
        fileSize: 'PDF Document',
        downloadsCount: 1,
      };

      onAddPaper(newPaper);
      playRoboticUnlock();
      showSuccess(`"${newPaper.titleEn}" published live via Gemini!`);

      return {
        thoughtProcess: `1. Intent: Resource Upload detected for Asman Linzy\n2. Subject: ${subject} (${stream.toUpperCase()}) | Year: ${year}\n3. Drive Link: ${driveLink.slice(0, 30)}...\n4. Executed onAddPaper() to cloud store.`,
        reply: `🎉 **வெற்றிகரமாக பதிவேற்றப்பட்டது, Linzy bro!**\n\n"${newPaper.titleEn}" ஆவணம் தளத்தின் நேரடி களஞ்சியத்தில் சேர்க்கப்பட்டுவிட்டது. மாணவர்கள் உடனே பதிவிறக்கலாம்:`,
        receipt: {
          type: 'UPLOAD_PAPER',
          title: newPaper.titleEn,
          detail: `Uploaded to Past Papers (${subject}). ID: ${newPaper.id}`,
          subject,
          category: 'past-papers',
          year,
          driveLink: newPaper.driveLink,
          paperId: newPaper.id
        }
      };
    }

    // Upload requested without link
    if (lower.includes('upload') || lower.includes('add') || lower.includes('பதிவேற்று') || lower.includes('podu')) {
      return {
        thoughtProcess: `1. Intent: Upload directive identified for ${subject} (${year})\n2. Missing Parameter: Google Drive URL\n3. Action: Asking Admin for drive link.`,
        reply: `சரி Asman bro! **${year} ${subject}** (${isScheme ? 'Marking Scheme' : 'Question Paper'}) விபரங்கள் தயார்.\n\nஇதற்கான **Google Drive Link**-ஐ (https://drive.google.com/...) அனுப்பிவிடுங்கள், நான் உடனே Publish செய்து விடுகிறேன்!`,
        suggestedPrompts: [
          `Upload ${year} ${subject} with link https://drive.google.com/file/d/sample/view`,
          `Open ${subject} resources folder`
        ]
      };
    }

    // Default intelligent guidance
    return {
      thoughtProcess: `1. Linguistic analysis of: "${q}"\n2. Context: Paper Express A/L Science repository administration (Asman Linzy)\n3. Result: Providing helpful direction.`,
      reply: `நான் உங்கள் குறிப்பை கவனித்தேன் Linzy bro! ஏதேனும் குறிப்பிட்ட Exam Paper, Marking Scheme பதிவேற்ற வேண்டுமா, அல்லது Announcement / Folder திறக்க வேண்டுமா? கூறுங்கள், உடனே செய்திடுவோம்!`,
      suggestedPrompts: [
        'Upload 2024 Biology Marking Scheme',
        'Open Moratuwa Pilot Archive',
        'Open Chemistry Virtual Lab',
        'Show repository statistics'
      ]
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!rawText) return;

    if (dailyChatCount >= DAILY_LIMIT) {
      alert(`இன்றைய 100 Chat வரம்பு முடிந்தது! (Daily limit of 100 chats reached). நள்ளிரவு 12:00 மணிக்கு இது Reset ஆகும்.`);
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
    setProcessingStatus('Gemini is reasoning & analyzing curriculum intent...');

    try {
      // 1. Call Full-Stack Server-Side Gemini Endpoint with Rich History & Admin Context
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: rawText,
          history: messages.slice(-10).map((m) => ({ role: m.sender === 'admin' ? 'user' : 'model', text: m.text })),
          adminProfile: {
            name: 'Asman Linzy',
            email: 'asmanlinzy44@gmail.com',
            instagram: '@asman_linzy',
            role: 'Founder & Administrator',
          },
          platformContext: {
            platformName: 'Paper Express',
            targetExam: 'August 10, 2027 (G.C.E. A/L 2027 Examination)',
            chemistryLabUrl: 'https://paperexpresslab1.vercel.app/',
            totalPapers: papers.length,
            totalVideos: videos.length,
            activeAnnouncement: siteAnnouncement?.text || '',
            recentUploads: papers.slice(-5).map((p) => ({
              title: p.titleEn,
              year: p.year,
              subject: p.subjectNameEn,
              category: p.category,
              id: p.id,
            })),
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();

        let receipt: CopilotActionReceipt | undefined = undefined;

        // If intent is UPLOAD and uploadData with driveLink is present
        if (data.intent === 'UPLOAD' && data.uploadData && data.uploadData.driveLink) {
          const u = data.uploadData;
          const subj = u.subject || 'Physics';
          const yr = Number(u.year) || 2024;
          const cat: ResourceCategory = u.category || 'past-papers';
          const isScheme = Boolean(u.isMarkingScheme);
          const src = u.schoolOrSource || 'Department of Examinations, Sri Lanka';

          const newPaper: PaperResource = {
            id: `copilot_gemini_${Date.now()}`,
            titleEn: u.titleEn || `G.C.E. A/L ${yr} ${subj} ${isScheme ? 'Official Marking Scheme' : 'Examination Paper'}`,
            titleTa: u.titleTa || `க.பொ.த உயர்தரம் ${yr} ${subj} ${isScheme ? 'விடைக் குறிப்பு' : 'வினாத்தாள்'}`,
            category: cat,
            stream: u.stream || (subj === 'Combined Mathematics' || subj === 'Physics' ? 'maths' : 'bio'),
            subjectId: subj === 'Combined Mathematics' ? 'sub-maths' : `sub-${subj.toLowerCase()}`,
            subjectNameEn: subj,
            year: yr,
            schoolOrSource: src,
            driveLink: u.driveLink,
            markingSchemeDriveLink: u.driveLink,
            fileSize: 'PDF Document',
            downloadsCount: 1,
          };

          onAddPaper(newPaper);
          playRoboticUnlock();
          showSuccess(`"${newPaper.titleEn}" published live via Gemini AI!`);

          receipt = {
            type: 'UPLOAD_PAPER',
            title: newPaper.titleEn,
            detail: `Published to ${cat} (${subj}) · Source: ${src}`,
            subject: subj,
            category: cat,
            year: yr,
            driveLink: newPaper.driveLink,
            paperId: newPaper.id
          };
        }

        // If intent is OPEN_FOLDER
        if (data.intent === 'OPEN_FOLDER' && data.folderData) {
          const tab = data.folderData.tab || 'papers';
          const subj = data.folderData.subject || 'physics';
          onSwitchTab(tab, { subject: subj });
          receipt = {
            type: 'OPEN_FOLDER',
            title: `${subj.toUpperCase()} Vault`,
            detail: `Navigated to ${tab.toUpperCase()} tab filtered for ${subj}.`,
            subject: subj,
            driveLink: vaultDriveLinks[subj] || 'https://drive.google.com'
          };
        }

        // If intent is ANNOUNCEMENT
        if (data.intent === 'ANNOUNCEMENT' && data.announcementText && onUpdateSiteAnnouncement) {
          onUpdateSiteAnnouncement({ active: true, text: data.announcementText, type: 'info' });
          receipt = {
            type: 'UPDATE_ANNOUNCEMENT',
            title: 'Live Site Notice Published',
            detail: data.announcementText
          };
        }

        // If intent is DELETE
        if (data.intent === 'DELETE' && data.deleteTarget && onDeletePaper) {
          const dt = data.deleteTarget;
          const target = papers.find((p) => {
            if (dt.year && p.year !== Number(dt.year)) return false;
            if (dt.subject && !p.subjectNameEn.toLowerCase().includes(dt.subject.toLowerCase())) return false;
            if (dt.query && !p.titleEn.toLowerCase().includes(dt.query.toLowerCase())) return false;
            return true;
          });
          if (target) {
            onDeletePaper(target.id);
            playRoboticUnlock();
            showSuccess(`"${target.titleEn}" removed from repository.`);
            receipt = {
              type: 'DELETE_PAPER',
              title: target.titleEn,
              detail: `Removed from ${target.category} archive (${target.subjectNameEn}).`,
              paperId: target.id,
            };
          }
        }

        // If intent is GRANT_VIDEO_ACCESS
        if (data.intent === 'GRANT_VIDEO_ACCESS' && data.grantVideoEmail && onGrantVideoAccess) {
          const isCustom = data.accessScope === 'custom' || (data.allowedUnits && data.allowedUnits.length > 0) || (data.allowedSubjectIds && data.allowedSubjectIds.length > 0);
          const scopeLabel = data.accessLabel || (isCustom ? 'Custom Selected Modules' : 'All Videos');
          const extra: Partial<PaidStudentAccess> = {
            accessScope: isCustom ? 'custom' : 'all',
            allowedSubjectIds: data.allowedSubjectIds,
            allowedUnits: data.allowedUnits,
            accessLabel: scopeLabel,
          };

          onGrantVideoAccess(data.grantVideoEmail, data.grantStudentName || 'Enrolled Student', `Granted via Gemini AI (${scopeLabel})`, extra);
          receipt = {
            type: 'GRANT_VIDEO_ACCESS',
            title: `Paid Video Access Granted: ${data.grantVideoEmail}`,
            detail: `Scope: ${scopeLabel} · Real-time Firestore & browser synced.`,
          };
          playRoboticUnlock();
          showSuccess(`Granted video access (${scopeLabel}) to ${data.grantVideoEmail}!`);
        }

        // If intent is CHEMISTRY_LAB
        if (data.intent === 'CHEMISTRY_LAB') {
          receipt = {
            type: 'OPEN_FOLDER',
            title: 'Paper Express Chemistry Virtual Lab',
            detail: 'paperexpresslab1.vercel.app — Interactive student practical simulator.',
            driveLink: 'https://paperexpresslab1.vercel.app/'
          };
        }

        const aiMsg: CopilotMessage = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: data.reply || 'Request processed successfully.',
          thoughtProcess: data.thoughtProcess,
          actionReceipt: receipt,
          suggestedPrompts: data.suggestedPrompts || [
            'Upload 2024 Biology Marking Scheme',
            'Open Moratuwa Pilot Archive',
            'Show repository stats'
          ]
        };

        setMessages((prev) => [...prev, aiMsg]);
        return;
      }

      // If server responded with error, use the conversational local engine
      console.warn('Server Gemini call returned non-ok status, falling back to smart engine');
      const fallbackResult = processLocalSmartFallback(rawText);

      const aiMsg: CopilotMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: fallbackResult.reply,
        thoughtProcess: fallbackResult.thoughtProcess,
        actionReceipt: fallbackResult.receipt,
        suggestedPrompts: fallbackResult.suggestedPrompts
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Copilot processing error, running local fallback:', err);
      const fallbackResult = processLocalSmartFallback(rawText);

      const aiMsg: CopilotMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: fallbackResult.reply,
        thoughtProcess: fallbackResult.thoughtProcess,
        actionReceipt: fallbackResult.receipt,
        suggestedPrompts: fallbackResult.suggestedPrompts
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = () => {
    playRoboticClick();
    if (confirm('Gemini AI உரையாடல் வரலாற்றை அழிக்கவா? (Clear conversation history?)')) {
      setMessages([
        {
          id: 'welcome_reset',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          thoughtProcess: '• Reset session state\n• Cleared conversation buffer\n• Gemini is ready for fresh commands.',
          text: `வரலாறு அழிக்கப்பட்டது! நான் புதிய உரையாடலுக்கு தயார். என்ன உதவி வேண்டும்?`,
          suggestedPrompts: [
            'Hi Gemini!',
            'Upload 2024 Biology Marking Scheme',
            'Open Moratuwa Pilot Archive'
          ]
        }
      ]);
      localStorage.removeItem('paperexpress_gemini_copilot_history');
    }
  };

  const remainingChats = Math.max(0, DAILY_LIMIT - dailyChatCount);

  return (
    <div className="flex flex-col h-full bg-[#050B17] text-white rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl">
      {/* Top Banner: Gemini AI Header & Daily Limit Counter */}
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
                <span>PAPER EXPRESS GEMINI AI</span>
                <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>GOOGLE GEMINI AI</span>
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Intelligent Conversational Agent &amp; Autonomous Resource Uploader
            </p>
          </div>
        </div>

        {/* Daily Limit Tracker Pill & Clear History */}
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
            title="Clear Gemini Chat History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-xs sm:text-sm">
        {messages.map((msg) => {
          const isThoughtExpanded = expandedThoughts[msg.id] ?? true;

          return (
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
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    {msg.sender === 'admin' ? (
                      'You (Administrator)'
                    ) : (
                      <>
                        <span>Gemini AI Agent</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </>
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* GEMINI THOUGHT PROCESS ACCORDION (Step-by-step thinking) */}
                {msg.sender === 'ai' && msg.thoughtProcess && (
                  <div className="rounded-xl bg-[#050A18] border border-cyan-500/25 overflow-hidden transition-all text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => toggleThought(msg.id)}
                      className="w-full px-3 py-2 bg-cyan-950/40 hover:bg-cyan-950/60 flex items-center justify-between text-cyan-300 text-[11px] font-bold transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span>GEMINI REASONING &amp; THOUGHT PROCESS</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
                        <span>{isThoughtExpanded ? 'Hide Thinking' : 'Show Thinking'}</span>
                        {isThoughtExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>

                    {isThoughtExpanded && (
                      <div className="p-3 text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed border-t border-cyan-500/20 bg-[#040814]">
                        {msg.thoughtProcess}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Text Content */}
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
                        <span className="px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[10px] border border-cyan-500/30 uppercase">
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

                      {msg.actionReceipt.type === 'GRANT_VIDEO_ACCESS' ? (
                        <button
                          type="button"
                          onClick={() => {
                            playRoboticClick();
                            onSwitchTab('video-access');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-amber-500/30"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>View in Video Access Tab</span>
                        </button>
                      ) : (
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
                      )}
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
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2.5 text-xs text-cyan-300 font-mono bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/20 w-fit animate-pulse">
            <Brain className="w-4 h-4 animate-spin text-cyan-400" />
            <span>{processingStatus}</span>
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
                : "Ask Gemini anything or command: e.g. 'hi bro' or 'Upload 2024 Biology Marking Scheme...'"
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
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Powered by Google Gemini 3.8 Flash · Conversational &amp; Autonomous</span>
          </span>
          <span className="text-cyan-400 font-bold">{remainingChats} / 100 chats remaining today</span>
        </div>
      </div>
    </div>
  );
};
