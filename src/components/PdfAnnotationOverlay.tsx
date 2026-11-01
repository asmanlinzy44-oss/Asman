import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pencil,
  Highlighter,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Eye,
  Camera,
  Check,
  Minimize2,
  Maximize2,
  Sparkles,
} from 'lucide-react';

export type AnnotationTool = 'view' | 'pen' | 'highlighter' | 'eraser';

interface PdfAnnotationOverlayProps {
  storageKey: string;
  documentTitle: string;
  children: React.ReactNode;
}

const PEN_COLORS = [
  { name: 'Correction Red', value: '#EF4444' },
  { name: 'Sky Cyan', value: '#38BDF8' },
  { name: 'Emerald Check', value: '#10B981' },
  { name: 'Vibrant Amber', value: '#F59E0B' },
  { name: 'Crisp White', value: '#FFFFFF' },
  { name: 'Royal Violet', value: '#A855F7' },
];

const HIGHLIGHTER_COLORS = [
  { name: 'Neon Yellow', value: '#FACC15', rgba: 'rgba(250, 204, 21, 0.40)' },
  { name: 'Spring Green', value: '#4ADE80', rgba: 'rgba(74, 222, 128, 0.40)' },
  { name: 'Cyan Glow', value: '#38BDF8', rgba: 'rgba(56, 189, 248, 0.40)' },
  { name: 'Hot Coral', value: '#F43F5E', rgba: 'rgba(244, 63, 94, 0.38)' },
  { name: 'Warm Amber', value: '#FB923C', rgba: 'rgba(251, 146, 60, 0.40)' },
];

const PEN_SIZES = [
  { label: 'Fine', size: 2 },
  { label: 'Medium', size: 4 },
  { label: 'Bold', size: 7 },
];

const HIGHLIGHTER_SIZES = [
  { label: 'Normal', size: 16 },
  { label: 'Wide', size: 26 },
  { label: 'Broad', size: 38 },
];

const ERASER_SIZES = [
  { label: 'Small', size: 16 },
  { label: 'Medium', size: 28 },
  { label: 'Large', size: 48 },
];

