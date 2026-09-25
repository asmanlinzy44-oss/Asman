import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  X, CheckCircle, BookOpen, Play, Pause,
  Maximize2, Minimize2, Zap, ShieldCheck, 
  RotateCw, RotateCcw, ListVideo, Volume2, VolumeX,
  Gauge, Sparkles, SlidersHorizontal, Tv, Check
} from 'lucide-react';
import { VideoLesson, User, UserNote } from '../types';
import { getYoutubeEmbedUrl } from '../utils/drive';

interface VideoPlayerModalProps {
  video: VideoLesson | null;
  onClose: () => void;
  user: User | null;
  onSaveNote?: (note: UserNote) => void;
  onToggleWatched?: (videoId: string) => void;
  isWatched?: boolean;
  onOpenPdfPreview?: (driveUrl: string, title: string) => void;
}

interface SpeedConfig {
  rate: number;
  label: string;
  badge: string;
  color: string;
  glowColor: string;
}

const GAMING_SPEED_OPTIONS: SpeedConfig[] = [
  { rate: 0.75, label: '0.75x', badge: 'SLOW',   color: 'from-amber-500 to-yellow-600', glowColor: 'rgba(245,158,11,0.5)' },
  { rate: 1.0,  label: '1.0x',  badge: 'NORMAL', color: 'from-blue-600 to-cyan-600',   glowColor: 'rgba(6,182,212,0.5)' },
  { rate: 1.25, label: '1.25x', badge: 'BOOST',  color: 'from-cyan-500 to-blue-600',   glowColor: 'rgba(0,210,255,0.6)' },
  { rate: 1.5,  label: '1.5x',  badge: 'TURBO',  color: 'from-indigo-500 to-purple-600', glowColor: 'rgba(147,51,234,0.6)' },
  { rate: 1.75, label: '1.75x', badge: 'NITRO',  color: 'from-fuchsia-500 to-pink-600',  glowColor: 'rgba(236,72,153,0.6)' },
  { rate: 2.0,  label: '2.0x',  badge: 'WARP',   color: 'from-rose-500 to-red-600',     glowColor: 'rgba(244,63,94,0.7)' },
];

interface QualityConfig {
  id: string;
  label: string;
  badge: string;
  tag: string;
  detail: string;
  color: string;
  glowColor: string;
}

