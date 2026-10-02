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
  Inbox,
  BookOpen,
  Download,
  Eye,
  Bookmark,
  Library,
  BookMarked,
  CheckCircle2,
  HelpCircle,
  FileText,
  FolderArchive,
  Copy,
  Check
} from 'lucide-react';
import { PaperResource } from '../types';
import { playRoboticFolder, playRoboticClick } from '../utils/audio';

export interface ResourceFileItem {
  id: string;
  unitNumber?: number;
  unitCode: string;
  unitName: string;
  fileName: string;
  title: string;
  driveLink: string;
  fileSize: string;
  description: string;
  categoryType: 'theory-notes' | 'resource-books' | 'mcq-bank';
}

export const SHARED_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1DZXNESgHI6fFqDAU_kOuSNmeXiP6sgXo';

// OFFICIAL COMBINED MATHS ALL IN ONE RESOURCE GOOGLE DRIVE FOLDER
export const COMBINED_MATHS_ALL_IN_ONE_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/14owYWOpE4zMkex49JEG9OvPqebNV4jBy';

export interface MathsResourceSection {
  id: string;
  nameEn: string;
  nameTa: string;
  driveFolderId: string;
  driveLink: string;
  badge: string;
  icon: string;
  colorBorder: string;
  bgGrad: string;
  description: string;
  fileHighlights: string[];
}

export const COMBINED_MATHS_SECTIONS: MathsResourceSection[] = [
  {
    id: 'past-papers',
    nameEn: 'Past Papers Archive',
    nameTa: 'கடந்த கால வினாத்தாள்கள்',
    driveFolderId: '1wg8CEnUOVaMUowEIENBCWQw659JguuJ1',
    driveLink: 'https://drive.google.com/drive/folders/1wg8CEnUOVaMUowEIENBCWQw659JguuJ1',
    badge: 'Official Past Papers',
    icon: '📑',
    colorBorder: 'border-blue-200 hover:border-blue-500',
    bgGrad: 'from-blue-50/50 to-white',
    description: 'Complete G.C.E. (A/L) Combined Mathematics national examination question papers with official step-by-step marking schemes.',
    fileHighlights: ['Official Question Papers', 'Marking Schemes', 'Paper 1 & Paper 2'],
  },
  {
    id: 'fwc-papers',
    nameEn: 'FWC Examination Papers',
    nameTa: 'தொண்டைமானாறு கள வினாத்தாள்கள்',
    driveFolderId: '1l63Okm5S_i0meQ6oPu_TVyzs84vCXvPG',
    driveLink: 'https://drive.google.com/drive/folders/1l63Okm5S_i0meQ6oPu_TVyzs84vCXvPG',
    badge: 'Terms 1 to 6',
    icon: '📄',
    colorBorder: 'border-amber-200 hover:border-amber-500',
    bgGrad: 'from-amber-50/50 to-white',
    description: 'Field Work Centre (FWC) Thondaimanaru term evaluation papers and step-by-step solutions for Grade 12 & Grade 13.',
    fileHighlights: ['FWC Terms 1–6 Papers', 'Step-by-Step Solutions', 'Final Pilot Exams'],
  },
  {
    id: 'moratuwa-papers',
    nameEn: 'Moratuwa University Model Papers',
    nameTa: 'மொறட்டுவ பல்கலைக்கழக மாதிரி வினாத்தாள்கள்',
    driveFolderId: '1mTde-mYzreBYJWKP3aQx6z-dznYw5PvD',
    driveLink: 'https://drive.google.com/drive/folders/1mTde-mYzreBYJWKP3aQx6z-dznYw5PvD',
    badge: 'University Pilot Exams',
    icon: '🗞️',
    colorBorder: 'border-purple-200 hover:border-purple-500',
    bgGrad: 'from-purple-50/50 to-white',
    description: 'High-standard pilot and trial examination papers prepared by University of Moratuwa mathematics educators with detailed solutions.',
    fileHighlights: ['Pilot Exam Papers', 'Standardized Model Schemes', 'Advanced Scoring Breakdowns'],
  },
  {
    id: 'practice-books',
    nameEn: 'Practice Books & Problem Sets',
    nameTa: 'பயிற்சி நூல்கள் மற்றும் செயலட்டைகள்',
    driveFolderId: '1wHxCbxzREyVQR8503yYsvgmBhgW3PBBQ',
    driveLink: 'https://drive.google.com/drive/folders/1wHxCbxzREyVQR8503yYsvgmBhgW3PBBQ',
    badge: 'Workbooks & Drills',
    icon: '📕',
    colorBorder: 'border-rose-200 hover:border-rose-500',
    bgGrad: 'from-rose-50/50 to-white',
    description: 'Structured exercise workbooks, classified problem sets, and unit-by-unit drill questions for Pure and Applied Mathematics.',
    fileHighlights: ['Pure Maths Problem Sets', 'Applied Mechanics Worksheets', 'Structured Practice Modules'],
  },
  {
    id: 'support-seminar',
    nameEn: 'Support Seminar Papers',
    nameTa: 'கருத்தரங்கு வினாத்தாள்கள்',
    driveFolderId: '17bklvz7UZsSybQiaxhOsu6KNvKiKU4B0',
    driveLink: 'https://drive.google.com/drive/folders/17bklvz7UZsSybQiaxhOsu6KNvKiKU4B0',
    badge: 'Revision Seminars',
    icon: '🔖',
    colorBorder: 'border-emerald-200 hover:border-emerald-500',
    bgGrad: 'from-emerald-50/50 to-white',
    description: 'Ministry and Provincial education department revision seminar papers and discussion questions for upcoming A/L candidates.',
    fileHighlights: ['Provincial Revision Papers', 'Discussion Worksheets', 'Exam Preparation Topics'],
  },
  {
    id: 'syllabus-guide',
    nameEn: 'Official Syllabus Guide',
    nameTa: 'பாடத்திட்ட வழிகாட்டி',
    driveFolderId: '1b3_pdjrssbYv8br5req3uljzAlDO5zU8',
    driveLink: 'https://drive.google.com/drive/folders/1b3_pdjrssbYv8br5req3uljzAlDO5zU8',
    badge: 'Curriculum Standards',
    icon: '🗺️',
    colorBorder: 'border-cyan-200 hover:border-cyan-500',
    bgGrad: 'from-cyan-50/50 to-white',
    description: 'National Institute of Education (NIE) official Combined Mathematics syllabus framework, learning competencies, and subject guide.',
    fileHighlights: ['Curriculum Framework', 'Syllabus Competency Matrix', 'Weightage Guidelines'],
  },
  {
    id: 'teachers-guide',
    nameEn: 'Teacher’s Instructional Guide',
    nameTa: 'ஆசிரியர் வழிகாட்டி நூல்',
    driveFolderId: '118wzikV-oMle7MNaikK5ceUf0EeX4JAG',
    driveLink: 'https://drive.google.com/drive/folders/118wzikV-oMle7MNaikK5ceUf0EeX4JAG',
    badge: 'Pedagogical Standards',
    icon: '🦯',
    colorBorder: 'border-indigo-200 hover:border-indigo-500',
    bgGrad: 'from-indigo-50/50 to-white',
    description: 'Teacher’s instructional handbook with canonical problem proofs, methodological guides, and pedagogical problem solving.',
    fileHighlights: ['Canonical Theorem Proofs', 'Teacher Method Guides', 'Model Classroom Exercises'],
  },
  {
    id: 'useful-books',
    nameEn: 'Useful Reference Books',
    nameTa: 'பயனுள்ள கணித நூல்கள்',
    driveFolderId: '1-iDPOvk_jSwQ5TumDaVrmJCGGsdAxTgF',
    driveLink: 'https://drive.google.com/drive/folders/1-iDPOvk_jSwQ5TumDaVrmJCGGsdAxTgF',
    badge: 'Reference Library',
    icon: '📚',
    colorBorder: 'border-slate-300 hover:border-slate-600',
    bgGrad: 'from-slate-50 to-white',
    description: 'Curated collection of standard textbooks, formula reference manuals, and academic compendiums for Sri Lankan A/L students.',
    fileHighlights: ['Standard Pure Maths Texts', 'Applied Mechanics Handbooks', 'Key Formula Compendiums'],
  },
];

