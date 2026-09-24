import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const handleSelectMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'focus') setTimeLeft(25 * 60);
    if (newMode === 'shortBreak') setTimeLeft(5 * 60);
    if (newMode === 'longBreak') setTimeLeft(15 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 text-white p-6 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-sky-400 text-xs font-bold mb-2">
          <Clock className="w-4 h-4 text-[#38BDF8]" />
          <span>Study Pro Focus Pomodoro</span>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-1 p-1 bg-slate-950 rounded-xl text-xs mb-6 border border-slate-800">
          <button
            onClick={() => handleSelectMode('focus')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              mode === 'focus' ? 'bg-[#0066FF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Study (25m)
          </button>
          <button
            onClick={() => handleSelectMode('shortBreak')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              mode === 'shortBreak' ? 'bg-[#0066FF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Break (5m)
          </button>
          <button
            onClick={() => handleSelectMode('longBreak')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              mode === 'longBreak' ? 'bg-[#0066FF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Long (15m)
          </button>
        </div>

        {/* Big Digit display */}
        <div className="text-5xl font-mono font-black tracking-tight text-white mb-6 tabular-nums">
          {displayTime}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-2.5 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md text-xs"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={() => handleSelectMode(mode)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-6 leading-relaxed">
          Solve 1 past paper question with zero distraction for 25 minutes, then take a 5-minute breather!
        </p>
      </div>
    </div>
  );
};
