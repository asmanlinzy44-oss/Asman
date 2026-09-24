import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, CheckCircle, Clock, BookOpen, Send, Play, Pause,
  Maximize2, Minimize2, Zap, ShieldCheck, 
  RotateCw, RotateCcw, ListVideo, Volume2, VolumeX
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

const SPEED_OPTIONS: number[] = [1, 1.25, 1.5, 2];

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  user,
  onSaveNote,
  onToggleWatched,
  isWatched = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>((video?.durationMinutes || 45) * 60);
  const [currentSpeed, setCurrentSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showOverlayControls, setShowOverlayControls] = useState<boolean>(true);
  const [showDrawerInFs, setShowDrawerInFs] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chapters' | 'notes' | 'discussion' | 'overview'>('chapters');
  const [noteText, setNoteText] = useState('');
  const [discussionInput, setDiscussionInput] = useState('');
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<'left' | 'right' | null>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  const [discussions, setDiscussions] = useState<Array<{ id: string; author: string; time: string; text: string; role: string }>>([
    {
      id: 'd1',
      author: 'A/L Chemistry Panel',
      time: 'Featured Guide',
      text: 'Remember: In coordination IUPAC naming, name ligands in alphabetical order regardless of Greek prefixes (di, tri, tetra). Central metal oxidation state goes in Roman numerals in parentheses!',
      role: 'teacher',
    },
    {
      id: 'd2',
      author: 'Dulantha K.',
      time: '1 day ago',
      text: 'The explanation for complex anions ending in "-ate" (e.g., ferrate, cuprate, aluminate) is crystal clear! Highly recommend 1.25x speed for revision.',
      role: 'student',
    },
  ]);

  // Send postMessage command to YouTube iframe safely
  const sendYtCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func,
          args,
        }),
        '*'
      );
    }
  }, []);

  // Reset states when video changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(true);
    setCurrentSpeed(1);
    setNoteText('');
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
            // 1: playing, 2: paused, 0: ended
            setIsPlaying(data.info.playerState === 1);
          }
          if (typeof data.info.muted === 'boolean') {
            setIsMuted(data.info.muted);
          }
        }
      } catch {
        // Ignore parsing errors from other postMessages
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Periodic heartbeat to track progress smoothly when playing
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (duration && prev >= duration ? prev : prev + 0.5));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Auto-hide controls overlay after 3 seconds of inactivity when playing
  const resetControlsTimeout = useCallback(() => {
    setShowOverlayControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowOverlayControls(false);
      }, 3500);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, resetControlsTimeout]);

  // Track Fullscreen state changes and orientation release
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
            // Ignore
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

  // Play / Pause Toggle
  const handleTogglePlay = () => {
    if (isPlaying) {
      sendYtCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendYtCommand('playVideo');
      setIsPlaying(true);
    }
    resetControlsTimeout();
  };

  // Speed Adjustment
  const handleSetSpeed = (rate: number) => {
    setCurrentSpeed(rate);
    sendYtCommand('setPlaybackRate', [rate]);
    resetControlsTimeout();
  };

  // Seek To Timestamp
  const handleSeek = (newSeconds: number) => {
    setCurrentTime(newSeconds);
    sendYtCommand('seekTo', [newSeconds, true]);
    resetControlsTimeout();
  };

  // Skip relative offset in seconds (e.g. -10s or +10s)
  const handleSkipSeconds = (offset: number) => {
    const target = Math.max(0, Math.min(duration, currentTime + offset));
    handleSeek(target);
  };

  // Volume Mute / Unmute Toggle
  const handleToggleMute = () => {
    if (isMuted) {
      sendYtCommand('unMute');
      setIsMuted(false);
    } else {
      sendYtCommand('mute');
      setIsMuted(true);
    }
    resetControlsTimeout();
  };

  // True Phone Landscape Fullscreen: locks orientation into landscape and fills 100% of physical screen
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
        
        // Lock mobile orientation to landscape for true YouTube mobile experience
        if (screen.orientation && 'lock' in screen.orientation) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch {
            // Orientation lock may fail if unsupported, browser will still fill window
          }
        }
      } else {
        if (screen.orientation && 'unlock' in screen.orientation) {
          try {
            (screen.orientation as any).unlock();
          } catch {
            // Ignore
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

  // Double-tap on video screen for mobile -10s / +10s (YouTube gesture)
  const handleVideoTapOrClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeft = clickX < rect.width / 2;

    if (now - lastTapRef.current.time < 300) {
      // Double tap detected
      if (isLeft) {
        handleSkipSeconds(-10);
        setDoubleTapFeedback('left');
        setTimeout(() => setDoubleTapFeedback(null), 600);
      } else {
        handleSkipSeconds(10);
        setDoubleTapFeedback('right');
        setTimeout(() => setDoubleTapFeedback(null), 600);
      }
      lastTapRef.current.time = 0;
    } else {
      lastTapRef.current = { time: now, x: clickX };
      // Single tap: toggle controls visibility
      setShowOverlayControls((prev) => !prev);
    }
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
  };

  const handleAddDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionInput.trim()) return;

    setDiscussions([
      ...discussions,
      {
        id: 'disc_' + Date.now(),
        author: user?.name || 'A/L Student',
        time: 'Just now',
        text: discussionInput.trim(),
        role: user?.role || 'student',
      },
    ]);
    setDiscussionInput('');
  };

  const formatTime = (secs: number) => {
    const totalSecs = Math.max(0, Math.floor(secs));
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const videoNotes = user?.notes?.filter((n) => n.videoId === video.id) || [];
  
  // Note: controls=0 ensures YouTube never displays title, share, copy link, or watermark
  const embedUrl = getYoutubeEmbedUrl(video.youtubeId, { 
    autoplay: true, 
    startSeconds: currentTime > 0 ? currentTime : 0, 
    controls: 0 
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 md:p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200">
      {/* Cockpit / Fullscreen Cinema Container */}
      <div 
        ref={modalContainerRef}
        className={`relative w-full bg-[#050A17] flex flex-col overflow-hidden text-slate-100 select-none ${
          isFullscreen 
            ? 'fixed inset-0 z-[99999] w-screen h-screen max-w-none max-h-none rounded-none border-0' 
            : 'max-w-6xl rounded-2xl h-[92vh] max-h-[860px] shadow-[0_0_60px_rgba(0,102,255,0.3)] border border-blue-500/30'
        }`}
        onMouseMove={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Top Navbar: Visible only in windowed mode (hidden in True Fullscreen like YouTube) */}
        {!isFullscreen && (
          <div className="px-4 sm:px-6 py-2.5 bg-[#0A1226]/95 border-b border-blue-500/20 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#00D2FF] shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
              </div>

              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-[#38BDF8] font-black text-[10px] sm:text-[11px] border border-blue-500/30 shrink-0">
                    {video.subjectNameEn}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white truncate">
                    {video.titleEn}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                  <span className="text-slate-300 font-mono">Unit {video.unitNumber}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-blue-300 font-medium truncate">{video.teacherName}</span>
                </div>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mark Completed */}
              {onToggleWatched && (
                <button
                  onClick={() => onToggleWatched(video.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isWatched
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  <CheckCircle className={`w-3.5 h-3.5 ${isWatched ? 'text-emerald-400' : ''}`} />
                  <span className="hidden sm:inline">
                    {isWatched ? 'Completed' : 'Mark Complete'}
                  </span>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-blue-950/60 transition-colors cursor-pointer border border-transparent hover:border-blue-500/30"
                title="Close Player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Body: Video Player & Controls + Deck */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* VIDEO STAGE: Takes 100% of screen in Fullscreen */}
          <div className={`relative flex flex-col bg-black overflow-hidden ${
            isFullscreen ? 'w-full h-full' : 'flex-[3]'
          }`}>
            
            {/* The Video & Interactive Tap Container */}
            <div className="relative w-full h-full flex-1 bg-black flex items-center justify-center overflow-hidden">
              
              {/* YouTube IFrame: controls=0 removes native chrome, share button, copy link & watermark */}
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title={video.titleEn}
                className="w-full h-full border-0 pointer-events-none select-none"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
              />

              {/* INTERACTIVE OVERLAY: Catches all taps/clicks so user never touches raw iframe or copy options */}
              <div 
                className="absolute inset-0 z-20 cursor-pointer"
                onClick={handleVideoTapOrClick}
              >
                {/* Double-tap feedback ripple */}
                {doubleTapFeedback === 'left' && (
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-blue-600/60 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold text-sm animate-ping duration-300">
                    <RotateCcw className="w-4 h-4" />
                    <span>-10s</span>
                  </div>
                )}
                {doubleTapFeedback === 'right' && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-blue-600/60 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold text-sm animate-ping duration-300">
                    <RotateCw className="w-4 h-4" />
                    <span>+10s</span>
                  </div>
                )}
              </div>

              {/* HUD OVERLAY: Smooth auto-hiding controls just like YouTube app */}
              <div 
                className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-5 ${
                  showOverlayControls ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Top Overlay Bar */}
                <div className="flex items-center justify-between gap-3 pointer-events-auto bg-gradient-to-b from-black/80 to-transparent p-2 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00D2FF] shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-md">
                      {video.titleEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* In Fullscreen: Chapters Drawer Toggle Button */}
                    {isFullscreen && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDrawerInFs(!showDrawerInFs);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg backdrop-blur-md ${
                          showDrawerInFs 
                            ? 'bg-[#0066FF] text-white border-blue-400' 
                            : 'bg-slate-900/80 text-sky-200 border-blue-500/40 hover:bg-blue-900/80'
                        }`}
                      >
                        <ListVideo className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>Chapters & Notes</span>
                      </button>
                    )}

                    {/* Exit Fullscreen Button in Fullscreen */}
                    {isFullscreen && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFullscreen();
                        }}
                        className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 cursor-pointer shadow-lg backdrop-blur-md"
                        title="Exit Fullscreen"
                      >
                        <Minimize2 className="w-4 h-4 text-[#38BDF8]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Center Play/Pause Indicator (Tap to play/pause) */}
                <div className="flex items-center justify-center pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlay();
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0066FF]/85 hover:bg-[#0066FF] text-white flex items-center justify-center shadow-[0_0_30px_rgba(0,102,255,0.6)] backdrop-blur-md transition-transform active:scale-95 cursor-pointer border border-blue-400/40"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current ml-1" />
                    )}
                  </button>
                </div>

                {/* Bottom Control Bar: Progress Bar + HUD Controls */}
                <div 
                  className="pointer-events-auto bg-gradient-to-t from-black/90 via-black/80 to-transparent p-2.5 sm:p-4 rounded-2xl flex flex-col gap-2 backdrop-blur-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Scrubber / Progress Bar */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={1}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full h-1.5 sm:h-2 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-[#00D2FF]"
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    {/* Left: Play/Pause, Rewind/Forward, Time */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={handleTogglePlay}
                        className="p-1.5 sm:p-2 rounded-xl text-white hover:bg-blue-600/40 transition-colors cursor-pointer"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>

                      {/* -10s / +10s Seek */}
                      <button
                        onClick={() => handleSkipSeconds(-10)}
                        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-blue-900/40 transition-colors cursor-pointer flex items-center gap-0.5"
                        title="Rewind 10s"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span className="text-[11px] font-bold">-10s</span>
                      </button>

                      <button
                        onClick={() => handleSkipSeconds(10)}
                        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-blue-900/40 transition-colors cursor-pointer flex items-center gap-0.5"
                        title="Forward 10s"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span className="text-[11px] font-bold">+10s</span>
                      </button>

                      {/* Time Display */}
                      <span className="text-[11px] font-mono font-bold text-slate-300">
                        <span className="text-white">{formatTime(currentTime)}</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-slate-400">{formatTime(duration)}</span>
                      </span>

                      {/* Volume / Mute Toggle */}
                      <button
                        onClick={handleToggleMute}
                        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-blue-900/40 transition-colors cursor-pointer"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-[#38BDF8]" />
                        )}
                      </button>
                    </div>

                    {/* Right: Speed pills & Fullscreen Toggle */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* Speed Pills */}
                      <div className="flex items-center bg-black/60 p-0.5 rounded-xl border border-blue-500/30 gap-0.5">
                        <span className="hidden md:flex items-center gap-1 px-1.5 text-blue-300 text-[10px] font-bold uppercase">
                          <Zap className="w-3 h-3 text-[#00D2FF]" />
                        </span>
                        {SPEED_OPTIONS.map((rate) => {
                          const isActive = currentSpeed === rate;
                          return (
                            <button
                              key={rate}
                              onClick={() => handleSetSpeed(rate)}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-[#0066FF] text-white shadow-sm ring-1 ring-white/30'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {rate}x
                            </button>
                          );
                        })}
                      </div>

                      {/* True Fullscreen Button (Landscape on phone) */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-sky-200 hover:text-white border border-blue-500/40 font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Landscape Fullscreen'}
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-4 h-4 text-[#38BDF8]" />
                        ) : (
                          <Maximize2 className="w-4 h-4 text-[#38BDF8]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DECK: Visible in windowed mode OR as a Slide-Over Drawer in Fullscreen */}
          {(!isFullscreen || showDrawerInFs) && (
            <div className={`flex flex-col bg-[#081024] overflow-hidden ${
              isFullscreen 
                ? 'absolute top-14 right-3 bottom-16 w-84 sm:w-96 z-40 bg-[#070D1E]/95 backdrop-blur-md rounded-2xl border border-blue-500/40 shadow-2xl animate-in slide-in-from-right duration-200' 
                : 'flex-[2] border-t lg:border-t-0 lg:border-l border-blue-500/20'
            }`}>
              {/* Drawer Header in Fullscreen */}
              {isFullscreen && (
                <div className="px-4 py-2 border-b border-blue-500/30 flex items-center justify-between bg-[#0A142D]">
                  <span className="text-xs font-black text-[#00D2FF] uppercase tracking-wider flex items-center gap-1.5">
                    <ListVideo className="w-3.5 h-3.5" />
                    <span>Study Deck</span>
                  </span>
                  <button
                    onClick={() => setShowDrawerInFs(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-blue-950/60"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tabs */}
              <div className="flex items-center border-b border-blue-500/20 bg-[#0A142D] px-2 overflow-x-auto shrink-0">
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`px-3 py-2.5 text-xs font-extrabold transition-all cursor-pointer border-b-2 shrink-0 ${
                    activeTab === 'chapters'
                      ? 'border-[#00D2FF] text-[#38BDF8] bg-blue-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Chapters ({video.chapters.length})
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-3 py-2.5 text-xs font-extrabold transition-all cursor-pointer border-b-2 flex items-center gap-1 shrink-0 ${
                    activeTab === 'notes'
                      ? 'border-[#00D2FF] text-[#38BDF8] bg-blue-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Notes</span>
                  {videoNotes.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono">
                      {videoNotes.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`px-3 py-2.5 text-xs font-extrabold transition-all cursor-pointer border-b-2 shrink-0 ${
                    activeTab === 'discussion'
                      ? 'border-[#00D2FF] text-[#38BDF8] bg-blue-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Q&A
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2.5 text-xs font-extrabold transition-all cursor-pointer border-b-2 shrink-0 ${
                    activeTab === 'overview'
                      ? 'border-[#00D2FF] text-[#38BDF8] bg-blue-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Overview
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Tab 1: Chapters */}
                {activeTab === 'chapters' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-medium">
                      <span>Jump to topic chapter:</span>
                      <span className="text-[#38BDF8] font-mono">1-click seek</span>
                    </div>
                    {video.chapters.map((ch, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSeek(ch.seconds)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 text-xs cursor-pointer border ${
                          Math.abs(currentTime - ch.seconds) < 15
                            ? 'bg-blue-950/80 border-blue-400 text-blue-100 shadow-md shadow-blue-500/20 ring-1 ring-blue-500/40'
                            : 'bg-slate-900/60 hover:bg-blue-950/40 border-slate-800 hover:border-blue-500/30 text-slate-300'
                        }`}
                      >
                        <span className="font-mono text-[#38BDF8] bg-blue-950 px-2 py-0.5 rounded-md text-[11px] shrink-0 font-black border border-blue-500/30">
                          {ch.time}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold block leading-snug">
                            {ch.title}
                          </span>
                          {ch.titleTa && (
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {ch.titleTa}
                            </span>
                          )}
                        </div>
                        <Play className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab 2: Notes */}
                {activeTab === 'notes' && (
                  <div className="flex flex-col h-full space-y-3">
                    <form onSubmit={handleAddNote} className="space-y-2">
                      <label className="block text-xs font-bold text-slate-200">
                        Take key notes & chemical equations:
                      </label>
                      <textarea
                        rows={3}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="e.g. [Co(NH3)5Cl]Cl2 is pentaamminechlorocobalt(III) chloride..."
                        className="w-full p-2.5 bg-[#060D1E] border border-blue-500/30 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00D2FF]"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-[#0066FF] to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/20"
                      >
                        Save to My Notebook
                      </button>
                    </form>

                    <div className="flex-1 overflow-y-auto space-y-2 pt-2 border-t border-blue-500/20">
                      {videoNotes.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-xs">
                          <BookOpen className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                          <p>No notes written yet for this class.</p>
                        </div>
                      ) : (
                        videoNotes.map((n) => (
                          <div key={n.id} className="p-2.5 bg-slate-900/90 rounded-xl text-xs border border-blue-500/20 shadow-xs">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                              <span className="font-mono text-[#38BDF8] font-bold">{n.timestampFormatted}</span>
                              <span className="text-slate-500">{n.createdAt}</span>
                            </div>
                            <p className="text-slate-200 leading-relaxed font-sans">{n.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Discussion */}
                {activeTab === 'discussion' && (
                  <div className="flex flex-col h-full space-y-3">
                    <div className="space-y-2.5">
                      {discussions.map((d) => (
                        <div key={d.id} className="p-2.5 bg-slate-900/80 rounded-xl text-xs border border-blue-500/20">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span className="font-bold text-slate-200 flex items-center gap-1.5">
                              {d.author}
                              {d.role === 'teacher' && (
                                <span className="text-[10px] bg-blue-950 text-[#38BDF8] px-1.5 py-0.2 rounded border border-blue-500/30 font-bold">
                                  Specialist
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500">{d.time}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{d.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddDiscussion} className="flex gap-2 pt-2 border-t border-blue-500/20">
                      <input
                        type="text"
                        value={discussionInput}
                        onChange={(e) => setDiscussionInput(e.target.value)}
                        placeholder="Ask a question about this lecture..."
                        className="flex-1 px-3 py-2 bg-[#060D1E] border border-blue-500/30 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00D2FF]"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-[#0066FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}

                {/* Tab 4: Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-blue-500/20">
                      <span className="font-bold text-white block mb-1 text-xs">
                        Lesson Objectives:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {video.descriptionEn}
                      </p>
                      {video.descriptionTa && (
                        <p className="text-slate-400 text-[11px] mt-2 leading-relaxed border-t border-blue-500/10 pt-2">
                          {video.descriptionTa}
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-blue-500/20 space-y-2 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subject:</span>
                        <span className="font-bold text-[#38BDF8]">{video.subjectNameEn} (Unit {video.unitNumber})</span>
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
                        <span className="text-slate-400">Player Engine:</span>
                        <span className="font-mono text-[#00D2FF]">Study Pro Cinema Cockpit v2</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