export const COMBINED_MATHS_ALL_IN_ONE_RESOURCE: PaperResource = {
  id: 'res-cmaths-all-in-one',
  titleEn: 'Combined Mathematics: All in one resource',
  titleTa: 'இணைந்த கணிதம்: All in one resource (முழுமையான வளங்கள்)',
  category: 'theory-notes',
  stream: 'maths',
  subjectId: 'c-maths',
  subjectNameEn: 'Combined Mathematics',
  subjectNameTa: 'இணைந்த கணிதம்',
  year: 2025,
  schoolOrSource: 'A/L Combined Mathematics Resource Panel',
  schoolOrSourceTa: 'உயர்தர இணைந்த கணித வளக் குழு',
  districtOrProvince: 'All Island Master Repository',
  driveLink: COMBINED_MATHS_ALL_IN_ONE_DRIVE_FOLDER,
  fileSize: 'Google Drive Master Folder',
  isPopular: true,
  downloadsCount: 18500,
  unitOrTopic: 'All in one resource: Pure Mathematics, Applied Mathematics, Theory Notes, Formulas & Question Vaults',
};

// 1. BIOLOGY THEORY NOTES (Uploaded files from Google Drive)
export const BIOLOGY_THEORY_NOTES: ResourceFileItem[] = [
  {
    id: 'bio-theory-unit-2',
    unitNumber: 2,
    unitCode: 'Unit 02',
    unitName: 'Chemical and Cellular Basis of Life',
    fileName: 'Biology - Unit 2 - Notes.pdf',
    title: 'Biology Unit 2: Chemical & Cellular Basis of Life (Theory Notes)',
    driveLink: 'https://drive.google.com/file/d/11MyQugt0M_8Of7Y2n8xn4aK7zTXdzM5q/view',
    fileSize: '3.4 MB',
    description: 'Biomolecules, water properties, cell organelles, cell division (mitosis & meiosis), enzymes and cellular metabolism.',
    categoryType: 'theory-notes',
  },
  {
    id: 'bio-theory-unit-3',
    unitNumber: 3,
    unitCode: 'Unit 03',
    unitName: 'Evolution and Diversity of Organisms',
    fileName: 'Biology - Unit 3 - Notes.pdf',
    title: 'Biology Unit 3: Evolution & Diversity of Organisms (Theory Notes)',
    driveLink: 'https://drive.google.com/file/d/1TfN4L7I8HOxoyvo6wzPwdl1kzF_N010R/view',
    fileSize: '4.8 MB',
    description: 'Five kingdoms, three domains, plant divisions, animal phyla, chordate classification and evolutionary adaptations.',
    categoryType: 'theory-notes',
  },
  {
    id: 'bio-theory-unit-4',
    unitNumber: 4,
    unitCode: 'Unit 04',
    unitName: 'Plant Form and Function',
    fileName: 'Biology - Unit 4 - Notes.pdf',
    title: 'Biology Unit 4: Plant Form & Function (Theory Notes)',
    driveLink: 'https://drive.google.com/file/d/17_wUyX3TGSqHWP2jD53qJ88hNvGvG1-i/view',
    fileSize: '3.5 MB',
    description: 'Plant tissues, xylem water transport, transpiration, phloem translocation, C3/C4/CAM photosynthesis and plant hormones.',
    categoryType: 'theory-notes',
  },
  {
    id: 'bio-theory-unit-5',
    unitNumber: 5,
    unitCode: 'Unit 05',
    unitName: 'Animal Form and Function',
    fileName: 'Biology - Unit 5 - Animal Notes.pdf',
    title: 'Biology Unit 5: Animal Form & Human Physiology (Theory Notes)',
    driveLink: 'https://drive.google.com/file/d/1euHWqaIRCd-jUsAtgrxUs1UqrSHF-xtl/view',
    fileSize: '10.2 MB',
    description: 'Human digestion, circulatory and immune systems, respiratory gas exchange, kidney osmoregulation, neural coordination and endocrine control.',
    categoryType: 'theory-notes',
  },
  {
    id: 'bio-theory-unit-6',
    unitNumber: 6,
    unitCode: 'Unit 06',
    unitName: 'Genetics',
    fileName: 'Biology - Unit 6 - Genetics Notes.pdf',
    title: 'Biology Unit 6: Genetics & Principles of Inheritance (Theory Notes)',
    driveLink: 'https://drive.google.com/file/d/1SMWEagSUB6Q7u5TuBwCaVRbRWuuuAH_v/view',
    fileSize: '2.7 MB',
    description: 'Mendelian genetics, monohybrid/dihybrid crosses, sex linkage, gene interactions, polygenic traits, pedigree charts and chromosomal mutations.',
    categoryType: 'theory-notes',
  },
  {
    id: 'bio-theory-unit-7',
    unitNumber: 7,
    unitCode: 'Unit 07',
    unitName: 'Molecular Biology & Recombinant DNA',
    fileName: 'Biology - Unit 7 - Molecular Notes.pdf',
    title: 'Biology Unit 7: Molecular Biology & Recombinant DNA (Theory Notes)',
    driveLink: 'https://drive.google.com/file/d/1XeG3YEUgO-biPTfEGjtLUzSw-fQMcZpO/view',
    fileSize: '3.5 MB',
    description: 'DNA structure and replication, transcription, genetic code, translation, recombinant DNA technology, cloning vectors, PCR and gel electrophoresis.',
    categoryType: 'theory-notes',
  },
  {
    id: 'bio-theory-unit-8',
    unitNumber: 8,
    unitCode: 'Unit 08',
    unitName: 'Environmental Biology',
    fileName: 'Biology - Unit 8 - Environmental Biology.pdf',
    title: 'Biology Unit 8: Environmental Biology & Ecology (Theory Notes)',
    driveLink: 'https://drive.google.com/file/d/1fr0Nay1G6o-6CBBsvUaiqkFUMYW8ygbQ/view',
    fileSize: '3.2 MB',
    description: 'Ecosystem structure, biogeochemical cycles, ecological succession, biomes of Sri Lanka, biodiversity threats and environmental conservation laws.',
    categoryType: 'theory-notes',
  },
  {
    id: 'bio-theory-unit-9',
    unitNumber: 9,
    unitCode: 'Unit 09',
    unitName: 'Microbiology',
    fileName: 'Biology - Unit 9 - Micro Notes.pdf',
    title: 'Biology Unit 9: Microbiology (Theory Notes)',
    driveLink: 'https://drive.google.com/file/d/1MaxfjfcGb3COgSiGeG8G7S7CKyAlJ61y/view',
    fileSize: '2.9 MB',
    description: 'Microbial diversity, bacteria, viruses, fungi, culturing techniques, control of microorganisms, and infectious diseases.',
    categoryType: 'theory-notes',
  },
];

