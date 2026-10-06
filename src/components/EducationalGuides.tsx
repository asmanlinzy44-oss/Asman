import React, { useState } from 'react';
import { 
  BookOpen, Calculator, Atom, FlaskConical, Dna, 
  ChevronDown, ChevronUp, CheckCircle, Lightbulb, 
  Target, Award, FileQuestion, HelpCircle 
} from 'lucide-react';
import { playRoboticClick } from '../utils/audio';

export const EducationalGuides: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState<'maths' | 'physics' | 'chem' | 'bio'>('maths');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    playRoboticClick();
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="mt-14 space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide">
          <BookOpen className="w-3.5 h-3.5" />
          <span>OFFICIAL A/L ACADEMIC GUIDE & SYLLABUS INSIGHTS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Sri Lankan G.C.E. A/L Science Master Study Hub
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Comprehensive subject breakdowns, past paper preparation roadmaps, and official marking scheme methodologies prepared for Physical Science and Biological Science aspirants.
        </p>
      </div>

      {/* Subject Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => {
            playRoboticClick();
            setActiveSubject('maths');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSubject === 'maths'
              ? 'bg-[#0066FF] text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Combined Mathematics</span>
        </button>

        <button
          onClick={() => {
            playRoboticClick();
            setActiveSubject('physics');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSubject === 'physics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
          }`}
        >
          <Atom className="w-4 h-4" />
          <span>Physics</span>
        </button>

        <button
          onClick={() => {
            playRoboticClick();
            setActiveSubject('chem');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSubject === 'chem'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Chemistry</span>
        </button>

        <button
          onClick={() => {
            playRoboticClick();
            setActiveSubject('bio');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSubject === 'bio'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
          }`}
        >
          <Dna className="w-4 h-4" />
          <span>Biology</span>
        </button>
      </div>

      {/* Guide Content Display */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {activeSubject === 'maths' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#0066FF]" />
                <span>Combined Mathematics: Exam Structure & Preparation Strategy</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Paper 1 (Pure Mathematics) & Paper 2 (Applied Mathematics) · 100 Marks Each
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-700">
                  <Target className="w-4 h-4" />
                  <span>Paper 1: Pure Mathematics Core Focus</span>
                </h4>
                <p>
                  Pure Mathematics tests algebraic foundations, trigonometry, analytical geometry, and calculus. High-scoring candidates focus meticulously on:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                  <li><strong>Part A (Structured Short Questions 1–10):</strong> 25 marks each. Essential speed topics include quadratic equations, mathematical induction, roots of polynomials, and standard limit evaluations.</li>
                  <li><strong>Straight Lines & Circles:</strong> Parametric circle representations, family of circles through intersections, and tangent properties.</li>
                  <li><strong>Trigonometry:</strong> General solution equations, sum-to-product transforms, and inverse trigonometric derivations.</li>
                  <li><strong>Differential & Integral Calculus:</strong> Curve sketching with asymptotes, integration by parts, partial fractions, and definite integral properties.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-indigo-700">
                  <Award className="w-4 h-4" />
                  <span>Paper 2: Applied Mathematics & Mechanics</span>
                </h4>
                <p>
                  Applied Mathematics evaluates classical Newtonian mechanics, kinematics, vectors, and probability & statistics.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                  <li><strong>Vectors & Coplanar Forces:</strong> Resultant of concurrent force systems, triangle & polygon of forces, and Varignon's theorem of moments.</li>
                  <li><strong>Friction & Equilibrium:</strong> Limiting equilibrium on rough inclined planes, jointed rods, and virtual work equilibrium.</li>
                  <li><strong>Kinematics & Projectiles:</strong> Relative velocity diagrams, trajectories under gravity, and collisions of elastic spheres (Newton's law of restitution).</li>
                  <li><strong>Probability & Statistics:</strong> Conditional probability, Bayes' theorem, permutations & combinations, and standard deviations.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Paper Express Tip: </span>
                Reviewing past papers from 2000 to 2024 reveals recurring question patterns in the Combined Mathematics B-Part questions. Always write full justification for standard theorems (such as L'Hôpital's rule restrictions or intermediate value theorem) to obtain full marks from examiners.
              </div>
            </div>
          </div>
        )}

        {activeSubject === 'physics' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Atom className="w-5 h-5 text-indigo-600" />
                <span>Physics: Theory Units, Structured Essay & Practical Mastery</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Paper 1 (50 MCQs · 2 Hours) · Paper 2 (Structured Essay & Essay · 3 Hours)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-indigo-700">
                  <Target className="w-4 h-4" />
                  <span>High-Yield Theoretical Units</span>
                </h4>
                <p>
                  Physics requires both mathematical precision and conceptual clarity. The syllabus spans 11 major units:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                  <li><strong>Mechanics:</strong> Newton's laws, rotational dynamics (moment of inertia, angular momentum), circular motion, and hydrodynamics (Bernoulli's principle & viscosity).</li>
                  <li><strong>Oscillations & Waves:</strong> Simple Harmonic Motion, Doppler effect, stationary sound waves in resonance tubes, and optical interference (Young's double slit).</li>
                  <li><strong>Thermal Physics:</strong> Kinetic theory of gases, heat engines, thermodynamics 1st law, and heat conduction & radiation laws (Stefan-Boltzmann).</li>
                  <li><strong>Fields & Electricity:</strong> Coulomb's law, Gauss's law, Kirchhoff's circuit rules, magnetic fields due to currents, and Faraday-Lenz electromagnetic induction.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-purple-700">
                  <Award className="w-4 h-4" />
                  <span>Structured Essay (Practical Questions 1–4)</span>
                </h4>
                <p>
                  Questions 1 to 4 of Paper 2 test the 42 prescribed practicals. Scoring full marks demands strict adherence to practical manuals:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                  <li><strong>Question 1 (Mechanics Practical):</strong> Vernier caliper, micrometer screw gauge, spherometer, sonometer, or verification of Boyle's law.</li>
                  <li><strong>Question 2 (Thermal / Hydro Practical):</strong> Specific heat capacity (method of mixtures/cooling), latent heat, or U-tube liquid density.</li>
                  <li><strong>Question 3 (Optics / Waves Practical):</strong> Critical angle determination, spectrometer minimum deviation, or resonance tube velocity of sound.</li>
                  <li><strong>Question 4 (Electricity Practical):</strong> Potentiometer internal resistance, meter bridge, meter conversion (galvanometer to voltmeter/ammeter).</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Examiner Advice: </span>
                Never omit standard SI units in final answers. Graph questions require axes labeled with quantity and unit (e.g. V / m³), a scale covering more than 50% of the grid, and best-fit gradient calculations using widely spaced points.
              </div>
            </div>
          </div>
        )}

        {activeSubject === 'chem' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-600" />
                <span>Chemistry: Comprehensive Organic, Inorganic & Physical Roadmaps</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Paper 1 (50 MCQs · 2 Hours) · Paper 2 (Part A Structured + Part B & C Essays · 3 Hours)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-800">
                  <Target className="w-4 h-4" />
                  <span>Organic Chemistry Conversion Pathways</span>
                </h4>
                <p>
                  Organic Chemistry accounts for a substantial percentage of Paper 2 marks (Questions 3 and 6):
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                  <li><strong>Reaction Mechanisms:</strong> Electrophilic addition to alkenes (Markovnikov rule), nucleophilic substitution (SN1 and SN2), electrophilic aromatic substitution of benzene, and nucleophilic addition to carbonyls.</li>
                  <li><strong>Multi-Step Syntheses:</strong> Functional group conversions involving Grignard reagents, diazonium salt reactions, and carboxylic acid derivatives.</li>
                  <li><strong>Qualitative Identification Tests:</strong> Brady's reagent, Tollens' test, Fehling's solution, Iodoform test, and neutral FeCl3 phenol test.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-800">
                  <Award className="w-4 h-4" />
                  <span>Physical & Inorganic Chemistry Core</span>
                </h4>
                <p>
                  Physical chemistry requires rigorous mathematical equations, while inorganic requires systematic periodic table trend mastery:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                  <li><strong>Chemical Energetics:</strong> Hess's law cycles, Born-Haber lattice energy cycles, and Gibbs free energy spontaneity calculations.</li>
                  <li><strong>Chemical & Ionic Equilibrium:</strong> Kc, Kp, buffer solutions, pH calculations of weak acids/bases, and solubility product Ksp.</li>
                  <li><strong>Electrochemistry:</strong> Standard electrode potentials, Nernst equation qualitative implications, electrolysis quantitative Faraday calculations.</li>
                  <li><strong>Inorganic Chemistry:</strong> Periodic trends of s-block, p-block (N, P, O, S, Halogens), and 3d transition metals with coordination complexes.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Chemistry Success Formula: </span>
                Always memorize the exact terminology stated in the NIE (National Institute of Education) Chemistry Resource Book. Exam marking schemes award marks strictly based on designated keywords for observations and mechanistic descriptions.
              </div>
            </div>
          </div>
        )}

        {activeSubject === 'bio' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Dna className="w-5 h-5 text-emerald-600" />
                <span>Biology: NIE Resource Book Alignment & Essay Technique</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Paper 1 (50 MCQs · 2 Hours) · Paper 2 (Part A Structured Essay + Part B Essay · 3 Hours)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-800">
                  <Target className="w-4 h-4" />
                  <span>Units 1 to 5: Molecular & Plant Architecture</span>
                </h4>
                <p>
                  Biology questions test deep understanding of physiological mechanisms and biochemical pathways:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                  <li><strong>Unit 2 (Cell & Chemical Basis of Life):</strong> Biomolecules, cellular organelle ultrastructure, enzyme kinetics, and cell division phases.</li>
                  <li><strong>Unit 3 (Evolution & Diversity):</strong> Classification systems, Domain Bacteria, Archaea, Eukarya, and plant kingdom life cycles.</li>
                  <li><strong>Unit 4 (Plant Form & Function):</strong> Water transport (transpiration pull, cohesion-tension), phloem translocation, plant hormones (auxins, gibberellins), and reproduction.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-teal-800">
                  <Award className="w-4 h-4" />
                  <span>Units 5 to 10: Human Physiology & Genetics</span>
                </h4>
                <p>
                  Units 5, 6, and 7 contribute the largest mark share in Paper 2:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                  <li><strong>Unit 5 (Animal Form & Function):</strong> Human digestion, circulatory system (cardiac cycle), respiratory mechanics, nephron excretion, nervous coordination, and endocrine regulation.</li>
                  <li><strong>Unit 6 (Genetics & Molecular Biology):</strong> DNA replication, transcription, translation, Mendelian crosses, pedigrees, and recombinant DNA technology.</li>
                  <li><strong>Unit 7 & 8 (Environmental Biology & Microbiology):</strong> Ecosystem energy flow, biomes, biogeochemical cycles, microbial growth curves, and industrial applications.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Biology Key Principle: </span>
                Answers must strictly follow the National Institute of Education (NIE) English/Tamil Resource Book. Draw neat, well-labeled diagrams in pencil for structured essays to gain full visual representation points.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Frequently Asked Questions (FAQ) Section */}
      <div className="bg-slate-50/80 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Frequently Asked Questions for G.C.E. A/L Candidates
          </h3>
        </div>

        {[
          {
            q: 'Where do the past papers and marking schemes on Paper Express come from?',
            a: 'All national examination papers are archived public documents originally administered by the Department of Examinations, Sri Lanka. FWC Pilot papers originate from Thondaimanaru FWC assessments, and pilot papers are curated from top universities (such as University of Moratuwa) and provincial educational boards for student study purposes.'
          },
          {
            q: 'Are all past papers and marking schemes free to download?',
            a: 'Yes, 100% free! Every document is linked directly through Google Drive with zero paywalls, forced subscriptions, or hidden charges. Students can view online or download PDFs directly to their device for offline study.'
          },
          {
            q: 'How should I use marking schemes to maximize my Z-score?',
            a: 'After attempting a past paper under strict timed conditions (2 hours for MCQ, 3 hours for Essay), compare your answers point-by-point with the official marking scheme. Note where marks were deducted for missing units, omitted intermediate steps, or inexact scientific terminology. Maintain an error logbook to review before the final exam.'
          },
          {
            q: 'How does Paper Express support my privacy and data security?',
            a: 'Paper Express does not require mandatory account registration to access past papers or study resources. Any saved bookmarks or study timer sessions remain securely in your local browser storage. We adhere to international privacy standards and Google AdSense publisher transparency policies.'
          }
        ].map((item, idx) => (
          <div 
            key={idx}
            className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all"
          >
            <button
              onClick={() => toggleFaq(idx)}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <span>{item.q}</span>
              {openFaq === idx ? (
                <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </button>
            {openFaq === idx && (
              <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
