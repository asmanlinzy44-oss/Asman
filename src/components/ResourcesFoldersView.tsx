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
  Sparkles,
  BookOpen,
  Eye,
  Bookmark,
  Library,
  CheckCircle2,
  FileText,
  FolderArchive,
  Copy,
  Check
} from 'lucide-react';
import { PaperResource } from '../types';
import { playRoboticFolder, playRoboticClick } from '../utils/audio';

export interface AcademicResourceSection {
  id: string;
  nameEn: string;
  nameTa: string;
  driveFolderId: string;
  driveLink: string;
  badge: string;
  icon: string;
  colorBorder: string;
  description: string;
  fileHighlights: string[];
}

// 1. BIOLOGY ALL IN ONE DRIVE FOLDER & SECTIONS
export const BIOLOGY_ALL_IN_ONE_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/19jJOxshaK3FpEeEd9caiwEVT79eeMYz2';

export const BIOLOGY_SECTIONS: AcademicResourceSection[] = [
  {
    id: 'bio-theory-books',
    nameEn: 'Theory Books (Unit Notes)',
    nameTa: 'கோட்பாட்டு நூல்கள் (அலகு குறிப்புகள்)',
    driveFolderId: '1QrVgGPX6BnXWvXBDeW3XPYfQLrrSEL-u',
    driveLink: 'https://drive.google.com/drive/folders/1QrVgGPX6BnXWvXBDeW3XPYfQLrrSEL-u',
    badge: 'Units 1 to 10',
    icon: '📘',
    colorBorder: 'border-rose-200 hover:border-rose-500',
    description: 'Comprehensive unit-by-unit syllabus theory books covering cell biology, genetics, plant & animal physiology, and microbiology.',
    fileHighlights: ['Units 01–10 Complete Notes', 'Color Diagrams & Charts', 'Syllabus Summaries'],
  },
  {
    id: 'bio-resource-books',
    nameEn: 'Official Resource Books (NIE)',
    nameTa: 'தேசிய கல்வி நிறுவகம் (NIE) வள நூல்கள்',
    driveFolderId: '1B_zpnHCnHNhnnJ5RxZjKWJVgHMbRkS8d',
    driveLink: 'https://drive.google.com/drive/folders/1B_zpnHCnHNhnnJ5RxZjKWJVgHMbRkS8d',
    badge: 'Official NIE Handbooks',
    icon: '📚',
    colorBorder: 'border-rose-200 hover:border-rose-500',
    description: 'National Institute of Education (NIE) curriculum resource books, authoritative definitions, and scientific terminology.',
    fileHighlights: ['NIE Resource Textbooks', 'Canonical Terminology', 'Syllabus Guidance'],
  },
  {
    id: 'bio-2000-mcq',
    nameEn: '2000+ MCQ Master Bank',
    nameTa: '2000+ பல்தேர்வு வினா வங்கி',
    driveFolderId: '1FxFQCKAvT00BGqReUSLxb74eNSP3h6kU',
    driveLink: 'https://drive.google.com/drive/folders/1FxFQCKAvT00BGqReUSLxb74eNSP3h6kU',
    badge: 'Classified MCQs',
    icon: '📜',
    colorBorder: 'border-rose-200 hover:border-rose-500',
    description: 'Over 2000 classified multiple choice questions arranged unit-by-unit with detailed answer keys and explanations.',
    fileHighlights: ['2000+ Unit MCQs', 'Analytical Explanations', 'Past Exam Questions'],
  },
  {
    id: 'bio-practicals',
    nameEn: 'Practical Handbook & Experiments',
    nameTa: 'ஆய்வுகூட செய்முறை வழிகாட்டி',
    driveFolderId: '1dHkJnlsBq8w7xBrajRVE8b4lPLEaMSmx',
    driveLink: 'https://drive.google.com/drive/folders/1dHkJnlsBq8w7xBrajRVE8b4lPLEaMSmx',
    badge: 'Mandatory Practicals',
    icon: '📕',
    colorBorder: 'border-rose-200 hover:border-rose-500',
    description: 'Complete practical handbook for microscopic slide preparation, biochemical food tests, and physiological experiments.',
    fileHighlights: ['All Mandatory Experiments', 'Slide Observations', 'Biochemical Tests'],
  },
  {
    id: 'bio-essays',
    nameEn: 'Essay Question Collection',
    nameTa: 'கட்டுரை வினாக்கள் தொகுப்பு',
    driveFolderId: '1lytpJBatznvX-yT4tXUuwXfSqU4fzLCU',
    driveLink: 'https://drive.google.com/drive/folders/1lytpJBatznvX-yT4tXUuwXfSqU4fzLCU',
    badge: 'Structured Essays',
    icon: '✍️',
    colorBorder: 'border-rose-200 hover:border-rose-500',
    description: 'High-yield essay questions with marking points, model structural answers, and diagrammatic explanations.',
    fileHighlights: ['Unit-wise Essay Questions', 'Model Structural Answers', 'Mark Allocation Points'],
  },
  {
    id: 'bio-structures',
    nameEn: 'Structure Question Collection',
    nameTa: 'அமைப்புக் கட்டுரை வினாக்கள்',
    driveFolderId: '1gTYiXZCoEm5lyZflZaHBnu0GjywF6Kn3',
    driveLink: 'https://drive.google.com/drive/folders/1gTYiXZCoEm5lyZflZaHBnu0GjywF6Kn3',
    badge: 'Structured Essays',
    icon: '📝',
    colorBorder: 'border-rose-200 hover:border-rose-500',
    description: 'Targeted structured essay questions designed to test in-depth syllabus knowledge and experimental reasoning.',
    fileHighlights: ['Structured Question Drills', 'Exam Benchmarks', 'Key Marking Terms'],
  },
  {
    id: 'bio-elaboration',
    nameEn: 'Elaboration Guide',
    nameTa: 'விளக்கக் கையேடு',
    driveFolderId: '1MX5k6hl0usT3WoARqWg_16TB1-1N8k6P',
    driveLink: 'https://drive.google.com/drive/folders/1MX5k6hl0usT3WoARqWg_16TB1-1N8k6P',
    badge: 'Marking Elaborations',
    icon: '📓',
    colorBorder: 'border-rose-200 hover:border-rose-500',
    description: 'Detailed elaborations on examination marking schemes, answer reasoning, and common student errors.',
    fileHighlights: ['Marking Scheme Explanations', 'Common Mistake Warnings', 'Examiner Commentary'],
  },
  {
    id: 'bio-seminars',
    nameEn: 'Support Seminar Papers',
    nameTa: 'கருத்தரங்கு வினாத்தாள்கள்',
    driveFolderId: '13Y-iTi8c71TC8jNhLrV4Ee0Th0TGsY8j',
    driveLink: 'https://drive.google.com/drive/folders/13Y-iTi8c71TC8jNhLrV4Ee0Th0TGsY8j',
    badge: 'Revision Seminars',
    icon: '🔖',
    colorBorder: 'border-rose-200 hover:border-rose-500',
    description: 'Provincial and national revision seminar papers, discussion question sets, and final review packages.',
    fileHighlights: ['Provincial Seminar Papers', 'Discussion Worksheets', 'Exam Revision Sets'],
  },
  {
    id: 'bio-syllabus',
    nameEn: 'Official Syllabus Guide',
    nameTa: 'பாடத்திட்ட வழிகாட்டி',
    driveFolderId: '1ygCw5mRA_P-uipqLvQ6FLjX-l80GDxqi',
    driveLink: 'https://drive.google.com/drive/folders/1ygCw5mRA_P-uipqLvQ6FLjX-l80GDxqi',
    badge: 'Curriculum Standards',
    icon: '🗺️',
    colorBorder: 'border-rose-200 hover:border-rose-500',
    description: 'Ministry of Education and NIE official G.C.E. (A/L) Biology curriculum framework, learning competencies, and time allocations.',
    fileHighlights: ['Syllabus Framework', 'Learning Competencies', 'Exam Format Guidelines'],
  },
  {
    id: 'bio-teachers-guide',
    nameEn: 'Teacher’s Instructional Guide',
    nameTa: 'ஆசிரியர் வழிகாட்டி நூல்',
    driveFolderId: '1zkV6pk3qMDFQh7yrN_JNiPHNH_JFoW27',
    driveLink: 'https://drive.google.com/drive/folders/1zkV6pk3qMDFQh7yrN_JNiPHNH_JFoW27',
    badge: 'Pedagogical Standards',
    icon: '🦯',
    colorBorder: 'border-rose-200 hover:border-rose-500',
    description: 'Official teacher’s instructional manual with pedagogical guidance, lesson planning, and expected benchmark responses.',
    fileHighlights: ['Teacher Lesson Guides', 'Model Answers', 'Pedagogical Standards'],
  },
];