// 2. PHYSICS THEORY NOTES (Units 2 to 11)
export const PHYSICS_THEORY_NOTES: ResourceFileItem[] = [
  {
    id: 'phy-theory-unit-2',
    unitNumber: 2,
    unitCode: 'Unit 02',
    unitName: 'Mechanics',
    fileName: 'Physics - Unit 2 - Mechanics Notes.pdf',
    title: 'Physics Unit 2: Mechanics (Theory Notes)',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '4.2 MB',
    description: 'Kinematics, Newton laws, circular motion, rotational dynamics, momentum, work-energy theorem, and hydrostatics.',
    categoryType: 'theory-notes',
  },
  {
    id: 'phy-theory-unit-3',
    unitNumber: 3,
    unitCode: 'Unit 03',
    unitName: 'Oscillations and Waves',
    fileName: 'Physics - Unit 3 - Waves & Optics Notes.pdf',
    title: 'Physics Unit 3: Oscillations and Waves (Theory Notes)',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '3.8 MB',
    description: 'Simple harmonic motion, mechanical waves, acoustic resonance, Doppler effect, geometric optics, lenses, and physical wave optics.',
    categoryType: 'theory-notes',
  },
  {
    id: 'phy-theory-unit-4',
    unitNumber: 4,
    unitCode: 'Unit 04',
    unitName: 'Thermal Physics',
    fileName: 'Physics - Unit 4 - Thermal Physics Notes.pdf',
    title: 'Physics Unit 4: Thermal Physics (Theory Notes)',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '3.1 MB',
    description: 'Thermometry, expansion, calorimetry, ideal gas laws, kinetic theory of gases, thermodynamics, and thermal conductivity.',
    categoryType: 'theory-notes',
  },
  {
    id: 'phy-theory-unit-5',
    unitNumber: 5,
    unitCode: 'Unit 05',
    unitName: 'Gravitational Field',
    fileName: 'Physics - Unit 5 - Gravitational Field Notes.pdf',
    title: 'Physics Unit 5: Gravitational Field (Theory Notes)',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '2.4 MB',
    description: 'Newton law of universal gravitation, gravitational intensity, potential, orbital mechanics, geostationary satellites, and escape velocity.',
    categoryType: 'theory-notes',
  },
  {
    id: 'phy-theory-unit-6',
    unitNumber: 6,
    unitCode: 'Unit 06',
    unitName: 'Electrostatic Field',
    fileName: 'Physics - Unit 6 - Electrostatics Notes.pdf',
    title: 'Physics Unit 6: Electrostatic Field (Theory Notes)',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '3.3 MB',
    description: 'Coulomb law, electric field intensity, electric potential, Gauss theorem, parallel plate capacitors, and dielectric behavior.',
    categoryType: 'theory-notes',
  },
  {
    id: 'phy-theory-unit-7',
    unitNumber: 7,
    unitCode: 'Unit 07',
    unitName: 'Current Electricity',
    fileName: 'Physics - Unit 7 - Current Electricity Notes.pdf',
    title: 'Physics Unit 7: Current Electricity (Theory Notes)',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '3.6 MB',
    description: 'Ohm law, Kirchhoff laws, potentiometer circuits, Wheatstone bridge, internal resistance, and electrical energy dissipation.',
    categoryType: 'theory-notes',
  },
  {
    id: 'phy-theory-unit-8',
    unitNumber: 8,
    unitCode: 'Unit 08',
    unitName: 'Magnetic Field & Induction',
    fileName: 'Physics - Unit 8 - Magnetic Fields Notes.pdf',
    title: 'Physics Unit 8: Magnetic Field & Induction (Theory Notes)',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '3.7 MB',
    description: 'Lorentz force, Biot-Savart law, Ampere circuital law, Faraday and Lenz laws of electromagnetic induction, and AC circuits.',
    categoryType: 'theory-notes',
  },
  {
    id: 'phy-theory-unit-9',
    unitNumber: 9,
    unitCode: 'Unit 09',
    unitName: 'Electronics',
    fileName: 'Physics - Unit 9 - Electronics Notes.pdf',
    title: 'Physics Unit 9: Electronics (Theory Notes)',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '3.2 MB',
    description: 'Semiconductors, p-n junction diodes, rectification, bipolar transistors, operational amplifiers, and digital logic gates.',
    categoryType: 'theory-notes',
  },
  {
    id: 'phy-theory-unit-10',
    unitNumber: 10,
    unitCode: 'Unit 10',
    unitName: 'Mechanical Properties of Matter',
    fileName: 'Physics - Unit 10 - Properties of Matter Notes.pdf',
    title: 'Physics Unit 10: Mechanical Properties of Matter (Theory Notes)',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '2.8 MB',
    description: 'Elasticity, Hooke law, Young modulus, surface tension, angle of contact, capillarity, and fluid viscosity (Poiseuille formula).',
    categoryType: 'theory-notes',
  },
  {
    id: 'phy-theory-unit-11',
    unitNumber: 11,
    unitCode: 'Unit 11',
    unitName: 'Matter and Radiation',
    fileName: 'Physics - Unit 11 - Matter & Radiation Notes.pdf',
    title: 'Physics Unit 11: Matter and Radiation (Theory Notes)',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '3.5 MB',
    description: 'Photoelectric effect, Einstein photon theory, X-rays, wave-particle duality, de Broglie relation, nuclear decay, and radioactivity.',
    categoryType: 'theory-notes',
  },
];