const QUALITY_OPTIONS: QualityConfig[] = [
  { id: 'hd1080', label: '1080p', badge: '1080P', tag: 'Full HD',     detail: 'Crystal clear maximum quality',      color: 'from-cyan-400 to-blue-600', glowColor: 'rgba(6,182,212,0.6)' },
  { id: 'hd720',  label: '720p',  badge: '720P',  tag: 'HD',          detail: 'High definition recommended for all', color: 'from-blue-500 to-indigo-600', glowColor: 'rgba(59,130,246,0.6)' },
  { id: 'large',   label: '480p',  badge: '480P',  tag: 'Standard',    detail: 'Balanced quality & less data',       color: 'from-emerald-500 to-teal-600', glowColor: 'rgba(16,185,129,0.5)' },
  { id: 'medium',  label: '360p',  badge: '360P',  tag: 'Data Saver',  detail: 'Optimized for mobile data savings',  color: 'from-amber-500 to-orange-600', glowColor: 'rgba(245,158,11,0.5)' },
  { id: 'auto',    label: 'Auto',  badge: 'AUTO',  tag: 'Recommended', detail: 'Automatically adjusts to connection', color: 'from-purple-500 to-fuchsia-600', glowColor: 'rgba(168,85,247,0.6)' },
];

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  user,
  onSaveNote,
  onToggleWatched,
  isWatched = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>((video?.durationMinutes || 45) * 60);
  const [currentSpeed, setCurrentSpeed] = useState<number>(1);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [embedQuality, setEmbedQuality] = useState<string>('auto');
  const [streamStartTime, setStreamStartTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showOverlayControls, setShowOverlayControls] = useState<boolean>(true);
  const [showDrawerInFs, setShowDrawerInFs] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'overview'>('notes');
  const [noteText, setNoteText] = useState('');
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<'left' | 'right' | null>(null);
  const [gamingHudFlash, setGamingHudFlash] = useState<string | null>(null);
  const [showMobileSpeedDrawer, setShowMobileSpeedDrawer] = useState<boolean>(false);
  const [showQualityModal, setShowQualityModal] = useState<boolean>(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const hudFlashTimeoutRef = useRef<any>(null);
  const touchHandledRef = useRef<boolean>(false);

  // Controlled embed URL with optional forced quality and seek start
  const embedUrl = useMemo(() => {
    if (!video?.youtubeId) return '';
    return getYoutubeEmbedUrl(video.youtubeId, { 
      autoplay: true, 
      controls: 0,
      quality: embedQuality !== 'auto' ? embedQuality : undefined,
      startSeconds: streamStartTime > 0 ? streamStartTime : undefined,
    });
  }, [video?.youtubeId, embedQuality, streamStartTime]);

  // Safe postMessage dispatcher to YouTube iframe
  const sendYtCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func,
            args,
          }),
          '*'
        );
      } catch (err) {
        console.error('Failed to postMessage to YouTube iframe:', err);
      }
    }
  }, []);

  // When iframe loads, initiate listening & sync playback rate
  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening' }),
          '*'
        );
        sendYtCommand('playVideo');
        if (currentSpeed !== 1) {
          sendYtCommand('setPlaybackRate', [currentSpeed]);
        }
        if (currentQuality !== 'auto') {
          sendYtCommand('setPlaybackQuality', [currentQuality]);
          sendYtCommand('setPlaybackQualityRange', [currentQuality, currentQuality]);
        }
      } catch (e) {
        console.warn('Iframe handshake issue:', e);
      }
    }
  };

  // Reset states when video changes
  useEffect(() => {
    setCurrentTime(0);
    setStreamStartTime(0);
    setIsPlaying(false);
    setCurrentSpeed(1);
    setCurrentQuality('auto');
    setEmbedQuality('auto');
    setNoteText('');
    setShowMobileSpeedDrawer(false);
    setShowQualityModal(false);
    if (video?.durationMinutes) {
      setDuration(video.durationMinutes * 60);
    }
  }, [video?.id, video?.durationMinutes]);

  // Handle postMessage events from YouTube iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            setCurrentTime(data.info.currentTime);
          }
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setDuration(data.info.duration);
          }
          if (typeof data.info.playerState === 'number') {
            if (data.info.playerState === 1) {
              setIsPlaying(true);
            } else if (data.info.playerState === 2 || data.info.playerState === 0) {
              setIsPlaying(false);
            }
          }
          if (typeof data.info.muted === 'boolean') {
            setIsMuted(data.info.muted);
          }
          if (typeof data.info.playbackRate === 'number' && data.info.playbackRate > 0) {
            setCurrentSpeed(data.info.playbackRate);
          }
        }
      } catch {
        // Ignore non-json messages
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Soft timer for progress tracking when playing
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (duration && prev >= duration ? prev : prev + 0.5));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Auto-hide controls overlay after 4 seconds of inactivity when playing
  const resetControlsTimeout = useCallback(() => {
    setShowOverlayControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !showMobileSpeedDrawer && !showQualityModal) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowOverlayControls(false);
      }, 4200);
    }
  }, [isPlaying, showMobileSpeedDrawer, showQualityModal]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, resetControlsTimeout, showMobileSpeedDrawer, showQualityModal]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs) {
        setShowDrawerInFs(false);
        if (screen.orientation && 'unlock' in screen.orientation) {
          try {
            (screen.orientation as any).unlock();
          } catch {
            // ignore
          }
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  if (!video) return null;

  // Trigger HUD Banner Flash
  const flashGamingHud = (text: string) => {
    setGamingHudFlash(text);
    if (hudFlashTimeoutRef.current) clearTimeout(hudFlashTimeoutRef.current);
    hudFlashTimeoutRef.current = setTimeout(() => {
      setGamingHudFlash(null);
    }, 1800);
  };

  // Play / Pause Toggle
  const handleTogglePlay = () => {
    if (isPlaying) {
      sendYtCommand('pauseVideo');
      setIsPlaying(false);
      flashGamingHud('⏸ PAUSED');
    } else {
      sendYtCommand('playVideo');
      setIsPlaying(true);
      flashGamingHud('▶ PLAYING');
    }
    resetControlsTimeout();
  };

  // Speed Adjustment
  const handleSetSpeed = (rate: number) => {
    setCurrentSpeed(rate);
    sendYtCommand('setPlaybackRate', [rate]);
    
    const config = GAMING_SPEED_OPTIONS.find((s) => s.rate === rate);
    flashGamingHud(`⚡ SPEED: ${rate}x ${config?.badge || ''}`);
    resetControlsTimeout();
  };

  // Quality Adjustment (Applies to both API command and reload URL parameter with exact timestamp)
  const handleSetQuality = (qualityId: string) => {
    setCurrentQuality(qualityId);
    setEmbedQuality(qualityId);
    setStreamStartTime(Math.floor(currentTime));
    
    // Command YouTube API
    sendYtCommand('setPlaybackQuality', [qualityId]);
    sendYtCommand('setPlaybackQualityRange', [qualityId, qualityId]);
    
    const qConfig = QUALITY_OPTIONS.find((q) => q.id === qualityId);
    flashGamingHud(`📺 RESOLUTION: ${qConfig?.label || qualityId} [${qConfig?.tag || 'ENGAGED'}]`);
    setShowQualityModal(false);
    resetControlsTimeout();
  };

  // Seek To Timestamp
  const handleSeek = (newSeconds: number) => {
    const clamped = Math.max(0, Math.min(duration, newSeconds));
    setCurrentTime(clamped);
    sendYtCommand('seekTo', [clamped, true]);
    resetControlsTimeout();
  };

  // Skip relative offset in seconds (e.g. -10s or +10s)
  const handleSkipSeconds = (offset: number) => {
    const target = Math.max(0, Math.min(duration, currentTime + offset));
    handleSeek(target);
    flashGamingHud(offset > 0 ? `⏩ +${offset}s SKIP` : `⏪ ${offset}s REWIND`);
  };

  // Volume Mute / Unmute Toggle
  const handleToggleMute = () => {
    if (isMuted) {
      sendYtCommand('unMute');
      setIsMuted(false);
      flashGamingHud('🔊 AUDIO ACTIVE');
    } else {
      sendYtCommand('mute');
      setIsMuted(true);
      flashGamingHud('🔇 AUDIO MUTED');
    }
    resetControlsTimeout();
  };

  // Mobile / Landscape Fullscreen toggle
  const toggleFullscreen = async () => {
    if (!modalContainerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        const el = modalContainerRef.current;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen();
        }
        
        if (screen.orientation && 'lock' in screen.orientation) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch {
            // Orientation lock may fail if unsupported
          }
        }
        flashGamingHud('⛶ FULLSCREEN ENGAGED');
      } else {
        if (screen.orientation && 'unlock' in screen.orientation) {
          try {
            (screen.orientation as any).unlock();
          } catch {
            // ignore
          }
        }
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.error('Fullscreen toggle error:', err);
    }
  };

  // Touch & tap handler on video area: Prevents double-firing and fixes fullscreen touches
  const processVideoTap = (clientX: number, rect: DOMRect) => {
    const now = Date.now();
    const clickX = clientX - rect.left;
    const isLeft = clickX < rect.width * 0.38;
    const isRight = clickX > rect.width * 0.62;

    if (now - lastTapRef.current.time < 350) {
      // Double tap detected
      if (isLeft) {
        handleSkipSeconds(-10);
        setDoubleTapFeedback('left');
        setTimeout(() => setDoubleTapFeedback(null), 600);
      } else if (isRight) {
        handleSkipSeconds(10);
        setDoubleTapFeedback('right');
        setTimeout(() => setDoubleTapFeedback(null), 600);
      } else {
        handleTogglePlay();
      }
      lastTapRef.current.time = 0;
    } else {
      lastTapRef.current = { time: now, x: clickX };
      // Single tap: toggle overlay controls
      setShowOverlayControls((prev) => !prev);
    }
  };

  const handleVideoTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      touchHandledRef.current = true;
      const touch = e.changedTouches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      processVideoTap(touch.clientX, rect);
      setTimeout(() => {
        touchHandledRef.current = false;
      }, 400);
    }
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (touchHandledRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    processVideoTap(e.clientX, rect);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const mins = Math.floor(currentTime / 60);
    const secs = Math.floor(currentTime % 60);
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const newNote: UserNote = {
      id: 'note_' + Date.now(),
      videoId: video.id,
      timestampSeconds: currentTime,
      timestampFormatted: formatted,
      text: noteText.trim(),
      createdAt: new Date().toLocaleDateString(),
    };

    if (onSaveNote) {
      onSaveNote(newNote);
    }
    setNoteText('');
    flashGamingHud('📝 NOTE SAVED');
  };

  const formatTime = (secs: number) => {
    const totalSecs = Math.max(0, Math.floor(secs));
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const videoNotes = user?.notes?.filter((n) => n.videoId === video.id) || [];
  const currentSpeedConfig = GAMING_SPEED_OPTIONS.find((s) => s.rate === currentSpeed) || GAMING_SPEED_OPTIONS[1];
  const currentQualityConfig = QUALITY_OPTIONS.find((q) => q.id === currentQuality) || QUALITY_OPTIONS[4];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 md:p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden w-screen h-screen select-none">
      {/* Cockpit Container - 100% Fullscreen on Mobile, Rounded modal on Desktop */}
      <div 
        ref={modalContainerRef}
        className={`relative w-full bg-[#050A17] flex flex-col overflow-hidden text-slate-100 ${
          isFullscreen 
            ? 'fixed inset-0 z-[99999] w-screen h-screen max-w-none max-h-none rounded-none border-0' 
            : 'w-full h-[100dvh] sm:h-[92vh] sm:max-h-[880px] sm:max-w-6xl rounded-none sm:rounded-2xl shadow-[0_0_60px_rgba(0,102,255,0.35)] border-0 sm:border border-cyan-500/30'
        }`}
        onMouseMove={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Top Navbar: Windowed Mode */}
        {!isFullscreen && (
          <div className="w-full px-3 sm:px-6 py-2 bg-[#080E20]/95 border-b border-cyan-500/20 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>

              <div className="truncate min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-black text-[10px] sm:text-[11px] border border-cyan-500/30 shrink-0">
                    {video.subjectNameEn}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white truncate">
                    {video.titleEn}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 truncate">
                  <span className="text-slate-300 font-mono">Unit {video.unitNumber}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-cyan-300/80 font-medium truncate">{video.teacherName}</span>
                </div>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Fast Fullscreen Button for Mobile (Instant One-Tap Edge-to-Edge) */}
              <button
                onClick={toggleFullscreen}
                className="px-2 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-[10px] font-black font-mono flex items-center gap-1 cursor-pointer transition-all shadow-sm active:scale-95"
                title="Full Screen Cinema"
              >
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xs:inline">FULLSCREEN</span>
              </button>

              {/* Mark Completed */}
              {onToggleWatched && (
                <button
                  onClick={() => onToggleWatched(video.id)}
                  className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer border active:scale-95 ${
                    isWatched
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700'
                  }`}
                  title={isWatched ? 'Watched' : 'Mark as Watched'}
                >
                  <CheckCircle className={`w-3.5 h-3.5 ${isWatched ? 'text-emerald-400' : ''}`} />
                  <span className="hidden sm:inline">
                    {isWatched ? 'Completed' : 'Complete'}
                  </span>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-cyan-950/60 transition-colors cursor-pointer border border-transparent hover:border-cyan-500/30 active:scale-95"
                title="Close Player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative w-full max-w-full">
          
          {/* VIDEO STAGE */}
          <div className={`relative flex flex-col bg-black overflow-hidden w-full max-w-full ${
            isFullscreen ? 'w-full h-full' : 'flex-none lg:flex-[3]'
          }`}>
            
            {/* The Video & Tap Area */}
            <div className={`relative w-full max-w-full bg-black flex items-center justify-center overflow-hidden ${
              isFullscreen ? 'h-full flex-1' : 'aspect-video max-h-[46vh] sm:max-h-[56vh] lg:max-h-none lg:h-full lg:flex-1'
            }`}>
              
              {/* YouTube IFrame - Unrestricted and Stable */}
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title={video.titleEn}
                onLoad={handleIframeLoad}
                className="w-full h-full border-0 select-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />

              {/* INTERACTIVE TAP OVERLAY (Fixed touch gesture support for mobile & fullscreen) */}
              <div 
                className="absolute inset-0 z-20 cursor-pointer touch-none"
                onClick={handleVideoClick}
                onTouchEnd={handleVideoTouchEnd}
              >
                {/* Double-tap feedback ripple */}
                {doubleTapFeedback === 'left' && (
                  <div className="absolute left-6 sm:left-12 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-cyan-600/85 backdrop-blur-md px-4 py-2.5 rounded-full text-white font-black text-xs sm:text-sm border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-pulse pointer-events-none">
                    <RotateCcw className="w-4 h-4" />
                    <span>-10s REWIND</span>
                  </div>
                )}
                {doubleTapFeedback === 'right' && (
                  <div className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-cyan-600/85 backdrop-blur-md px-4 py-2.5 rounded-full text-white font-black text-xs sm:text-sm border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-pulse pointer-events-none">
                    <RotateCw className="w-4 h-4" />
                    <span>+10s SKIP</span>
                  </div>
                )}
              </div>

              {/* HUD FLASH BANNER */}
              {gamingHudFlash && (
                <div className="absolute top-12 sm:top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-1.5 rounded-full bg-slate-950/95 border border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.6)] backdrop-blur-md flex items-center gap-2 whitespace-nowrap">
                    <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                    <span className="text-[11px] sm:text-xs font-black tracking-wider text-cyan-200 uppercase font-mono">
                      {gamingHudFlash}
                    </span>
                  </div>
                </div>
              )}

              {/* HUD OVERLAY - Full screen, touch-buffered */}
              <div 
                className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-300 flex flex-col justify-between p-2 sm:p-4 w-full max-w-full overflow-hidden ${
                  showOverlayControls ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Top Overlay Bar */}
                <div 
                  className="flex items-center justify-between gap-2 pointer-events-auto bg-gradient-to-b from-black/95 via-black/70 to-transparent p-2 rounded-xl w-full"
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-md">
                      {video.titleEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Fullscreen Drawer Toggle (Notes & Info) */}
                    {isFullscreen && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDrawerInFs(!showDrawerInFs);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl border text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95 ${
                          showDrawerInFs 
                            ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black' 
                            : 'bg-slate-900/85 text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/80'
                        }`}
                      >
                        <ListVideo className="w-3.5 h-3.5" />
                        <span>Notes & Info</span>
                      </button>
                    )}

                    {/* Exit Fullscreen Button */}
                    {isFullscreen && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFullscreen();
                        }}
                        className="p-1.5 sm:p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 cursor-pointer shadow-lg backdrop-blur-md active:scale-95"
                        title="Exit Fullscreen"
                      >
                        <Minimize2 className="w-4 h-4 text-cyan-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Center Play/Pause Indicator */}
                <div 
                  className="flex items-center justify-center pointer-events-auto"
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleTogglePlay}
                    className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.7)] backdrop-blur-md transition-all active:scale-90 cursor-pointer border-2 border-cyan-300/60"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow" />
                    ) : (
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1 drop-shadow" />
                    )}
                  </button>
                </div>

                {/* Bottom Control Bar */}
                <div 
                  className="pointer-events-auto bg-gradient-to-t from-black/95 via-black/85 to-transparent p-2 sm:p-3 rounded-none sm:rounded-2xl flex flex-col gap-1.5 sm:gap-2 backdrop-blur-xs border-t border-cyan-500/20 w-full max-w-full"
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Scrubber Bar */}
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={1}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                    />
                  </div>

                  {/* Main Controls Row */}
                  <div className="flex items-center justify-between gap-1 w-full max-w-full">
                    
                    {/* Left: Play/Pause, -10s, +10s, Time, Mute */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink min-w-0">
                      <button
                        onClick={handleTogglePlay}
                        className="p-1.5 sm:p-2 rounded-xl text-white hover:bg-cyan-500/20 transition-colors cursor-pointer border border-transparent hover:border-cyan-500/40 shrink-0 active:scale-95"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4 fill-current text-cyan-400" />}
                      </button>

                      {/* -10s Seek */}
                      <button
                        onClick={() => handleSkipSeconds(-10)}
                        className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-950/40 transition-colors cursor-pointer flex items-center gap-0.5 shrink-0 active:scale-95"
                        title="Rewind 10s"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] font-bold font-mono hidden xs:inline">-10s</span>
                      </button>

                      {/* +10s Seek */}
                      <button
                        onClick={() => handleSkipSeconds(10)}
                        className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-950/40 transition-colors cursor-pointer flex items-center gap-0.5 shrink-0 active:scale-95"
                        title="Forward 10s"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] font-bold font-mono hidden xs:inline">+10s</span>
                      </button>

                      {/* Time Indicator */}
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300 px-1 whitespace-nowrap shrink-0">
                        <span className="text-white">{formatTime(currentTime)}</span>
                        <span className="text-slate-500 mx-0.5">/</span>
                        <span className="text-slate-400 hidden xs:inline">{formatTime(duration)}</span>
                      </span>

                      {/* Mute Toggle */}
                      <button
                        onClick={handleToggleMute}
                        className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-950/40 transition-colors cursor-pointer shrink-0 active:scale-95"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </button>
                    </div>

                    {/* Right: Quality, Speed, Fullscreen (Always completely visible!) */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      
                      {/* QUALITY BUTTON */}
                      <button
                        onClick={() => setShowQualityModal(true)}
                        className="px-2 py-1 rounded-xl bg-slate-900/90 text-cyan-300 border border-cyan-500/40 hover:border-cyan-300 hover:bg-slate-800 text-[10px] sm:text-xs font-black font-mono flex items-center gap-1 cursor-pointer transition-all shadow-sm active:scale-95"
                        title="Select Video Quality"
                      >
                        <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                        <span>{currentQualityConfig.badge}</span>
                      </button>

                      {/* DESKTOP / TABLET: Inline Gaming Speed Selector */}
                      <div className="hidden lg:flex items-center bg-slate-950/90 p-0.5 rounded-xl border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] gap-0.5">
                        <span className="flex items-center gap-1 px-1.5 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                          <Gauge className="w-3 h-3 text-cyan-400 animate-spin-slow" />
                        </span>
                        {GAMING_SPEED_OPTIONS.map((opt) => {
                          const isActive = currentSpeed === opt.rate;
                          return (
                            <button
                              key={opt.rate}
                              onClick={() => handleSetSpeed(opt.rate)}
                              className={`relative px-1.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer flex items-center gap-0.5 active:scale-95 ${
                                isActive
                                  ? `bg-gradient-to-r ${opt.color} text-white shadow-md ring-1 ring-white/50 scale-105`
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                              style={isActive ? { boxShadow: `0 0 10px ${opt.glowColor}` } : {}}
                            >
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* MOBILE GAMING SPEED PILL */}
                      <button
                        onClick={() => setShowMobileSpeedDrawer(!showMobileSpeedDrawer)}
                        className="lg:hidden px-2 py-1 rounded-xl bg-slate-900/90 text-cyan-300 border border-cyan-500/40 hover:border-cyan-300 text-[10px] sm:text-xs font-black font-mono flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                        title="Change Speed"
                      >
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span>{currentSpeed}x</span>
                      </button>

                      {/* Fullscreen Button */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 sm:p-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 hover:text-white border border-cyan-500/40 font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm shrink-0 active:scale-95"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Landscape Fullscreen'}
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-4 h-4 text-cyan-300" />
                        ) : (
                          <Maximize2 className="w-4 h-4 text-cyan-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* MOBILE EXPANDABLE SPEED DRAWER */}
                  {showMobileSpeedDrawer && (
                    <div className="pt-2 border-t border-cyan-500/30 flex flex-col gap-1.5 animate-in slide-in-from-bottom duration-200">
                      <div className="flex items-center justify-between text-[10px] text-cyan-300 font-mono px-1">
                        <span className="flex items-center gap-1 font-bold">
                          <Gauge className="w-3 h-3 text-cyan-400" />
                          <span>SPEED ENGINE:</span>
                        </span>
                        <span className="text-slate-400 font-sans">Tap to engage</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {GAMING_SPEED_OPTIONS.map((opt) => {
                          const isActive = currentSpeed === opt.rate;
                          return (
                            <button
                              key={opt.rate}
                              onClick={() => {
                                handleSetSpeed(opt.rate);
                                setShowMobileSpeedDrawer(false);
                              }}
                              className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                                isActive
                                  ? `bg-gradient-to-b ${opt.color} border-white/60 text-white shadow-lg ring-1 ring-cyan-300`
                                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/40'
                              }`}
                              style={isActive ? { boxShadow: `0 0 15px ${opt.glowColor}` } : {}}
                            >
                              <span className="text-xs font-black font-mono">{opt.label}</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                {opt.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* DEDICATED MOBILE PORTRAIT DOCK: Studypro Engine */}
            {!isFullscreen && (
              <div className="bg-[#070D1E] px-3 py-2 border-b border-cyan-500/20 flex flex-col gap-2 shrink-0 w-full max-w-full overflow-hidden">
                {/* Header: Studypro Engine */}
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Studypro Engine</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-cyan-300 font-black">
                      ⚡ {currentSpeed}x
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-emerald-400 font-black">
                      📺 {currentQualityConfig.badge}
                    </span>
                  </div>
                </div>

                {/* Speed Row: Thumb Reachable */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
                  <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider shrink-0 px-1">
                    SPEED:
                  </span>
                  {GAMING_SPEED_OPTIONS.map((opt) => {
                    const isActive = currentSpeed === opt.rate;
                    return (
                      <button
                        key={opt.rate}
                        onClick={() => handleSetSpeed(opt.rate)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer border flex items-center gap-1 active:scale-95 ${
                          isActive
                            ? `bg-gradient-to-r ${opt.color} text-white border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)] scale-102`
                            : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700 hover:border-cyan-500/40'
                        }`}
                      >
                        <span className="font-mono">{opt.label}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded ${
                          isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {opt.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quality Row: Thumb Reachable */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider shrink-0 px-1">
                    QUALITY:
                  </span>
                  {QUALITY_OPTIONS.map((q) => {
                    const isActive = currentQuality === q.id;
                    return (
                      <button
                        key={q.id}
                        onClick={() => handleSetQuality(q.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer border flex items-center gap-1 active:scale-95 ${
                          isActive
                            ? `bg-gradient-to-r ${q.color} text-white border-cyan-300 shadow-[0_0_12px_${q.glowColor}] scale-102`
                            : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700 hover:border-cyan-500/40'
                        }`}
                      >
                        <span className="font-mono">{q.label}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded ${
                          isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {q.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* DECK: Only Notes & Overview (Chapters & Q&A removed) */}
          {(!isFullscreen || showDrawerInFs) && (
            <div className={`flex flex-col bg-[#070E22] overflow-hidden w-full max-w-full ${
              isFullscreen 
                ? 'absolute top-14 right-3 bottom-16 w-84 sm:w-96 z-40 bg-[#060D1E]/95 backdrop-blur-md rounded-2xl border border-cyan-500/40 shadow-2xl animate-in slide-in-from-right duration-200' 
                : 'flex-1 lg:flex-[2] border-t lg:border-t-0 lg:border-l border-cyan-500/20 min-h-0'
            }`}>
              
              {/* Drawer Header in Fullscreen */}
              {isFullscreen && (
                <div className="px-4 py-2 border-b border-cyan-500/30 flex items-center justify-between bg-[#0A142D]">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ListVideo className="w-3.5 h-3.5" />
                    <span>Study Notes & Info</span>
                  </span>
                  <button
                    onClick={() => setShowDrawerInFs(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-cyan-950/60 active:scale-95"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Clean Tabs Bar: Only Notes & Overview */}
              <div className="flex items-center border-b border-cyan-500/20 bg-[#0A142D] px-2 overflow-x-auto shrink-0 no-scrollbar w-full">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 py-2.5 text-xs font-black transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 shrink-0 active:scale-98 ${
                    activeTab === 'notes'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Notes</span>
                  {videoNotes.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-cyan-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                      {videoNotes.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2.5 text-xs font-black transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 shrink-0 active:scale-98 ${
                    activeTab === 'overview'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Lesson Overview</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                
                {/* Tab: Notes */}
                {activeTab === 'notes' && (
                  <div className="flex flex-col h-full space-y-3">
                    <form onSubmit={handleAddNote} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-200">
                          Key formulas & notes:
                        </label>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-500/30">
                          @ {formatTime(currentTime)}
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Write down formulas, key steps, or points to review..."
                        className="w-full p-2.5 bg-[#050A17] border border-cyan-500/30 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-cyan-500/20 active:scale-98"
                      >
                        Save Note at {formatTime(currentTime)}
                      </button>
                    </form>

                    <div className="flex-1 overflow-y-auto space-y-2 pt-2 border-t border-cyan-500/20">
                      {videoNotes.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-xs">
                          <BookOpen className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                          <p>No notes written yet for this class.</p>
                        </div>
                      ) : (
                        videoNotes.map((n) => (
                          <div key={n.id} className="p-2.5 bg-slate-900/90 rounded-xl text-xs border border-cyan-500/20 shadow-xs">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                              <button
                                onClick={() => handleSeek(n.timestampSeconds)}
                                className="font-mono text-cyan-400 font-bold hover:underline cursor-pointer flex items-center gap-1 active:scale-95"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                {n.timestampFormatted}
                              </button>
                              <span className="text-slate-500">{n.createdAt}</span>
                            </div>
                            <p className="text-slate-200 leading-relaxed font-sans">{n.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-cyan-500/20">
                      <span className="font-bold text-white block mb-1 text-xs">
                        Lesson Objectives:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {video.descriptionEn}
                      </p>
                      {video.descriptionTa && (
                        <p className="text-slate-400 text-[11px] mt-2 leading-relaxed border-t border-cyan-500/10 pt-2">
                          {video.descriptionTa}
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-cyan-500/20 space-y-2 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subject:</span>
                        <span className="font-bold text-cyan-300">{video.subjectNameEn} (Unit {video.unitNumber})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Topic:</span>
                        <span className="font-medium text-slate-200 truncate max-w-[200px]">{video.unitNameEn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Curriculum:</span>
                        <span className="font-semibold text-white">G.C.E. A/L Physical & Bio Science</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Playback Engine:</span>
                        <span className="font-mono text-cyan-400 font-bold">Studypro Engine v3</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CLEAN VIDEO QUALITY SELECTOR MODAL (No AI text / Clean & Direct) */}
      {showQualityModal && (
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowQualityModal(false)}
        >
          <div 
            className="w-full max-w-sm bg-[#081024] border-2 border-cyan-400/50 rounded-2xl p-4 sm:p-5 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col gap-3 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2.5">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-black text-xs sm:text-sm">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>VIDEO RESOLUTION</span>
              </div>
              <button 
                onClick={() => setShowQualityModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cyan-950/60 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-sans">
              Choose your preferred video streaming quality.
            </div>

            <div className="space-y-2">
              {QUALITY_OPTIONS.map((opt) => {
                const isSelected = currentQuality === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSetQuality(opt.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98 ${
                      isSelected
                        ? `bg-gradient-to-r ${opt.color} text-white border-white/60 shadow-[0_0_15px_${opt.glowColor}] ring-1 ring-cyan-300`
                        : 'bg-slate-900/80 border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                        isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-cyan-400'
                      }`}>
                        {opt.badge}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs font-mono">{opt.label}</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-black/40 text-cyan-200' : 'bg-slate-800 text-cyan-400'
                          }`}>
                            {opt.tag}
                          </span>
                        </div>
                        <span className={`text-[10px] block truncate ${isSelected ? 'text-cyan-100' : 'text-slate-400'}`}>
                          {opt.detail}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-white text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-cyan-500/20 text-center">
              <span className="text-[10px] text-slate-400 font-mono">
                Studypro Engine · High Speed Streaming
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
