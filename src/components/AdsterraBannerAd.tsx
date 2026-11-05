import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface AutoSizingBannerSlotProps {
  adKey: string;
  width: number;
  height: number;
  scriptSrc: string;
  label?: string;
  className?: string;
}

/**
 * Auto-Sizing Ad Banner Slot.
 * Measures available container width and dynamically adjusts container size
 * and scaling so the ad always fits the screen cleanly with zero overflow,
 * zero empty wasted space, and auto-collapses if the ad fails to load.
 */
export const AutoSizingBannerSlot: React.FC<AutoSizingBannerSlotProps> = ({
  adKey,
  width,
  height,
  scriptSrc,
  label,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [containerWidth, setContainerWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : width
  );

  // Monitor available parent width to scale smoothly without overflow
  useEffect(() => {
    if (!wrapperRef.current) return;
    const updateWidth = () => {
      if (wrapperRef.current) {
        const clientW = wrapperRef.current.clientWidth;
        if (clientW > 0) {
          setContainerWidth(clientW);
        }
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(wrapperRef.current);
    window.addEventListener('resize', updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Calculate dynamic scale factor so ad never overflows on narrow screens
  const scale = Math.min(1, Math.max(0.35, (containerWidth - 8) / width));
  const scaledWidth = Math.round(width * scale);
  const scaledHeight = Math.round(height * scale);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

    try {
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.text = `
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;

      const srcScript = document.createElement('script');
      srcScript.type = 'text/javascript';
      srcScript.src = scriptSrc;
      srcScript.async = true;
      srcScript.onerror = () => setIsLoaded(false);

      container.appendChild(confScript);
      container.appendChild(srcScript);

      const checkTimer = setTimeout(() => {
        const iframe = container.querySelector('iframe');
        if (!iframe || iframe.offsetHeight === 0) {
          setIsLoaded(false);
        }
      }, 3500);

      return () => clearTimeout(checkTimer);
    } catch {
      setIsLoaded(false);
    }
  }, [adKey, height, width, scriptSrc]);

  if (!isLoaded) return null;

  return (
    <div 
      ref={wrapperRef}
      className={`w-full flex flex-col items-center justify-center my-2 transition-all duration-300 ${className}`}
      style={{ minHeight: isLoaded ? `${scaledHeight}px` : '0px' }}
    >
      {label && (
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
          {label} ({width}x{height})
        </span>
      )}
      
      {/* Outer wrapper that hugs the exact scaled ad dimensions */}
      <div 
        className="rounded-2xl bg-slate-900/40 border border-slate-800/60 overflow-hidden flex items-center justify-center transition-all duration-300 shadow-xs"
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          maxWidth: '100%',
        }}
      >
        {/* Inner container with scale transform to preserve crisp ad layout */}
        <div
          ref={containerRef}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'center center',
            flexShrink: 0,
          }}
          className="flex items-center justify-center overflow-hidden"
        />
      </div>
    </div>
  );
};

/**
 * Dedicated Native Sponsor Banner Slot.
 * Using an isolated document iframe ensures the Adsterra invoke.js script
 * runs freshly and reliably without SPA routing or React DOM virtual reconciliation conflicts.
 * Automatically resizes its height to match the rendered ad cards (1 row, 2 rows, etc.).
 */
export const NativeBannerSlot: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(140);

  // Listen for height broadcast from inside iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ADSTERRA_NATIVE_HEIGHT' && typeof e.data.height === 'number') {
        const newH = Math.max(90, Math.ceil(e.data.height));
        setIframeHeight(newH);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { box-sizing: border-box; }
              html, body {
                margin: 0;
                padding: 0;
                background: transparent;
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              #container-fa6bf9477ba924f59983d1515f1d1e14 {
                width: 100%;
                max-width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <script async="async" data-cfasync="false" src="https://pl32201276.profitableratecpmnetwork.com/fa6bf9477ba924f59983d1515f1d1e14/invoke.js"><\/script>
            <div id="container-fa6bf9477ba924f59983d1515f1d1e14"></div>

            <script>
              function sendHeight() {
                var container = document.getElementById('container-fa6bf9477ba924f59983d1515f1d1e14');
                var h = (container && container.offsetHeight > 40) ? container.offsetHeight : document.body.scrollHeight;
                if (h && h > 40) {
                  window.parent.postMessage({ type: 'ADSTERRA_NATIVE_HEIGHT', height: h + 10 }, '*');
                }
              }

              if (window.ResizeObserver) {
                var ro = new ResizeObserver(function() { sendHeight(); });
                ro.observe(document.body);
              }
              setInterval(sendHeight, 800);
              setTimeout(sendHeight, 2000);
              setTimeout(sendHeight, 5000);
            <\/script>
          </body>
        </html>
      `);
      doc.close();

      // Fallback measurement from parent document
      const fallbackTimer = setInterval(() => {
        try {
          const bodyH = doc.body.scrollHeight || doc.documentElement.scrollHeight;
          const containerEl = doc.getElementById('container-fa6bf9477ba924f59983d1515f1d1e14');
          const elH = containerEl ? containerEl.offsetHeight : 0;
          const targetH = Math.max(elH, bodyH);
          if (targetH > 50) {
            setIframeHeight(Math.max(100, targetH + 8));
          }
        } catch {}
      }, 1000);

      const cancelTimer = setTimeout(() => clearInterval(fallbackTimer), 15000);

      return () => {
        clearInterval(fallbackTimer);
        clearTimeout(cancelTimer);
      };
    } catch (err) {
      console.warn('Native banner iframe initialization error:', err);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-4xl flex flex-col items-center justify-center my-3 transition-all duration-300"
    >
      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 opacity-70">
        Native Sponsor Banner
      </span>
      <div 
        className="w-full rounded-2xl bg-slate-900/40 border border-slate-800/60 p-2 overflow-hidden shadow-inner flex items-center justify-center transition-all duration-300"
        style={{ minHeight: `${iframeHeight}px` }}
      >
        <iframe
          ref={iframeRef}
          title="Native Sponsor Banner"
          className="w-full border-0 rounded-xl overflow-hidden transition-all duration-300"
          style={{ height: `${iframeHeight}px`, width: '100%' }}
          scrolling="no"
        />
      </div>
    </div>
  );
};

export interface AdsterraBannerAdProps {
  className?: string;
  showSkyscraper?: boolean;
  showNativeBanner?: boolean;
  show728x90?: boolean;
  show468x60?: boolean;
  show160x300?: boolean;
  responsiveSwitch?: boolean; // If true (default), shows 728x90 on desktop and 468x60 on mobile to avoid double-stacking
}

export const AdsterraBannerAd: React.FC<AdsterraBannerAdProps> = ({ 
  className = '',
  showSkyscraper = false,
  showNativeBanner = true,
  show728x90 = true,
  show468x60 = true,
  show160x300 = false,
  responsiveSwitch = true,
}) => {
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [showAdBlockToast, setShowAdBlockToast] = useState(true);

  return (
    <div className={`flex flex-col items-center justify-center gap-2 my-3 overflow-hidden google-anno-skip ${className}`}>
      {/* Polite Ad-Blocker Notice Bar */}
      {adBlockDetected && showAdBlockToast && (
        <div className="w-full max-w-md p-3 rounded-2xl bg-amber-950/90 border border-amber-500/50 text-amber-200 text-xs shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Please disable ad-blocker to support free A/L resources</span>
          </div>
          <button
            onClick={() => setShowAdBlockToast(false)}
            className="p-1 rounded-lg text-amber-300 hover:text-white hover:bg-amber-900 transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 728x90 Leaderboard Banner: On desktop/tablet, automatically auto-sizes to fit */}
      {show728x90 && (
        <AutoSizingBannerSlot
          adKey="1f86267bbc350d1bb190155c7b7af825"
          width={728}
          height={90}
          scriptSrc="https://bauval.org/22/1f86267bbc350d1bb190155c7b7af825"
          label="Sponsor Banner"
          className={responsiveSwitch ? 'hidden sm:flex' : ''}
        />
      )}

      {/* 468x60 Banner: Auto-sizes to fit on mobile screens */}
      {show468x60 && (
        <AutoSizingBannerSlot
          adKey="223fac3ae07a235a0d8ba8950ee1c4c5"
          width={468}
          height={60}
          scriptSrc="https://bauval.org/22/223fac3ae07a235a0d8ba8950ee1c4c5"
          label="Sponsor Banner"
          className={responsiveSwitch ? 'flex sm:hidden' : ''}
        />
      )}

      {/* 160x300 Skyscraper Banner (Optional, when requested) */}
      {show160x300 && (
        <AutoSizingBannerSlot
          adKey="2c9453cf5beca2eba3d3daf52869bf3b"
          width={160}
          height={300}
          scriptSrc="https://bauval.org/22/2c9453cf5beca2eba3d3daf52869bf3b"
          label="Sponsor Skyscraper"
        />
      )}

      {/* 300x250 Square Banner (Optional, when requested) */}
      {showSkyscraper && (
        <AutoSizingBannerSlot
          adKey="de48150321be2f036daf667f62eeb33c"
          width={300}
          height={250}
          scriptSrc="https://bauval.org/22/de48150321be2f036daf667f62eeb33c"
          label="Sponsor Square"
        />
      )}

      {/* Native Sponsor Banner with Auto-Adjusting Height */}
      {showNativeBanner && <NativeBannerSlot />}
    </div>
  );
};