// 3. RESOURCE BOOKS (Official NIE Handbooks)
export const BIOLOGY_RESOURCE_BOOKS: ResourceFileItem[] = [
  {
    id: 'bio-res-book-nie',
    unitCode: 'NIE Handbook',
    unitName: 'National Institute of Education (NIE) Biology Resource Book',
    fileName: 'GCE AL Biology Resource Book - NIE.pdf',
    title: 'G.C.E. (A/L) Biology Official NIE Resource Book',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '24.5 MB',
    description: 'Official National Institute of Education curriculum guide, syllabus definitions, practical experiment requirements, and standard terminology.',
    categoryType: 'resource-books',
  },
  {
    id: 'bio-res-practical-guide',
    unitCode: 'Practical Guide',
    unitName: 'A/L Biology Laboratory Practical Handbook',
    fileName: 'Biology Practical Handbook - National Guide.pdf',
    title: 'A/L Biology Laboratory Practical Handbook',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '12.8 MB',
    description: 'Comprehensive microscopic slide examinations, physiological food tests, biochemical assays, and laboratory experiment protocols.',
    categoryType: 'resource-books',
  },
];

export const PHYSICS_RESOURCE_BOOKS: ResourceFileItem[] = [
  {
    id: 'phy-res-book-nie',
    unitCode: 'NIE Handbook',
    unitName: 'National Institute of Education (NIE) Physics Resource Book',
    fileName: 'GCE AL Physics Resource Book - NIE.pdf',
    title: 'G.C.E. (A/L) Physics Official NIE Resource Book',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '28.2 MB',
    description: 'Official NIE syllabus concepts, mathematical derivations, standard SI definitions, and teacher guidance notes.',
    categoryType: 'resource-books',
  },
  {
    id: 'phy-res-practical-guide',
    unitCode: 'Practical Guide',
    unitName: 'A/L Physics Practical Experiments Handbook',
    fileName: 'Physics Practical Experiments Handbook.pdf',
    title: 'A/L Physics Practical Experiments Handbook',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '15.4 MB',
    description: 'Complete guide for 42 mandatory physics experiments, graph plotting, error percentage calculations, and apparatus handling.',
    categoryType: 'resource-books',
  },
];

// 4. 2000+ MCQ BANKS
export const BIOLOGY_MCQ_BANKS: ResourceFileItem[] = [
  {
    id: 'bio-mcq-2000-master',
    unitCode: '2000+ Bank',
    unitName: '2000+ Biology Classified MCQs Master Bank',
    fileName: 'Biology 2000+ Classified MCQs & Answer Keys.pdf',
    title: 'Biology 2000+ Classified MCQs Master Bank with Answers',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '18.6 MB',
    description: 'Complete collection of over 2000 unit-classified Multiple Choice Questions from national past papers, pilot exams, and school benchmark tests with answer keys.',
    categoryType: 'mcq-bank',
  },
  {
    id: 'bio-mcq-unit-wise',
    unitCode: 'Classified',
    unitName: 'Biology Unit-by-Unit High Yield MCQ Collection',
    fileName: 'Biology Unit-wise Classified MCQs (Units 1-10).pdf',
    title: 'Biology Unit-by-Unit Classified MCQs (Units 1 to 10)',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '14.2 MB',
    description: 'Targeted MCQ exercises organized by syllabus units with analytical step solutions and common trap explanations.',
    categoryType: 'mcq-bank',
  },
];

