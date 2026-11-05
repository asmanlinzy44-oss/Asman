import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Hand } from 'lucide-react';
import { playRoboticClick } from '../utils/audio';

interface DragScrollManagerProps {
  onToggleChange?: (enabled: boolean) => void;
}

export const DragScrollManager: React.FC<DragScrollManagerProps> = ({ onToggleChange }) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('studypro_drag_scroll_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
    targetContainer: HTMLElement | Window | null;
    hasMoved: boolean;
    draggedDistance: number;
    preventClick: boolean;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
    targetContainer: null,
    hasMoved: false,
    draggedDistance: 0,
    preventClick: false,
  });

  // Save preference and inform user
  const toggleDragScroll = useCallback(() => {
    playRoboticClick();
    setIsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('studypro_drag_scroll_enabled', String(next));
      if (onToggleChange) onToggleChange(next);

      setToastMessage(
        next
          ? '🖐️ PC Drag & Horizontal Swipe Scroll Enabled! Click and drag anywhere.'
          : '🖱️ Standard PC Mouse Cursor Restored.'
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return next;
    });
  }, [onToggleChange]);

  // Find nearest scrollable container
  const findScrollableParent = (element: HTMLElement | null): HTMLElement | Window => {
    let curr = element;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      const style = window.getComputedStyle(curr);
      const overflowX = style.overflowX;
      const overflowY = style.overflowY;
      const isScrollableX = (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay') && curr.scrollWidth > curr.clientWidth + 2;
      const isScrollableY = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && curr.scrollHeight > curr.clientHeight + 2;

      // Prioritize horizontal scroll container if clicked inside tab bar / nav bar
      if (isScrollableX || isScrollableY) {
        return curr;
      }
      curr = curr.parentElement;
    }
    return window;
  };

  // 1. Convert vertical mouse wheel into horizontal scroll when hovering horizontal tab bars
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      let curr = e.target as HTMLElement | null;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        const style = window.getComputedStyle(curr);
        const overflowX = style.overflowX;
        const isScrollableX = (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay') && curr.scrollWidth > curr.clientWidth + 2;

        if (isScrollableX) {
          const isScrollableY = (style.overflowY === 'auto' || style.overflowY === 'scroll') && curr.scrollHeight > curr.clientHeight + 2;
          if (!isScrollableY || Math.abs(e.deltaX) > Math.abs(e.deltaY) || curr.clientHeight < 120) {
            if (e.deltaY !== 0) {
              curr.scrollLeft += e.deltaY;
              if (e.cancelable) e.preventDefault();
              return;
            }
          }
        }
        curr = curr.parentElement;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // 2. PC Mouse Click & Drag Horizontal Swiping
  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Allow drag-scroll on left click (button 0) or middle click (button 1)
      if (e.button !== 0 && e.button !== 1) return;

      const target = e.target as HTMLElement;

      // Ignore text inputs, textareas, or explicitly non-draggable elements
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('.no-drag-scroll') ||
        target.closest('iframe')
      ) {
        return;
      }

      const container = findScrollableParent(target);

      let initialLeft = 0;
      let initialTop = 0;

      if (container === window) {
        initialLeft = window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
        initialTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      } else {
        const el = container as HTMLElement;
        initialLeft = el.scrollLeft;
        initialTop = el.scrollTop;
      }

      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: initialLeft,
        scrollTop: initialTop,
        targetContainer: container,
        hasMoved: false,
        draggedDistance: 0,
        preventClick: false,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.active || !dragRef.current.targetContainer) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (dist > 4) {
        dragRef.current.hasMoved = true;
        dragRef.current.draggedDistance = dist;
        dragRef.current.preventClick = true;
        setIsDragging(true);
      }

      if (!dragRef.current.hasMoved) return;

      const container = dragRef.current.targetContainer;

      if (container === window) {
        window.scrollTo({
          left: dragRef.current.scrollLeft - deltaX,
          top: dragRef.current.scrollTop - deltaY,
          behavior: 'instant' as ScrollBehavior,
        });
      } else {
        const el = container as HTMLElement;
        el.scrollLeft = dragRef.current.scrollLeft - deltaX;
        el.scrollTop = dragRef.current.scrollTop - deltaY;
      }

      // Prevent text selection while drag scrolling
      if (e.cancelable) e.preventDefault();
    };

    const handleMouseUp = () => {
      if (dragRef.current.active) {
        if (dragRef.current.hasMoved) {
          // Temporarily prevent click handler on links/buttons if dragged significantly
          const captureClickOnce = (clickEvent: MouseEvent) => {
            clickEvent.stopPropagation();
            clickEvent.preventDefault();
            window.removeEventListener('click', captureClickOnce, true);
          };
          window.addEventListener('click', captureClickOnce, true);
          setTimeout(() => window.removeEventListener('click', captureClickOnce, true), 100);
        }

        dragRef.current.active = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('mousedown', handleMouseDown, { passive: false });
    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isEnabled]);

  // Set body cursor class when dragging
  useEffect(() => {
    if (isDragging) {
      document.body.classList.add('is-dragging-scroll');
    } else {
      document.body.classList.remove('is-dragging-scroll');
    }

    return () => {
      document.body.classList.remove('is-dragging-scroll');
    };
  }, [isDragging]);

  return (
    <>
      {/* Dynamic Cursor Styling */}
      <style>{`
        body.is-dragging-scroll,
        body.is-dragging-scroll * {
          cursor: grabbing !important;
          user-select: none !important;
        }
      `}</style>

      {/* Floating Toast Notice */}
      {showToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-[9999] bg-slate-900/95 border border-blue-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200 text-xs sm:text-sm font-semibold max-w-xs sm:max-w-md">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-[#38BDF8] flex items-center justify-center shrink-0 border border-blue-500/30">
            <Hand className="w-4 h-4" />
          </div>
          <span className="flex-1 leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Floating Desktop Quick Toggle Button */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:flex items-center gap-2 group">
        <button
          onClick={toggleDragScroll}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold shadow-xl border backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer ${
            isEnabled
              ? 'bg-[#0066FF] hover:bg-blue-600 text-white border-blue-400/50 shadow-blue-500/25 ring-2 ring-blue-500/30'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700/80 shadow-slate-900/50'
          }`}
          title={
            isEnabled
              ? 'PC Drag & Swipe Scroll is ON (Click and drag anywhere to scroll)'
              : 'Turn ON PC Drag & Swipe Scroll'
          }
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            isEnabled ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            <Hand className={`w-3.5 h-3.5 ${isEnabled ? 'animate-bounce' : ''}`} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] leading-tight font-extrabold flex items-center gap-1">
              <span>PC Drag Scroll</span>
              <span className={`text-[9px] px-1 py-0.2 rounded ${
                isEnabled ? 'bg-emerald-500 text-white font-mono' : 'bg-slate-800 text-slate-400'
              }`}>
                {isEnabled ? 'ON' : 'OFF'}
              </span>
            </span>
            <span className="text-[9px] opacity-80 font-normal">
              {isEnabled ? 'Click & swipe like mobile' : 'Standard mouse'}
            </span>
          </div>
        </button>
      </div>
    </>
  );
};
