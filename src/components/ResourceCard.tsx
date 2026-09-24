import React from 'react';
import { ExternalLink, Download, Eye, Bookmark, CheckCircle2, FileText, FolderArchive, ArrowRight } from 'lucide-react';
import { PaperResource } from '../types';
import { getDriveDirectViewUrl, getDriveDirectDownloadUrl } from '../utils/drive';

interface ResourceCardProps {
  resource: PaperResource;
  onPreview: (res: PaperResource, mode?: 'paper' | 'scheme') => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onPreview,
  isBookmarked,
  onToggleBookmark,
}) => {
  const isSchemeStandalone =
    resource.titleEn.toLowerCase().includes('marking scheme') ||
    resource.titleEn.toLowerCase().includes('answers');

  const hasDualPaperAndScheme = Boolean(resource.markingSchemeDriveLink);
  const isFolder = resource.driveLink.includes('/folders/');

  const directDriveUrl = getDriveDirectViewUrl(resource.driveLink);
  const directDownloadUrl = getDriveDirectDownloadUrl(resource.driveLink);

  const schemeDriveUrl = resource.markingSchemeDriveLink
    ? getDriveDirectViewUrl(resource.markingSchemeDriveLink)
    : directDriveUrl;

  const getCategoryLabel = () => {
    switch (resource.category) {
      case 'past-papers':
        return 'National Past Paper';
      case 'fwc-papers':
      case 'term-papers':
        return 'FWC & Term Tests';
      case 'theory-notes':
        return 'Theory Note';
      case 'useful-resources':
        return 'Study Guide';
      default:
        return 'Resource';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-0.5 relative overflow-hidden">
      {/* Top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 transition-opacity ${
          isSchemeStandalone
            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
            : hasDualPaperAndScheme
            ? 'bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-500'
            : 'bg-gradient-to-r from-blue-600 to-sky-400'
        }`}
      />

      <div className="p-5">
        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap truncate">
            <span className="font-bold text-[#0066FF] bg-blue-50 px-2 py-0.5 rounded-md">
              {resource.subjectNameEn}
            </span>
            <span className="text-slate-700 font-mono font-bold">· {resource.year}</span>
            {resource.term && (
              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md font-semibold text-[11px]">
                {resource.term}
              </span>
            )}
            <span className="text-slate-400">· {getCategoryLabel()}</span>
          </div>

          <button
            onClick={() => onToggleBookmark(resource.id)}
            title={isBookmarked ? 'Remove Bookmark' : 'Save to Bookmarks'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Resource Format Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {hasDualPaperAndScheme ? (
            <>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50 text-[#0066FF] border border-blue-100">
                <FileText className="w-3 h-3" /> Question Paper
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" /> Marking Scheme Included
              </span>
            </>
          ) : isSchemeStandalone ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-3 h-3" /> Official Marking Scheme & Solutions
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50 text-[#0066FF] border border-blue-100">
              <FileText className="w-3 h-3" /> Question Paper
            </span>
          )}

          {isFolder && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
              <FolderArchive className="w-3 h-3" /> Drive Folder
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors leading-snug mb-2 line-clamp-2">
          {resource.titleEn}
        </h4>

        {/* Tamil Title */}
        {resource.titleTa && (
          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-1 mb-2">
            {resource.titleTa}
          </p>
        )}

        {/* Source / School info */}
        <div className="text-xs text-slate-500 space-y-1 mb-2">
          <p className="truncate">
            <span className="text-slate-400">Board / Source: </span>
            <span className="text-slate-700 font-semibold">{resource.schoolOrSource}</span>
          </p>
          {resource.unitOrTopic && (
            <p className="truncate text-slate-500">
              <span className="text-slate-400">Content: </span>
              <span className="font-medium text-slate-600">{resource.unitOrTopic}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Area: Clear, intuitive Dual-Access for Paper & Scheme */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-2">
        {hasDualPaperAndScheme ? (
          <div className="space-y-2">
            {/* 1. Question Paper Action Bar */}
            <div className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="w-4 h-4 text-[#0066FF] shrink-0" />
                <span className="text-xs font-bold text-slate-800 truncate">Question Paper</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onPreview(resource, 'paper')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Preview Question Paper in App"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Preview</span>
                </button>
                <a
                  href={directDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0066FF] hover:bg-blue-600 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Download Question Paper directly"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <a
                  href={directDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Open Question Paper in Google Drive"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 2. Marking Scheme Action Bar */}
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-emerald-900 truncate">Marking Scheme</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onPreview(resource, 'scheme')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Preview Marking Scheme in App"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Scheme</span>
                </button>
                <a
                  href={getDriveDirectDownloadUrl(resource.markingSchemeDriveLink || resource.driveLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Download Marking Scheme directly"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <a
                  href={schemeDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                  title="Open Marking Scheme in Google Drive"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Single Item Action Row */
          <div className="flex items-center justify-between gap-2 text-xs">
            <button
              onClick={() => onPreview(resource, isSchemeStandalone ? 'scheme' : 'paper')}
              className={`px-3 py-2 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSchemeStandalone
                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isSchemeStandalone ? 'Preview Scheme' : 'Preview Paper'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <a
                href={directDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3.5 py-2 rounded-xl font-bold text-white transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                  isSchemeStandalone ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#0066FF] hover:bg-blue-600'
                }`}
                title="Open in Google Drive"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Drive</span>
              </a>

              <a
                href={directDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Download directly"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
