import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Search,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  ExternalLink,
  BookOpen,
  Eye,
  Bookmark,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Award,
  Download,
  Plus,
  Compass
} from 'lucide-react';
import { PaperResource, StreamId } from '../types';
import { playRoboticFolder, playRoboticClick } from '../utils/audio';

export interface PilotFolderItem {
  id: string;
  nameEn: string;
  nameTa: string;
  driveFolderId: string;
  driveLink: string;
  badge: string;
  type: 'Provincial Pilot' | 'Leading Schools & Academies' | 'University Pilot';
  year: number;
  descriptionEn: string;
  descriptionTa: string;
  highlights: string[];
}

export interface PilotSubjectConfig {
  id: string;
  name: string;
  fullName: string;
  nameTa: string;
  icon: React.ComponentType<{ className?: string }>;
  colorTheme: 'rose' | 'blue' | 'emerald' | 'purple';
  stream: StreamId;
  masterDriveLink?: string;
  masterDriveTitleEn?: string;
  masterDriveTitleTa?: string;
  moratuwaDriveLink: string;
  moratuwaTitleEn: string;
  moratuwaTitleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  highlights: string[];
  subFolders: PilotFolderItem[];
}

// 1. PHYSICS 2024 PILOT SUBFOLDERS (Analyzed from user's Drive 1GcqnLsdCspxMj3Z6ZAgT6RciaaFdXpkC)
// Excludes Moratuwa and FWC as requested by user
export const PHYSICS_PILOT_2024_FOLDERS: PilotFolderItem[] = [
  {
    id: 'pilot-phy-royal-2024',
    nameEn: 'Royal College Colombo 2024 Pilot Exam',
    nameTa: 'கொழும்பு ரோயல் கல்லூரி 2024 முன்னோடிப் பரீட்சை',
    driveFolderId: '1H6i2yyJXmhQ7cU_nnxKMbFvZLeZ9YqWW',
    driveLink: 'https://drive.google.com/drive/folders/1H6i2yyJXmhQ7cU_nnxKMbFvZLeZ9YqWW',
    badge: 'Royal College 2024',
    type: 'Leading Schools & Academies',
    year: 2024,
    descriptionEn: 'Royal College Colombo 2024 Physics pilot and trial examination question papers with detailed step scoring criteria.',
    descriptionTa: 'கொழும்பு ரோயல் கல்லூரி உயர்தர பௌதிகவியல் முன்னோடி வினாத்தாள்கள் மற்றும் உத்தியோகபூர்வ விடைக்குறிப்புகள்.',
    highlights: ['Paper 1 & Paper 2', 'Colombo Benchmark', 'Full Step Scheme'],
  },
  {
    id: 'pilot-phy-kalinga-2024',
    nameEn: 'Prof. Kalinga Bandara 2024 Benchmark Exam',
    nameTa: 'பேராசிரியர் காலிங்க பண்டார 2024 மாதிரி வினாத்தாள்',
    driveFolderId: '1DtuqBhEtiWYkla9HYkj1Ua3EaexgCMv7',
    driveLink: 'https://drive.google.com/drive/folders/1DtuqBhEtiWYkla9HYkj1Ua3EaexgCMv7',
    badge: 'Prof. Kalinga Bandara',
    type: 'Leading Schools & Academies',
    year: 2024,
    descriptionEn: 'High-standard physics benchmark examination formulated by Senior Prof. Kalinga Bandara with detailed mathematical reasoning.',
    descriptionTa: 'பேராசிரியர் காலிங்க பண்டாரவினால் தயாரிக்கப்பட்ட உயர்தர மாதிரி வினாத்தாள்கள் மற்றும் கணித விளக்கங்கள்.',
    highlights: ['Advanced Problem Sets', 'Step-by-Step Solutions', 'Concept Mastery'],
  },
  {
    id: 'pilot-phy-np-2024',
    nameEn: 'Northern Province (NP) 2024 Trial Exam',
    nameTa: 'வட மாகாணம் (NP) 2024 முன்னோடிப் பரீட்சை',
    driveFolderId: '1MauT6VjXSR1LPDnQhqO3yJOM0iUVbg7n',
    driveLink: 'https://drive.google.com/drive/folders/1MauT6VjXSR1LPDnQhqO3yJOM0iUVbg7n',
    badge: 'Northern Province',
    type: 'Provincial Pilot',
    year: 2024,
    descriptionEn: 'Northern Province Department of Education 2024 Physics pilot examination question papers with step marking schemes.',
    descriptionTa: 'வட மாகாணக் கல்வித் திணைக்களம் 2024 உயர்தர பௌதிகவியல் முன்னோடி வினாத்தாள்கள் & விடைக்குறிப்புகள்.',
    highlights: ['Provincial Trial Paper', 'Structured Reasoning', 'Full Marking Schemes'],
  },
  {
    id: 'pilot-phy-central-2024',
    nameEn: 'Central Province 2024 Trial Exam',
    nameTa: 'மத்திய மாகாணம் 2024 முன்னோடிப் பரீட்சை',
    driveFolderId: '1nqYjKA4Y96tkOQDaekLVzaZC7oekHh4B',
    driveLink: 'https://drive.google.com/drive/folders/1nqYjKA4Y96tkOQDaekLVzaZC7oekHh4B',
    badge: 'Central Province',
    type: 'Provincial Pilot',
    year: 2024,
    descriptionEn: 'Central Province 2024 Physics pilot examination papers with complete marking schemes and score allocations.',
    descriptionTa: 'மத்திய மாகாண 2024 பௌதிகவியல் மாதிரிப் பரீட்சை வினாத்தாள்கள் மற்றும் புள்ளி வழங்கும் வழிகாட்டல்கள்.',
    highlights: ['Central Province Trial', 'Step Marking Criteria', 'MCQ & Essay Keys'],
  },
  {
    id: 'pilot-phy-dreamway-2024',
    nameEn: 'Dream Way 2024 Pilot Examination',
    nameTa: 'Dream Way 2024 பௌதிகவியல் முன்னோடிப் பரீட்சை',
    driveFolderId: '1m1OKdB0oMTEc1ULBhNhVrlom5YFZ3HQa',
    driveLink: 'https://drive.google.com/drive/folders/1m1OKdB0oMTEc1ULBhNhVrlom5YFZ3HQa',
    badge: 'Dream Way 2024',
    type: 'Leading Schools & Academies',
    year: 2024,
    descriptionEn: 'Dream Way 2024 island-wide Physics pilot examination question papers with step-by-step model schemes.',
    descriptionTa: 'Dream Way 2024 நாடளாவிய பௌதிகவியல் மாதிரிப் பரீட்சை வினாத்தாள்கள் மற்றும் படிமுறை விடைகள்.',
    highlights: ['Island-wide Pilot Paper', 'Model Essay Answers', 'Structured Problem Sets'],
  },
  {
    id: 'pilot-phy-ausdav-2024',
    nameEn: 'AUSDAV 2024 Pilot Examination',
    nameTa: 'AUSDAV 2024 மாதிரிப் பரீட்சை',
    driveFolderId: '12MJsKfs52RixnpRfK8-8o2xAJ0GJ8LG-',
    driveLink: 'https://drive.google.com/drive/folders/12MJsKfs52RixnpRfK8-8o2xAJ0GJ8LG-',
    badge: 'AUSDAV 2024',
    type: 'Leading Schools & Academies',
    year: 2024,
    descriptionEn: 'AUSDAV 2024 high-standard Physics pilot examination papers with complete marking schemes.',
    descriptionTa: 'AUSDAV 2024 உயர்தர பௌதிகவியல் மாதிரி வினாத்தாள்கள் மற்றும் மதிப்பீட்டுத் திட்டங்கள்.',
    highlights: ['Pilot Test Series', 'Full Step Scheme', 'Exam Benchmarks'],
  },
  {
    id: 'pilot-phy-gmsa-2024',
    nameEn: 'GMSA Ampara 2024 Pilot Examination',
    nameTa: 'GMSA அம்பாறை 2024 மாதிரிப் பரீட்சை',
    driveFolderId: '1Py7dyHRic-UN_58NQOUv8qnv2hrUGN8M',
    driveLink: 'https://drive.google.com/drive/folders/1Py7dyHRic-UN_58NQOUv8qnv2hrUGN8M',
    badge: 'GMSA Ampara',
    type: 'Leading Schools & Academies',
    year: 2024,
    descriptionEn: 'Graduate Muslim Science Association (GMSA) Ampara 2024 Physics pilot paper with full solutions.',
    descriptionTa: 'GMSA அம்பாறை 2024 பௌதிகவியல் முன்னோடி வினாத்தாள் மற்றும் முழுமையான தீர்வுகள்.',
    highlights: ['Ampara District Pilot', 'Complete Schemes', 'Structured Essays'],
  },
];

