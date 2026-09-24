import React from 'react';
import { X, BookmarkCheck, ExternalLink, Eye, Trash2 } from 'lucide-react';
import { PaperResource } from '../types';
import { getDriveDirectViewUrl } from '../utils/drive';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedResources: PaperResource[];
  onRemoveBookmark: (id: string) => void;
  onPreview: (res: PaperResource) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarkedResources,
  onRemoveBookmark,
  onPreview,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-800 text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold tracking-tight">
              Saved Study Bookmarks ({bookmarkedResources.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {bookmarkedResources.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <BookmarkCheck className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-slate-800 text-sm">No saved papers yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click the bookmark ribbon icon on any paper card to save it here for fast revision!
              </p>
            </div>
          ) : (
            bookmarkedResources.map((res) => (
              <div
                key={res.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-0.5">
                    <span className="font-bold text-[#0066FF]">{res.subjectNameEn}</span>
                    <span aria-hidden="true">·</span>
                    <span>{res.year}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{res.schoolOrSource}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 truncate">{res.titleEn}</h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onPreview(res);
                      onClose();
                    }}
                    className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors cursor-pointer"
                    title="Preview PDF"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={getDriveDirectViewUrl(res.driveLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-[#0066FF] hover:bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Drive</span>
                  </a>

                  <button
                    onClick={() => onRemoveBookmark(res.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
