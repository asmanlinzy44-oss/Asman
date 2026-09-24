import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, FileText, Sparkles, ExternalLink, Download } from 'lucide-react';

interface Chemistry1983SolutionsProps {
  onOpenPdf?: () => void;
}

export const Chemistry1983Solutions: React.FC<Chemistry1983SolutionsProps> = ({ onOpenPdf }) => {
  const [activeSection, setActiveSection] = useState<'mcq' | 'partA' | 'partB'>('mcq');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>('q1');

  // Complete 60 MCQs Official Answers directly from 1983 Marking Scheme
  const mcqAnswers: Record<number, string> = {
    1: '1', 2: '4', 3: '3', 4: '5', 5: '2', 6: '2', 7: '5', 8: '3', 9: '4', 10: '2',
    11: '1', 12: '5', 13: '4', 14: '3', 15: '5', 16: '4', 17: '5', 18: '3', 19: '2', 20: '5',
    21: 'All (-)', 22: '5', 23: '1', 24: '3', 25: '5', 26: '2', 27: '1', 28: '3', 29: '5', 30: '2',
    31: '2', 32: '1', 33: '3', 34: '4', 35: '4', 36: '5', 37: '5', 38: '3', 39: '3', 40: '1',
    41: '3', 42: '5', 43: '1', 44: '3', 45: '4', 46: '3', 47: '3', 48: '3', 49: '4', 50: '2 or 3',
    51: '5', 52: '5', 53: '2', 54: '2', 55: '3', 56: '3', 57: '5', 58: '1', 59: '4', 60: '2',
  };

  const toggleQuestion = (qId: string) => {
    setExpandedQuestion(expandedQuestion === qId ? null : qId);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-slate-100 shadow-xl">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-sky-400 font-bold text-xs border border-blue-500/30">
              1983 G.C.E. A/L
            </span>
            <span className="text-xs text-slate-400">உயர் கல்விப் பதிப்பகம், யாழ்ப்பாணம்</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            1983 க.பொ.த (உயர்தரம்) இரசாயனவியல் — உத்தியோகபூர்வ மாதிரிவிடைகள்
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            பகுதி 1 (60 பல்தேர்வு வினாக்கள்) + பகுதி A (அமைப்புக்கட்டுரை 1–4) + பகுதி B (கட்டுரை 5–10) படிமுறைத் தீர்வுகள்
          </p>
        </div>

        {onOpenPdf && (
          <button
            onClick={onOpenPdf}
            className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>24 பக்க மூல ஆவணப் பார்வை</span>
          </button>
        )}
      </div>

      {/* Segment Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSection('mcq')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === 'mcq'
              ? 'bg-[#0066FF] text-white shadow-xs font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-300" />
          <span>பகுதி 1: MCQ விடைகள் (1–60)</span>
        </button>
        <button
          onClick={() => setActiveSection('partA')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === 'partA'
              ? 'bg-[#0066FF] text-white shadow-xs font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-sky-300" />
          <span>பகுதி A: அமைப்புக்கட்டுரை (Q1–Q4)</span>
        </button>
        <button
          onClick={() => setActiveSection('partB')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === 'partB'
              ? 'bg-[#0066FF] text-white shadow-xs font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>பகுதி B: கட்டுரைத் தீர்வுகள் (Q5–Q10)</span>
        </button>
      </div>

      {/* Section Content */}
      <div className="p-4 sm:p-6">
        {/* MCQ Grid */}
        {activeSection === 'mcq' && (
          <div className="space-y-4">
            <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3 text-xs text-sky-200 flex items-center justify-between">
              <span>
                <strong>இரசாயனவியல் 1 (MCQ):</strong> 1983 ஆம் ஆண்டுப் பரீட்சையின் 60 வினாக்களுக்குமான உத்தியோகபூர்வ விடைக் குறிப்பு.
              </span>
              <span className="font-mono text-sky-300 font-bold shrink-0 ml-2">Total: 60 Qs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
              {Array.from({ length: 60 }, (_, i) => i + 1).map((qNum) => {
                const ans = mcqAnswers[qNum];
                return (
                  <div
                    key={qNum}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center hover:border-blue-500/50 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-slate-400">Q{qNum < 10 ? `0${qNum}` : qNum}</span>
                    <span className="text-sm font-black text-sky-400 font-mono mt-0.5">({ans})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Part A: Structured Essay (Q1-Q4) */}
        {activeSection === 'partA' && (
          <div className="space-y-3">
            {/* Q1 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => toggleQuestion('q1')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sky-400 font-mono text-xs">வினா 01</span>
                  <span>ஆவர்த்தன அட்டவணை, அணு ஆரை, மின்னெதிர்த்தன்மை & அயனாக்கற் சக்தி</span>
                </div>
                {expandedQuestion === 'q1' ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedQuestion === 'q1' && (
                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-3 bg-slate-950/80 leading-relaxed font-sans">
                  <div>
                    <strong className="text-sky-300">1. (அ) மூலக இனங்காணல்:</strong>
                    <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-slate-300">
                      <li><strong>D, T:</strong> R அதி பெரிய ஆரை உடையது (1ம் கூட்டம்), M அதி சிறிய ஆரை உடையது (7ம் கூட்டம்). Q பூச்சியக் கூட்டம் (அரிய வாயுக்கள்). ஆகவே <strong>D மற்றும் T</strong> ஆவர்த்தன அட்டவணையின் <strong>2ம் கூட்டத்தைச்</strong> சேர்ந்தவை.</li>
                      <li><strong>அதிகூடிய மின்னெதிரான மூலகம்:</strong> <strong>M</strong> (7ம் கூட்ட ஹலோஜன் மூலகம்).</li>
                      <li><strong>அதி குறைந்த முதலாம் அயனாக்கற் சக்தி:</strong> <strong>R</strong> — காரணம்: இதன் பொது இலத்திரன் நிலைமைப்பு (n-1)s² (n-1)p⁶ ns¹ ஆகும்; தனித்த வெளிக்கூட்டு இலத்திரனை அதி இலகுவாக இழக்கும்.</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-sky-300">1. (இ) ஒட்சியேற்றல் & பிணைப்பு:</strong>
                    <p className="mt-1">
                      M மிக வலிமை கூடிய ஒட்சியேற்றும் கருவியாகும். M மற்றும் Cl இரண்டும் மின்னெதிர்த்தன்மை உயர்ந்த மூலகங்கள்; அவற்றிடையே மின்னெதிர்த்தன்மை வித்தியாசம் மிகக் குறைவு என்பதால் இரண்டும் சேர்ந்து <strong>பங்கீட்டுச் சேர்வையை (Covalent compound)</strong> உருவாக்கும்.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Q2 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => toggleQuestion('q2')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sky-400 font-mono text-xs">வினா 02</span>
                  <span>கதிர்த்தொழிற்பாடு அரைவாழ்வுக்காலம், உப்புக்கரைசல் செறிவுகள் & ஒட்சியேற்ற எண்கள்</span>
                </div>
                {expandedQuestion === 'q2' ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedQuestion === 'q2' && (
                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-3 bg-slate-950/80 leading-relaxed">
                  <div>
                    <strong className="text-sky-300">2. (அ) கதிர்த்தொழிற்பாடு கணக்கீடுகள்:</strong>
                    <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                      <li><strong>அரைவாழ்வுக்காலம் (Half-Life):</strong> வரைபிலிருந்து t₁/₂ = <strong>5,600 ஆண்டுகள் (years)</strong>.</li>
                      <li><strong>0.625 mg ஆக குறைய எடுக்கும் நேரம்:</strong> 5g → 2.5g → 1.25g → 0.625g = 3 அரைவாழ்வுக்காலங்கள். ஆகவே காலம் = 3 × 5600 = <strong>16,800 ஆண்டுகள்</strong>.</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-sky-300">2. (ஆ) மோலார் செறிவு கணிப்பு:</strong>
                    <p className="mt-1">
                      சோடியம் குளோரைட்டு செறிவு = <strong>0.0296 mol dm⁻³</strong>.<br />
                      Mg²⁺ அயன்களின் செறிவு = <strong>0.0416 mol dm⁻³</strong>.<br />
                      <strong>Pb²⁺ உறுதிப்படுத்தல் சோதனை:</strong> KI கரைசலைச் சேர்க்கும்போது பிரகாசமான மஞ்சள் நிற PbI₂ வீழ்படிவு தோன்றும்; இதைச் சூடாக்கிக் குளிரச் செய்யும்போது அழகான தங்கத் துகள்களாகப் படிகமாகும் (Golden spangles).
                    </p>
                  </div>
                  <div>
                    <strong className="text-sky-300">2. (ஈ) நைதரசனின் (N) ஒட்சியேற்ற நிலைகள்:</strong>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2 font-mono">
                      <div className="bg-slate-900 p-1.5 rounded text-center">+5 : N₂O₅</div>
                      <div className="bg-slate-900 p-1.5 rounded text-center">+4 : N₂O₄ / NO₂</div>
                      <div className="bg-slate-900 p-1.5 rounded text-center">+3 : N₂O₃</div>
                      <div className="bg-slate-900 p-1.5 rounded text-center">+2 : NO</div>
                      <div className="bg-slate-900 p-1.5 rounded text-center">+1 : N₂O</div>
                      <div className="bg-slate-900 p-1.5 rounded text-center">0 : N₂</div>
                      <div className="bg-slate-900 p-1.5 rounded text-center">-1 : NH₂OH</div>
                      <div className="bg-slate-900 p-1.5 rounded text-center">-2 : N₂H₄</div>
                      <div className="bg-slate-900 p-1.5 rounded text-center">-3 : NH₃</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Q3 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => toggleQuestion('q3')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sky-400 font-mono text-xs">வினா 03</span>
                  <span>அனுபவச் சூத்திரம், ஈனோட்டுச் சேர்வைகள் & சேதன இரசாயனப் பொறிமுறை</span>
                </div>
                {expandedQuestion === 'q3' ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedQuestion === 'q3' && (
                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-3 bg-slate-950/80 leading-relaxed">
                  <div>
                    <strong className="text-sky-300">3. (அ) அனுபவச் சூத்திரம் கணித்தல்:</strong>
                    <p className="mt-1 font-mono">
                      C : 33 / 12 = 2.75 → 3<br />
                      Cl : 65 / 35.5 = 1.83 → 2<br />
                      H : 2 / 1 = 2.00 → 2<br />
                      ∴ அனுபவச் சூத்திரம் = <strong>C₃H₂Cl₂</strong> (மூலக்கூற்றுத் திணிவு = 109, n = 1, கட்டமைப்பு: Cl₂CH-C≡C-H அல்லது 3,3-இருகுளோரோபுரப்பீன்).
                    </p>
                  </div>
                  <div>
                    <strong className="text-sky-300">3. (ஆ) அமில ஊக்கியிலான எசுத்தராக்கல் பொறிமுறை:</strong>
                    <p className="mt-1">
                      CH₃COOH + CH₃CH₂OH → CH₃COOCH₂CH₃ + H₂O (H₂SO₄ முன்னிலையில் காபொனைல் ஒக்சிசன் புரோத்தனேற்றப்பட்டு தாக்கம் நடைபெறும்).
                    </p>
                  </div>
                  <div>
                    <strong className="text-sky-300">3. (இ) பீனோல் vs அமீன் இரசாயன வேறுபடுத்தல்:</strong>
                    <p className="mt-1">
                      பீனோலுக்கு நடுநிலையான FeCl₃ கரைசல் சேர்க்கும்போது ஊதா நிறக் கரைசல் தோன்றும். முதலாம் அமீனுக்கு குளிர்ந்த NaNO₂ + HCl சேர்க்கப்பட்டு ஈரசோனியம் உப்பு உருவாக்கப்பட்டு β-நப்தோல் உடன் செம்மஞ்சள் நிற சாயம் (Azo dye) பெறப்படும்.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Q4 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => toggleQuestion('q4')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sky-400 font-mono text-xs">வினா 04</span>
                  <span>சேதன இரசாயன மாற்றீடுகள் & பலபடிகள் (Clemmensen Reduction, Bakelite)</span>
                </div>
                {expandedQuestion === 'q4' ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedQuestion === 'q4' && (
                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-3 bg-slate-950/80 leading-relaxed font-mono">
                  <div>
                    <strong className="text-sky-300 font-sans">4. (அ) மாற்றீட்டுத் தாக்கங்கள்:</strong>
                    <p className="mt-1">
                      1. C₆H₅COCH₃ ──(Zn-Hg / conc. HCl)──&gt; C₆H₅CH₂CH₃ (கிளமென்சன் தாழ்த்தல்)<br />
                      2. RCOONa + CH₃COCl ──(Δ)──&gt; RCOOCOCH₃ + NaCl (அமில அன்ஹைட்ரைட்டு தயாரிப்பு)
                    </p>
                  </div>
                  <div>
                    <strong className="text-sky-300 font-sans">4. (ஆ) பலபடி தாக்கம்:</strong>
                    <p className="mt-1">
                      பீனோல் (C₆H₅OH) + ஃபார்மால்டிஹைட் (HCHO) கார ஊக்கியில் சூடாக்கப்படும்போது குறுக்கு இணைப்புடைய உறுதியான <strong>பேக்கலைற்று (Bakelite)</strong> பீனோல்-ஃபார்மால்டிஹைட் பிசின் பெறப்படும்.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Part B: Essay Solutions (Q5-Q10) */}
        {activeSection === 'partB' && (
          <div className="space-y-3">
            {/* Q5 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => toggleQuestion('q5')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs">வினா 05</span>
                  <span>ஒஸ்ட்வால்டின் நீர்த்தல் விதி (Ostwald's Dilution Law) & pH நியமிப்புக் கோடு</span>
                </div>
                {expandedQuestion === 'q5' ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedQuestion === 'q5' && (
                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 bg-slate-950/80 leading-relaxed font-sans">
                  <p><strong>விதியின் நிறுவல்:</strong> மென்னமிலம் HA ⇌ H⁺ + A⁻. ஆரம்பச் செறிவு c, சமநிலையில் [H⁺] = cα, [A⁻] = cα, [HA] = c(1-α). K = (cα²)/(1-α). α &lt;&lt; 1 எனின் K = cα², α = √(K/c). [H⁺] = √(cK).</p>
                  <p><strong>நியமிப்பு முடிவுப்புள்ளி:</strong> pH மாற்றம் 6.5 → 10 வரை செங்குத்தாக நிகழும். முடிவுப்புள்ளி கார ஊடகத்தில் தோன்றுவதால் <strong>பினோல்ப் தலின் (Phenolphthalein)</strong> காட்டியே (pH எல்லை 8.2–10.0) பொருத்தமானது.</p>
                </div>
              )}
            </div>

            {/* Q6 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => toggleQuestion('q6')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs">வினா 06</span>
                  <span>வெப்ப இரசாயனம் (Hess's Law) & தாக்கவேகவியல் கடிகாரத் தாக்கம்</span>
                </div>
                {expandedQuestion === 'q6' ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedQuestion === 'q6' && (
                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 bg-slate-950/80 leading-relaxed">
                  <p><strong>ஹெஸ்ஸின் வெப்பக் கூட்டல் விதி:</strong> ΔH₁ = ΔH₂ + ΔH₃. ஆரம்ப மற்றும் இறுதி நிலைகள் சமமாயின், தாக்கம் நிகழும் பாதையில் வெப்பவுள்ளுறை மாற்றம் தங்கியிருக்காது.</p>
                  <p><strong>கடிகாரத் தாக்கம்:</strong> H₂O₂ + 2I⁻ + 2H⁺ → I₂ + 2H₂O (மெதுவானது), I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻ (வேகமானது). S₂O₃²⁻ முழுமையாகத் தீர்ந்தவுடன் எஞ்சிய I₂ மாப்பொருளுடன் சேர்ந்து நீல நிறத்தைக் கொடுக்கும். தாக்க வரிசை n = 1.</p>
                </div>
              )}
            </div>

            {/* Q7 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => toggleQuestion('q7')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs">வினா 07</span>
                  <span>இலட்சிய வாயு நடத்தை விலகல், Kp & Kc தொடர்பு மற்றும் சமநிலை நகர்வு</span>
                </div>
                {expandedQuestion === 'q7' ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedQuestion === 'q7' && (
                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 bg-slate-950/80 leading-relaxed">
                  <p><strong>விலகலுக்கான காரணங்கள்:</strong> மெய்வாயு மூலக்கூறுகளுக்கிடையே உள்ள கவர்ச்சி விசைகள் மற்றும் மூலக்கூறுகள் அடைக்கும் புறக்கணிக்க முடியாத பருமன்.</p>
                  <p><strong>தொடர்பு:</strong> Kp = Kc(RT)^Δn. வெப்பநிலை கூடும்போது முன்தாக்கம் அகவெப்பத் தாக்கமாயின் Kp கூடும்; அமுக்கம் அதிகரிக்கப்படும்போது மூலக்கூறுகளின் எண்ணிக்கை குறைவான பக்கத்தை நோக்கிச் சமநிலை நகரும்.</p>
                </div>
              )}
            </div>

            {/* Q8 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => toggleQuestion('q8')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs">வினா 08</span>
                  <span>ஈதற்பிணைப்பு (Coordinate Bond) & அசேதன இரசாயனப் போக்குகள்</span>
                </div>
                {expandedQuestion === 'q8' ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedQuestion === 'q8' && (
                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 bg-slate-950/80 leading-relaxed">
                  <p><strong>ஈதற்பிணைப்பு விளக்கம்:</strong> பிணைப்புக்குரிய இலத்திரன் சோடி ஒரு அணுவினாலேயே வழங்கப்பட்டு இரு அணுக்களாலும் பங்கிடப்படுதல் (எ.கா: H₃N: → BCl₃).</p>
                  <p><strong>HF vs CO₂ vs SiO₂:</strong> HF மூலக்கூறுகளுக்கிடையே வன்மையான மூலக்கூற்றிடை நைதரசன் பிணைப்பு உள்ளதால் உயர் கொதிநிலையைக் கொண்டது. CO₂ எளிய தனித்த மூலக்கூறுகளைக் கொண்டது; ஆனால் SiO₂ வலிமையான முப்பரிமாணப் பெருமூலக்கூற்று வலைப்பின்னல் அமைப்பைக் கொண்டதால் மிக உயர் உருகுநிலையைக் கொண்டுள்ளது.</p>
                </div>
              )}
            </div>

            {/* Q9 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => toggleQuestion('q9')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs">வினா 09</span>
                  <span>கந்தகத்தின் ஒட்சியேற்ற-தாழ்த்தல் பண்புகள் & கற்றயன் பிரித்தறிதல் (Zn²⁺, Al³⁺, Mg²⁺)</span>
                </div>
                {expandedQuestion === 'q9' ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedQuestion === 'q9' && (
                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 bg-slate-950/80 leading-relaxed">
                  <p><strong>கந்தகம் (S):</strong> உலோகங்களுடன் தாக்கமடையும்போது ஒட்சியேற்றும் கருவியாகச் செயல்படும் (S + 2Na → Na₂S, S + Mg → MgS). செறிந்த HNO₃ அல்லது H₂SO₄ உடன் தாக்கமடையும்போது தாழ்த்தும் கருவியாகச் செயல்படும் (S + 2H₂SO₄ → 3SO₂ + 2H₂O).</p>
                  <p><strong>கற்றயன் பிரித்தறிதல்:</strong> NaOH சேர்க்கும்போது Mg(OH)₂ வெண் வீழ்படிவு மிகையில் கரையாது. Al(OH)₃ மற்றும் Zn(OH)₂ வெண் வீழ்படிவுகள் மிகை NaOH இல் கரைந்து அணைவு அயன்களைத் தரும். அவற்றுள் அம்மோனியா கரைசலில் Zn²⁺ கரையும்; Al³⁺ கரையாது.</p>
                </div>
              )}
            </div>

            {/* Q10 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => toggleQuestion('q10')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs">வினா 10</span>
                  <span>கைத்தொழில் இரசாயனம்: சோல்வே முறை (Solvay Process) & ஹேபர் முறை (Haber Process)</span>
                </div>
                {expandedQuestion === 'q10' ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedQuestion === 'q10' && (
                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 bg-slate-950/80 leading-relaxed">
                  <p><strong>சோல்வே முறை (Na₂CO₃ தயாரிப்பு):</strong> மூலப்பொருட்கள்: கடல் நீர் (NaCl), சுண்ணக்கல் (CaCO₃), அமோனியா (NH₃). தாக்கம்: NH₃ + CO₂ + H₂O + NaCl → NaHCO₃↓ + NH₄Cl. 2NaHCO₃ ──(Δ)──&gt; Na₂CO₃ + CO₂ + H₂O.</p>
                  <p><strong>அமோனியா மீளப்பெறல்:</strong> 2NH₄Cl + Ca(OH)₂ → 2NH₃↑ + CaCl₂ + 2H₂O. பெறப்படும் CaCl₂ கைத்தொழிலில் உலர்த்தியாகவும் வீதிகளில் தூசியடக்கியாகவும் பயன்படும்.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