// 2. CHEMISTRY 2024 PILOT SUBFOLDERS (Analyzed from user's Drive 1C54pgxE8fR-nLhxeneSWvzY40sf6BBCI)
// Excludes Moratuwa and FWC as requested by user
export const CHEMISTRY_PILOT_2024_FOLDERS: PilotFolderItem[] = [
  {
    id: 'pilot-chem-wp-2024',
    nameEn: 'Western Province (WP) 2024 Pilot Exam',
    nameTa: 'மேல் மாகாணம் (WP) 2024 முன்னோடிப் பரீட்சை',
    driveFolderId: '1kTVvt76yHkYvYKl9hxFUv4E2FTBLkI_e',
    driveLink: 'https://drive.google.com/drive/folders/1kTVvt76yHkYvYKl9hxFUv4E2FTBLkI_e',
    badge: 'Western Province',
    type: 'Provincial Pilot',
    year: 2024,
    descriptionEn: 'Western Province Department of Education 2024 G.C.E. (A/L) Chemistry trial examination papers and official marking schemes.',
    descriptionTa: 'மேல் மாகாணக் கல்வித் திணைக்களம் 2024 இரசாயனவியல் முன்னோடி வினாத்தாள்கள் & விடைக்குறிப்புகள்.',
    highlights: ['Provincial Benchmark', 'Paper 1 & Paper 2', 'Official Scoring Scheme'],
  },
  {
    id: 'pilot-chem-royal-2024',
    nameEn: 'Royal College Colombo 2024 Pilot Exam',
    nameTa: 'கொழும்பு ரோயல் கல்லூரி 2024 முன்னோடிப் பரீட்சை',
    driveFolderId: '1XPG5i8z4LgBpP-iD9X4rN4T4IvzibGjC',
    driveLink: 'https://drive.google.com/drive/folders/1XPG5i8z4LgBpP-iD9X4rN4T4IvzibGjC',
    badge: 'Royal College 2024',
    type: 'Leading Schools & Academies',
    year: 2024,
    descriptionEn: 'Royal College Colombo 2024 Chemistry trial examination papers with full step marking criteria and organic reaction roadmaps.',
    descriptionTa: 'கொழும்பு ரோயல் கல்லூரி 2024 இரசாயனவியல் மாதிரி வினாத்தாள் மற்றும் சேதன மாற்றீட்டு விடைக்குறிப்புகள்.',
    highlights: ['Premier School Exam', 'Standard Criteria', 'Organic & Inorganic Schemes'],
  },
  {
    id: 'pilot-chem-np-2024',
    nameEn: 'Northern Province (NP) 2024 Pilot Exam',
    nameTa: 'வட மாகாணம் (NP) 2024 முன்னோடிப் பரீட்சை',
    driveFolderId: '1uD5vCcwK-djCr8ETCL30vpLVRGibhiFc',
    driveLink: 'https://drive.google.com/drive/folders/1uD5vCcwK-djCr8ETCL30vpLVRGibhiFc',
    badge: 'Northern Province',
    type: 'Provincial Pilot',
    year: 2024,
    descriptionEn: 'Northern Province 2024 G.C.E. (A/L) Chemistry pilot examination question paper with full answer breakdown.',
    descriptionTa: 'வட மாகாண 2024 இரசாயனவியல் மாதிரிப் பரீட்சை வினாத்தாள் மற்றும் விரிவான விடைக்குறிப்புகள்.',
    highlights: ['Northern Provincial Trial', 'Step Marking Criteria', 'MCQ & Structured Essays'],
  },
  {
    id: 'pilot-chem-nwp-2024',
    nameEn: 'North Western Province (NWP) 2024 Pilot Exam',
    nameTa: 'வடமேல் மாகாணம் (NWP) 2024 முன்னோடிப் பரீட்சை',
    driveFolderId: '1MNWjWDyML-ynbYatBF1EsmGRxspJLu9u',
    driveLink: 'https://drive.google.com/drive/folders/1MNWjWDyML-ynbYatBF1EsmGRxspJLu9u',
    badge: 'North Western Province',
    type: 'Provincial Pilot',
    year: 2024,
    descriptionEn: 'North Western Province 2024 Chemistry trial examination question paper with step-by-step marking schemes.',
    descriptionTa: 'வடமேல் மாகாண 2024 இரசாயனவியல் மாதிரி வினாத்தாள்கள் மற்றும் புள்ளி வழங்கும் வழிகாட்டல்கள்.',
    highlights: ['Provincial Assessment', 'Full Marking Schemes', 'Equilibrium & Kinetics Schemes'],
  },
  {
    id: 'pilot-chem-central-2024',
    nameEn: 'Central Province 2024 Pilot Exam',
    nameTa: 'மத்திய மாகாணம் 2024 முன்னோடிப் பரீட்சை',
    driveFolderId: '19p2-X0a3-Iy2psrpYjw12mFHpSfUp6l3',
    driveLink: 'https://drive.google.com/drive/folders/19p2-X0a3-Iy2psrpYjw12mFHpSfUp6l3',
    badge: 'Central Province',
    type: 'Provincial Pilot',
    year: 2024,
    descriptionEn: 'Central Province Department of Education 2024 Chemistry pilot examination papers with detailed answer schemes.',
    descriptionTa: 'மத்திய மாகாணக் கல்வித் திணைக்களம் 2024 இரசாயனவியல் முன்னோடி வினாத்தாள்கள் & விடைக்குறிப்புகள்.',
    highlights: ['Provincial Trial Paper', 'MCQ Key', 'Full Essay Points'],
  },
  {
    id: 'pilot-chem-uva-2024',
    nameEn: 'Uva Province (UVA) 2024 Pilot Exam',
    nameTa: 'ஊவா மாகாணம் 2024 முன்னோடிப் பரீட்சை',
    driveFolderId: '16Z-6_ahXtSAuXhuceUHA6dp5_8lz7AUa',
    driveLink: 'https://drive.google.com/drive/folders/16Z-6_ahXtSAuXhuceUHA6dp5_8lz7AUa',
    badge: 'UVA Province',
    type: 'Provincial Pilot',
    year: 2024,
    descriptionEn: 'Uva Province 2024 Chemistry trial examination question paper with full scoring criteria.',
    descriptionTa: 'ஊவா மாகாண 2024 இரசாயனவியல் முன்னோடிப் பரீட்சை வினாத்தாள் மற்றும் விடைக்குறிப்புகள்.',
    highlights: ['Uva Provincial Trial', 'Step Marking Criteria', 'Complete Paper Set'],
  },
  {
    id: 'pilot-chem-dreamway-2024',
    nameEn: 'Dream Way 2024 Chemistry Pilot',
    nameTa: 'Dream Way 2024 இரசாயனவியல் முன்னோடிப் பரீட்சை',
    driveFolderId: '1HNi9oTJvxVqGA77KblMOcSIngZbnO-1V',
    driveLink: 'https://drive.google.com/drive/folders/1HNi9oTJvxVqGA77KblMOcSIngZbnO-1V',
    badge: 'Dream Way 2024',
    type: 'Leading Schools & Academies',
    year: 2024,
    descriptionEn: 'Dream Way 2024 island-wide Chemistry pilot examination papers with step-by-step marking schemes.',
    descriptionTa: 'Dream Way 2024 நாடளாவிய இரசாயனவியல் முன்னோடி வினாத்தாள்கள் மற்றும் படிமுறை விடைக்குறிப்புகள்.',
    highlights: ['Island-wide Pilot Paper', 'Organic Mechanisms', 'Calculation Steps'],
  },
  {
    id: 'pilot-chem-gmsa-2024',
    nameEn: 'GMSA Ampara 2024 Chemistry Pilot',
    nameTa: 'GMSA அம்பாறை 2024 இரசாயனவியல் மாதிரிப் பரீட்சை',
    driveFolderId: '15W4GgIQ9cBkT8QP_Jq-_50gtNe0ZDqCz',
    driveLink: 'https://drive.google.com/drive/folders/15W4GgIQ9cBkT8QP_Jq-_50gtNe0ZDqCz',
    badge: 'GMSA Ampara',
    type: 'Leading Schools & Academies',
    year: 2024,
    descriptionEn: 'GMSA Ampara 2024 Chemistry pilot examination question paper with comprehensive solutions.',
    descriptionTa: 'GMSA அம்பாறை 2024 இரசாயனவியல் மாதிரி வினாத்தாள் மற்றும் முழுமையான தீர்வுகள்.',
    highlights: ['Ampara District Model Exam', 'Full Marking Schemes', 'Structured Questions'],
  },
];

