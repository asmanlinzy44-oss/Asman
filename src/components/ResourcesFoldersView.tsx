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
  FolderPlus,
  Info,
  Clock,
  CheckCircle2,
  Library
} from 'lucide-react';
import { PaperResource } from '../types';
import { playRoboticFolder, playRoboticClick } from '../utils/audio';

interface UnitFolderItem {
  id: string;
  unitNumber: number;
  unitCode: string;
  title: string;
  itemCount: number;
  description: string;
}

export interface SubjectResourceFolder {
  id: string;
  subjectId: string;
  name: string;
  fullName: string;
  icon: React.ComponentType<{ className?: string }>;
  colorTheme: 'blue' | 'rose' | 'emerald' | 'purple';
  accentColor: string;
  bgGradient: string;
  borderTheme: string;
  pillColor: string;
  tagColor: string;
  driveLink: string;
  unitFolders: UnitFolderItem[];
}

export const SUBJECT_RESOURCE_FOLDERS: SubjectResourceFolder[] = [
  {
    id: 'biology-folder',
    subjectId: 'biology',
    name: 'Biology',
    fullName: 'G.C.E. (A/L) Biology',
    icon: Dna,
    colorTheme: 'rose',
    accentColor: 'text-rose-600',
    bgGradient: 'from-rose-500/10 via-pink-500/5 to-white',
    borderTheme: 'border-rose-200 hover:border-rose-400 group-hover:border-rose-500',
    pillColor: 'bg-rose-50 text-rose-700 border-rose-200',
    tagColor: 'bg-rose-500',
    driveLink: 'https://drive.google.com/drive/folders/1jQL3RY0gJrcOq-SxZfbqrmwao3EnVACM',
    unitFolders: [
      {
        id: 'bio-u01',
        unitNumber: 1,
        unitCode: 'Unit 01',
        title: 'Introduction to Biology',
        itemCount: 0,
        description: 'Nature and scope of biology, scientific methods, and key biological concepts.',
      },
      {
        id: 'bio-u02',
        unitNumber: 2,
        unitCode: 'Unit 02',
        title: 'Chemical and Cellular Basis of Life',
        itemCount: 0,
        description: 'Biomolecules, water properties, cellular organelles, mitosis, and meiosis.',
      },
      {
        id: 'bio-u03',
        unitNumber: 3,
        unitCode: 'Unit 03',
        title: 'Evolution & Diversity of Organisms',
        itemCount: 0,
        description: 'Five kingdoms, animal phyla, plant divisions, and evolutionary adaptations.',
      },
      {
        id: 'bio-u04',
        unitNumber: 4,
        unitCode: 'Unit 04',
        title: 'Plant Form and Function',
        itemCount: 0,
        description: 'Plant tissues, transport of water and nutrients, photosynthesis, and hormones.',
      },
      {
        id: 'bio-u05',
        unitNumber: 5,
        unitCode: 'Unit 05',
        title: 'Animal Form and Function',
        itemCount: 0,
        description: 'Human physiology: digestion, circulation, respiration, excretion, nervous, and endocrine systems.',
      },
      {
        id: 'bio-u06',
        unitNumber: 6,
        unitCode: 'Unit 06',
        title: 'Genetics',
        itemCount: 0,
        description: 'Mendelian genetics, sex linkage, polygenic traits, pedigree charts, and mutations.',
      },
      {
        id: 'bio-u07',
        unitNumber: 7,
        unitCode: 'Unit 07',
        title: 'Molecular Biology & Recombinant DNA',
        itemCount: 0,
        description: 'DNA replication, transcription, translation, gene cloning, PCR, and gel electrophoresis.',
      },
      {
        id: 'bio-u08',
        unitNumber: 8,
        unitCode: 'Unit 08',
        title: 'Environmental Biology',
        itemCount: 0,
        description: 'Ecosystem dynamics, energy flow, biogeochemical cycles, biodiversity conservation in Sri Lanka.',
      },
      {
        id: 'bio-u09',
        unitNumber: 9,
        unitCode: 'Unit 09',
        title: 'Applied Biology',
        itemCount: 0,
        description: 'Agriculture, aquaculture, post-harvest technology, and pest control techniques.',
      },
      {
        id: 'bio-u10',
        unitNumber: 10,
        unitCode: 'Unit 10',
        title: 'Microbiology & Biotechnology',
        itemCount: 0,
        description: 'Bacterial and fungal culture, industrial fermentations, antibiotics, and bio-remediation.',
      },
    ],
  },
  {
    id: 'physics-folder',
    subjectId: 'physics',
    name: 'Physics',
    fullName: 'G.C.E. (A/L) Physics',
    icon: Atom,
    colorTheme: 'blue',
    accentColor: 'text-blue-600',
    bgGradient: 'from-blue-500/10 via-sky-500/5 to-white',
    borderTheme: 'border-blue-200 hover:border-blue-400 group-hover:border-blue-500',
    pillColor: 'bg-blue-50 text-blue-700 border-blue-200',
    tagColor: 'bg-blue-600',
    driveLink: 'https://drive.google.com/drive/folders/1T-zfsSFwpA16EVtvoimLUSnZzj4J1EtT',
    unitFolders: [
      {
        id: 'phy-u01',
        unitNumber: 1,
        unitCode: 'Unit 01',
        title: 'Measurement & Units',
        itemCount: 0,
        description: 'SI units, dimensions, vernier caliper, micrometer screw gauge, spherometer, and error estimation.',
      },
      {
        id: 'phy-u02',
        unitNumber: 2,
        unitCode: 'Unit 02',
        title: 'Mechanics',
        itemCount: 0,
        description: 'Vectors, kinematics, Newton laws, momentum, work-energy, circular motion, rotational dynamics, and hydrostatics.',
      },
      {
        id: 'phy-u03',
        unitNumber: 3,
        unitCode: 'Unit 03',
        title: 'Oscillations and Waves',
        itemCount: 0,
        description: 'Simple harmonic motion, sound waves, resonance, Doppler effect, refraction, lenses, and physical optics.',
      },
      {
        id: 'phy-u04',
        unitNumber: 4,
        unitCode: 'Unit 04',
        title: 'Thermal Physics',
        itemCount: 0,
        description: 'Thermometry, expansion, calorimetry, gas laws, kinetic theory, thermodynamics, and thermal conduction.',
      },
      {
        id: 'phy-u05',
        unitNumber: 5,
        unitCode: 'Unit 05',
        title: 'Gravitational Field',
        itemCount: 0,
        description: 'Newton law of gravitation, gravitational intensity, potential, orbital speed, and escape velocity.',
      },
      {
        id: 'phy-u06',
        unitNumber: 6,
        unitCode: 'Unit 06',
        title: 'Electrostatic Field',
        itemCount: 0,
        description: 'Coulomb law, electric field lines, electric potential, capacitance, and energy stored in capacitors.',
      },
      {
        id: 'phy-u07',
        unitNumber: 7,
        unitCode: 'Unit 07',
        title: 'Current Electricity',
        itemCount: 0,
        description: 'Ohm law, Kirchhoff laws, potentiometer, Wheatstone bridge, internal resistance, and electrical power.',
      },
      {
        id: 'phy-u08',
        unitNumber: 8,
        unitCode: 'Unit 08',
        title: 'Magnetic Field & Induction',
        itemCount: 0,
        description: 'Magnetic force on conductors and charges, Biot-Savart law, Faraday law, Lenz law, and alternating currents.',
      },
      {
        id: 'phy-u09',
        unitNumber: 9,
        unitCode: 'Unit 09',
        title: 'Electronics',
        itemCount: 0,
        description: 'Semiconductors, p-n diodes, rectification, bipolar junction transistors, operational amplifiers, and logic gates.',
      },
      {
        id: 'phy-u10',
        unitNumber: 10,
        unitCode: 'Unit 10',
        title: 'Mechanical Properties of Matter',
        itemCount: 0,
        description: 'Elasticity, Hooke law, surface tension, capillarity, viscosity, and Poiseuille formula.',
      },
      {
        id: 'phy-u11',
        unitNumber: 11,
        unitCode: 'Unit 11',
        title: 'Matter and Radiation',
        itemCount: 0,
        description: 'Photoelectric effect, photon theory, X-rays, wave-particle duality, nuclear physics, and radioactivity.',
      },
    ],
  },
  {
    id: 'chemistry-folder',
    subjectId: 'chemistry',
    name: 'Chemistry',
    fullName: 'G.C.E. (A/L) Chemistry',
    icon: FlaskConical,
    colorTheme: 'emerald',
    accentColor: 'text-emerald-600',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-white',
    borderTheme: 'border-emerald-200 hover:border-emerald-400 group-hover:border-emerald-500',
    pillColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tagColor: 'bg-emerald-600',
    driveLink: 'https://drive.google.com/drive/folders/1dJjXv4nREJDzdREIYNdR9fwlv0KAlhRb',
    unitFolders: [
      {
        id: 'chem-u01',
        unitNumber: 1,
        unitCode: 'Unit 01',
        title: 'Atomic Structure',
        itemCount: 0,
        description: 'Electromagnetic spectrum, Bohr model, quantum numbers, electron configurations, and periodic trends.',
      },
      {
        id: 'chem-u02',
        unitNumber: 2,
        unitCode: 'Unit 02',
        title: 'Structure & Chemical Bonding',
        itemCount: 0,
        description: 'Lewis structures, resonance, VSEPR molecular geometry, hybridization, and intermolecular forces.',
      },
      {
        id: 'chem-u03',
        unitNumber: 3,
        unitCode: 'Unit 03',
        title: 'Chemical Calculations',
        itemCount: 0,
        description: 'Mole concept, stoichiometry, solution concentration, titration calculations, and empirical formulas.',
      },
      {
        id: 'chem-u04',
        unitNumber: 4,
        unitCode: 'Unit 04',
        title: 'Gaseous State of Matter',
        itemCount: 0,
        description: 'Ideal gas law, Dalton law of partial pressures, kinetic theory of gases, and real gas deviations.',
      },
      {
        id: 'chem-u05',
        unitNumber: 5,
        unitCode: 'Unit 05',
        title: 'Energetics (Thermodynamics)',
        itemCount: 0,
        description: 'Enthalpy changes, Hess law, Born-Haber cycle, bond energies, and calorimetry.',
      },
      {
        id: 'chem-u06',
        unitNumber: 6,
        unitCode: 'Unit 06',
        title: 'Chemistry of s, p & d Block Elements',
        itemCount: 0,
        description: 'Group 1, 2, 13-17 chemical properties, transition elements, oxidation states, complexes, and color tests.',
      },
      {
        id: 'chem-u07',
        unitNumber: 7,
        unitCode: 'Unit 07',
        title: 'Basic Concepts of Organic Chemistry',
        itemCount: 0,
        description: 'IUPAC nomenclature, structural isomerism, stereoisomerism, inductive effects, and reaction mechanisms.',
      },
      {
        id: 'chem-u08',
        unitNumber: 8,
        unitCode: 'Unit 08',
        title: 'Hydrocarbons & Halohydrocarbons',
        itemCount: 0,
        description: 'Alkanes, alkenes, alkynes, benzene electrophilic substitution, and alkyl halides nucleophilic substitution.',
      },
      {
        id: 'chem-u09',
        unitNumber: 9,
        unitCode: 'Unit 09',
        title: 'Oxygen-Containing Organic Compounds',
        itemCount: 0,
        description: 'Alcohols, phenols, aldehydes, ketones, carboxylic acids, and esters.',
      },
      {
        id: 'chem-u10',
        unitNumber: 10,
        unitCode: 'Unit 10',
        title: 'Nitrogen-Containing Organic Compounds',
        itemCount: 0,
        description: 'Amines, amides, diazonium salts, basicity comparison, and synthetic pathways.',
      },
      {
        id: 'chem-u11',
        unitNumber: 11,
        unitCode: 'Unit 11',
        title: 'Chemical Kinetics',
        itemCount: 0,
        description: 'Rate laws, order of reaction, rate constant, activation energy, Arrhenius equation, and catalysis.',
      },
      {
        id: 'chem-u12',
        unitNumber: 12,
        unitCode: 'Unit 12',
        title: 'Chemical Equilibrium',
        itemCount: 0,
        description: 'Dynamic equilibrium, Kc, Kp, Le Chatelier principle, acid-base equilibrium, pH, buffers, and Ksp.',
      },
      {
        id: 'chem-u13',
        unitNumber: 13,
        unitCode: 'Unit 13',
        title: 'Electrochemistry',
        itemCount: 0,
        description: 'Conductance, electrochemical cells, standard electrode potentials, Nernst equation, and electrolysis.',
      },
      {
        id: 'chem-u14',
        unitNumber: 14,
        unitCode: 'Unit 14',
        title: 'Industrial Chemistry & Environment',
        itemCount: 0,
        description: 'Haber process, contact process, chlor-alkali industry, air and water pollution, and green chemistry.',
      },
    ],
  },
  {
    id: 'maths-folder',
    subjectId: 'c-maths',
    name: 'Combined Maths',
    fullName: 'G.C.E. (A/L) Combined Mathematics',
    icon: Calculator,
    colorTheme: 'purple',
    accentColor: 'text-purple-600',
    bgGradient: 'from-purple-500/10 via-indigo-500/5 to-white',
    borderTheme: 'border-purple-200 hover:border-purple-400 group-hover:border-purple-500',
    pillColor: 'bg-purple-50 text-purple-700 border-purple-200',
    tagColor: 'bg-purple-600',
    driveLink: 'https://drive.google.com/drive/folders/1ZdIODWG_-rzNw-782VuLRrIJS247xtXi',
    unitFolders: [
      {
        id: 'math-u01',
        unitNumber: 1,
        unitCode: 'Unit 01',
        title: 'Real Numbers & Polynomials',
        itemCount: 0,
        description: 'Remainder theorem, factor theorem, roots of polynomials, and algebraic manipulations.',
      },
      {
        id: 'math-u02',
        unitNumber: 2,
        unitCode: 'Unit 02',
        title: 'Quadratic Equations & Inequalities',
        itemCount: 0,
        description: 'Discriminant, nature of roots, quadratic graphs, and solving modulus inequalities.',
      },
      {
        id: 'math-u03',
        unitNumber: 3,
        unitCode: 'Unit 03',
        title: 'Mathematical Induction & Binomial Theorem',
        itemCount: 0,
        description: 'Principle of mathematical induction, binomial expansion, general term, and coefficient problems.',
      },
      {
        id: 'math-u04',
        unitNumber: 4,
        unitCode: 'Unit 04',
        title: 'Trigonometry & Trigonometric Functions',
        itemCount: 0,
        description: 'Compound angles, double/triple angles, general solutions of trigonometric equations, and inverse functions.',
      },
      {
        id: 'math-u05',
        unitNumber: 5,
        unitCode: 'Unit 05',
        title: 'Coordinate Geometry — Straight Line',
        itemCount: 0,
        description: 'Distance formula, section formula, gradient, angle between lines, perpendicular distance, and concurrency.',
      },
      {
        id: 'math-u06',
        unitNumber: 6,
        unitCode: 'Unit 06',
        title: 'Coordinate Geometry — Circle',
        itemCount: 0,
        description: 'General equation of a circle, tangents, normals, intersection of circles, and orthogonal circles.',
      },
      {
        id: 'math-u07',
        unitNumber: 7,
        unitCode: 'Unit 07',
        title: 'Limits & Differential Calculus',
        itemCount: 0,
        description: 'Standard limits, first principles, chain rule, product rule, quotient rule, tangents and normals, and maxima-minima.',
      },
      {
        id: 'math-u08',
        unitNumber: 8,
        unitCode: 'Unit 08',
        title: 'Integral Calculus & Applications',
        itemCount: 0,
        description: 'Standard integrals, integration by substitution, by parts, partial fractions, and definite integrals.',
      },
      {
        id: 'math-u09',
        unitNumber: 9,
        unitCode: 'Unit 09',
        title: 'Matrices & Determinants',
        itemCount: 0,
        description: 'Matrix algebra, determinants, inverse matrix, and solving systems of linear equations.',
      },
      {
        id: 'math-u10',
        unitNumber: 10,
        unitCode: 'Unit 10',
        title: 'Vectors & Coplanar Forces',
        itemCount: 0,
        description: 'Vector addition, dot product, cross product, resultants of coplanar forces, and moment of a force.',
      },
      {
        id: 'math-u11',
        unitNumber: 11,
        unitCode: 'Unit 11',
        title: 'Rectilinear Motion & Kinematics',
        itemCount: 0,
        description: 'Displacement-time, velocity-time graphs, motion under constant acceleration, and vertical projection.',
      },
      {
        id: 'math-u12',
        unitNumber: 12,
        unitCode: 'Unit 12',
        title: 'Relative Velocity & Motion in a Circle',
        itemCount: 0,
        description: 'Relative velocity vectors, closest approach, angular velocity, and conical pendulum.',
      },
      {
        id: 'math-u13',
        unitNumber: 13,
        unitCode: 'Unit 13',
        title: 'Newton Laws, Work, Energy & Power',
        itemCount: 0,
        description: 'Connected particles, inclined planes, work-energy theorem, and conservation of mechanical energy.',
      },
      {
        id: 'math-u14',
        unitNumber: 14,
        unitCode: 'Unit 14',
        title: 'Friction & Statics of Rigid Bodies',
        itemCount: 0,
        description: 'Limiting friction, equilibrium of rods and ladders, three-force principle, and framework joint analysis.',
      },
      {
        id: 'math-u15',
        unitNumber: 15,
        unitCode: 'Unit 15',
        title: 'Probability and Statistics',
        itemCount: 0,
        description: 'Measures of central tendency, dispersion, probability rules, independent events, and conditional probability.',
      },
    ],
  },
];

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
}) => {
  // Current active subject folder (null means viewing the 4 main subject folders)
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(() => {
    if (selectedSubject && selectedSubject !== 'all') {
      return selectedSubject;
    }
    return null;
  });

  // Currently selected unit folder inside the subject
  const [selectedUnitFolder, setSelectedUnitFolder] = useState<UnitFolderItem | null>(null);

  // Search query within the opened subject folder
  const [folderSearchQuery, setFolderSearchQuery] = useState('');

  const activeSubject = useMemo(() => {
    return SUBJECT_RESOURCE_FOLDERS.find((f) => f.subjectId === activeSubjectId) || null;
  }, [activeSubjectId]);

  const filteredUnitFolders = useMemo(() => {
    if (!activeSubject) return [];
    if (!folderSearchQuery.trim()) return activeSubject.unitFolders;
    const q = folderSearchQuery.toLowerCase();
    return activeSubject.unitFolders.filter(
      (u) =>
        u.title.toLowerCase().includes(q) ||
        u.unitCode.toLowerCase().includes(q) ||
        u.description.toLowerCase().includes(q)
    );
  }, [activeSubject, folderSearchQuery]);

  const handleOpenSubject = (subjectId: string) => {
    playRoboticFolder();
    setActiveSubjectId(subjectId);
    setSelectedUnitFolder(null);
    setFolderSearchQuery('');
    if (onSelectSubject) {
      onSelectSubject(subjectId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAllSubjects = () => {
    playRoboticClick();
    setActiveSubjectId(null);
    setSelectedUnitFolder(null);
    setFolderSearchQuery('');
    if (onSelectSubject) {
      onSelectSubject('all');
    }
  };

  const handleOpenUnitFolder = (unit: UnitFolderItem) => {
    playRoboticFolder();
    setSelectedUnitFolder(unit);
  };

  return (
    <div className="space-y-6">
      {/* View 1: Top Navigation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5">
            {/* Interactive Breadcrumb */}
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
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-sky-200 border border-blue-400/30">
                    {activeSubject.name} Folders
                  </span>
                </>
              )}

              {selectedUnitFolder && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-400/30">
                    {selectedUnitFolder.unitCode}: {selectedUnitFolder.title}
                  </span>
                </>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeSubject
                ? `${activeSubject.fullName} Resource Folders`
                : 'Academic Resource Folders'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {activeSubject
                ? `Explore organized unit folders for ${activeSubject.name}. All folders are structured and ready for academic notes, formula sheets, and study materials.`
                : 'Access dedicated subject folders for Biology, Physics, Chemistry, and Combined Mathematics. Touch any folder below to open:'}
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

      {/* VIEW A: The 4 Big Main Subject Folders (When no subject is opened) */}
      {!activeSubject && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Core Subject Folders (4 Subjects)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Click a folder to view unit folders</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SUBJECT_RESOURCE_FOLDERS.map((folder) => {
              const Icon = folder.icon;
              return (
                <div
                  key={folder.id}
                  onClick={() => handleOpenSubject(folder.subjectId)}
                  className={`bg-white rounded-3xl border ${folder.borderTheme} p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1 relative select-none`}
                >
                  <div>
                    {/* Folder Header Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-105 transition-transform">
                          <Folder className="w-9 h-9 fill-amber-400 text-amber-500" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                        {folder.unitFolders.length} Unit Folders
                      </span>
                    </div>

                    {/* Subject Title */}
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                      {folder.name}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 mb-3">
                      {folder.fullName}
                    </p>

                    <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>Contains {folder.unitFolders.length} Unit Folders</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        <span>Empty folders ready for study notes</span>
                      </div>
                    </div>
                  </div>

                  {/* Open Folder Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                      <span>Open Folder</span>
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

      {/* VIEW B: Inside an Opened Subject Folder (Displays that subject's empty unit folders) */}
      {activeSubject && (
        <div className="space-y-5">
          {/* Subheader Toolbar with Search and Count */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToAllSubjects}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Back to all 4 subjects"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{activeSubject.name} Folders</span>
                  <span className="text-xs font-normal text-slate-500">
                    ({activeSubject.unitFolders.length} Unit Folders)
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select any unit folder to view its contents:
                </p>
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={folderSearchQuery}
                onChange={(e) => setFolderSearchQuery(e.target.value)}
                placeholder={`Search ${activeSubject.name} units...`}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Unit Folders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredUnitFolders.map((unit) => {
              const isSelected = selectedUnitFolder?.id === unit.id;
              return (
                <div
                  key={unit.id}
                  onClick={() => handleOpenUnitFolder(unit)}
                  className={`bg-white rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-md select-none ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                      : 'border-slate-200/90 hover:border-blue-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    {/* Top Row: Unit Badge & Folder Icon */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                        {isSelected ? (
                          <FolderOpen className="w-5 h-5 fill-amber-400 text-amber-600" />
                        ) : (
                          <Folder className="w-5 h-5 fill-amber-300 text-amber-500" />
                        )}
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                        {unit.unitCode}
                      </span>
                    </div>

                    {/* Unit Name */}
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-1.5">
                      {unit.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {unit.description}
                    </p>
                  </div>

                  {/* Status: Empty Folder */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span>Empty (0 files)</span>
                    </span>

                    <span className="text-blue-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUnitFolders.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs max-w-md mx-auto my-6">
              <Search className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h4 className="font-bold text-slate-800 text-sm mb-1">No Unit Folders Match</h4>
              <p className="text-xs text-slate-500 mb-4">
                No unit folders found for &quot;{folderSearchQuery}&quot;.
              </p>
              <button
                onClick={() => setFolderSearchQuery('')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Modal / Overlay when a Unit Folder is clicked */}
          {selectedUnitFolder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 relative overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Close Button */}
                <button
                  onClick={() => {
                    playRoboticClick();
                    setSelectedUnitFolder(null);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close"
                >
                  <span className="text-lg font-bold">✕</span>
                </button>

                {/* Modal Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-7 h-7 fill-amber-400 text-amber-600" />
                  </div>
                  <div className="pr-6">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono">
                      {activeSubject.name} · {selectedUnitFolder.unitCode}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {selectedUnitFolder.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedUnitFolder.description}
                    </p>
                  </div>
                </div>

                {/* Empty State Presentation */}
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center my-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <Inbox className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800 mb-1">
                    Empty Folder (0 Files)
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    This unit folder is currently empty. Verified notes, formula cheat sheets, and revision summaries will be loaded here.
                  </p>
                </div>

                {/* Modal Bottom Actions */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      playRoboticClick();
                      setSelectedUnitFolder(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Close Folder
                  </button>

                  <a
                    href={activeSubject.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playRoboticClick()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Open Drive Cloud</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