export const PdfAnnotationOverlay: React.FC<PdfAnnotationOverlayProps> = ({
  storageKey,
  documentTitle,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<AnnotationTool>('view');
  const [penColor, setPenColor] = useState<string>('#EF4444');
  const [highlighterColor, setHighlighterColor] = useState(HIGHLIGHTER_COLORS[0]);
  const [penSize, setPenSize] = useState<number>(3);
  const [highlighterSize, setHighlighterSize] = useState<number>(22);
  const [eraserSize, setEraserSize] = useState<number>(28);

  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState<boolean>(false);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Restore saved image onto canvas
  const restoreCanvasFromDataUrl = useCallback((dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = dataUrl;
  }, []);

  // Save current state to Undo history and LocalStorage
  const saveCanvasSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setUndoStack((prev) => [...prev.slice(-20), dataUrl]);
      setRedoStack([]);
      localStorage.setItem(storageKey, dataUrl);
      setSavedNotification('Saved');
      setTimeout(() => setSavedNotification(null), 1500);
    } catch (err) {
      console.warn('Canvas save warning:', err);
    }
  }, [storageKey]);

  // Canvas initial sizing and resize observer
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let resizeTimer: NodeJS.Timeout;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.round(rect.width * dpr);
      const targetHeight = Math.round(rect.height * dpr);

      if (canvas.width === targetWidth && canvas.height === targetHeight) return;

      // Preserve existing content during resize
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
          ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
        } else {
          // If fresh init, check localStorage
          const savedData = localStorage.getItem(storageKey);
          if (savedData) {
            restoreCanvasFromDataUrl(savedData);
          }
        }
      }
    };

    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 60);
    });

    observer.observe(container);
    handleResize();

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [storageKey, restoreCanvasFromDataUrl]);

  // When storageKey changes (e.g. user toggles between paper and scheme), reload
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setUndoStack([]);
    setRedoStack([]);

    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      restoreCanvasFromDataUrl(savedData);
    }
  }, [storageKey, restoreCanvasFromDataUrl]);

  // Keyboard Shortcuts: Ctrl+Z (Undo), Ctrl+Y (Redo), v/p/h/e
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is focused inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 'v') setTool('view');
        if (e.key === 'p') setTool('pen');
        if (e.key === 'h') setTool('highlighter');
        if (e.key === 'e') setTool('eraser');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack]);

  // Get scaled canvas coordinates
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (clientX - rect.left) * dpr,
      y: (clientY - rect.top) * dpr,
    };
  };

  // Drawing primitives
  const startDrawing = (clientX: number, clientY: number) => {
    if (tool === 'view') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const coords = getCanvasCoords(clientX, clientY);
    lastPointRef.current = coords;

    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.fillStyle = penColor;
      ctx.lineWidth = penSize * dpr;

      // Draw initial dot for quick taps
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, (penSize * dpr) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = highlighterColor.rgba;
      ctx.fillStyle = highlighterColor.rgba;
      ctx.lineWidth = highlighterSize * dpr;

      ctx.beginPath();
      ctx.arc(coords.x, coords.y, (highlighterSize * dpr) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = eraserSize * dpr;

      ctx.beginPath();
      ctx.arc(coords.x, coords.y, (eraserSize * dpr) / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawMove = (clientX: number, clientY: number) => {
    if (!isDrawing || tool === 'view') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPointRef.current) return;

    const coords = getCanvasCoords(clientX, clientY);
    const dpr = window.devicePixelRatio || 1;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(coords.x, coords.y);

    if (tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize * dpr;
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = highlighterColor.rgba;
      ctx.lineWidth = highlighterSize * dpr;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = eraserSize * dpr;
    }

    ctx.stroke();
    lastPointRef.current = coords;
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.restore();
    }
    saveCanvasSnapshot();
  };

  // Undo implementation
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const currentData = canvas.toDataURL('image/png');

    const previousData = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, currentData]);
    setUndoStack((prev) => prev.slice(0, -1));

    if (undoStack.length === 1) {
      // Clear to blank state
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      localStorage.removeItem(storageKey);
    } else {
      const targetState = undoStack[undoStack.length - 2];
      restoreCanvasFromDataUrl(targetState);
      localStorage.setItem(storageKey, targetState);
    }
    setSavedNotification('Undo');
    setTimeout(() => setSavedNotification(null), 1000);
  };

  // Redo implementation
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const nextData = redoStack[redoStack.length - 1];

    setUndoStack((prev) => [...prev, canvas.toDataURL('image/png')]);
    setRedoStack((prev) => prev.slice(0, -1));

    restoreCanvasFromDataUrl(nextData);
    localStorage.setItem(storageKey, nextData);
    setSavedNotification('Redo');
    setTimeout(() => setSavedNotification(null), 1000);
  };

  // Clear all annotations
  const handleClearAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (undoStack.length > 0 || localStorage.getItem(storageKey)) {
      setUndoStack((prev) => [...prev, canvas.toDataURL('image/png')]);
      setRedoStack([]);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(storageKey);
    setSavedNotification('Cleared');
    setTimeout(() => setSavedNotification(null), 1200);
  };

  // Export / Download drawing overlay as PNG
  const handleExportDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement('a');
      const safeTitle = (documentTitle || 'PaperExpress-Annotation').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `${safeTitle}-notes.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setSavedNotification('Downloaded');
      setTimeout(() => setSavedNotification(null), 1500);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950 select-none">
      {/* Sleek Floating Annotation Bar */}
      <div className="z-30 px-3 sm:px-6 py-2 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-2 text-xs flex-wrap">
        {/* Left: Mode Selection (Browse, Pen, Highlighter, Eraser) */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
          {/* Browse / Scroll Tool */}
          <button
            onClick={() => setTool('view')}
            className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              tool === 'view'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Browse & Scroll PDF without drawing (Shortcut: V)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Browse</span>
          </button>

          {/* Pen Tool */}
          <button
            onClick={() => setTool('pen')}
            className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              tool === 'pen'
                ? 'bg-[#0066FF] text-white shadow-sm ring-1 ring-blue-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Pen / Pencil Tool for equations & writing (Shortcut: P)"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pen</span>
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs inline-block"
              style={{ backgroundColor: penColor }}
            />
          </button>

          {/* Highlighter Tool */}
          <button
            onClick={() => setTool('highlighter')}
            className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              tool === 'highlighter'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Translucent Highlighter Tool (Shortcut: H)"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlighter</span>
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-xs inline-block"
              style={{ backgroundColor: highlighterColor.value }}
            />
          </button>

          {/* Eraser Tool */}
          <button
            onClick={() => setTool('eraser')}
            className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              tool === 'eraser'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Eraser Tool (Shortcut: E)"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>
        </div>

        {/* Center: Contextual Tool Controls (Colors / Sizes based on active tool) */}
        {!isToolbarCollapsed && tool !== 'view' && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Color Swatches for Pen */}
            {tool === 'pen' && (
              <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 hidden md:inline">Color:</span>
                <div className="flex items-center gap-1">
                  {PEN_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setPenColor(c.value)}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        penColor === c.value ? 'scale-125 ring-2 ring-blue-400 shadow-md' : 'hover:scale-110 opacity-80'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {penColor === c.value && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Swatches for Highlighter */}
            {tool === 'highlighter' && (
              <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 hidden md:inline">Tint:</span>
                <div className="flex items-center gap-1">
                  {HIGHLIGHTER_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setHighlighterColor(c)}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        highlighterColor.value === c.value ? 'scale-125 ring-2 ring-amber-300 shadow-md' : 'hover:scale-110 opacity-80'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {highlighterColor.value === c.value && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stroke Thickness Selector */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 hidden md:inline">Size:</span>
              {(tool === 'pen'
                ? PEN_SIZES
                : tool === 'highlighter'
                ? HIGHLIGHTER_SIZES
                : ERASER_SIZES
              ).map((preset) => {
                const currentSize =
                  tool === 'pen'
                    ? penSize
                    : tool === 'highlighter'
                    ? highlighterSize
                    : eraserSize;
                const isSelected = currentSize === preset.size;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      if (tool === 'pen') setPenSize(preset.size);
                      else if (tool === 'highlighter') setHighlighterSize(preset.size);
                      else setEraserSize(preset.size);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Right: History, Clear, Snapshot & Indicator */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
          {savedNotification && (
            <div className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1 animate-in fade-in">
              <Check className="w-3 h-3" />
              <span>{savedNotification}</span>
            </div>
          )}

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className={`p-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer ${
              undoStack.length > 0
                ? 'bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white'
                : 'bg-slate-950 text-slate-600 cursor-not-allowed'
            }`}
            title="Undo stroke (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          {/* Redo */}
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`p-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer ${
              redoStack.length > 0
                ? 'bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white'
                : 'bg-slate-950 text-slate-600 cursor-not-allowed'
            }`}
            title="Redo stroke (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          {/* Clear All */}
          <button
            onClick={handleClearAll}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 transition-colors cursor-pointer"
            title="Clear all annotations on this document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Download Snapshot */}
          <button
            onClick={handleExportDrawing}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-sky-400 hover:text-sky-300 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
            title="Download handwritten notes & highlights as PNG image"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Save Notes</span>
          </button>

          {/* Collapse / Expand Tool Options */}
          <button
            onClick={() => setIsToolbarCollapsed((prev) => !prev)}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title={isToolbarCollapsed ? 'Expand toolbar' : 'Compact toolbar'}
          >
            {isToolbarCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Helpful banner when in Drawing/Highlighting mode */}
      {tool !== 'view' && (
        <div className="z-20 px-4 py-1.5 bg-blue-950/60 border-b border-blue-900/40 flex items-center justify-between text-[11px] text-sky-200">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#38BDF8]" />
            <span>
              <strong>Annotation Mode Active:</strong> You can draw, solve equations, and highlight questions directly.
            </span>
          </div>
          <button
            onClick={() => setTool('view')}
            className="text-xs text-sky-300 hover:text-white underline font-bold cursor-pointer"
          >
            Switch to Browse to scroll PDF →
          </button>
        </div>
      )}

      {/* Main Container: PDF iframe beneath + HTML5 Canvas on top */}
      <div ref={containerRef} className="relative w-full h-full flex-1 overflow-hidden bg-slate-950">
        {/* Underlying PDF / Content */}
        <div className="w-full h-full absolute inset-0">
          {children}
        </div>

        {/* Annotation Canvas Layer */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full ${
            tool === 'view'
              ? 'pointer-events-none'
              : tool === 'eraser'
              ? 'pointer-events-auto cursor-cell touch-none'
              : 'pointer-events-auto cursor-crosshair touch-none'
          }`}
          onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
          onMouseMove={(e) => drawMove(e.clientX, e.clientY)}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            if (tool === 'view') return;
            e.preventDefault();
            const touch = e.touches[0];
            startDrawing(touch.clientX, touch.clientY);
          }}
          onTouchMove={(e) => {
            if (tool === 'view') return;
            e.preventDefault();
            const touch = e.touches[0];
            drawMove(touch.clientX, touch.clientY);
          }}
          onTouchEnd={(e) => {
            if (tool === 'view') return;
            e.preventDefault();
            stopDrawing();
          }}
        />
      </div>
    </div>
  );
};