// 2. CHEMISTRY ALL IN ONE DRIVE FOLDER & SECTIONS
export const CHEMISTRY_ALL_IN_ONE_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1tL7N0zTjqhbG3jWDBQn9VspcPgglVMsD';

export const CHEMISTRY_SECTIONS: AcademicResourceSection[] = [
  {
    id: 'chem-theory-books',
    nameEn: 'Chemistry Theory Books',
    nameTa: 'இரசாயனவியல் கோட்பாட்டு நூல்கள்',
    driveFolderId: '1D9Ir-8G9soNt1wbdIbRpZVsFvMnPtc42',
    driveLink: 'https://drive.google.com/drive/folders/1D9Ir-8G9soNt1wbdIbRpZVsFvMnPtc42',
    badge: 'Units 1 to 14',
    icon: '📒',
    colorBorder: 'border-emerald-200 hover:border-emerald-500',
    description: 'Complete unit-by-unit Chemistry theory compendiums covering general, inorganic, physical, and organic chemistry.',
    fileHighlights: ['Units 01–14 Full Theory', 'Reaction Mechanisms', 'Equilibrium & Kinetics'],
  },
  {
    id: 'chem-practice-books',
    nameEn: 'Practice Books & Problem Sets',
    nameTa: 'பயிற்சி நூல்கள் மற்றும் வினாக்கொத்து',
    driveFolderId: '1D3rAqvsmgUtFZiTi3M-mpMMD8h9nrLWn',
    driveLink: 'https://drive.google.com/drive/folders/1D3rAqvsmgUtFZiTi3M-mpMMD8h9nrLWn',
    badge: 'Workbooks & Drills',
    icon: '📕',
    colorBorder: 'border-emerald-200 hover:border-emerald-500',
    description: 'Extensive problem workbooks for calculation practice, organic conversions, and inorganic qualitative analysis exercises.',
    fileHighlights: ['Calculation Workbooks', 'Organic Reaction Roadmaps', 'Inorganic Problem Sets'],
  },
  {
    id: 'chem-2000-mcq',
    nameEn: '2000+ MCQ Master Bank',
    nameTa: '2000+ பல்தேர்வு வினா வங்கி',
    driveFolderId: '1gAlXk95gLtGuUoaVryDLlNR5sYJiJO2_',
    driveLink: 'https://drive.google.com/drive/folders/1gAlXk95gLtGuUoaVryDLlNR5sYJiJO2_',
    badge: 'Classified MCQs',
    icon: '📜',
    colorBorder: 'border-emerald-200 hover:border-emerald-500',
    description: 'Over 2000 classified Chemistry MCQs arranged by syllabus units with analytical reasoning and step-by-step solutions.',
    fileHighlights: ['2000+ Unit-wise MCQs', 'Analytical Solutions', 'Exam Trap Explanations'],
  },
  {
    id: 'chem-practicals',
    nameEn: 'Practical Handbook & Titrations',
    nameTa: 'ஆய்வுகூட செய்முறை & தரம் பார்த்தல்',
    driveFolderId: '1EfkvODWMTQbsouI-Gq1dsjA0-pUL9xtP',
    driveLink: 'https://drive.google.com/drive/folders/1EfkvODWMTQbsouI-Gq1dsjA0-pUL9xtP',
    badge: 'Laboratory Guide',
    icon: '📕',
    colorBorder: 'border-emerald-200 hover:border-emerald-500',
    description: 'Official laboratory manual for volumetric titrations, qualitative cation/anion analysis, and physical chemistry experiments.',
    fileHighlights: ['Volumetric Titrations', 'Cation/Anion Identification', 'Rate of Reaction Experiments'],
  },
  {
    id: 'chem-resource-books',
    nameEn: 'Official Resource Books (NIE)',
    nameTa: 'தேசிய கல்வி நிறுவகம் (NIE) வள நூல்கள்',
    driveFolderId: '1vTDPtTqE9DzPlxKMz7wlJ2NCjqtRHPVF',
    driveLink: 'https://drive.google.com/drive/folders/1vTDPtTqE9DzPlxKMz7wlJ2NCjqtRHPVF',
    badge: 'Official NIE Handbooks',
    icon: '📚',
    colorBorder: 'border-emerald-200 hover:border-emerald-500',
    description: 'National Institute of Education (NIE) Chemistry curriculum resource books, standard IUPAC names, and SI units.',
    fileHighlights: ['NIE Resource Textbooks', 'IUPAC Standards', 'Official Formulas'],
  },
  {
    id: 'chem-elaboration',
    nameEn: 'Elaboration Guide',
    nameTa: 'விளக்கக் கையேடு',
    driveFolderId: '1L72xHpItk5-XbrCmGdJbLayRiJ67wAf2',
    driveLink: 'https://drive.google.com/drive/folders/1L72xHpItk5-XbrCmGdJbLayRiJ67wAf2',
    badge: 'Marking Elaborations',
    icon: '📓',
    colorBorder: 'border-emerald-200 hover:border-emerald-500',
    description: 'In-depth elaborations on national marking criteria, common chemical misconceptions, and equation balancing standards.',
    fileHighlights: ['Marking Scheme Commentary', 'Reaction Mechanism Notes', 'Score Maximization Tips'],
  },
  {
    id: 'chem-seminars',
    nameEn: 'Support Seminar Papers',
    nameTa: 'கருத்தரங்கு வினாத்தாள்கள்',
    driveFolderId: '1ajlaa10g6w_3BzrWgSIdfP7NapBr9d_T',
    driveLink: 'https://drive.google.com/drive/folders/1ajlaa10g6w_3BzrWgSIdfP7NapBr9d_T',
    badge: 'Revision Seminars',
    icon: '🔖',
    colorBorder: 'border-emerald-200 hover:border-emerald-500',
    description: 'Provincial and national revision seminar papers, review worksheets, and high-probability examination topics.',
    fileHighlights: ['Provincial Revision Papers', 'Discussion Worksheets', 'Target Exam Questions'],
  },
  {
    id: 'chem-syllabus',
    nameEn: 'Official Syllabus Guide',
    nameTa: 'பாடத்திட்ட வழிகாட்டி',
    driveFolderId: '1iNSpsSdWuyoXAHzmC5O_02z6mcWZBwUz',
    driveLink: 'https://drive.google.com/drive/folders/1iNSpsSdWuyoXAHzmC5O_02z6mcWZBwUz',
    badge: 'Curriculum Standards',
    icon: '🗺️',
    colorBorder: 'border-emerald-200 hover:border-emerald-500',
    description: 'National Institute of Education (NIE) Chemistry syllabus framework, learning competencies, and practical requirements.',
    fileHighlights: ['Curriculum Framework', 'Syllabus Competency Matrix', 'Weightage Guidelines'],
  },
  {
    id: 'chem-teachers-guide',
    nameEn: 'Teacher’s Instructional Guide',
    nameTa: 'ஆசிரியர் வழிகாட்டி நூல்',
    driveFolderId: '1s8OBk_9NhCMK_xCWBha93hyuT7uf_D_V',
    driveLink: 'https://drive.google.com/drive/folders/1s8OBk_9NhCMK_xCWBha93hyuT7uf_D_V',
    badge: 'Pedagogical Standards',
    icon: '🦯',
    colorBorder: 'border-emerald-200 hover:border-emerald-500',
    description: 'Official teacher’s instructional handbook with canonical problem proofs, methodological guides, and pedagogical problem solving.',
    fileHighlights: ['Teacher Lesson Guides', 'Model Answers', 'Pedagogical Standards'],
  },
];