export const PHYSICS_MCQ_BANKS: ResourceFileItem[] = [
  {
    id: 'phy-mcq-2000-master',
    unitCode: '2000+ Bank',
    unitName: '2000+ Physics Classified MCQs Master Bank',
    fileName: 'Physics 2000+ Classified MCQs & Detailed Solutions.pdf',
    title: 'Physics 2000+ Classified MCQs Master Bank with Solutions',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '22.4 MB',
    description: 'Over 2000 high-yield Physics MCQs arranged by unit (Mechanics, Waves, Fields, Thermal, Electronics) with step-by-step mathematical reasoning.',
    categoryType: 'mcq-bank',
  },
  {
    id: 'phy-mcq-speed-drills',
    unitCode: 'Speed Tests',
    unitName: 'Physics Paper 1 50-MCQ Timed Mock Tests',
    fileName: 'Physics Paper 1 Timed 50-MCQ Mock Practice.pdf',
    title: 'Physics Paper 1 Timed 50-MCQ Mock Practice Tests',
    driveLink: SHARED_DRIVE_FOLDER,
    fileSize: '11.8 MB',
    description: 'Timed full-length 50 question MCQ mock test papers designed to master time management and exam speed under real test conditions.',
    categoryType: 'mcq-bank',
  },
];

export type SubFolderCategoryId = 'theory-notes' | 'resource-books' | 'mcq-bank';

export interface SubFolderCategoryDef {
  id: SubFolderCategoryId;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgGradient: string;
  borderColor: string;
}

export const SUB_FOLDER_CATEGORIES: SubFolderCategoryDef[] = [
  {
    id: 'theory-notes',
    title: 'Theory Notes',
    badge: 'Uploaded Syllabus Notes',
    description: 'Comprehensive unit-by-unit syllabus notes, derivations, and lecture summaries.',
    icon: BookOpen,
    accentColor: 'text-blue-600',
    bgGradient: 'from-blue-500/10 via-sky-500/5 to-white',
    borderColor: 'border-blue-200 hover:border-blue-400 group-hover:border-blue-500',
  },
  {
    id: 'resource-books',
    title: 'Resource Books',
    badge: 'Official NIE Handbooks',
    description: 'Official National Institute of Education curriculum guide books and practical experiment handbooks.',
    icon: Library,
    accentColor: 'text-emerald-600',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-white',
    borderColor: 'border-emerald-200 hover:border-emerald-400 group-hover:border-emerald-500',
  },
  {
    id: 'mcq-bank',
    title: '2000+ MCQ',
    badge: 'Classified Question Bank',
    description: 'Unit-by-unit classified Multiple Choice Questions with detailed scoring answer keys.',
    icon: Sparkles,
    accentColor: 'text-purple-600',
    bgGradient: 'from-purple-500/10 via-indigo-500/5 to-white',
    borderColor: 'border-purple-200 hover:border-purple-400 group-hover:border-purple-500',
  },
];

export interface SubjectFolderConfig {
  id: string;
  name: string;
  fullName: string;
  icon: React.ComponentType<{ className?: string }>;
  colorTheme: 'blue' | 'rose' | 'emerald' | 'purple';
  driveLink: string;
  theoryNotes: ResourceFileItem[];
  resourceBooks: ResourceFileItem[];
  mcqBanks: ResourceFileItem[];
  isAllInOne?: boolean;
}

export const SUBJECTS_CONFIG: SubjectFolderConfig[] = [
  {
    id: 'biology',
    name: 'Biology',
    fullName: 'G.C.E. (A/L) Biology',
    icon: Dna,
    colorTheme: 'rose',
    driveLink: SHARED_DRIVE_FOLDER,
    theoryNotes: BIOLOGY_THEORY_NOTES,
    resourceBooks: BIOLOGY_RESOURCE_BOOKS,
    mcqBanks: BIOLOGY_MCQ_BANKS,
  },
  {
    id: 'physics',
    name: 'Physics',
    fullName: 'G.C.E. (A/L) Physics',
    icon: Atom,
    colorTheme: 'blue',
    driveLink: SHARED_DRIVE_FOLDER,
    theoryNotes: PHYSICS_THEORY_NOTES,
    resourceBooks: PHYSICS_RESOURCE_BOOKS,
    mcqBanks: PHYSICS_MCQ_BANKS,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    fullName: 'G.C.E. (A/L) Chemistry',
    icon: FlaskConical,
    colorTheme: 'emerald',
    driveLink: 'https://drive.google.com/drive/folders/1dJjXv4nREJDzdREIYNdR9fwlv0KAlhRb',
    theoryNotes: [],
    resourceBooks: [],
    mcqBanks: [],
  },
  {
    id: 'c-maths',
    name: 'Combined Maths',
    fullName: 'G.C.E. (A/L) Combined Mathematics',
    icon: Calculator,
    colorTheme: 'purple',
    driveLink: COMBINED_MATHS_ALL_IN_ONE_DRIVE_FOLDER,
    theoryNotes: [],
    resourceBooks: [],
    mcqBanks: [],
    isAllInOne: true, // For Combined Maths only: all other folders deleted, single All in one resource
  },
];

export function convertItemToPaperResource(item: ResourceFileItem, subjectName: string, stream: 'bio' | 'maths'): PaperResource {
  return {
    id: item.id,
    titleEn: item.title,
    category: 'theory-notes',
    stream: stream,
    subjectId: subjectName.toLowerCase().includes('math') ? 'c-maths' : subjectName.toLowerCase().includes('bio') ? 'biology' : 'physics',
    subjectNameEn: subjectName,
    year: 2025,
    schoolOrSource: 'A/L Science Curriculum Resource Panel',
    districtOrProvince: 'All Island Resource',
    driveLink: item.driveLink,
    fileSize: item.fileSize,
    downloadsCount: 5800,
    unitOrTopic: `${item.unitCode}: ${item.unitName} (${item.fileName})`,
  };
}

