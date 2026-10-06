import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Download, FileText, CheckCircle2, ShieldAlert, FolderArchive, ArrowRight, Sparkles } from 'lucide-react';
import { PaperResource } from '../types';
import { getDriveDirectViewUrl, getDriveDirectDownloadUrl, getDriveEmbedPreviewUrl } from '../utils/drive';
import { Chemistry1983Solutions } from './Chemistry1983Solutions';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: PaperResource | null;
  customDriveUrl?: string;
  customTitle?: string;
  initialMode?: 'paper' | 'scheme';
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  resource,
  customDriveUrl,
  customTitle,
  initialMode = 'paper',
}) => {
  const [viewingMode, setViewingMode] = useState<'paper' | 'scheme'>('paper');

  useEffect(() => {
    if (initialMode) {
      setViewingMode(initialMode);
    } else {
      setViewingMode('paper');
    }
  }, [initialMode, resource, isOpen]);

  if (!isOpen) return null;

  const isSchemeMode = viewingMode === 'scheme' && !!resource?.markingSchemeDriveLink;
  const currentDriveLink =
    customDriveUrl ||
    (isSchemeMode
      ? resource?.markingSchemeDriveLink!
      : resource?.driveLink || '');

  const isFolder = currentDriveLink.includes('/folders/');

  const title =
    customTitle ||
    (resource
      ? `${resource.titleEn} ${isSchemeMode ? '— [Marking Scheme]' : '— [Question Paper]'}`
      : 'PDF Document');

  const embedUrl = getDriveEmbedPreviewUrl(currentDriveLink);
  const directOpenUrl = getDriveDirectViewUrl(currentDriveLink);
  const directDownloadUrl = getDriveDirectDownloadUrl(currentDriveLink);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200 google-anno-skip">
      <div className="relative w-full max-w-5xl h-[94vh] max-h-[950px] bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden text-white google-anno-skip">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isSchemeMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-[#38BDF8]'
            }`}>
              {isFolder ? <FolderArchive className="w-5 h-5" /> : isSchemeMode ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold truncate text-slate-100">{title}</h3>
              </div>
              {resource && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="text-[#38BDF8] font-bold">{resource.subjectNameEn}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-200 font-semibold">{resource.year}</span>
                  {resource.term && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-300 font-medium">{resource.term}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{resource.schoolOrSource}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Google Drive Open Button */}
            <a
              href={directOpenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
              title="Open directly in Google Drive"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Drive</span>
              <span className="sm:hidden">Drive</span>
            </a>

            {/* Direct Download Button */}
            <a
              href={directDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prominent Paper & Scheme Switcher Sub-Bar (When marking scheme is attached) */}
        {resource?.markingSchemeDriveLink && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold hidden md:inline">Viewing Target:</span>
              <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewingMode('paper')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all font-bold flex items-center gap-2 cursor-pointer ${
                    viewingMode === 'paper'
                      ? 'bg-[#0066FF] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>📄 Question Paper</span>
                </button>
                <button
                  onClick={() => setViewingMode('scheme')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all font-bold flex items-center gap-2 cursor-pointer ${
                    viewingMode === 'scheme'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>📝 Marking Scheme & Solutions</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                isSchemeMode
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-blue-500/10 text-sky-400 border-blue-500/30'
              }`}>
                {isSchemeMode ? 'Official Scoring Key' : 'Evaluation Paper'}
              </span>
              <a
                href={isSchemeMode ? resource.markingSchemeDriveLink : resource.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-slate-300 hover:text-white underline flex items-center gap-1"
              >
                <span>Direct Link</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Content Area: Folder Explorer OR PDF Frame */}
        <div className="flex-1 bg-slate-950 relative overflow-y-auto">
          {isFolder ? (
            <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
              {/* Folder Hero Card */}
              <div className="bg-gradient-to-b from-blue-900/40 via-slate-900 to-slate-950 border border-blue-500/30 rounded-3xl p-6 sm:p-7 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 bg-[#0066FF] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                  <FolderArchive className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Official Google Drive Folder
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {resource?.titleEn || 'Examination Folder Archive'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                    This folder contains the complete series of authentic question papers, structured essays, and official marking schemes.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={directOpenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-[#0066FF] hover:bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Full Folder in Google Drive</span>
                  </a>
                </div>
              </div>

              {/* Folder Contents Checklist */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Folder Contents & Direct Access
                  </span>
                  <span className="text-xs text-sky-400 font-mono font-bold">
                    {resource?.category === 'past-papers' ? 'National Past Paper Archive' : '2022–2027 Series'}
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80 text-xs">
                  {(resource?.id === 'res-bio-all-in-one'
                    ? [
                        { year: 'Theory Books', name: 'Biology Complete Theory Books (Units 01–10 Notes & Diagrams)', link: 'https://drive.google.com/drive/folders/1QrVgGPX6BnXWvXBDeW3XPYfQLrrSEL-u' },
                        { year: 'Resource Books', name: 'National Institute of Education (NIE) Official Resource Books', link: 'https://drive.google.com/drive/folders/1B_zpnHCnHNhnnJ5RxZjKWJVgHMbRkS8d' },
                        { year: '2000+ MCQs', name: '2000+ Classified Multiple Choice Questions & Answer Keys', link: 'https://drive.google.com/drive/folders/1FxFQCKAvT00BGqReUSLxb74eNSP3h6kU' },
                        { year: 'Practical Book', name: 'Biology Practical Handbook & Laboratory Experiments Guide', link: 'https://drive.google.com/drive/folders/1dHkJnlsBq8w7xBrajRVE8b4lPLEaMSmx' },
                        { year: 'Essays', name: 'High-Yield Essay Questions Collection & Model Answer Outlines', link: 'https://drive.google.com/drive/folders/1lytpJBatznvX-yT4tXUuwXfSqU4fzLCU' },
                        { year: 'Structures', name: 'Structured Essay Question Drills & Experimental Reasoning', link: 'https://drive.google.com/drive/folders/1gTYiXZCoEm5lyZflZaHBnu0GjywF6Kn3' },
                        { year: 'Elaboration', name: 'Official Marking Elaborations & Examiner Common Mistake Notes', link: 'https://drive.google.com/drive/folders/1MX5k6hl0usT3WoARqWg_16TB1-1N8k6P' },
                        { year: 'Seminars', name: 'Support Seminar Revision Papers & Discussion Worksheets', link: 'https://drive.google.com/drive/folders/13Y-iTi8c71TC8jNhLrV4Ee0Th0TGsY8j' },
                        { year: 'Syllabus', name: 'Ministry of Education & NIE Official Biology Syllabus Guide', link: 'https://drive.google.com/drive/folders/1ygCw5mRA_P-uipqLvQ6FLjX-l80GDxqi' },
                        { year: 'Teachers', name: 'Teacher’s Instructional Guide & Pedagogical Lesson Plans', link: 'https://drive.google.com/drive/folders/1zkV6pk3qMDFQh7yrN_JNiPHNH_JFoW27' },
                      ]
                    : resource?.id === 'res-chem-all-in-one'
                    ? [
                        { year: 'Theory Books', name: 'Chemistry Complete Theory Compendiums (Units 01–14 Notes)', link: 'https://drive.google.com/drive/folders/1D9Ir-8G9soNt1wbdIbRpZVsFvMnPtc42' },
                        { year: 'Practice', name: 'Chemistry Practice Workbooks, Conversions & Calculation Problem Sets', link: 'https://drive.google.com/drive/folders/1D3rAqvsmgUtFZiTi3M-mpMMD8h9nrLWn' },
                        { year: '2000+ MCQs', name: '2000+ Classified Chemistry MCQ Master Question Bank & Solutions', link: 'https://drive.google.com/drive/folders/1gAlXk95gLtGuUoaVryDLlNR5sYJiJO2_' },
                        { year: 'Practical Book', name: 'Practical Chemistry Handbook, Titrations & Qualitative Analysis', link: 'https://drive.google.com/drive/folders/1EfkvODWMTQbsouI-Gq1dsjA0-pUL9xtP' },
                        { year: 'Resource Books', name: 'National Institute of Education (NIE) Chemistry Resource Textbooks', link: 'https://drive.google.com/drive/folders/1vTDPtTqE9DzPlxKMz7wlJ2NCjqtRHPVF' },
                        { year: 'Elaboration', name: 'Chemistry Elaborations, Marking Criteria & Reaction Roadmaps', link: 'https://drive.google.com/drive/folders/1L72xHpItk5-XbrCmGdJbLayRiJ67wAf2' },
                        { year: 'Seminars', name: 'National & Provincial Support Seminar Papers & Review Sets', link: 'https://drive.google.com/drive/folders/1ajlaa10g6w_3BzrWgSIdfP7NapBr9d_T' },
                        { year: 'Syllabus', name: 'Official NIE Chemistry Syllabus Framework & Competencies', link: 'https://drive.google.com/drive/folders/1iNSpsSdWuyoXAHzmC5O_02z6mcWZBwUz' },
                        { year: 'Teachers', name: 'Official Chemistry Teacher’s Instructional Manual & Guidelines', link: 'https://drive.google.com/drive/folders/1s8OBk_9NhCMK_xCWBha93hyuT7uf_D_V' },
                      ]
                    : resource?.id === 'res-phy-all-in-one'
                    ? [
                        { year: 'Theory Books', name: 'Physics Complete Theory Books (Units 01–11 Derivations & Notes)', link: 'https://drive.google.com/drive/folders/1-wmQU75e1_olhneID8pgcMZvFLEryMLP' },
                        { year: 'Practice', name: 'Physics Practice Workbooks, Calculation Drills & Problem Sets', link: 'https://drive.google.com/drive/folders/1YjXqAONOl19SFi3jVXUgHQPPmWDqpymM' },
                        { year: '2000+ MCQs', name: '2000+ Classified Physics MCQ Master Bank with Mathematical Reasoning', link: 'https://drive.google.com/drive/folders/14odeyJC0l21WzZOFAeLI0s2Q08rP2dy9' },
                        { year: 'Practicals', name: 'Physics 42 Mandatory Practical Experiments Handbook & Error Calculations', link: 'https://drive.google.com/drive/folders/1IWwbEQeb0A5ZQ9Yk1iDR8r7I8bs7D2CM' },
                        { year: 'Resource Books', name: 'National Institute of Education (NIE) Physics Resource Textbooks', link: 'https://drive.google.com/drive/folders/1mVbBtT1ahnPKJOxAvd0WfzjSPiSk2RVu' },
                        { year: 'Elaboration', name: 'Physics Marking Criteria Elaborations & Examiner Advice', link: 'https://drive.google.com/drive/folders/1gKXXC1Vr85MjihwYVTwS0ewEJOtNPNG1' },
                        { year: 'Seminars', name: 'National & Provincial Support Seminar Revision Papers & Sets', link: 'https://drive.google.com/drive/folders/1HReBgEPtLl_cTG9VHr4BXEVeyVW36H5s' },
                        { year: 'Syllabus', name: 'Official NIE Physics Syllabus Framework & Practical Standards', link: 'https://drive.google.com/drive/folders/13rCJj41EvlVZUYMrFaUSk6UfcpIqUtV5' },
                        { year: 'Teachers', name: 'Official Physics Teacher’s Instructional Handbook & Guidelines', link: 'https://drive.google.com/drive/folders/1biBDRENibS13kBzkTUNe5hPRzdpH3mgH' },
                      ]
                    : resource?.id === 'res-cmaths-all-in-one'
                    ? [
                        { year: 'Practice', name: 'Pure & Applied Maths Practice Books, Workbooks & Problem Sets', link: 'https://drive.google.com/drive/folders/1wHxCbxzREyVQR8503yYsvgmBhgW3PBBQ' },
                        { year: 'Seminars', name: 'Support Seminar Question Papers & Discussion Worksheets', link: 'https://drive.google.com/drive/folders/17bklvz7UZsSybQiaxhOsu6KNvKiKU4B0' },
                        { year: 'Syllabus', name: 'Official NIE Combined Mathematics Syllabus Guide & Competencies', link: 'https://drive.google.com/drive/folders/1b3_pdjrssbYv8br5req3uljzAlDO5zU8' },
                        { year: 'Teachers', name: 'Official Teacher’s Instructional Handbook & Canonical Proofs', link: 'https://drive.google.com/drive/folders/118wzikV-oMle7MNaikK5ceUf0EeX4JAG' },
                        { year: 'Useful Books', name: 'Combined Maths Standard Reference Textbooks & Formula Compendiums', link: 'https://drive.google.com/drive/folders/1-iDPOvk_jSwQ5TumDaVrmJCGGsdAxTgF' },
                      ]
                    : resource?.category === 'pilot-papers' || resource?.id?.startsWith('pilot-moratuwa')
                    ? [
                        { year: 'Moratuwa Pilot', name: `${resource?.subjectNameEn || 'Subject'} University of Moratuwa Pilot & Model Papers Master Archive`, link: resource?.driveLink || '' },
                        { year: 'Paper 1 (MCQ)', name: `${resource?.subjectNameEn || 'Subject'} Moratuwa Pilot Exam Paper 1 & Official Answer Key`, link: resource?.driveLink || '' },
                        { year: 'Paper 2 (Essay)', name: `${resource?.subjectNameEn || 'Subject'} Moratuwa Pilot Exam Paper 2 & Detailed Step Marking Scheme`, link: resource?.markingSchemeDriveLink || resource?.driveLink || '' },
                      ]
                    : resource?.id === 'past-bio-master-1994-2026' || resource?.driveLink.includes('1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c')
                    ? [
                        { year: '2026', name: 'Biology Benchmark / Model Paper & Scheme (2026 Batch)', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2025', name: 'Biology National Examination Paper & Official Marking Scheme', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2024', name: 'Biology Past Paper & Full Scoring Criteria', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2023', name: 'Biology Past Paper & Step-by-Step Marking Scheme', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2022', name: 'Biology Past Paper & Official Answer Scheme', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2021', name: 'Biology Past Paper & Island Scheme', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2020', name: 'Biology Past Paper & Scheme', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2019', name: 'Biology New Syllabus & Old Syllabus Papers', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2018', name: 'Biology Past Paper & Complete Solutions', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2015', name: 'Biology Past Paper & Official Marking Guide', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2010', name: 'Biology Past Paper & Scoring Breakdown', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2005', name: 'Biology 2005 Examination Paper & Key', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '2000', name: 'Biology Millennium Examination Paper & Key', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '1995', name: 'Biology 1995 Examination Paper & Key', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                        { year: '1994', name: 'Biology 1994 Inaugural Archive Paper & Answers', link: 'https://drive.google.com/drive/folders/1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c' },
                      ]
                    : resource?.id === 'past-chem-master-1980-2026' || resource?.driveLink.includes('1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y')
                    ? [
                        { year: '2026', name: 'Chemistry Benchmark / Model Paper & Scheme (2026 Batch)', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '2025', name: 'Chemistry National Examination Paper & Official Marking Scheme', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '2024', name: 'Chemistry Past Paper & Full Scoring Criteria', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '2023', name: 'Chemistry Past Paper & Step-by-Step Marking Scheme', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '2022', name: 'Chemistry Past Paper & Official Answer Scheme', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '2021', name: 'Chemistry Past Paper & Island Scheme', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '2020', name: 'Chemistry Past Paper & Scheme', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '2019', name: 'Chemistry New Syllabus & Old Syllabus Papers', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '2018', name: 'Chemistry Past Paper & Complete Solutions', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '2015', name: 'Chemistry Past Paper & Official Marking Guide', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '2010', name: 'Chemistry Past Paper & Scoring Breakdown', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '2000', name: 'Chemistry Millennium Examination Paper & Key', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '1990', name: 'Chemistry 1990 Examination Paper & Key', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                        { year: '1983', name: 'Chemistry 24-Page Jaffna Model Scheme & 60 MCQs Key', link: 'https://drive.google.com/file/d/1eEV1ENXxlUObFNG3zajBuOiFaJdqInjk/view?usp=sharing' },
                        { year: '1982', name: 'Chemistry Past Paper & Official Scoring Criteria', link: 'https://drive.google.com/file/d/1eEV1ENXxlUObFNG3zajBuOiFaJdqInjk/view?usp=sharing' },
                        { year: '1981', name: 'Chemistry Past Paper & Official Scoring Criteria', link: 'https://drive.google.com/file/d/13nG7ydvVO7FaYjLd6-lpN39UQKDzmMgT/view?usp=sharing' },
                        { year: '1980', name: 'Chemistry 1980 National Examination Paper & Answers', link: 'https://drive.google.com/drive/folders/1lgcoq3fEXCD3KvO1SfRdcWvb2dXOvK9Y' },
                      ]
                    : resource?.category === 'past-papers'
                    ? [
                        { year: '1983', name: 'Chemistry Past Paper & 24-page Model Marking Scheme (Jaffna)', link: 'https://drive.google.com/file/d/1eEV1ENXxlUObFNG3zajBuOiFaJdqInjk/view?usp=sharing' },
                        { year: '1982', name: 'Chemistry Past Paper & Official Scoring Criteria', link: 'https://drive.google.com/file/d/1eEV1ENXxlUObFNG3zajBuOiFaJdqInjk/view?usp=sharing' },
                        { year: '1981', name: 'Chemistry Past Paper & Official Scoring Criteria', link: 'https://drive.google.com/file/d/13nG7ydvVO7FaYjLd6-lpN39UQKDzmMgT/view?usp=sharing' },
                        { year: '2023', name: 'Physics, Chemistry, Combined Maths & Biology Papers & Schemes', link: directOpenUrl },
                        { year: 'A/L', name: 'National Examination Archive - All Science Streams', link: directOpenUrl },
                      ]
                    : [
                        { year: '2027', name: 'Physics 1st Term Paper & Official Marking Scheme', link: directOpenUrl },
                        { year: '2026', name: 'Physics 1st Term Paper & Official Marking Scheme', link: directOpenUrl },
                        { year: '2025', name: 'Physics 1st Term Paper & Official Marking Scheme', link: directOpenUrl },
                        { year: '2024', name: 'Physics 1st Term Paper & Official Marking Scheme', link: directOpenUrl },
                        { year: '2023', name: 'Physics 1st Term Paper & Official Marking Scheme', link: directOpenUrl },
                        { year: '2022', name: 'Physics 1st Term Paper & Official Marking Scheme', link: directOpenUrl },
                        { year: 'FWC', name: 'Thondaimanaru Field Work Centre Pilot Papers & Schemes', link: directOpenUrl },
                      ]
                  ).map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-sky-300 font-bold font-mono text-[11px] shrink-0">
                          {item.year}
                        </span>
                        <span className="text-slate-200 truncate">{item.name}</span>
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : resource?.id === 'past-chem-1983' && isSchemeMode ? (
            <div className="p-4 sm:p-6 max-w-5xl mx-auto">
              <Chemistry1983Solutions onOpenPdf={() => setViewingMode('paper')} />
            </div>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              title={title}
              allow="autoplay"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-amber-500" />
              <p className="text-sm">
                Preparing document preview. You can also open it directly in Google Drive.
              </p>
              <a
                href={directOpenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#0066FF] text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Google Drive</span>
              </a>
            </div>
          )}
        </div>

        {/* Bottom Bar Info */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="truncate">
            Official cloud storage mirror · Safe preview without ads or redirections
          </span>
          <span className="font-mono text-sky-400 font-bold shrink-0 ml-2">Paper Express Exam Hub</span>
        </div>
      </div>
    </div>
  );
};
