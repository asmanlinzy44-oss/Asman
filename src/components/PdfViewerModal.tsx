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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[94vh] max-h-[950px] bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden text-white">
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
                  {(resource?.id === 'past-bio-master-1994-2026' || resource?.driveLink.includes('1AhgjZ6aYV7WTB0sXi1SIVnfBDehq_e2c')
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
          <span className="font-mono text-sky-400 font-bold shrink-0 ml-2">Study Pro Exam Hub</span>
        </div>
      </div>
    </div>
  );
};
