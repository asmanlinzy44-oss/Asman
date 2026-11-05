import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface AdsterraBannerAdProps {
  className?: string;
  showSkyscraper?: boolean;
}

export const AdsterraBannerAd: React.FC<AdsterraBannerAdProps> = ({ 
  className = '',
  showSkyscraper = true
}) => {
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  const containerRefTop = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLDivElement>(null);

  // States to track whether each iframe ad successfully loaded or has content (auto-hide if ad blockers or empty)
  const [ad1Loaded, setAd1Loaded] = useState(true);
  const [ad2Loaded, setAd2Loaded] = useState(true);
  const [adTopLoaded, setAdTopLoaded] = useState(true);
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [showAdBlockToast, setShowAdBlockToast] = useState(true);

  // Simple Ad-blocker detection check
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasAnyAd = ad1Loaded || ad2Loaded || adTopLoaded;
      if (!hasAnyAd) {
        setAdBlockDetected(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [ad1Loaded, ad2Loaded, adTopLoaded]);

  // Load Top 160x600 Banner Ad
  useEffect(() => {
    if (!containerRefTop.current) return;
    const container = containerRefTop.current;
    container.innerHTML = '';

    try {
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.text = `
        atOptions = {
          'key' : '2896df15d30e5bd79f502e655ffb4da0',
          'format' : 'iframe',
          'height' : 600,
          'width' : 160,
          'params' : {}
        };
      `;

      const srcScript = document.createElement('script');
      srcScript.type = 'text/javascript';
      srcScript.src = 'https://bauval.org/22/2896df15d30e5bd79f502e655ffb4da0';
      srcScript.async = true;
      srcScript.onerror = () => setAdTopLoaded(false);

      container.appendChild(confScript);
      container.appendChild(srcScript);

      const timer = setTimeout(() => {
        const iframe = container.querySelector('iframe');
        if (!iframe || iframe.offsetHeight === 0) {
          setAdTopLoaded(false);
        }
      }, 3000);

      return () => clearTimeout(timer);
    } catch (err) {
      setAdTopLoaded(false);
    }
  }, []);

  // Load 468x60 Horizontal Banner Ad 1
  useEffect(() => {
    if (!containerRef1.current) return;
    const container = containerRef1.current;
    container.innerHTML = '';

    try {
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.text = `
        atOptions = {
          'key' : '223fac3ae07a235a0d8ba8950ee1c4c5',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;

      const srcScript = document.createElement('script');
      srcScript.type = 'text/javascript';
      srcScript.src = 'https://bauval.org/22/223fac3ae07a235a0d8ba8950ee1c4c5';
      srcScript.async = true;
      srcScript.onerror = () => setAd1Loaded(false);

      container.appendChild(confScript);
      container.appendChild(srcScript);

      const timer = setTimeout(() => {
        const iframe = container.querySelector('iframe');
        if (!iframe || iframe.offsetHeight === 0) {
          setAd1Loaded(false);
        }
      }, 3000);

      return () => clearTimeout(timer);
    } catch (err) {
      setAd1Loaded(false);
    }
  }, []);

  // Load 300x250 Banner Ad 2
  useEffect(() => {
    if (!showSkyscraper || !containerRef2.current) return;
    const container = containerRef2.current;
    container.innerHTML = '';

    try {
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.text = `
        atOptions = {
          'key' : 'de48150321be2f036daf667f62eeb33c',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;

      const srcScript = document.createElement('script');
      srcScript.type = 'text/javascript';
      srcScript.src = 'https://bauval.org/22/de48150321be2f036daf667f62eeb33c';
      srcScript.async = true;
      srcScript.onerror = () => setAd2Loaded(false);

      container.appendChild(confScript);
      container.appendChild(srcScript);

      const timer = setTimeout(() => {
        const iframe = container.querySelector('iframe');
        if (!iframe || iframe.offsetHeight === 0) {
          setAd2Loaded(false);
        }
      }, 3000);

      return () => clearTimeout(timer);
    } catch (err) {
      setAd2Loaded(false);
    }
  }, [showSkyscraper]);

  // Load Native Banner Ad 3
  useEffect(() => {
    if (!nativeRef.current) return;
    const parent = nativeRef.current;
    parent.innerHTML = '';

    try {
      const containerDiv = document.createElement('div');
      containerDiv.id = 'container-fa6bf9477ba924f59983d1515f1d1e14';

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://pl32201276.profitableratecpmnetwork.com/fa6bf9477ba924f59983d1515f1d1e14/invoke.js';

      parent.appendChild(containerDiv);
      parent.appendChild(script);
    } catch (err) {
      console.warn('Native banner script error:', err);
    }
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center gap-4 my-4 overflow-hidden google-anno-skip ${className}`}>
      {/* Polite Ad-Blocker Notice Bar */}
      {adBlockDetected && showAdBlockToast && (
        <div className="w-full max-w-md p-3.5 rounded-2xl bg-amber-950/90 border border-amber-500/50 text-amber-200 text-xs shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
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

      {/* Top Banner: 160x600 (Auto-hide if adblocked or unavailable) */}
      {adTopLoaded && (
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
            Sponsor Top (160x600)
          </span>
          <div 
            ref={containerRefTop} 
            style={{ width: '160px', height: '600px', maxWidth: '160px', maxHeight: '600px' }}
            className="flex items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-0 overflow-hidden shrink-0"
          />
        </div>
      )}

      {/* Banner 1: 468x60 (Auto-hide if adblocked or unavailable) */}
      {ad1Loaded && (
        <div className="flex flex-col items-center w-full max-w-[468px]">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
            Sponsor Banner 1 (468x60)
          </span>
          <div 
            ref={containerRef1} 
            className="w-full min-h-[60px] flex items-center justify-center rounded-xl bg-slate-900/40 border border-slate-800/60 p-1 overflow-hidden"
          />
        </div>
      )}

      {/* Banner 2: 300x250 (Auto-hide if adblocked or unavailable) */}
      {showSkyscraper && ad2Loaded && (
        <div className="flex flex-col items-center w-full max-w-[300px]">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
            Sponsor Banner 2 (300x250)
          </span>
          <div 
            ref={containerRef2} 
            className="w-full min-h-[250px] flex items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-1 overflow-hidden"
          />
        </div>
      )}

      {/* Banner 3: Native Banner Ad */}
      <div className="flex flex-col items-center w-full max-w-lg">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
          Native Sponsor Banner
        </span>
        <div 
          ref={nativeRef} 
          className="w-full min-h-[100px] flex items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-2 overflow-hidden shadow-inner"
        />
      </div>
    </div>
  );
};