// 3. PHYSICS ALL IN ONE DRIVE FOLDER & SECTIONS
export const PHYSICS_ALL_IN_ONE_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1nhSw8LLOjq_x5s5YORyBZCBy1QsIPmB8';

export const PHYSICS_SECTIONS: AcademicResourceSection[] = [
  {
    id: 'phy-theory-books',
    nameEn: 'Physics Theory Books',
    nameTa: 'பௌதிகவியல் கோட்பாட்டு நூல்கள்',
    driveFolderId: '1-wmQU75e1_olhneID8pgcMZvFLEryMLP',
    driveLink: 'https://drive.google.com/drive/folders/1-wmQU75e1_olhneID8pgcMZvFLEryMLP',
    badge: 'Units 1 to 11',
    icon: '📒',
    colorBorder: 'border-blue-200 hover:border-blue-500',
    description: 'Comprehensive theory books for mechanics, waves, fields, thermal physics, electronics, and radiation with proofs.',
    fileHighlights: ['Units 01–11 Comprehensive Notes', 'Mathematical Derivations', 'Formula Proofs'],
  },
  {
    id: 'phy-practice-books',
    nameEn: 'Physics Practice Books',
    nameTa: 'பயிற்சி நூல்கள் மற்றும் கணக்கீடுகள்',
    driveFolderId: '1YjXqAONOl19SFi3jVXUgHQPPmWDqpymM',
    driveLink: 'https://drive.google.com/drive/folders/1YjXqAONOl19SFi3jVXUgHQPPmWDqpymM',
    badge: 'Workbooks & Drills',
    icon: '📕',
    colorBorder: 'border-blue-200 hover:border-blue-500',
    description: 'Extensive problem solving workbooks, numerical calculation drills, and structured essay question collections.',
    fileHighlights: ['Numerical Calculation Drills', 'Mechanics & Wave Exercises', 'Structured Problem Sets'],
  },
  {
    id: 'phy-2000-mcq',
    nameEn: '2000+ MCQ Master Bank',
    nameTa: '2000+ பல்தேர்வு வினா வங்கி',
    driveFolderId: '14odeyJC0l21WzZOFAeLI0s2Q08rP2dy9',
    driveLink: 'https://drive.google.com/drive/folders/14odeyJC0l21WzZOFAeLI0s2Q08rP2dy9',
    badge: 'Classified MCQs',
    icon: '📜',
    colorBorder: 'border-blue-200 hover:border-blue-500',
    description: 'Over 2000 classified Physics MCQs arranged unit-by-unit with step-by-step mathematical reasoning and solutions.',
    fileHighlights: ['2000+ Unit-wise MCQs', 'Step-by-step Math Reasoning', 'Speed Test Drills'],
  },
  {
    id: 'phy-practicals',
    nameEn: 'Practical Handbook (42 Experiments)',
    nameTa: 'செய்முறை வழிகாட்டி (42 சோதனைகள்)',
    driveFolderId: '1IWwbEQeb0A5ZQ9Yk1iDR8r7I8bs7D2CM',
    driveLink: 'https://drive.google.com/drive/folders/1IWwbEQeb0A5ZQ9Yk1iDR8r7I8bs7D2CM',
    badge: '42 Mandatory Practicals',
    icon: '📕',
    colorBorder: 'border-blue-200 hover:border-blue-500',
    description: 'Complete guide for 42 mandatory physics experiments, graph plotting, error percentage calculations, and apparatus handling.',
    fileHighlights: ['All 42 Mandatory Experiments', 'Graph Plotting Rules', 'Error Percentage Formulas'],
  },
  {
    id: 'phy-resource-books',
    nameEn: 'Official Resource Books (NIE)',
    nameTa: 'தேசிய கல்வி நிறுவகம் (NIE) வள நூல்கள்',
    driveFolderId: '1mVbBtT1ahnPKJOxAvd0WfzjSPiSk2RVu',
    driveLink: 'https://drive.google.com/drive/folders/1mVbBtT1ahnPKJOxAvd0WfzjSPiSk2RVu',
    badge: 'Official NIE Handbooks',
    icon: '📚',
    colorBorder: 'border-blue-200 hover:border-blue-500',
    description: 'National Institute of Education (NIE) Physics curriculum resource books, standard SI definitions, and teacher guidance notes.',
    fileHighlights: ['NIE Resource Textbooks', 'SI Units & Standards', 'Official Equations'],
  },
  {
    id: 'phy-elaboration',
    nameEn: 'Elaboration Guide',
    nameTa: 'விளக்கக் கையேடு',
    driveFolderId: '1gKXXC1Vr85MjihwYVTwS0ewEJOtNPNG1',
    driveLink: 'https://drive.google.com/drive/folders/1gKXXC1Vr85MjihwYVTwS0ewEJOtNPNG1',
    badge: 'Marking Elaborations',
    icon: '📓',
    colorBorder: 'border-blue-200 hover:border-blue-500',
    description: 'In-depth elaborations on national marking criteria, physics concept definitions, and examiner expectations.',
    fileHighlights: ['Marking Scheme Commentary', 'Concept Clarifications', 'Examiner Commentary'],
  },
  {
    id: 'phy-seminars',
    nameEn: 'Support Seminar Papers',
    nameTa: 'கருத்தரங்கு வினாத்தாள்கள்',
    driveFolderId: '1HReBgEPtLl_cTG9VHr4BXEVeyVW36H5s',
    driveLink: 'https://drive.google.com/drive/folders/1HReBgEPtLl_cTG9VHr4BXEVeyVW36H5s',
    badge: 'Revision Seminars',
    icon: '🔖',
    colorBorder: 'border-blue-200 hover:border-blue-500',
    description: 'Provincial and national revision seminar papers, review worksheets, and targeted examination problems.',
    fileHighlights: ['Provincial Revision Papers', 'Discussion Worksheets', 'Exam Preparation Topics'],
  },
  {
    id: 'phy-syllabus',
    nameEn: 'Official Syllabus Guide',
    nameTa: 'பாடத்திட்ட வழிகாட்டி',
    driveFolderId: '13rCJj41EvlVZUYMrFaUSk6UfcpIqUtV5',
    driveLink: 'https://drive.google.com/drive/folders/13rCJj41EvlVZUYMrFaUSk6UfcpIqUtV5',
    badge: 'Curriculum Standards',
    icon: '🗺️',
    colorBorder: 'border-blue-200 hover:border-blue-500',
    description: 'National Institute of Education (NIE) official Physics syllabus framework, learning competencies, and practical requirements.',
    fileHighlights: ['Curriculum Framework', 'Syllabus Competency Matrix', 'Weightage Guidelines'],
  },
  {
    id: 'phy-teachers-guide',
    nameEn: 'Teacher’s Instructional Guide',
    nameTa: 'ஆசிரியர் வழிகாட்டி நூல்',
    driveFolderId: '1biBDRENibS13kBzkTUNe5hPRzdpH3mgH',
    driveLink: 'https://drive.google.com/drive/folders/1biBDRENibS13kBzkTUNe5hPRzdpH3mgH',
    badge: 'Pedagogical Standards',
    icon: '🦯',
    colorBorder: 'border-blue-200 hover:border-blue-500',
    description: 'Teacher’s instructional handbook with canonical problem proofs, methodological guides, and pedagogical problem solving.',
    fileHighlights: ['Teacher Lesson Guides', 'Model Answers', 'Pedagogical Standards'],
  },
];

