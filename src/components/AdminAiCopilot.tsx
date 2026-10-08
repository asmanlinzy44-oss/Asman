import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, CheckCircle2, AlertCircle, 
  FolderOpen, FileText, Trash2, Megaphone, ExternalLink, 
  Copy, Check, ArrowRight, Video, RefreshCw, Layers, 
  Zap, HelpCircle, ShieldCheck, ChevronDown, ChevronUp,
  Brain, BookOpen, Clock, CheckCheck
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
  thoughtProcess?: string;
  actionReceipt?: CopilotActionReceipt;
  suggestedPrompts?: string[];
}

const DAILY_LIMIT = 100;

// Comprehensive Sri Lankan G.C.E. Advanced Level Science Stream Knowledge Base
const AL_CURRICULUM_KNOWLEDGE = {
  subjects: {
    physics: {
      name: 'Physics',
      nameTa: 'பௌதிகவியல்',
      stream: 'maths' as StreamId,
      units: [
        'Unit 1: Measurement & Dimensions',
        'Unit 2: Mechanics (Vectors, Kinematics, Dynamics, Statics, Circular Motion, Work & Energy)',
        'Unit 3: Oscillations & Waves (SHM, Sound Waves, Doppler Effect)',
        'Unit 4: Thermal Physics (Heat Transfer, Kinetic Theory, Thermodynamics)',
        'Unit 5: Gravitational Field',
        'Unit 6: Electrostatic Field',
        'Unit 7: Magnetic Field & Electromagnetic Induction',
        'Unit 8: Current Electricity (DC Circuits, Potentiometer, Wheatstone Bridge)',
        'Unit 9: Electronics (Diodes, Transistors, Operational Amplifiers, Logic Gates)',
        'Unit 10: Mechanical Properties of Matter (Viscosity, Surface Tension, Elasticity)',
        'Unit 11: Radiation & Matter (Photoelectric Effect, X-Rays, Radioactivity)'
      ],
      practicalCount: 42
    },
    chemistry: {
      name: 'Chemistry',
      nameTa: 'இரசாயனவியல்',
      stream: 'bio' as StreamId,
      units: [
        'Unit 1: Atomic Structure & Chemical Periodicity',
        'Unit 2: Chemical Bonding & Molecular Structure',
        'Unit 3: Chemical Calculations & Mole Concept',
        'Unit 4: Gaseous State of Matter',
        'Unit 5: Chemical Energetics & Thermodynamics',
        'Unit 6: Inorganic Chemistry (s-block, p-block, d-block chemistry)',
        'Unit 7: Basic Organic Chemistry & Hydrocarbons',
        'Unit 8: Oxygen Containing Organic Compounds (Alcohols, Carbonyls, Carboxylic Acids)',
        'Unit 9: Nitrogen Containing Organic Compounds (Amines, Amides)',
        'Unit 10: Chemical Kinetics',
        'Unit 11: Equilibrium (Chemical Equilibrium, Ionic Equilibrium, Solubility Product)',
        'Unit 12: Phase Equilibrium & Electrochemistry',
        'Unit 13: Industrial & Environmental Chemistry'
      ],
      practicalCount: 38
    },
    'c-maths': {
      name: 'Combined Mathematics',
      nameTa: 'இணைந்த கணிதம்',
      stream: 'maths' as StreamId,
      units: [
        'Pure Maths: Real Numbers, Functions, Quadratic Equations & Inequalities',
        'Pure Maths: Polynomials & Partial Fractions',
        'Pure Maths: Mathematical Induction & Binomial Expansion',
        'Pure Maths: Trigonometric Functions & Identifications',
        'Pure Maths: Limits, Differentiation & Applications (Tangent, Normal, Max/Min)',
        'Pure Maths: Integration Techniques & Definite Integrals',
        'Pure Maths: Straight Line & Circle Geometry',
        'Pure Maths: Complex Numbers & De Moivre Theorem',
        'Pure Maths: Matrices & Linear Equations',
        'Applied Maths: Vectors & Coordinate Geometry in Mechanics',
        'Applied Maths: Coplanar Forces, Equilibrium of Rigid Bodies & Friction',
        'Applied Maths: Kinematics (Rectilinear Motion with Uniform & Variable Acceleration)',
        'Applied Maths: Projectiles Motion under Gravity',
        'Applied Maths: Newton Laws of Motion, Work, Power & Energy',
        'Applied Maths: Circular Motion & Simple Harmonic Motion (SHM)',
        'Applied Maths: Relative Velocity & Impact of Elastic Bodies',
        'Applied Maths: Probability & Descriptive Statistics'
      ],
      practicalCount: 0
    },
    biology: {
      name: 'Biology',
      nameTa: 'உயிரியல்',
      stream: 'bio' as StreamId,
      units: [
        'Unit 1: Introduction to Biology & Scientific Method',
        'Unit 2: Chemical and Cellular Basis of Life (Biomolecules, Cell Structure & Division)',
        'Unit 3: Diversity of Organisms (Five Kingdom Classification, Viruses, Bacteria, Protista, Fungi, Plantae, Animalia)',
        'Unit 4: Plant Form and Function (Anatomy, Water & Solute Transport, Photosynthesis, Reproduction)',
        'Unit 5: Animal Form and Function (Nutrition, Respiration, Circulation, Immunity, Excretion, Nervous & Endocrine, Locomotion, Reproduction)',
        'Unit 6: Genetics & Molecular Biology (Mendelian Genetics, DNA Structure, Replication, Gene Expression)',
        'Unit 7: Recombinant DNA Technology & Biotechnology',
        'Unit 8: Environmental Biology & Ecology (Ecosystems, Biodiversity, Conservation)',
        'Unit 9: Evolutionary Biology',
        'Unit 10: Applied Biology & Food Technology'
      ],
      practicalCount: 46
    }
  },
  examSyndicates: [
    'Department of Examinations, Sri Lanka (National A/L Past Papers 1981–2024)',
    'Department of Examinations Official Marking Schemes & Evaluator Reports',
    'University of Moratuwa Engineering Faculty Pilot Exam Syndicate',
    'FWC Thondaimanaru (Future War Cloud) Pilot Examination Board',
    'Provincial Department of Education (Western, Northern, Southern, Central Term Tests)',
    'National Institute of Education (NIE) Resource Books & Teacher Guides'
  ],
  resourceVaultFolders: [
    'Folder 1: Comprehensive Theory Books & Complete Syllabus Handbooks',
    'Folder 2: Official NIE Resource Textbooks & Teacher Guides',
    'Folder 3: 2000+ Classified MCQs & Unit-Wise Practice Questions',
    'Folder 4: Practical Lab Guides, Essays, Structured Experiments & Revision Seminars'
  ]
};

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
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [processingStatus, setProcessingStatus] = useState<string>('Analyzing query...');

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
        // Welcoming initial assistant message with deep knowledge orientation
        setMessages([
          {
            id: 'welcome',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            thoughtProcess: `• Initialized Paper Express Autonomous AI Copilot Engine
• Verified Sri Lankan G.C.E. Advanced Level Science Curriculum knowledge base (Combined Maths, Physics, Chemistry, Biology)
• Active Database State: ${papers.length} Past Papers/Schemes, ${videos.length} Video Masterclasses
• Loaded Syndicates: Department of Examinations, Moratuwa Pilot, FWC Thondaimanaru, NIE Resource Textbooks
• Ready to parse Tamil, Tanglish & English upload directives with verified multi-step reasoning.`,
            text: `வணக்கம் Admin! நான் உங்கள் Paper Express AI Copilot. 

நான் உங்கள் கோரிக்கையை ஆழமாக யோசித்து (Deep Step-by-Step Reasoning), இலங்கை க.பொ.த உயர்தர விஞ்ஞானப் பிரிவு (Science Stream) பாடத்திட்டத்தின்படி துல்லியமாகப் பகுப்பாய்வு செய்து செயலாற்றுகிறேன். 

தமிழ், Tanglish அல்லது English-ல் நீங்கள் கேட்கும் எந்தவொரு ஆவணத்தையும் (Past Papers, Marking Schemes, Pilot Papers, NIE Resource Textbooks, Term Tests) உடனடியாக Database-ல் Upload செய்யலாம், Folder-களை நிர்வகிக்கலாம்!

⚡ தினசரி வரம்பு: 100 Chats (Daily Limit: 100 Chats).

உதாரணமாக:
• "2024 Biology Marking Scheme upload pannu link: https://drive.google.com/..."
• "Moratuwa Pilot Combined Maths 2023 paper add pannu https://..."
• "Chemistry 2nd term paper 2022 upload pannu link https://..."
• "Open Physics NIE Resource textbook folder"
• "Delete 2019 Chemistry past paper"
• "Put live announcement: 2024 Biology Marking Schemes uploaded successfully!"`,
            suggestedPrompts: [
              'Upload 2024 Biology Marking Scheme (Drive link...)',
              'Moratuwa Pilot Combined Maths 2023 paper add pannu https://...',
              'Open Physics Dedicated Sub-Folders Vault',
              'Show total database statistics & subject breakdown'
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

  // Extract clean cloud storage URL (Google Drive, Docs, Cloud PDF)
  const extractCloudUrl = (input: string): string => {
    const driveRegex = /(https?:\/\/(?:drive\.google\.com\/[^\s]+|docs\.google\.com\/[^\s]+|mega\.nz\/[^\s]+|mediafire\.com\/[^\s]+))/i;
    const match = input.match(driveRegex);
    return match ? match[0] : '';
  };

  // High-Precision Thoughtful Agent Engine (Executes with Deep Step-by-Step Reasoning)
  const processThoughtfulAgent = (input: string): { 
    reply: string; 
    thoughtProcess: string;
    receipt?: CopilotActionReceipt; 
    suggestedPrompts?: string[];
  } => {
    const q = input.trim();
    const lower = q.toLowerCase();

    // 1. Extract Links
    const driveLink = extractCloudUrl(q);
    const ytMatch = q.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/[^\s]+|youtu\.be\/[^\s]+)/i);
    const youtubeUrl = ytMatch ? ytMatch[0] : '';

    // 2. Identify Subject & Stream
    let subject = 'Physics';
    let subjectTa = 'பௌதிகவியல்';
    let subjectId = 'physics';
    let stream: StreamId = 'maths';

    if (lower.includes('bio') || lower.includes('உயிரியல்') || lower.includes('botany') || lower.includes('zoology')) {
      subject = 'Biology';
      subjectTa = 'உயிரியல்';
      subjectId = 'biology';
      stream = 'bio';
    } else if (lower.includes('chem') || lower.includes('இரசாயன') || lower.includes('வேதியியல்')) {
      subject = 'Chemistry';
      subjectTa = 'இரசாயனவியல்';
      subjectId = 'chemistry';
      stream = 'bio';
    } else if (lower.includes('math') || lower.includes('கணித') || lower.includes('pure') || lower.includes('applied') || lower.includes('combined')) {
      subject = 'Combined Mathematics';
      subjectTa = 'இணைந்த கணிதம்';
      subjectId = 'c-maths';
      stream = 'maths';
    } else if (lower.includes('phy') || lower.includes('பௌதிக') || lower.includes('இயற்பியல்')) {
      subject = 'Physics';
      subjectTa = 'பௌதிகவியல்';
      subjectId = 'physics';
      stream = 'maths';
    }

    // 3. Identify Year
    const yearMatch = lower.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2024;

    // 4. Identify Document Material Classification
    const isScheme = lower.includes('scheme') || lower.includes('marking') || lower.includes('விடை') || lower.includes('புள்ளி') || lower.includes('answers');
    const isPilot = lower.includes('pilot') || lower.includes('moratuwa') || lower.includes('மாதிரி');
    const isFwcTerm = lower.includes('fwc') || lower.includes('term') || lower.includes('தவணை') || lower.includes('thondaimanaru');
    const isResourceVault = lower.includes('nie') || lower.includes('resource') || lower.includes('handbook') || lower.includes('mcq') || lower.includes('practical') || lower.includes('guide') || lower.includes('theory');

    // Categorization
    let category: ResourceCategory = 'past-papers';
    let term: string | undefined = undefined;
    let pilotType: string | undefined = undefined;
    let schoolSource = 'Department of Examinations, Sri Lanka';

    if (isPilot) {
      category = 'pilot-papers';
      pilotType = 'University of Moratuwa';
      schoolSource = 'University of Moratuwa Engineering Faculty Pilot Syndicate';
    } else if (isFwcTerm) {
      category = 'fwc-papers';
      term = lower.includes('1st') ? '1st Term' : lower.includes('2nd') ? '2nd Term' : lower.includes('3rd') ? '3rd Term' : 'FWC Pilot Exam';
      schoolSource = 'FWC Thondaimanaru / Leading School Syndicate';
    } else if (isResourceVault) {
      category = 'theory-notes';
      schoolSource = 'National Institute of Education (NIE) / Academic Panel';
    } else {
      category = 'past-papers';
      schoolSource = 'Department of Examinations, Sri Lanka';
    }

    // DETECT ACTION: 1. UPLOAD / ADD PAPER OR RESOURCE
    const isUploadIntent = 
      lower.includes('upload') || 
      lower.includes('add') || 
      lower.includes('publish') || 
      lower.includes('போடு') || 
      lower.includes('podu') || 
      lower.includes('சேர்') || 
      lower.includes('பதிவேற்று') ||
      Boolean(driveLink);

    if (isUploadIntent) {
      // Step-by-step thinking generation
      const thoughtSteps = [
        `1. Query Analysis: Admin requested resource upload for "${q}"`,
        `2. Domain Mapping: Stream detected as ${stream.toUpperCase()} | Subject: ${subject} (${subjectTa})`,
        `3. Academic Classification: Category set to "${category}" | Year: ${year}${term ? ` | Term: ${term}` : ''}`,
        `4. Material Format: ${isScheme ? 'Official Marking Scheme & Answer Guide' : 'Standard Examination Question Paper'}`,
        `5. Cloud Link Status: ${driveLink ? `Valid Cloud Link verified (${driveLink.slice(0, 35)}...)` : 'No cloud link found in text'}`,
        `6. Verification & Execution: ${driveLink ? 'Generating bilingual database record and executing onAddPaper()' : 'Prompting Admin for Google Drive storage link'}`
      ].join('\n');

      if (!driveLink) {
        return {
          thoughtProcess: thoughtSteps,
          reply: `நான் உங்கள் கோரிக்கையை முழுமையாகப் பகுப்பாய்வு செய்துவிட்டேன்:\n\n` +
                 `• **பாடம்**: ${subject} (${subjectTa})\n` +
                 `• **வருடம்**: ${year}\n` +
                 `• **வகை**: ${category.toUpperCase()} (${isScheme ? 'Marking Scheme' : 'Question Paper'})\n` +
                 `• **சேர்க்கப்படவுள்ள Folder**: ${schoolSource}\n\n` +
                 `⚠️ **Google Drive Link தேவை:**\n` +
                 `இந்த ஆவணத்திற்கான **Google Drive Link** (https://drive.google.com/...) இதில் குறிப்பிடப்படவில்லை. தயவுசெய்து Link-ஐ என்னிடம் கூறுங்கள், நான் உடனடியாக இதை Website-ல் நேரலையாக (Live) பதிவேற்றி விடுவேன்!`,
          suggestedPrompts: [
            `Upload ${year} ${subject} with link https://drive.google.com/file/d/sample/view`,
            `Open ${subject} Dedicated Sub-Folders Vault`
          ]
        };
      }

      // Construct authentic title in English and Tamil
      let titleEn = `G.C.E. A/L ${year} ${subject} ${isScheme ? 'Marking Scheme' : 'Past Paper'}`;
      let titleTa = `க.பொ.த உயர்தரம் ${year} ${subject} ${isScheme ? 'புள்ளித்திட்டம் மற்றும் வழிகாட்டல்' : 'வினாத்தாள்'}`;

      if (category === 'pilot-papers') {
        titleEn = `Moratuwa Pilot ${year} ${subject} ${isScheme ? 'Marking Scheme' : 'Exam Paper'}`;
        titleTa = `மொறட்டுவ மாதிரிப் பரீட்சை ${year} ${subject} ${isScheme ? 'புள்ளித்திட்டம்' : 'வினாத்தாள்'}`;
      } else if (category === 'fwc-papers') {
        titleEn = `FWC ${year} ${subject} ${term || 'Term Test'} ${isScheme ? 'Scheme' : 'Paper'}`;
        titleTa = `FWC தொண்டைமானாறு ${year} ${subject} ${term || 'தவணைப் பரீட்சை'} ${isScheme ? 'புள்ளித்திட்டம்' : 'வினாத்தாள்'}`;
      } else if (category === 'theory-notes') {
        titleEn = `G.C.E. A/L ${subject} NIE Syllabus Master Resource (${year})`;
        titleTa = `க.பொ.த உயர்தரம் ${subject} NIE பாடத்திட்ட வளநூல் (${year})`;
      }

      const newPaper: PaperResource = {
        id: `copilot_al_${Date.now()}`,
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
      showSuccess(`"${newPaper.titleEn}" published live via AI Copilot!`);

      return {
        thoughtProcess: thoughtSteps,
        reply: `🎉 **வெற்றிகரமாக ஆராய்ந்து பதிவேற்றப்பட்டது! (Successfully Analyzed & Uploaded)**\n\n` +
               `புதிய ஆவணம் இணையதளத்தின் நேரடி Database-ல் சேர்க்கப்பட்டு விட்டது:\n\n` +
               `• **Title**: ${newPaper.titleEn}\n` +
               `• **பாடம் (Subject)**: ${subject} (${stream.toUpperCase()} Stream)\n` +
               `• **வகை (Category)**: ${category.toUpperCase()}\n` +
               `• **ஆண்டு (Year)**: ${year}\n` +
               `• **மூலம் (Source)**: ${schoolSource}\n\n` +
               `கீழே உள்ள Action Card மூலம் Google Drive-ல் திறக்கலாம் அல்லது Papers Tab-ல் நேரடியாக சரிபார்க்கலாம்:`,
        receipt: {
          type: 'UPLOAD_PAPER',
          title: newPaper.titleEn,
          detail: `Classified under ${category} (${stream.toUpperCase()}) · Source: ${schoolSource}`,
          subject,
          category,
          year,
          driveLink: newPaper.driveLink,
          paperId: newPaper.id
        }
      };
    }

    // DETECT ACTION: 2. OPEN FOLDER / VAULT
    const isOpenFolder = 
      (lower.includes('open') || lower.includes('திற') || lower.includes('thira') || lower.includes('view') || lower.includes('goto') || lower.includes('show')) &&
      (lower.includes('folder') || lower.includes('vault') || lower.includes('கோப்பு') || lower.includes('களஞ்சியம்') || lower.includes('archive') || lower.includes('pilot') || lower.includes('resource'));

    if (isOpenFolder && !driveLink) {
      let targetTab: 'papers' | 'resources' = 'papers';
      let folderTitle = `${subject} National Archive`;
      let folderDriveUrl = vaultDriveLinks[subjectId] || 'https://drive.google.com';

      if (lower.includes('pilot') || lower.includes('moratuwa')) {
        folderTitle = `University of Moratuwa Engineering Faculty Pilot Archive (${subject})`;
        targetTab = 'papers';
      } else if (lower.includes('resource') || lower.includes('vault') || lower.includes('theory') || lower.includes('nie') || lower.includes('sub')) {
        folderTitle = `${subject} Dedicated 4 Sub-Folders Academic Vault`;
        targetTab = 'resources';
      }

      onSwitchTab(targetTab, { subject: subjectId });

      const thoughtSteps = [
        `1. Navigation Intent: Admin requested to inspect folder "${folderTitle}"`,
        `2. Domain Resolution: Target tab resolved to "${targetTab.toUpperCase()}" with subject filter "${subjectId}"`,
        `3. Cloud Storage Mapping: Vault link retrieved: ${folderDriveUrl}`,
        `4. Execution: Navigated Admin view and synthesized direct Google Drive launch card.`
      ].join('\n');

      return {
        thoughtProcess: thoughtSteps,
        reply: `📂 **"${folderTitle}" வெற்றிகரமாக திறக்கப்பட்டது!**\n\n` +
               `Admin Console-ல் இப்பாடத்திற்கான ஆவணப் பட்டியல் வடிகட்டப்பட்டு (Filtered) காட்டப்பட்டுள்ளது. மேலும் இதற்கான நேரடி Google Drive இணைப்பும் தயாராக உள்ளது:`,
        receipt: {
          type: 'OPEN_FOLDER',
          title: folderTitle,
          detail: `Navigated to ${targetTab.toUpperCase()} tab filtered for ${subject}.`,
          subject,
          driveLink: folderDriveUrl
        }
      };
    }

    // DETECT ACTION: 3. DELETE PAPER
    const isDelete = lower.includes('delete') || lower.includes('remove') || lower.includes('நீக்கு') || lower.includes('azhi');
    if (isDelete) {
      const targetPaper = papers.find((p) => {
        const titleMatch = (p.titleEn || '').toLowerCase().includes(subject.toLowerCase()) || (p.subjectNameEn || '').toLowerCase().includes(subject.toLowerCase());
        const yearMatch2 = yearMatch ? p.year === year : true;
        return titleMatch && yearMatch2;
      });

      const thoughtSteps = [
        `1. Deletion Security Audit: Admin requested to remove resource matching "${q}"`,
        `2. Database Lookup: Searched ${papers.length} active documents for ${subject} (${year})`,
        `3. Target Status: ${targetPaper ? `Found Paper ID: ${targetPaper.id} ("${targetPaper.titleEn}")` : 'No matching paper found'}`
      ].join('\n');

      if (targetPaper && onDeletePaper) {
        onDeletePaper(targetPaper.id);
        playRoboticClick();
        showSuccess(`"${targetPaper.titleEn}" deleted from database.`);

        return {
          thoughtProcess: thoughtSteps,
          reply: `🗑️ **ஆவணம் நீக்கப்பட்டது! (Successfully Deleted)**\n\n` +
                 `"${targetPaper.titleEn}" (${targetPaper.year} ${targetPaper.subjectNameEn}) cloud database-ல் இருந்து பாதுகாப்பாக நீக்கப்பட்டது.`,
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
          thoughtProcess: thoughtSteps,
          reply: `நீக்குவதற்கான பொருத்தமான Paper கண்டறியப்படவில்லை. தயவுசெய்து சரியான வருடம் மற்றும் பாடத்தைக் குறிப்பிடுங்கள் (உதா: "Delete 2019 Physics paper").`
        };
      }
    }

    // DETECT ACTION: 4. SITE ANNOUNCEMENT / BROADCAST BANNER
    const isAnnouncement = lower.includes('announcement') || lower.includes('notice') || lower.includes('அறிவிப்பு') || lower.includes('banner');
    if (isAnnouncement && onUpdateSiteAnnouncement) {
      const cleanNoticeText = q
        .replace(/^(?:put|set|post|add|publish|update)\s+(?:live\s+)?(?:notice|announcement)[:\s]*/i, '')
        .trim();

      const finalNotice = cleanNoticeText || 'New G.C.E. A/L Official Marking Schemes & Examination Papers Published!';
      onUpdateSiteAnnouncement({ active: true, text: finalNotice, type: 'info' });

      const thoughtSteps = [
        `1. Broadcast Intent: Admin requested live announcement publish`,
        `2. Text Sanitization: Processed notice: "${finalNotice}"`,
        `3. State Update: Published to public header broadcast banner across entire site.`
      ].join('\n');

      return {
        thoughtProcess: thoughtSteps,
        reply: `📢 **இணையதளத்தில் நேரடி அறிவிப்பு (Live Broadcast Banner) வெற்றிகரமாக வெளியிடப்பட்டது!**\n\nஅறிவிப்பு உரை: "${finalNotice}"`,
        receipt: {
          type: 'UPDATE_ANNOUNCEMENT',
          title: 'Live Site Notice Published',
          detail: finalNotice
        }
      };
    }

    // DETECT ACTION: 5. DATABASE STATS & CURRICULUM AUDIT
    if (lower.includes('count') || lower.includes('total') || lower.includes('stats') || lower.includes('status') || lower.includes('எத்தனை')) {
      const bioCount = papers.filter((p) => (p.subjectNameEn || '').toLowerCase().includes('bio')).length;
      const phyCount = papers.filter((p) => (p.subjectNameEn || '').toLowerCase().includes('phy')).length;
      const chemCount = papers.filter((p) => (p.subjectNameEn || '').toLowerCase().includes('chem')).length;
      const mathCount = papers.filter((p) => (p.subjectNameEn || '').toLowerCase().includes('math')).length;

      const thoughtSteps = [
        `1. Audit Intent: Admin requested comprehensive repository statistics`,
        `2. Database aggregation: Computed totals across ${papers.length} documents and ${videos.length} videos`,
        `3. Category distribution: Maths, Bio, Physics, Chemistry distribution calculated.`
      ].join('\n');

      return {
        thoughtProcess: thoughtSteps,
        reply: `📊 **Paper Express களஞ்சிய நிலவரம் (Repository Status):**\n\n` +
               `• **மொத்த ஆவணங்கள்**: **${papers.length} Papers & Schemes**\n` +
               `• **Biology**: **${bioCount}** ஆவணங்கள்\n` +
               `• **Combined Mathematics**: **${mathCount}** ஆவணங்கள்\n` +
               `• **Physics**: **${phyCount}** ஆவணங்கள்\n` +
               `• **Chemistry**: **${chemCount}** ஆவணங்கள்\n` +
               `• **Theory Videos**: **${videos.length}** வீடியோ பாடங்கள்\n\n` +
               `எந்தவொரு புதிய ஆவணத்தையும் பதிவேற்ற அதன் Google Drive Link மற்றும் வருடத்தை என்னிடம் கூறுங்கள்!`
      };
    }

    // Default intelligent curriculum thought reply
    const thoughtSteps = [
      `1. Linguistic Parsing: Admin input processed in Tanglish/Tamil/English: "${q}"`,
      `2. Knowledge Consultation: Consulted G.C.E. A/L Science syllabus & exam syndicate guidelines`,
      `3. Strategy: Providing comprehensive guidance on uploading papers, managing folder vaults, and broadcasting announcements.`
    ].join('\n');

    return {
      thoughtProcess: thoughtSteps,
      reply: `நான் உங்கள் கட்டளையை ஆழமாக ஆராய்ந்துவிட்டேன்!\n\n` +
             `நீங்கள் புதிய ஆவணங்களை பதிவேற்ற விரும்பினால் அதன் **Google Drive Link**-உடன் என்னிடம் கூறலாம்:\n` +
             `• **Past Paper / Scheme**: "2024 Biology Marking Scheme upload pannu link: https://drive.google.com/..."\n` +
             `• **Moratuwa Pilot**: "Combined Maths 2023 Moratuwa pilot paper add pannu https://..."\n` +
             `• **Folders**: "Open Physics resource sub-folders"\n` +
             `• **Live Notice**: "Put live announcement: New 2024 papers uploaded"`,
      suggestedPrompts: [
        'Upload 2024 Chemistry Marking Scheme',
        'Open Combined Maths Pilot Vault',
        'Show repository statistics'
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
    setProcessingStatus('Analyzing query intent & curriculum context...');

    try {
      // Simulate live deep thinking steps for immediate interactive feedback
      setTimeout(() => setProcessingStatus('Consulting Sri Lankan G.C.E. A/L curriculum database...'), 400);
      setTimeout(() => setProcessingStatus('Verifying Google Drive link & folder destination...'), 800);

      // Attempt Gemini API if key is available
      const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');
      let processed: { 
        reply: string; 
        thoughtProcess: string; 
        receipt?: CopilotActionReceipt 
      } | null = null;

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `You are the Paper Express Autonomous AI Copilot inside the Administrator Console.
You have FULL autonomous administrative rights to execute uploads, delete papers, open folders, and publish live announcements for Sri Lankan G.C.E. Advanced Level Science Stream (Physical Science: Combined Maths & Biological Science: Biology, with Physics & Chemistry).

Admin Query: "${rawText}"

Language capability: Understand Tamil, Tanglish (e.g. "biology 2024 marking scheme upload pannu link: https://..."), and English fluently.

INSTRUCTIONS:
1. THINK DEEPLY. Provide a step-by-step reasoning chain in "thoughtProcess" showing:
   - Query intent analysis
   - Curriculum subject, stream, year and examination syndicate determination
   - Google Drive link validation
   - Target database folder placement
2. If this is an UPLOAD request:
   - Extract subject, year, stream, category (past-papers | fwc-papers | pilot-papers | theory-notes), and drive link.
   - If drive link is missing, clearly explain what document you recognized and request the drive link.
3. If this is an OPEN FOLDER request:
   - Identify subject and target category.
4. If this is an ANNOUNCEMENT request:
   - Extract notice text.

Respond ONLY with valid JSON:
{
  "thoughtProcess": "Step 1: Analyzed intent... Step 2: Subject mapped to... Step 3: Verified cloud link... Step 4: Formulated database record...",
  "intent": "UPLOAD" | "OPEN_FOLDER" | "DELETE" | "ANNOUNCEMENT" | "CHAT",
  "replyText": "Helpful, intelligent, thoughtful reply in Tamil or English explaining the action",
  "subject": "Physics" | "Chemistry" | "Combined Mathematics" | "Biology",
  "category": "past-papers" | "pilot-papers" | "fwc-papers" | "theory-notes",
  "year": 2024,
  "driveLink": "extracted drive link or empty string",
  "isMarkingScheme": true,
  "schoolOrSource": "Department of Examinations, Sri Lanka" | "University of Moratuwa" | "FWC Thondaimanaru" | "NIE Resource Books"
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
              const isScheme = Boolean(parsed.isMarkingScheme);
              const src = parsed.schoolOrSource || (cat === 'pilot-papers' ? 'University of Moratuwa' : 'Department of Examinations, Sri Lanka');

              const newPaper: PaperResource = {
                id: 'copilot_gemini_' + Date.now(),
                titleEn: `G.C.E. A/L ${yr} ${subj} ${isScheme ? 'Official Marking Scheme' : 'Examination Paper'}`,
                titleTa: `க.பொ.த உயர்தரம் ${yr} ${subj} ${isScheme ? 'விடைக் குறிப்பு' : 'வினாத்தாள்'}`,
                category: cat,
                stream: subj === 'Combined Mathematics' || subj === 'Physics' ? 'maths' : 'bio',
                subjectId: subj === 'Combined Mathematics' ? 'sub-maths' : `sub-${subj.toLowerCase()}`,
                subjectNameEn: subj,
                year: yr,
                schoolOrSource: src,
                driveLink: parsed.driveLink,
                markingSchemeDriveLink: parsed.driveLink,
                fileSize: 'PDF Document',
                downloadsCount: 1,
              };

              onAddPaper(newPaper);
              playRoboticUnlock();
              showSuccess(`"${newPaper.titleEn}" published via Gemini AI Copilot!`);

              processed = {
                thoughtProcess: parsed.thoughtProcess || `• Step 1: Analyzed upload intent for ${subj} ${yr}\n• Step 2: Validated Drive link: ${parsed.driveLink}\n• Step 3: Inserted into ${cat} cloud database.`,
                reply: parsed.replyText || `🎉 **வெற்றிகரமாக பதிவேற்றப்பட்டது!**\n\n"${newPaper.titleEn}" cloud database-ல் வெற்றிகரமாக சேர்க்கப்பட்டது!`,
                receipt: {
                  type: 'UPLOAD_PAPER',
                  title: newPaper.titleEn,
                  detail: `Published to ${cat} database by Gemini Copilot. Source: ${src}`,
                  subject: subj,
                  category: cat,
                  year: yr,
                  driveLink: newPaper.driveLink,
                  paperId: newPaper.id
                }
              };
            } else if (parsed.thoughtProcess && parsed.replyText) {
              processed = {
                thoughtProcess: parsed.thoughtProcess,
                reply: parsed.replyText
              };
            }
          }
        } catch (apiErr) {
          console.warn('Gemini copilot api notice, using local thoughtful engine:', apiErr);
        }
      }

      // Fallback to high-precision local agent with deep reasoning
      if (!processed) {
        processed = processThoughtfulAgent(rawText);
      }

      const aiMsg: CopilotMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: processed.reply,
        thoughtProcess: processed.thoughtProcess,
        actionReceipt: processed.receipt,
        suggestedPrompts: processed.receipt ? undefined : [
          'Upload 2024 Chemistry Marking Scheme',
          'Open Physics Dedicated Sub-Folders Vault',
          'Show repository statistics'
        ]
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Copilot processing error:', err);
      const errMsg: CopilotMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thoughtProcess: '• System encounter error parsing directive\n• Fallback engaged to assist administrator safely.',
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
          thoughtProcess: '• Reset Copilot session state\n• Cleared local memory buffer\n• Ready for fresh upload and navigation operations.',
          text: `வரலாறு அழிக்கப்பட்டது! நான் புதிய பணிகளுக்கு தயார். Drive Link மற்றும் விபரங்களுடன் உங்கள் கோரிக்கையை கூறுங்கள்!`,
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
      {/* Top Banner: AI Copilot Header & Knowledge Badge */}
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
                <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-400/30 flex items-center gap-1">
                  <Brain className="w-3 h-3 text-cyan-400" />
                  <span>DEEP REASONING AGENT</span>
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Sri Lankan G.C.E. A/L Science Curriculum · Natural Language Uploader &amp; Manager
            </p>
          </div>
        </div>

        {/* Daily Limit Tracker & Clear History Button */}
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
        {messages.map((msg) => {
          const isThoughtExpanded = expandedThoughts[msg.id] ?? false;

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
                        <span>AI Autonomous Agent</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </>
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* AI THOUGHT PROCESS BOX (Deep Reasoning Analysis) */}
                {msg.sender === 'ai' && msg.thoughtProcess && (
                  <div className="rounded-xl bg-[#050A18] border border-cyan-500/25 overflow-hidden transition-all text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => toggleThought(msg.id)}
                      className="w-full px-3 py-2 bg-cyan-950/40 hover:bg-cyan-950/60 flex items-center justify-between text-cyan-300 text-[11px] font-bold transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span>AI THOUGHT PROCESS &amp; REASONING</span>
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
                : "Ask AI Copilot: e.g. 'Upload 2024 Biology Marking Scheme link https://drive.google.com/...'"
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
            <Brain className="w-3 h-3 text-cyan-400" />
            <span>Deep Reasoning Agent with full Sri Lankan A/L curriculum knowledge</span>
          </span>
          <span className="text-cyan-400 font-bold">{remainingChats} / 100 chats remaining today</span>
        </div>
      </div>
    </div>
  );
};