export const PILOT_SUBJECTS: PilotSubjectConfig[] = [
  {
    id: 'c-maths',
    name: 'Combined Maths',
    fullName: 'G.C.E. (A/L) Combined Mathematics',
    nameTa: 'இணைந்த கணிதம்',
    icon: Calculator,
    colorTheme: 'purple',
    stream: 'maths',
    moratuwaDriveLink: 'https://drive.google.com/drive/folders/1mTde-mYzreBYJWKP3aQx6z-dznYw5PvD',
    moratuwaTitleEn: 'University of Moratuwa Combined Maths Pilot & Model Exam Papers',
    moratuwaTitleTa: 'மொறட்டுவ பல்கலைக்கழக இணைந்த கணித மாதிரி வினாத்தாள்கள் & விடைக்குறிப்புகள்',
    descriptionEn: 'High-standard Pure & Applied Mathematics pilot and trial examination papers prepared by University of Moratuwa educators with complete step-by-step marking schemes.',
    descriptionTa: 'மொறட்டுவ பல்கலைக்கழக விரிவுரையாளர்களால் தயாரிக்கப்பட்ட உயர்தர மாதிரி மற்றும் முன்னோடி வினாத்தாள்கள், விரிவான படிமுறை விடைக்குறிப்புகள்.',
    highlights: ['Pure & Applied Mathematics', 'Step-by-Step Marking Schemes', 'Advanced Model Examinations'],
    subFolders: [],
  },
  {
    id: 'physics',
    name: 'Physics',
    fullName: 'G.C.E. (A/L) Physics',
    nameTa: 'பௌதிகவியல்',
    icon: Atom,
    colorTheme: 'blue',
    stream: 'all',
    masterDriveLink: 'https://drive.google.com/drive/folders/1GcqnLsdCspxMj3Z6ZAgT6RciaaFdXpkC',
    masterDriveTitleEn: '2024 Physics All Island Pilot Papers Complete Archive [Master Drive]',
    masterDriveTitleTa: '2024 பௌதிகவியல் நாடளாவிய முன்னோடி வினாத்தாள்கள் முழுத் தொகுப்பு [Master Drive]',
    moratuwaDriveLink: 'https://drive.google.com/drive/folders/11WkIA9Xf9ImJj9OXM7duAJWmFfH-PcXW',
    moratuwaTitleEn: 'University of Moratuwa Physics Pilot & Model Exam Papers',
    moratuwaTitleTa: 'மொறட்டுவ பல்கலைக்கழக பௌதிகவியல் மாதிரி வினாத்தாள்கள் & விடைக்குறிப்புகள்',
    descriptionEn: 'University of Moratuwa Physics pilot, trial, and model examination papers plus 2024 provincial & leading school pilot folders with standard MCQ answer keys and complete structured essay marking schemes.',
    descriptionTa: 'மொறட்டுவ பல்கலைக்கழக பௌதிகவியல் மாதிரி வினாத்தாள்கள் மற்றும் 2024 மாகாண/முன்னணிப் பாடசாலை முன்னோடி வினாத்தாள்கள்.',
    highlights: ['Paper 1 (MCQ) & Paper 2 (Essay)', '2024 Provincial & College Pilot Folders', 'Standard Scoring Schemes'],
    subFolders: PHYSICS_PILOT_2024_FOLDERS,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    fullName: 'G.C.E. (A/L) Chemistry',
    nameTa: 'இரசாயனவியல்',
    icon: FlaskConical,
    colorTheme: 'emerald',
    stream: 'all',
    masterDriveLink: 'https://drive.google.com/drive/folders/1C54pgxE8fR-nLhxeneSWvzY40sf6BBCI',
    masterDriveTitleEn: '2024 Chemistry All Island Pilot Papers Complete Archive [Master Drive]',
    masterDriveTitleTa: '2024 இரசாயனவியல் நாடளாவிய முன்னோடி வினாத்தாள்கள் முழுத் தொகுப்பு [Master Drive]',
    moratuwaDriveLink: 'https://drive.google.com/drive/folders/1FjU5zVMZ5-l4aqAbs-T4ux2qRX0S6zrU',
    moratuwaTitleEn: 'University of Moratuwa Chemistry Pilot & Model Exam Papers',
    moratuwaTitleTa: 'மொறட்டுவ பல்கலைக்கழக இரசாயனவியல் மாதிரி வினாத்தாள்கள் & விடைக்குறிப்புகள்',
    descriptionEn: 'University of Moratuwa Chemistry pilot papers plus 2024 provincial & top college pilot folders (Western, Northern, North Western, Central, Uva, Royal College, Dream Way, GMSA) with standard marking schemes.',
    descriptionTa: 'மொறட்டுவ பல்கலைக்கழக இரசாயனவியல் மாதிரி வினாத்தாள்கள் மற்றும் 2024 மாகாண முன்னோடி வினாத்தாள்கள் தொகுப்பு.',
    highlights: ['2024 Provincial & Top College Folders', 'Reaction Mechanisms & Step Schemes', 'University Pilot Series'],
    subFolders: CHEMISTRY_PILOT_2024_FOLDERS,
  },
  {
    id: 'biology',
    name: 'Biology',
    fullName: 'G.C.E. (A/L) Biology',
    nameTa: 'உயிரியல்',
    icon: Dna,
    colorTheme: 'rose',
    stream: 'bio',
    moratuwaDriveLink: 'https://drive.google.com/drive/folders/1qxg_rnsbNwm7XnqeXS2ModZTdEfR3qJn',
    moratuwaTitleEn: 'University of Moratuwa Biology Pilot & Model Exam Papers',
    moratuwaTitleTa: 'மொறட்டுவ பல்கலைக்கழக உயிரியல் மாதிரி வினாத்தாள்கள் & விடைக்குறிப்புகள்',
    descriptionEn: 'University of Moratuwa pilot, trial, and model examination papers prepared by expert educators with detailed answer keys, essay outlines, and marking points.',
    descriptionTa: 'மொறட்டுவ பல்கலைக்கழக உயிரியல் முன்னோடி வினாத்தாள்கள், மாதிரி கட்டுரை விடைகள் மற்றும் திருத்தக் குறிப்புகள்.',
    highlights: ['Pilot & Trial Examinations', 'Detailed Mark Schemes', 'High-Standard Questions'],
    subFolders: [],
  },
];