// 4. COMBINED MATHS ALL IN ONE DRIVE FOLDER & SECTIONS
export const COMBINED_MATHS_ALL_IN_ONE_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/14owYWOpE4zMkex49JEG9OvPqebNV4jBy';

export const COMBINED_MATHS_SECTIONS: AcademicResourceSection[] = [
  {
    id: 'maths-practice-books',
    nameEn: 'Practice Books & Problem Sets',
    nameTa: 'பயிற்சி நூல்கள் மற்றும் செயலட்டைகள்',
    driveFolderId: '1wHxCbxzREyVQR8503yYsvgmBhgW3PBBQ',
    driveLink: 'https://drive.google.com/drive/folders/1wHxCbxzREyVQR8503yYsvgmBhgW3PBBQ',
    badge: 'Workbooks & Drills',
    icon: '📕',
    colorBorder: 'border-purple-200 hover:border-purple-500',
    description: 'Structured exercise workbooks, classified problem sets, and unit-by-unit drill questions for Pure and Applied Mathematics.',
    fileHighlights: ['Pure Maths Problem Sets', 'Applied Mechanics Worksheets', 'Structured Practice Modules'],
  },
  {
    id: 'maths-support-seminar',
    nameEn: 'Support Seminar Papers',
    nameTa: 'கருத்தரங்கு வினாத்தாள்கள்',
    driveFolderId: '17bklvz7UZsSybQiaxhOsu6KNvKiKU4B0',
    driveLink: 'https://drive.google.com/drive/folders/17bklvz7UZsSybQiaxhOsu6KNvKiKU4B0',
    badge: 'Revision Seminars',
    icon: '🔖',
    colorBorder: 'border-purple-200 hover:border-purple-500',
    description: 'Ministry and Provincial education department revision seminar papers and discussion questions for upcoming A/L candidates.',
    fileHighlights: ['Provincial Revision Papers', 'Discussion Worksheets', 'Exam Preparation Topics'],
  },
  {
    id: 'maths-syllabus-guide',
    nameEn: 'Official Syllabus Guide',
    nameTa: 'பாடத்திட்ட வழிகாட்டி',
    driveFolderId: '1b3_pdjrssbYv8br5req3uljzAlDO5zU8',
    driveLink: 'https://drive.google.com/drive/folders/1b3_pdjrssbYv8br5req3uljzAlDO5zU8',
    badge: 'Curriculum Standards',
    icon: '🗺️',
    colorBorder: 'border-purple-200 hover:border-purple-500',
    description: 'National Institute of Education (NIE) official Combined Mathematics syllabus framework, learning competencies, and subject guide.',
    fileHighlights: ['Curriculum Framework', 'Syllabus Competency Matrix', 'Weightage Guidelines'],
  },
  {
    id: 'maths-teachers-guide',
    nameEn: 'Teacher’s Instructional Guide',
    nameTa: 'ஆசிரியர் வழிகாட்டி நூல்',
    driveFolderId: '118wzikV-oMle7MNaikK5ceUf0EeX4JAG',
    driveLink: 'https://drive.google.com/drive/folders/118wzikV-oMle7MNaikK5ceUf0EeX4JAG',
    badge: 'Pedagogical Standards',
    icon: '🦯',
    colorBorder: 'border-purple-200 hover:border-purple-500',
    description: 'Teacher’s instructional handbook with canonical problem proofs, methodological guides, and pedagogical problem solving.',
    fileHighlights: ['Canonical Theorem Proofs', 'Teacher Method Guides', 'Model Classroom Exercises'],
  },
  {
    id: 'maths-useful-books',
    nameEn: 'Useful Reference Books',
    nameTa: 'பயனுள்ள கணித நூல்கள்',
    driveFolderId: '1-iDPOvk_jSwQ5TumDaVrmJCGGsdAxTgF',
    driveLink: 'https://drive.google.com/drive/folders/1-iDPOvk_jSwQ5TumDaVrmJCGGsdAxTgF',
    badge: 'Reference Library',
    icon: '📚',
    colorBorder: 'border-purple-200 hover:border-purple-500',
    description: 'Curated collection of standard textbooks, formula reference manuals, and academic compendiums for Sri Lankan A/L students.',
    fileHighlights: ['Standard Pure Maths Texts', 'Applied Mechanics Handbooks', 'Key Formula Compendiums'],
  },
];