export function getDirectDownloadUrl(driveUrl: string): string {
  const match = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return driveUrl;
}

interface ResourcesFoldersViewProps {
  selectedSubject?: string;
  onSelectSubject?: (subjId: string) => void;
  resources?: PaperResource[];
  onPreview?: (res: PaperResource, mode?: 'paper' | 'scheme') => void;
  isBookmarked?: (id: string) => boolean;
  onToggleBookmark?: (id: string) => void;
}

export const ResourcesFoldersView: React.FC<ResourcesFoldersViewProps> = ({
  selectedSubject = 'all',
  onSelectSubject,
  onPreview,
  isBookmarked,
  onToggleBookmark,
}) => {
  // Current active subject (null = viewing the 4 main subject folders)
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(() => {
    if (selectedSubject && selectedSubject !== 'all') {
      return selectedSubject;
    }
    return null;
  });

  // Current category folder within the subject: null = viewing category folders
  const [activeCategory, setActiveCategory] = useState<SubFolderCategoryId | null>(null);

  // Search query within the opened folder
  const [searchQuery, setSearchQuery] = useState('');

  // Copied link toast indicator for All in one resource
  const [copiedLink, setCopiedLink] = useState(false);

  const activeSubject = useMemo(() => {
    return SUBJECTS_CONFIG.find((s) => s.id === activeSubjectId) || null;
  }, [activeSubjectId]);

  const activeCategoryDef = useMemo(() => {
    if (!activeCategory) return null;
    return SUB_FOLDER_CATEGORIES.find((c) => c.id === activeCategory) || null;
  }, [activeCategory]);

  // Items currently displayed inside the chosen category folder
  const currentCategoryFiles = useMemo(() => {
    if (!activeSubject || !activeCategory) return [];
    if (activeCategory === 'theory-notes') return activeSubject.theoryNotes;
    if (activeCategory === 'resource-books') return activeSubject.resourceBooks;
    if (activeCategory === 'mcq-bank') return activeSubject.mcqBanks;
    return [];
  }, [activeSubject, activeCategory]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return currentCategoryFiles;
    const q = searchQuery.toLowerCase();
    return currentCategoryFiles.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.unitCode.toLowerCase().includes(q) ||
        f.unitName.toLowerCase().includes(q) ||
        f.fileName.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }, [currentCategoryFiles, searchQuery]);

  const handleOpenSubject = (subjectId: string) => {
    playRoboticFolder();
    setActiveSubjectId(subjectId);
    setActiveCategory(null);
    setSearchQuery('');
    if (onSelectSubject) {
      onSelectSubject(subjectId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAllSubjects = () => {
    playRoboticClick();
    setActiveSubjectId(null);
    setActiveCategory(null);
    setSearchQuery('');
    if (onSelectSubject) {
      onSelectSubject('all');
    }
  };

  const handleOpenCategory = (categoryId: SubFolderCategoryId) => {
    playRoboticFolder();
    setActiveCategory(categoryId);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSubjectCategories = () => {
    playRoboticClick();
    setActiveCategory(null);
    setSearchQuery('');
  };

  const handleFilePreview = (item: ResourceFileItem) => {
    playRoboticClick();
    if (onPreview && activeSubject) {
      const stream = activeSubject.id === 'biology' ? 'bio' : 'maths';
      onPreview(convertItemToPaperResource(item, activeSubject.name, stream), 'paper');
    } else {
      window.open(item.driveLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenCombinedMathsPreview = () => {
    playRoboticClick();
    if (onPreview) {
      onPreview(COMBINED_MATHS_ALL_IN_ONE_RESOURCE, 'paper');
    } else {
      window.open(COMBINED_MATHS_ALL_IN_ONE_DRIVE_FOLDER, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyMathsLink = () => {
    playRoboticClick();
    navigator.clipboard.writeText(COMBINED_MATHS_ALL_IN_ONE_DRIVE_FOLDER);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isMathsBookmarked = isBookmarked ? isBookmarked(COMBINED_MATHS_ALL_IN_ONE_RESOURCE.id) : false;

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
                  <button
                    onClick={handleBackToSubjectCategories}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeCategory
                        ? 'bg-white/10 hover:bg-white/20 text-sky-200'
                        : 'bg-blue-500/20 text-sky-200 border border-blue-400/30'
                    }`}
                  >
                    {activeSubject.name}
                  </button>
                </>
              )}

              {activeSubject?.isAllInOne && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/30 text-purple-200 border border-purple-400/40 font-black flex items-center gap-1.5">
                    <FolderArchive className="w-3.5 h-3.5 text-purple-300" />
                    <span>All in one resource</span>
                  </span>
                </>
              )}

              {activeCategoryDef && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-sky-200 border border-blue-400/30 font-extrabold flex items-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5 text-sky-300" />
                    <span>{activeCategoryDef.title}</span>
                  </span>
                </>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeSubject?.isAllInOne
                ? 'Combined Maths — All in one resource'
                : activeCategoryDef && activeSubject
                ? `${activeSubject.name} — ${activeCategoryDef.title}`
                : activeSubject
                ? `${activeSubject.fullName} Folders`
                : 'Academic Resource Folders'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {activeSubject?.isAllInOne
                ? 'Official G.C.E. (A/L) Combined Mathematics Master Resource Folder. All units, Pure Maths, Applied Mechanics, and Past Papers are organized in this verified Google Drive repository.'
                : activeCategoryDef && activeSubject
                ? `Browsing ${activeCategoryDef.title} for ${activeSubject.name}. All files are organized and ready to read online or download directly from Google Drive.`
                : activeSubject
                ? `Select a section below to explore Theory Notes, Resource Books, and 2000+ MCQ question banks for ${activeSubject.name}.`
                : 'Access dedicated subject folders for Biology, Physics, Chemistry, and Combined Mathematics. Touch any folder below to open:'}
            </p>
          </div>

          {/* Action Buttons in Banner */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0 flex-wrap">
            {activeSubject?.isAllInOne ? (
              <>
                <button
                  onClick={handleBackToAllSubjects}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to 4 Subjects</span>
                </button>

                <a
                  href={COMBINED_MATHS_ALL_IN_ONE_DRIVE_FOLDER}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playRoboticClick()}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/30 active:scale-95"
                  title="Open Official Google Drive Archive"
                >
                  <span>Open Drive Folder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            ) : activeCategory ? (
              <>
                <button
                  onClick={handleBackToSubjectCategories}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to {activeSubject?.name} Folders</span>
                </button>

                <a
                  href={activeSubject?.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playRoboticClick()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/30 active:scale-95"
                  title="Open Google Drive Folder"
                >
                  <span>Open Drive Folder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            ) : activeSubject ? (
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
            ) : null}
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
                Core Subject Folders (4 Subjects)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Click a folder to view internal folders</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SUBJECTS_CONFIG.map((folder) => {
              const Icon = folder.icon;
              const hasNotes = folder.theoryNotes.length > 0;
              const isMaths = folder.id === 'c-maths';

              return (
                <div
                  key={folder.id}
                  onClick={() => handleOpenSubject(folder.id)}
                  className={`bg-white rounded-3xl border ${
                    isMaths
                      ? 'border-purple-200/90 hover:border-purple-400 bg-gradient-to-b from-purple-50/20 to-white'
                      : 'border-slate-200/90 hover:border-blue-400'
                  } p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1 relative select-none`}
                >
                  <div>
                    {/* Folder Header Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-2xl ${
                          isMaths ? 'bg-purple-50 border-purple-200/80 text-purple-600' : 'bg-amber-50 border-amber-200/80 text-amber-500'
                        } border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                          <Folder className={`w-9 h-9 ${isMaths ? 'fill-purple-300 text-purple-500' : 'fill-amber-400 text-amber-500'}`} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {isMaths ? (
                        <span className="text-[11px] font-black px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 shadow-2xs">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          <span>All in one resource</span>
                        </span>
                      ) : hasNotes ? (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>{folder.theoryNotes.length} Theory Notes</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                          3 Categories
                        </span>
                      )}
                    </div>

                    {/* Subject Title */}
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                      {folder.name}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 mb-3">
                      {folder.fullName}
                    </p>

                    <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                      {isMaths ? (
                        <>
                          <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                            <FolderArchive className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>All in one resource (Drive Vault)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-300 shrink-0" />
                            <span>Pure & Applied Complete Archive</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Theory Notes, Resource Books & 2000+ MCQ</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                            <span>Organized folder structure</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Open Folder Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isMaths ? 'text-purple-600' : 'text-blue-600'} group-hover:underline flex items-center gap-1`}>
                      <span>{isMaths ? 'Open All in one resource' : 'Open Subject'}</span>
                    </span>
                    <div className={`w-7 h-7 rounded-xl ${
                      isMaths
                        ? 'bg-purple-50 group-hover:bg-purple-600 group-hover:text-white text-purple-600'
                        : 'bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600'
                    } flex items-center justify-center transition-all`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SPECIAL LEVEL 2 FOR COMBINED MATHS ONLY: "All in one resource" Dedicated Vault */}
      {/* For Combined Maths, all other folders (Theory Notes, Resource Books, 2000+ MCQ) are deleted, and only "All in one resource" is uploaded and presented */}
      {activeSubject && activeSubject.isAllInOne && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-black uppercase tracking-wider">
                  Master Repository
                </span>
                <span className="text-xs text-slate-400 font-medium">Combined Mathematics</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <span>All in one resource</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete A/L Combined Mathematics archive uploaded from official Google Drive storage.
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

          {/* Big Featured All-in-One Resource Card */}
          <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-purple-300 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <FolderArchive className="w-10 h-10 text-purple-300" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-black flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-300" />
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
                      Combined Mathematics: All in one resource
                    </h2>
                    <p className="text-purple-200/90 text-sm font-semibold">
                      இணைந்த கணிதம்: All in one resource (முழுமையான வளக் களஞ்சியம்)
                    </p>

                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed pt-1">
                      Comprehensive, verified master folder containing all Combined Mathematics requirements in one place:
                      Pure Maths & Applied Maths lecture notes, standard theorem proofs, calculus guides, mechanics worksheets, 
                      formula handbooks, and past paper question collections.
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges of Contents included */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                    <Calculator className="w-3.5 h-3.5 text-purple-400" />
                    <span>Pure Maths</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Algebra, Calculus, Trig, Geometry & Complex Numbers
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                  <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                    <Atom className="w-3.5 h-3.5 text-sky-400" />
                    <span>Applied Maths</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Mechanics, Dynamics, Statics, Vectors & Equilibrium
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Theory Guides</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Step-by-step derivations and standard formula sheets
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exam Vault</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Classified questions, model papers and past papers
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
                <a
                  href={COMBINED_MATHS_ALL_IN_ONE_DRIVE_FOLDER}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playRoboticClick()}
                  className="px-5 py-3 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/40 active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open All in one resource (Google Drive)</span>
                </a>

                <button
                  onClick={handleOpenCombinedMathsPreview}
                  className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>Browse in App Viewer</span>
                </button>

                {onToggleBookmark && (
                  <button
                    onClick={() => {
                      playRoboticClick();
                      onToggleBookmark(COMBINED_MATHS_ALL_IN_ONE_RESOURCE.id);
                    }}
                    className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                      isMathsBookmarked
                        ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-md shadow-amber-400/20'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isMathsBookmarked ? 'fill-current' : ''}`} />
                    <span>{isMathsBookmarked ? 'Bookmarked in Account' : 'Bookmark Resource'}</span>
                  </button>
                )}

                <button
                  onClick={handleCopyMathsLink}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 ml-auto"
                  title="Copy Google Drive URL"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Drive Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Clean 8 Academic Sections Grid — Verified Official Combined Maths Resources (No third-party branding) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-purple-600" />
                  <span>Combined Mathematics Syllabus Sections (8 Resource Folders)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore organized examination papers, practice problem books, syllabus guides, and reference material.
                </p>
              </div>

              {/* Quick Filter */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter Combined Maths folders..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {COMBINED_MATHS_SECTIONS.filter((sec) => {
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
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/70 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-2xs">
                          {sec.icon}
                        </div>

                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                          {sec.badge}
                        </span>
                      </div>

                      {/* Folder Title */}
                      <h4 className="text-base font-black text-slate-900 group-hover:text-purple-600 transition-colors mb-0.5 leading-snug">
                        {sec.nameEn}
                      </h4>
                      <p className="text-[11px] font-semibold text-purple-700 mb-2.5">
                        {sec.nameTa}
                      </p>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                        {sec.description}
                      </p>

                      {/* File highlights */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 mb-4">
                        {sec.fileHighlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
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
                        className="flex-1 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
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
          </div>
        </div>
      )}

      {/* LEVEL 2: Inside a Subject - Displays the 3 Big Sub-Folders (Only for Biology, Physics, Chemistry) */}
      {activeSubject && !activeSubject.isAllInOne && !activeCategory && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>{activeSubject.name} Folders</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All uploaded study notes are stored inside &quot;Theory Notes&quot;. Click any folder below to enter:
              </p>
            </div>
            <button
              onClick={handleBackToAllSubjects}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to 4 Subjects</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUB_FOLDER_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              let fileCount = 0;
              if (cat.id === 'theory-notes') fileCount = activeSubject.theoryNotes.length;
              if (cat.id === 'resource-books') fileCount = activeSubject.resourceBooks.length;
              if (cat.id === 'mcq-bank') fileCount = activeSubject.mcqBanks.length;

              const isTheory = cat.id === 'theory-notes';

              return (
                <div
                  key={cat.id}
                  onClick={() => handleOpenCategory(cat.id)}
                  className={`bg-white rounded-3xl border ${cat.borderColor} p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1.5 relative select-none`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-105 transition-transform">
                        <Folder className="w-9 h-9 fill-amber-400 text-amber-500" />
                      </div>

                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                        fileCount > 0
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {fileCount > 0 ? `${fileCount} Files` : 'Empty (0 files)'}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5 flex items-center gap-2">
                      <span>{cat.title}</span>
                    </h4>

                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      {isTheory ? `${activeSubject.name} Theory Notes` : cat.badge}
                    </span>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {isTheory && fileCount > 0
                        ? `Contains all uploaded ${activeSubject.name} theory notes (Units ${activeSubject.id === 'biology' ? '2 to 9' : '2 to 11'}). Read online with PDF preview or download.`
                        : cat.description}
                    </p>
                  </div>

                  {/* Open Folder Action */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                      <span>Open {cat.title} Folder</span>
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEVEL 3: Inside a Specific Sub-Folder (e.g. Theory Notes, Resource Books, 2000+ MCQ for Bio/Physics/Chem) */}
      {activeSubject && !activeSubject.isAllInOne && activeCategory && activeCategoryDef && (
        <div className="space-y-5">
          {/* Header Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToSubjectCategories}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title={`Back to ${activeSubject.name} folders`}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>{activeSubject.name} — {activeCategoryDef.title}</span>
                  <span className="text-xs font-normal text-slate-500">
                    ({filteredFiles.length} {filteredFiles.length === 1 ? 'File' : 'Files'})
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {filteredFiles.length > 0
                    ? 'Click "Read Note" to open in-app PDF preview, or download directly from Google Drive.'
                    : 'This folder is currently empty. Resources will be added soon.'}
                </p>
              </div>
            </div>

            {/* Quick Search */}
            {currentCategoryFiles.length > 0 && (
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeCategoryDef.title}...`}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}
          </div>

          {/* Files Grid */}
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredFiles.map((file) => {
                const isSaved = isBookmarked ? isBookmarked(file.id) : false;

                return (
                  <div
                    key={file.id}
                    className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 p-5 flex flex-col justify-between group transform hover:-translate-y-1 select-none shadow-2xs hover:shadow-xl transition-all duration-300"
                  >
                    <div>
                      {/* Top Row: Unit Badge, File Size & Bookmark */}
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="font-mono font-black px-2.5 py-1 rounded-lg border text-blue-700 bg-blue-50 border-blue-200">
                          {file.unitCode}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {file.fileSize}
                          </span>

                          {onToggleBookmark && (
                            <button
                              onClick={() => {
                                playRoboticClick();
                                onToggleBookmark(file.id);
                              }}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isSaved
                                  ? 'text-amber-500 bg-amber-50'
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                              title={isSaved ? 'Remove Bookmark' : 'Save to Bookmarks'}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* File Icon & Name */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                          <BookOpen className="w-6 h-6" />
                        </div>

                        <div>
                          <h4
                            onClick={() => handleFilePreview(file)}
                            className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer leading-snug line-clamp-2"
                          >
                            {file.unitName}
                          </h4>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5 truncate max-w-[190px]">
                            {file.fileName}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                        {file.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleFilePreview(file)}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Read in website PDF Viewer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Read Note</span>
                      </button>

                      <a
                        href={file.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playRoboticClick()}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href={getDirectDownloadUrl(file.driveLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        onClick={() => playRoboticClick()}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs max-w-md mx-auto my-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Folder className="w-7 h-7 fill-amber-300 text-amber-500" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-base mb-1">
                Empty Folder (0 Files)
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mb-5">
                {searchQuery
                  ? `No files match "${searchQuery}" in this folder.`
                  : `No files uploaded to ${activeCategoryDef.title} for ${activeSubject.name} yet. Verified documents will be added soon.`}
              </p>

              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={handleBackToSubjectCategories}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Back to {activeSubject.name} Folders
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