interface OtherPilotPapersViewProps {
  selectedSubject?: string;
  onSelectSubject?: (subjId: string) => void;
  papers: PaperResource[];
  onPreview: (res: PaperResource, mode?: 'paper' | 'scheme') => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (id: string) => void;
  onOpenAdminUpload?: () => void;
  isAdmin?: boolean;
}

export const OtherPilotPapersView: React.FC<OtherPilotPapersViewProps> = ({
  selectedSubject = 'all',
  onSelectSubject,
  papers,
  onPreview,
  isBookmarked,
  onToggleBookmark,
  onOpenAdminUpload,
  isAdmin = false,
}) => {
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(() => {
    if (selectedSubject && selectedSubject !== 'all') {
      return selectedSubject;
    }
    return null;
  });

  const [selectedFolderFilter, setSelectedFolderFilter] = useState<'all' | 'provincial' | 'colleges' | 'moratuwa'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const activeSubject = useMemo(() => {
    return PILOT_SUBJECTS.find((s) => s.id === activeSubjectId) || null;
  }, [activeSubjectId]);

  const handleOpenSubject = (subjectId: string) => {
    playRoboticFolder();
    setActiveSubjectId(subjectId);
    setSearchQuery('');
    setSelectedFolderFilter('all');
    if (onSelectSubject) {
      onSelectSubject(subjectId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAll = () => {
    playRoboticClick();
    setActiveSubjectId(null);
    setSearchQuery('');
    setSelectedFolderFilter('all');
    if (onSelectSubject) {
      onSelectSubject('all');
    }
  };

  const handleCopyLink = (link: string, id: string) => {
    playRoboticClick();
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Filter subfolders based on category filter & search query
  const filteredSubFolders = useMemo(() => {
    if (!activeSubject) return [];
    return activeSubject.subFolders.filter((f) => {
      if (selectedFolderFilter === 'provincial' && f.type !== 'Provincial Pilot') return false;
      if (selectedFolderFilter === 'colleges' && f.type !== 'Leading Schools & Academies') return false;
      if (selectedFolderFilter === 'moratuwa') return false; // Handled in dedicated master section
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (f.nameEn || '').toLowerCase().includes(q) ||
          (f.nameTa || '').toLowerCase().includes(q) ||
          (f.badge || '').toLowerCase().includes(q) ||
          (f.descriptionEn || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeSubject, selectedFolderFilter, searchQuery]);

  // Filter individual pilot papers from state
  const subjectPilotPapers = useMemo(() => {
    return papers.filter((p) => {
      if (!p || p.category !== 'pilot-papers') return false;
      if (activeSubjectId) {
        const matchesSubject =
          p.subjectId === activeSubjectId ||
          (activeSubjectId === 'c-maths' && (p.subjectId === 'sub-combined-maths' || p.subjectId === 'c-maths')) ||
          (activeSubjectId === 'physics' && (p.subjectId === 'sub-physics' || p.subjectId === 'physics')) ||
          (activeSubjectId === 'chemistry' && (p.subjectId === 'sub-chemistry' || p.subjectId === 'chemistry')) ||
          (activeSubjectId === 'biology' && (p.subjectId === 'sub-biology' || p.subjectId === 'biology'));
        if (!matchesSubject) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (p.titleEn || '').toLowerCase().includes(q) ||
          (p.titleTa && p.titleTa.toLowerCase().includes(q)) ||
          (p.subjectNameEn || '').toLowerCase().includes(q) ||
          (p.schoolOrSource || '').toLowerCase().includes(q) ||
          (p.pilotType && p.pilotType.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [papers, activeSubjectId, searchQuery]);

  return (
    <div className="space-y-6">
      {/* View 1: Main 4 Subject Folders Hub */}
      {!activeSubject ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50/60 rounded-2xl border border-indigo-100 p-5 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-800 text-xs font-bold tracking-wide">
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  <span>University & Pilot Examinations Archive</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Other Pilot Papers · முன்னோடி மாதிரி வினாத்தாள்கள்
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Comprehensive repository for University of Moratuwa pilot examinations, 2024 Provincial trial assessments (Western, Central, Northern, North Western, Uva), and top college pilot folders (Royal College, Prof. Kalinga Bandara, Dream Way, AUSDAV, GMSA).
                </p>
              </div>

              {isAdmin && onOpenAdminUpload && (
                <button
                  onClick={() => {
                    playRoboticClick();
                    onOpenAdminUpload();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload New Pilot Paper</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Primary Subject Folder Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {PILOT_SUBJECTS.map((subj) => {
              const IconComponent = subj.icon;
              const colorClasses = {
                purple: {
                  border: 'border-purple-200 hover:border-purple-400',
                  iconBg: 'bg-purple-600 text-white',
                  badge: 'bg-purple-100 text-purple-800',
                },
                blue: {
                  border: 'border-blue-200 hover:border-blue-400',
                  iconBg: 'bg-blue-600 text-white',
                  badge: 'bg-blue-100 text-blue-800',
                },
                emerald: {
                  border: 'border-emerald-200 hover:border-emerald-400',
                  iconBg: 'bg-emerald-600 text-white',
                  badge: 'bg-emerald-100 text-emerald-800',
                },
                rose: {
                  border: 'border-rose-200 hover:border-rose-400',
                  iconBg: 'bg-rose-600 text-white',
                  badge: 'bg-rose-100 text-rose-800',
                },
              }[subj.colorTheme];

              return (
                <div
                  key={subj.id}
                  onClick={() => handleOpenSubject(subj.id)}
                  className={`group relative rounded-2xl bg-white border ${colorClasses.border} p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    {/* Header: Icon & Folder Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl ${colorClasses.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${colorClasses.badge}`}>
                        {subj.subFolders.length > 0 ? `${subj.subFolders.length} Folders` : 'Pilot Folder'}
                      </span>
                    </div>

                    {/* Title & Tamil */}
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {subj.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5 font-tamil">
                        {subj.nameTa}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                        {subj.descriptionEn}
                      </p>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Moratuwa & Pilot Series</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {subj.highlights.slice(0, 2).map((h, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Open Folder Action */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    <span className="flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4" />
                      <span>Open Subject Folders</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Educational Overview Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-extrabold text-slate-900">
                About Other Pilot Papers (முன்னோடி மாதிரி வினாத்தாள்கள்)
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This archive hosts high-standard pilot, trial, and model examination papers created by leading educational institutions, provincial departments of education, and top academic educators. Each folder contains question papers, detailed marking schemes, and score allocations with direct Google Drive access and in-app viewing.
            </p>
          </div>
        </div>
      ) : (
        /* View 2: Specific Subject Pilot Papers Page */
        <div className="space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div>
              <button
                onClick={handleBackToAll}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All 4 Subject Folders</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  {React.createElement(activeSubject.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {activeSubject.fullName}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 font-tamil">
                    {activeSubject.nameTa} · முன்னோடி மற்றும் மாதிரி வினாத்தாள்கள்
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && onOpenAdminUpload && (
                <button
                  onClick={() => {
                    playRoboticClick();
                    onOpenAdminUpload();
                  }}
                  className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Paper</span>
                </button>
              )}

              {activeSubject.masterDriveLink && (
                <a
                  href={activeSubject.masterDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>2024 Master Drive</span>
                </a>
              )}
            </div>
          </div>

          {/* Master Pilot Drive Collections (2024 All Island Pilot & Moratuwa Collection) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1. 2024 All Island Master Drive Folder (if available for Physics & Chemistry) */}
            {activeSubject.masterDriveLink && (
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50/70 border border-blue-200/90 p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-extrabold uppercase">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      2024 Master Drive
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      All Island 2024
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {activeSubject.masterDriveTitleEn}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 font-tamil mt-0.5">
                      {activeSubject.masterDriveTitleTa}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Access the complete 2024 master Google Drive folder containing all island-wide pilot, trial, and model examination papers with answer keys.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      const res: PaperResource = {
                        id: `pilot-${activeSubject.id}-master-2024`,
                        titleEn: activeSubject.masterDriveTitleEn || '2024 Pilot Papers Master Drive',
                        titleTa: activeSubject.masterDriveTitleTa,
                        category: 'pilot-papers',
                        pilotType: '2024 Pilot Papers',
                        stream: activeSubject.stream,
                        subjectId: activeSubject.id,
                        subjectNameEn: activeSubject.name,
                        subjectNameTa: activeSubject.nameTa,
                        year: 2024,
                        term: 'All Island',
                        schoolOrSource: 'All Island Pilot Consortium',
                        schoolOrSourceTa: 'நாடளாவிய முன்னோடிப் பரீட்சைகள்',
                        driveLink: activeSubject.masterDriveLink || '',
                        fileSize: 'Complete Archive',
                        downloadsCount: 18000,
                        unitOrTopic: 'Complete 2024 Pilot Examination Papers Archive',
                      };
                      onPreview(res, 'paper');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Drive</span>
                  </button>

                  <a
                    href={activeSubject.masterDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>Open in Drive</span>
                  </a>

                  <button
                    onClick={() => handleCopyLink(activeSubject.masterDriveLink || '', `master-${activeSubject.id}`)}
                    className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedLink === `master-${activeSubject.id}` ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 2. University of Moratuwa Collection */}
            <div className={`rounded-2xl bg-gradient-to-br from-amber-50 via-white to-blue-50/70 border border-amber-200/90 p-5 shadow-xs flex flex-col justify-between ${
              !activeSubject.masterDriveLink ? 'lg:col-span-2' : ''
            }`}>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    University Collection
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Moratuwa University
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {activeSubject.moratuwaTitleEn}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 font-tamil mt-0.5">
                    {activeSubject.moratuwaTitleTa}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeSubject.descriptionEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const moratuwaRes: PaperResource = {
                      id: `pilot-moratuwa-${activeSubject.id}-master`,
                      titleEn: activeSubject.moratuwaTitleEn,
                      titleTa: activeSubject.moratuwaTitleTa,
                      category: 'pilot-papers',
                      pilotType: 'Moratuwa University',
                      stream: activeSubject.stream,
                      subjectId: activeSubject.id,
                      subjectNameEn: activeSubject.name,
                      subjectNameTa: activeSubject.nameTa,
                      year: 2025,
                      term: 'Trial / Final',
                      schoolOrSource: 'University of Moratuwa',
                      schoolOrSourceTa: 'மொறட்டுவ பல்கலைக்கழகம்',
                      driveLink: activeSubject.moratuwaDriveLink,
                      markingSchemeDriveLink: activeSubject.moratuwaDriveLink,
                      fileSize: 'Complete Pilot Exam Archive',
                      downloadsCount: 15400,
                      unitOrTopic: activeSubject.descriptionEn,
                    };
                    onPreview(moratuwaRes, 'paper');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Moratuwa</span>
                </button>

                <a
                  href={activeSubject.moratuwaDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>Open Folder</span>
                </a>

                <button
                  onClick={() => handleCopyLink(activeSubject.moratuwaDriveLink, `moratuwa-${activeSubject.id}`)}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                  title="Copy Link"
                >
                  {copiedLink === `moratuwa-${activeSubject.id}` ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => {
                    const id = `pilot-moratuwa-${activeSubject.id}-master`;
                    onToggleBookmark(id);
                  }}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isBookmarked(`pilot-moratuwa-${activeSubject.id}-master`)
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'border-slate-200 text-slate-400 hover:text-slate-700'
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Analyzed 2024 Pilot Sub-Folders Section (for Physics & Chemistry) */}
          {activeSubject.subFolders.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-600" />
                    <span>2024 Analyzed Pilot Folders ({activeSubject.subFolders.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-tamil mt-0.5">
                    மாகாணக் கல்வித் திணைக்களங்கள் மற்றும் முன்னணிப் பாடசாலைகளின் முன்னோடி வினாத்தாள்கள்
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setSelectedFolderFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedFolderFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({activeSubject.subFolders.length})
                  </button>
                  <button
                    onClick={() => setSelectedFolderFilter('provincial')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedFolderFilter === 'provincial'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Provincial Pilot
                  </button>
                  <button
                    onClick={() => setSelectedFolderFilter('colleges')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedFolderFilter === 'colleges'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Leading Schools
                  </button>
                </div>
              </div>

              {/* Sub-Folders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredSubFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase border border-indigo-100">
                          {folder.badge}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyLink(folder.driveLink, folder.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Copy Drive Link"
                          >
                            {copiedLink === folder.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => onToggleBookmark(folder.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isBookmarked(folder.id)
                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                : 'border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                            title="Bookmark"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                        {folder.nameEn}
                      </h4>
                      <p className="text-xs text-slate-500 font-tamil line-clamp-1">
                        {folder.nameTa}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {folder.descriptionEn}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {folder.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          const res: PaperResource = {
                            id: folder.id,
                            titleEn: folder.nameEn,
                            titleTa: folder.nameTa,
                            category: 'pilot-papers',
                            pilotType: folder.type,
                            stream: activeSubject.stream,
                            subjectId: activeSubject.id,
                            subjectNameEn: activeSubject.name,
                            subjectNameTa: activeSubject.nameTa,
                            year: folder.year,
                            term: 'Trial Exam',
                            schoolOrSource: folder.badge,
                            driveLink: folder.driveLink,
                            fileSize: 'Drive Folder',
                            downloadsCount: 12000,
                            unitOrTopic: folder.descriptionEn,
                          };
                          onPreview(res, 'paper');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview In-App</span>
                      </button>

                      <a
                        href={folder.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1"
                        title="Open Google Drive Folder"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Drive</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Box & All Individual Papers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Search All {activeSubject.name} Pilot Documents ({subjectPilotPapers.length})</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Type to filter by paper name, year, or pilot provider
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeSubject.name} papers...`}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* List of Individual Papers */}
            {subjectPilotPapers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No matching papers found for "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                {subjectPilotPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-2xs transition-all flex flex-col justify-between space-y-2.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase">
                            {paper.pilotType || 'Pilot Paper'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {paper.year}
                          </span>
                        </div>

                        <button
                          onClick={() => onToggleBookmark(paper.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isBookmarked(paper.id)
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                          title="Bookmark"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h5 className="text-xs font-bold text-slate-900 line-clamp-2">
                        {paper.titleEn}
                      </h5>
                      {paper.titleTa && (
                        <p className="text-[11px] text-slate-500 font-tamil line-clamp-1">
                          {paper.titleTa}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] text-slate-500 truncate">
                        {paper.schoolOrSource}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onPreview(paper, 'paper')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <a
                          href={paper.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Open Drive Link"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
