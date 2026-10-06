import React from 'react';
import { X, ShieldCheck, FileText, Info, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { playRoboticClick } from '../utils/audio';

export type LegalModalType = 'privacy' | 'terms' | 'about' | 'disclaimer' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 google-anno-skip"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col google-anno-skip"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              {type === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {type === 'terms' && <FileText className="w-5 h-5" />}
              {type === 'about' && <Info className="w-5 h-5" />}
              {type === 'disclaimer' && <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {type === 'privacy' && 'Privacy Policy & Cookie Disclosure'}
                {type === 'terms' && 'Terms of Service'}
                {type === 'about' && 'About Paper Express'}
                {type === 'disclaimer' && 'Academic Disclaimer & Fair Use Notice'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Paper Express — Sri Lankan G.C.E. A/L Academic Portal · Last Updated: October 2026
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playRoboticClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {type === 'privacy' && (
            <>
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-blue-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Google AdSense Compliance & Cookie Transparency</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Paper Express adheres strictly to the Google AdSense Program Policies, Google Publisher Policies, General Data Protection Regulation (GDPR), and applicable privacy guidelines. This page details how cookies, advertisements, and personal data are handled.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">1. Information We Collect</h3>
                <p>
                  Paper Express is designed as a free, student-centric academic repository. We do not require visitors to register an account or provide payment information to access our past paper downloads, marking schemes, or study resources. When you use our optional features (such as bookmarks, study timer, or student inquiry form), minimal technical data or user-submitted details (e.g. email, message) are stored locally in your browser's localStorage or synced to our secure Firebase database.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">2. Google AdSense & Third-Party Advertising Cookies</h3>
                <p>
                  We partner with third-party advertising companies, including Google, to display advertisements when you visit our website. These companies may use cookies, web beacons, and related technologies to measure ad effectiveness and serve advertisements tailored to your interests.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                  <li>
                    <strong>Third-Party Vendors:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to Paper Express or other websites on the Internet.
                  </li>
                  <li>
                    <strong>Advertising Cookies:</strong> Google's use of advertising cookies enables it and its partners to serve personalized or contextual ads to our users based on their visits to Paper Express and/or other sites across the World Wide Web.
                  </li>
                  <li>
                    <strong>Opt-Out of Personalized Advertising:</strong> Users may opt out of personalized advertising by visiting{' '}
                    <a 
                      href="https://adssettings.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline font-bold inline-flex items-center gap-0.5"
                    >
                      Google Ads Settings <ExternalLink className="w-3 h-3 inline" />
                    </a>. Alternatively, users can opt out of third-party vendors' use of cookies for personalized advertising by visiting{' '}
                    <a 
                      href="https://www.aboutads.info" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline font-bold inline-flex items-center gap-0.5"
                    >
                      www.aboutads.info <ExternalLink className="w-3 h-3 inline" />
                    </a>.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">3. Log Files & Analytics</h3>
                <p>
                  Like most standard web servers, our hosting provider (Vercel) automatically logs standard network requests, including Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), referring/exit pages, platform type, date/time stamp, and number of clicks. This data is non-personally identifiable and is used solely to analyze trends, administer the site, and maintain platform stability and performance.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">4. Browser LocalStorage</h3>
                <p>
                  Paper Express utilizes modern HTML5 LocalStorage to preserve your user preferences client-side (such as your saved past paper bookmarks, study timer logs, and active stream preferences). This data resides exclusively in your browser and is never sold, leased, or distributed to third parties.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">5. Children's Online Privacy Protection (COPPA)</h3>
                <p>
                  Paper Express is an educational resource intended for Sri Lankan secondary and high school students preparing for the G.C.E. Advanced Level examination. We do not knowingly collect personal identifiable information from children under the age of 13.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">6. Contacting the Publisher</h3>
                <p>
                  If you have questions about this Privacy Policy, please reach out to our team at{' '}
                  <span className="font-bold text-blue-600">asmanlinzy44@gmail.com</span> or message us via the Contact Us modal.
                </p>
              </section>
            </>
          )}

          {type === 'terms' && (
            <>
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                  <span>Educational Use Terms & Student Charter</span>
                </div>
                <p className="text-xs">
                  By accessing Paper Express (paperexpress.vercel.app), you agree to these Terms of Service designed to keep this portal free, safe, and academically honest.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">1. Educational Non-Commercial Purpose</h3>
                <p>
                  Paper Express is provided as an open educational aid for students sitting the Sri Lankan G.C.E. Advanced Level Physical Science (Combined Mathematics) and Biological Science (Biology) streams. All materials, past papers, model questions, and revision guides are provided for personal study, revision, and academic advancement.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">2. Intellectual Property & Fair Use</h3>
                <p>
                  National past examination papers and official marking schemes are public educational documents administered by the Department of Examinations, Sri Lanka. FWC Pilot papers and school term examination papers are authored by their respective educational institutions. Paper Express indexes and curates these materials for non-commercial student revision under educational fair use principles.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">3. User Conduct</h3>
                <p>
                  Users agree not to disrupt, overload, or attempt unauthorized access to the platform's infrastructure, Firebase backend, or administrative endpoints. Automated scraping of materials in a manner that degrades service for other students is prohibited.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">4. Limitation of Liability</h3>
                <p>
                  While Paper Express makes every effort to ensure the accuracy and completeness of marking schemes, solutions, and paper links, the platform is provided on an "as-is" and "as-available" basis. Students are encouraged to cross-reference with official publications issued by the Department of Examinations, Sri Lanka.
                </p>
              </section>
            </>
          )}

          {type === 'about' && (
            <>
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Empowering Sri Lankan Advanced Level Students</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Paper Express is an independent, non-profit academic initiative created by passionate Sri Lankan educators and alumni to bridge educational resource disparities across all 9 provinces.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Our Mission</h3>
                <p>
                  The Sri Lankan G.C.E. Advanced Level examination is one of the most competitive academic milestones for science students. Access to high-quality past papers, structured marking schemes, and term examination papers should never be limited by geographical boundaries or financial barriers. Paper Express provides an organized, fast, and distraction-free academic hub where students can immediately find:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                  <li><strong>National G.C.E. A/L Past Papers:</strong> 1981 to present with full marking schemes for Combined Mathematics, Physics, Chemistry, and Biology.</li>
                  <li><strong>FWC Thondaimanaru Pilot Examinations:</strong> Renowned island-wide trial exams across all terms with comprehensive answer keys.</li>
                  <li><strong>Provincial School Term Tests:</strong> Curated 1st, 2nd, and 3rd term tests from top schools in Western, Northern, Southern, and Central provinces.</li>
                  <li><strong>University of Moratuwa Pilot Assessments:</strong> High-standard model papers for engineering and medical aspirants.</li>
                  <li><strong>Curated Subject Folders:</strong> Direct Google Drive folders with formula handbooks, unit summaries, and practical guides.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Editorial & Quality Standards</h3>
                <p>
                  Every paper and marking scheme added to Paper Express undergoes verification by subject tutors to ensure legibility, correct year classification, and accurate answer alignment. We believe in providing original academic value, clear organization, and zero intrusive distractions.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Contact the Editorial Team</h3>
                <p>
                  Connect with our editorial and developer team via Instagram{' '}
                  <a 
                    href="https://www.instagram.com/asman_linzy/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-pink-600 font-bold hover:underline"
                  >
                    @asman_linzy
                  </a>{' '}
                  or email us directly at <span className="font-bold text-blue-600">asmanlinzy44@gmail.com</span>.
                </p>
              </section>
            </>
          )}

          {type === 'disclaimer' && (
            <>
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Fair Use & Educational Non-Affiliation Disclaimer</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Paper Express is an independent educational initiative and is NOT an official agency of, nor affiliated with, the Department of Examinations, Sri Lanka or the Ministry of Education.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">1. Past Paper Ownership & Copyright</h3>
                <p>
                  The official G.C.E. Advanced Level question papers and marking schemes are the intellectual property of the Department of Examinations, Sri Lanka. Paper Express hosts and indexes these archived documents strictly under fair use principles for non-commercial educational instruction, private study, criticism, and scholarship.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">2. Third-Party Institutional Papers</h3>
                <p>
                  FWC Thondaimanaru pilot examinations, school term test papers, and University of Moratuwa pilot exams are the property of their respective schools, alumni associations, or examination committees. We acknowledge and honor the hard work of these institutions in preparing high-quality educational evaluations.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">3. Takedown & Copyright Inquiries</h3>
                <p>
                  If you are a copyright holder or institutional representative and believe any material indexed on this platform infringes your copyright or should be removed, please contact our administrative desk at{' '}
                  <span className="font-bold text-blue-600">asmanlinzy44@gmail.com</span> with details of the document. We will review and address valid requests within 48 hours.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Paper Express Academic Portal</span>
          <button
            onClick={() => {
              playRoboticClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