export interface SubjectFolderConfig {
  id: string;
  name: string;
  fullName: string;
  nameTa: string;
  icon: React.ComponentType<{ className?: string }>;
  colorTheme: 'rose' | 'blue' | 'emerald' | 'purple';
  driveLink: string;
  sections: AcademicResourceSection[];
  summaryTa: string;
}

export const SUBJECTS_CONFIG: SubjectFolderConfig[] = [
  {
    id: 'biology',
    name: 'Biology',
    fullName: 'G.C.E. (A/L) Biology',
    nameTa: 'உயிரியல்',
    icon: Dna,
    colorTheme: 'rose',
    driveLink: BIOLOGY_ALL_IN_ONE_DRIVE_FOLDER,
    sections: BIOLOGY_SECTIONS,
    summaryTa: 'கோட்பாட்டு நூல்கள், NIE வள நூல்கள், பல்தேர்வு வினாக்கள், செய்முறை வழிகாட்டி',
  },
  {
    id: 'physics',
    name: 'Physics',
    fullName: 'G.C.E. (A/L) Physics',
    nameTa: 'பௌதிகவியல்',
    icon: Atom,
    colorTheme: 'blue',
    driveLink: PHYSICS_ALL_IN_ONE_DRIVE_FOLDER,
    sections: PHYSICS_SECTIONS,
    summaryTa: 'கோட்பாட்டு நூல்கள், 42 செய்முறைகள் வழிகாட்டி, 2000+ MCQs, அலகு குறிப்புகள்',
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    fullName: 'G.C.E. (A/L) Chemistry',
    nameTa: 'இரசாயனவியல்',
    icon: FlaskConical,
    colorTheme: 'emerald',
    driveLink: CHEMISTRY_ALL_IN_ONE_DRIVE_FOLDER,
    sections: CHEMISTRY_SECTIONS,
    summaryTa: 'கோட்பாட்டு நூல்கள், பயிற்சி நூல்கள், தரம் பார்த்தல், 2000+ MCQs, NIE நூல்கள்',
  },
  {
    id: 'c-maths',
    name: 'Combined Maths',
    fullName: 'G.C.E. (A/L) Combined Mathematics',
    nameTa: 'இணைந்த கணிதம்',
    icon: Calculator,
    colorTheme: 'purple',
    driveLink: COMBINED_MATHS_ALL_IN_ONE_DRIVE_FOLDER,
    sections: COMBINED_MATHS_SECTIONS,
    summaryTa: 'தூய மற்றும் பிரயோக கணிதம், பயிற்சி நூல்கள், கருத்தரங்கு வினாக்கள், பாடத்திட்ட வழிகாட்டி',
  },
];

