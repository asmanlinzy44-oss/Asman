import React from 'react';
import { Play, Lock, Clock, ExternalLink, CheckCircle, FileText } from 'lucide-react';
import { VideoLesson, User } from '../types';
import { getDriveDirectViewUrl } from '../utils/drive';

interface VideoCardProps {
  video: VideoLesson;
  user: User | null;
  onPlay: (video: VideoLesson) => void;
  onRequireLogin: () => void;
  isWatched: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  user,
  onPlay,
  onRequireLogin,
  isWatched,
}) => {
  const handleClick = () => {
    if (!user) {
      onRequireLogin();
    } else {
      onPlay(video);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1">
      <div>
        {/* Video Thumbnail Preview Area */}
        <div 
          onClick={handleClick}
          className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center group/thumb"
        >
          {/* YouTube Thumbnail Image */}
          <img
            src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt={video.titleEn}
            className="w-full h-full object-cover opacity-85 group-hover/thumb:opacity-95 group-hover/thumb:scale-105 transition-all duration-300"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* Overlay Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Central Play/Lock Button */}
          <div className="absolute z-10 w-12 h-12 rounded-2xl bg-[#0066FF] text-white flex items-center justify-center group-hover/thumb:bg-blue-600 group-hover/thumb:scale-110 transition-transform shadow-lg border border-white/20">
            {!user ? (
              <Lock className="w-5 h-5 text-amber-300" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </div>

          {/* Duration & Watched Indicator */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white z-10">
            <span className="font-mono bg-black/70 px-2 py-0.5 rounded-md text-[11px] backdrop-blur-xs flex items-center gap-1 border border-white/10">
              <Clock className="w-3 h-3 text-sky-400" />
              {video.durationMinutes} min
            </span>

            {isWatched ? (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            ) : !user ? (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                Login to Watch
              </span>
            ) : (
              <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                In-Player
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4">
          {/* Metadata line */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 truncate">
            <span className="font-bold text-[#0066FF] bg-blue-50 px-2 py-0.5 rounded-md">
              {video.subjectNameEn}
            </span>
            <span className="text-slate-400 font-mono">· Unit {video.unitNumber}</span>
            <span className="text-slate-400 font-mono">· {video.chapters.length} Chapters</span>
          </div>

          {/* Title */}
          <h4 
            onClick={handleClick}
            className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors leading-snug mb-2 cursor-pointer line-clamp-2"
          >
            {video.titleEn}
          </h4>

          {/* Teacher Information */}
          <div className="text-xs text-slate-600 mb-2">
            <p className="font-semibold text-slate-800 truncate">
              {video.teacherName}
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {video.unitNameEn}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action: Only Play Now button as requested */}
      <div className="p-4 pt-0">
        <button
          onClick={handleClick}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0066FF] via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          <span>Play Now</span>
        </button>
      </div>
    </div>
  );
};