interface ResourcesFoldersViewProps {
  selectedSubject?: string;
  onSelectSubject?: (subjId: string) => void;
  resources?: PaperResource[];
  onPreview?: (res: PaperResource, mode?: 'paper' | 'scheme') => void;
  isBookmarked?: (id: string) => boolean;
  onToggleBookmark?: (id: string) => void;
  vaultDriveLinks?: Record<string, string>;
}

export const ResourcesFoldersView: React.FC<ResourcesFoldersViewProps> = ({
  selectedSubject = 'all',
  onSelectSubject,
  resources = [],
  onPreview,
  isBookmarked,
  onToggleBookmark,
  vaultDriveLinks = {},
}) => {
  // Current active subject (null = viewing the 4 main subject folders)
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(() => {
    if (selectedSubject && selectedSubject !== 'all') {
      return selectedSubject;
    }
    return null;
  });

  // Search query within the opened subject
  const [searchQuery, setSearchQuery] = useState('');

  // Copied link toast indicator
  const [copiedLink, setCopiedLink] = useState(false);

  const effectiveSubjectsConfig = useMemo(() => {
    return SUBJECTS_CONFIG.map((s) => ({
      ...s,
      driveLink: vaultDriveLinks[s.id] || s.driveLink,
    }));
  }, [vaultDriveLinks]);

  const activeSubject = useMemo(() => {
    return effectiveSubjectsConfig.find((s) => s.id === activeSubjectId) || null;
  }, [effectiveSubjectsConfig, activeSubjectId]);

  const handleOpenSubject = (subjectId: string) => {
    playRoboticFolder();
    setActiveSubjectId(subjectId);
    setSearchQuery('');
    if (onSelectSubject) {
      onSelectSubject(subjectId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAllSubjects = () => {
    playRoboticClick();
    setActiveSubjectId(null);
    setSearchQuery('');
    if (onSelectSubject) {
      onSelectSubject('all');
    }
  };

  const handleOpenSubjectPreview = (subj: SubjectFolderConfig) => {
    playRoboticClick();
    if (onPreview) {
      const resourceId = `res-${subj.id === 'c-maths' ? 'cmaths' : subj.id.slice(0, 3)}-all-in-one`;
      const stream = subj.id === 'biology' ? 'bio' : subj.id === 'c-maths' ? 'maths' : 'all';
      const paperRes: PaperResource = {
        id: resourceId,
        titleEn: `${subj.name}: All in one resource`,
        titleTa: `${subj.nameTa}: All in one resource (முழுமையான வளங்கள்)`,
        category: 'theory-notes',
        stream: stream as 'bio' | 'maths' | 'all',
        subjectId: subj.id,
        subjectNameEn: subj.name,
        subjectNameTa: subj.nameTa,
        year: 2025,
        schoolOrSource: `${subj.fullName} Resource Panel`,
        districtOrProvince: 'All Island Master Repository',
        driveLink: subj.driveLink,
        fileSize: 'Google Drive Master Folder',
        downloadsCount: 19500,
        unitOrTopic: `All in one resource: Complete ${subj.name} Examination Papers, Theory Books, Practice Drills & NIE Resource Books`,
      };
      onPreview(paperRes, 'paper');
    } else {
      window.open(subj.driveLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyLink = (link: string) => {
    playRoboticClick();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getSubjectResourceId = (subjId: string) => {
    if (subjId === 'c-maths') return 'res-cmaths-all-in-one';
    if (subjId === 'biology') return 'res-bio-all-in-one';
    if (subjId === 'physics') return 'res-phy-all-in-one';
    if (subjId === 'chemistry') return 'res-chem-all-in-one';
    return `res-${subjId}-all-in-one`;
  };

  const getThemeStyles = (color: SubjectFolderConfig['colorTheme']) => {
    switch (color) {
      case 'rose':
        return {
          bannerGrad: 'from-rose-950 via-slate-900 to-slate-950 border-rose-500/30',
          badgeText: 'text-rose-700 bg-rose-50 border-rose-200',
          btnPrimary: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30',
          accentText: 'text-rose-600',
          folderIconBg: 'bg-rose-50 border-rose-200/80 text-rose-600',
          fillFolder: 'fill-rose-300 text-rose-500',
          cardHover: 'hover:border-rose-400',
        };
      case 'blue':
        return {
          bannerGrad: 'from-blue-950 via-slate-900 to-slate-950 border-blue-500/30',
          badgeText: 'text-blue-700 bg-blue-50 border-blue-200',
          btnPrimary: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30',
          accentText: 'text-blue-600',
          folderIconBg: 'bg-blue-50 border-blue-200/80 text-blue-600',
          fillFolder: 'fill-blue-300 text-blue-500',
          cardHover: 'hover:border-blue-400',
        };
      case 'emerald':
        return {
          bannerGrad: 'from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/30',
          badgeText: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          btnPrimary: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30',
          accentText: 'text-emerald-600',
          folderIconBg: 'bg-emerald-50 border-emerald-200/80 text-emerald-600',
          fillFolder: 'fill-emerald-300 text-emerald-500',
          cardHover: 'hover:border-emerald-400',
        };
      case 'purple':
      default:
        return {
          bannerGrad: 'from-purple-950 via-slate-900 to-slate-950 border-purple-500/30',
          badgeText: 'text-purple-700 bg-purple-50 border-purple-200',
          btnPrimary: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30',
          accentText: 'text-purple-600',
          folderIconBg: 'bg-purple-50 border-purple-200/80 text-purple-600',
          fillFolder: 'fill-purple-300 text-purple-500',
          cardHover: 'hover:border-purple-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Navigation & Interactive Breadcrumb Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5">
            {/* Interactive Breadcrumb Hierarchy */}
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300 flex-wrap">
              <button
                onClick={handleBackToAllSubjects}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15"
              >
                <Library className="w-3.5 h-3.5" />
                <span>Resources</span>
              </button>

              {activeSubject && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="px-2.5 py-1 rounded-lg bg-white/15 text-white font-extrabold flex items-center gap-1.5">
                    <span>{activeSubject.name}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/25 text-sky-200 border border-blue-400/40 font-black flex items-center gap-1.5">
                    <FolderArchive className="w-3.5 h-3.5 text-sky-300" />
                    <span>All in one resource</span>
                  </span>
                </>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeSubject
                ? `${activeSubject.name} — All in one resource`
                : 'Academic Resource Folders (All in One Vaults)'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {activeSubject
                ? `Official G.C.E. (A/L) ${activeSubject.fullName} Master Resource Repository. All past papers, theory books, practice drills, and NIE guides in one verified Google Drive archive.`
                : 'Access 4 unified All-in-One master archives for Biology, Physics, Chemistry, and Combined Mathematics. Touch any subject below to enter:'}
            </p>
          </div>

          {/* Action Buttons in Banner */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0 flex-wrap">
            {activeSubject && (
              <>
                <button
                  onClick={handleBackToAllSubjects}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to 4 Subjects</span>
                </button>

                <a
                  href={activeSubject.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playRoboticClick()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/30 active:scale-95"
                  title="Open Official Google Drive Archive"
                >
                  <span>Open Drive Folder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* LEVEL 1: The 4 Big Main Subject Folders (When no subject is selected) */}
      {!activeSubject && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Core Subject Archives (4 Subjects)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Click a folder to view internal folders</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {effectiveSubjectsConfig.map((subj) => {
              const Icon = subj.icon;
              const styles = getThemeStyles(subj.colorTheme);

              return (
                <div
                  key={subj.id}
                  onClick={() => handleOpenSubject(subj.id)}
                  className={`bg-white rounded-3xl border border-slate-200/90 ${styles.cardHover} p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1 relative select-none`}
                >
                  <div>
                    {/* Folder Header Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-2xl ${styles.folderIconBg} border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                          <Folder className={`w-9 h-9 ${styles.fillFolder}`} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <span className={`text-[11px] font-black px-3 py-1 rounded-full border flex items-center gap-1 shadow-2xs ${styles.badgeText}`}>
                        <Sparkles className="w-3 h-3" />
                        <span>All in one resource</span>
                      </span>
                    </div>

                    {/* Subject Title */}
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-0.5">
                      {subj.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 mb-1">
                      {subj.nameTa}
                    </p>
                    <p className="text-[11px] text-slate-400 mb-3">
                      {subj.fullName}
                    </p>

                    <div className="text-[11px] text-slate-500 space-y-1.5 mb-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <FolderArchive className={`w-3.5 h-3.5 ${styles.accentText} shrink-0`} />
                        <span>{subj.sections.length} Academic Resource Folders</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {subj.summaryTa}
                      </p>
                    </div>
                  </div>

                  {/* Open Folder Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-xs font-bold ${styles.accentText} group-hover:underline flex items-center gap-1`}>
                      <span>Open {subj.name} Vault</span>
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-600 flex items-center justify-center transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEVEL 2: Inside ANY of the 4 Subjects - Dedicated "All in one resource" Vault */}
      {activeSubject && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider">
                  Master Repository
                </span>
                <span className="text-xs text-slate-400 font-medium">{activeSubject.fullName}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <span>{activeSubject.name}: All in one resource</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete A/L {activeSubject.name} archive uploaded from official Google Drive storage.
              </p>
            </div>

            <button
              onClick={handleBackToAllSubjects}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to 4 Subjects</span>
            </button>
          </div>

          {/* Big Featured All-in-One Resource Hero Card */}
          {(() => {
            const styles = getThemeStyles(activeSubject.colorTheme);
            const resourceId = getSubjectResourceId(activeSubject.id);
            const isSubjBookmarked = isBookmarked ? isBookmarked(resourceId) : false;

            return (
              <div className={`bg-gradient-to-br ${styles.bannerGrad} text-white rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-4 sm:gap-5">
                      <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform text-white">
                        <FolderArchive className="w-10 h-10" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>All in one resource</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                            Google Drive Cloud
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified 2025</span>
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          {activeSubject.name}: All in one resource
                        </h2>
                        <p className="text-slate-200 text-sm font-semibold">
                          {activeSubject.nameTa}: All in one resource (முழுமையான வளக் களஞ்சியம்)
                        </p>

                        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed pt-1">
                          Comprehensive, verified master folder containing all {activeSubject.name} requirements in one place:
                          past examination papers, unit theory books, practice drill modules, NIE resource handbooks, practical guides,
                          and revision seminar worksheets.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                      <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        <span>Past Papers</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Authentic national papers & scoring criteria
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Theory Books</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Unit-by-unit syllabus notes & derivations
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                      <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>2000+ MCQs</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Classified question banks with step keys
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                      <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                        <Library className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Practicals & NIE</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Curriculum handbooks & laboratory guides
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
                    <a
                      href={activeSubject.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playRoboticClick()}
                      className={`px-5 py-3 rounded-2xl ${styles.btnPrimary} text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open All in one resource (Google Drive)</span>
                    </a>

                    <button
                      onClick={() => handleOpenSubjectPreview(activeSubject)}
                      className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs active:scale-95"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Browse in App Viewer</span>
                    </button>

                    {onToggleBookmark && (
                      <button
                        onClick={() => {
                          playRoboticClick();
                          onToggleBookmark(resourceId);
                        }}
                        className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                          isSubjBookmarked
                            ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-md shadow-amber-400/20'
                            : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSubjBookmarked ? 'fill-current' : ''}`} />
                        <span>{isSubjBookmarked ? 'Bookmarked in Account' : 'Bookmark Resource'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyLink(activeSubject.driveLink)}
                      className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 ml-auto"
                      title="Copy Google Drive URL"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Drive Link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Clean Academic Sections Grid (No third-party branding) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>{activeSubject.name} Syllabus Sections ({activeSubject.sections.length} Resource Folders)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore organized examination papers, theory books, practice problem sets, syllabus guides, and reference material.
                </p>
              </div>

              {/* Quick Filter */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Filter ${activeSubject.name} folders...`}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {activeSubject.sections.filter((sec) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  sec.nameEn.toLowerCase().includes(q) ||
                  sec.nameTa.toLowerCase().includes(q) ||
                  sec.description.toLowerCase().includes(q) ||
                  sec.fileHighlights.some((h) => h.toLowerCase().includes(q))
                );
              }).map((sec) => {
                return (
                  <div
                    key={sec.id}
                    className={`bg-white rounded-3xl border ${sec.colorBorder} p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1.5 relative select-none`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-2xs">
                          {sec.icon}
                        </div>

                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                          {sec.badge}
                        </span>
                      </div>

                      {/* Folder Title */}
                      <h4 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-0.5 leading-snug">
                        {sec.nameEn}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-600 mb-2.5">
                        {sec.nameTa}
                      </p>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                        {sec.description}
                      </p>

                      {/* File highlights */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 mb-4">
                        {sec.fileHighlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span className="truncate">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <a
                        href={sec.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playRoboticClick()}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>Open Folder</span>
                      </a>

                      <a
                        href={sec.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playRoboticClick()}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Uploaded Academic Notes & Booklets for this Subject */}
            {(() => {
              const customForSubj = resources.filter((r) => 
                r.subjectId === activeSubject.id || 
                (r.subjectNameEn && r.subjectNameEn.toLowerCase().includes(activeSubject.name.toLowerCase()))
              );
              if (customForSubj.length === 0) return null;

              return (
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Uploaded {activeSubject.name} Notes & Master Materials ({customForSubj.length})</span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {customForSubj.map((res) => (
                      <div key={res.id} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 line-clamp-2">{res.titleEn}</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold shrink-0">{res.year || 2025}</span>
                        </div>
                        {res.schoolOrSource && (
                          <p className="text-[11px] text-slate-500 truncate">{res.schoolOrSource}</p>
                        )}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <a
                            href={res.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Drive</span>
                          </a>
                          {onPreview && (
                            <button
                              onClick={() => onPreview(res, 'paper')}
                              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                              title="Preview in App"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
