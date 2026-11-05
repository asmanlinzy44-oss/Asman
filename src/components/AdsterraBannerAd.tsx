import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface AdsterraBannerAdProps {
  className?: string;
  showSkyscraper?: boolean;
  showNativeBanner?: boolean;
  show728x90?: boolean;
  show160x300?: boolean;
}

export const AdsterraBannerAd: React.FC<AdsterraBannerAdProps> = ({ 
  className = '',
  showSkyscraper = false,
  showNativeBanner = true,
  show728x90 = true,
  show160x300 = true,
}) => {
  const containerRef468 = useRef<HTMLDivElement>(null);
  const containerRef728 = useRef<HTMLDivElement>(null);
  const containerRef160x300 = useRef<HTMLDivElement>(null);
  const containerRef300 = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLDivElement>(null);

  const [ad468Loaded, setAd468Loaded] = useState(true);
  const [ad728Loaded, setAd728Loaded] = useState(true);
  const [ad160x300Loaded, setAd160x300Loaded] = useState(true);
  const [ad300Loaded, setAd300Loaded] = useState(true);
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [showAdBlockToast, setShowAdBlockToast] = useState(true);

  // Ad-blocker detection check
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasAnyAd = ad468Loaded || ad728Loaded || ad160x300Loaded || ad300Loaded;
      if (!hasAnyAd) {
        setAdBlockDetected(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [ad468Loaded, ad728Loaded, ad160x300Loaded, ad300Loaded]);

  // Load 728x90 Leaderboard Banner Ad
  useEffect(() => {
    if (!show728x90 || !containerRef728.current) return;
    const container = containerRef728.current;
    container.innerHTML = '';

    try {
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.text = `
        atOptions = {
          'key' : '1f86267bbc350d1bb190155c7b7af825',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      const srcScript = document.createElement('script');
      srcScript.type = 'text/javascript';
      srcScript.src = 'https://bauval.org/22/1f86267bbc350d1bb190155c7b7af825';
      srcScript.async = true;
      srcScript.onerror = () => setAd728Loaded(false);

      container.appendChild(confScript);
      container.appendChild(srcScript);

      const timer = setTimeout(() => {
        const iframe = container.querySelector('iframe');
        if (!iframe || iframe.offsetHeight === 0) {
          setAd728Loaded(false);
        }
      }, 3000);

      return () => clearTimeout(timer);
    } catch (err) {
      setAd728Loaded(false);
    }
  }, [show728x90]);

  // Load 160x300 Skyscraper Banner Ad
  useEffect(() => {
    if (!show160x300 || !containerRef160x300.current) return;
    const container = containerRef160x300.current;
    container.innerHTML = '';

    try {
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.text = `
        atOptions = {
          'key' : '2c9453cf5beca2eba3d3daf52869bf3b',
          'format' : 'iframe',
          'height' : 300,
          'width' : 160,
          'params' : {}
        };
      `;

      const srcScript = document.createElement('script');
      srcScript.type = 'text/javascript';
      srcScript.src = 'https://bauval.org/22/2c9453cf5beca2eba3d3daf52869bf3b';
      srcScript.async = true;
      srcScript.onerror = () => setAd160x300Loaded(false);

      container.appendChild(confScript);
      container.appendChild(srcScript);

      const timer = setTimeout(() => {
        const iframe = container.querySelector('iframe');
        if (!iframe || iframe.offsetHeight === 0) {
          setAd160x300Loaded(false);
        }
      }, 3000);

      return () => clearTimeout(timer);
    } catch (err) {
      setAd160x300Loaded(false);
    }
  }, [show160x300]);

  // Load 468x60 Horizontal Banner Ad
  useEffect(() => {
    if (!containerRef468.current) return;
    const container = containerRef468.current;
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
      srcScript.onerror = () => setAd468Loaded(false);

      container.appendChild(confScript);
      container.appendChild(srcScript);

      const timer = setTimeout(() => {
        const iframe = container.querySelector('iframe');
        if (!iframe || iframe.offsetHeight === 0) {
          setAd468Loaded(false);
        }
      }, 3000);

      return () => clearTimeout(timer);
    } catch (err) {
      setAd468Loaded(false);
    }
  }, []);

  // Load 300x250 Banner (Optional)
  useEffect(() => {
    if (!showSkyscraper || !containerRef300.current) return;
    const container = containerRef300.current;
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
      srcScript.onerror = () => setAd300Loaded(false);

      container.appendChild(confScript);
      container.appendChild(srcScript);

      const timer = setTimeout(() => {
        const iframe = container.querySelector('iframe');
        if (!iframe || iframe.offsetHeight === 0) {
          setAd300Loaded(false);
        }
      }, 3000);

      return () => clearTimeout(timer);
    } catch (err) {
      setAd300Loaded(false);
    }
  }, [showSkyscraper]);

  // Load Native Banner Ad (Strictly for bottom placement when showNativeBanner=true)
  useEffect(() => {
    if (!showNativeBanner || !nativeRef.current) return;
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
  }, [showNativeBanner]);

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

      {/* Leaderboard Banner: 728x90 */}
      {show728x90 && ad728Loaded && (
        <div className="hidden sm:flex flex-col items-center w-full max-w-[728px]">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
            Sponsor Banner (728x90)
          </span>
          <div 
            ref={containerRef728} 
            className="w-full min-h-[90px] flex items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-1 overflow-hidden"
          />
        </div>
      )}

      {/* Horizontal Banner: 468x60 */}
      {ad468Loaded && (
        <div className="flex flex-col items-center w-full max-w-[468px]">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
            Sponsor Banner (468x60)
          </span>
          <div 
            ref={containerRef468} 
            className="w-full min-h-[60px] flex items-center justify-center rounded-xl bg-slate-900/40 border border-slate-800/60 p-1 overflow-hidden"
          />
        </div>
      )}

      {/* Skyscraper Banner: 160x300 */}
      {show160x300 && ad160x300Loaded && (
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
            Sponsor Skyscraper (160x300)
          </span>
          <div 
            ref={containerRef160x300} 
            style={{ width: '160px', height: '300px', maxWidth: '160px', maxHeight: '300px' }}
            className="flex items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-0 overflow-hidden shrink-0"
          />
        </div>
      )}

      {/* Square Banner: 300x250 */}
      {showSkyscraper && ad300Loaded && (
        <div className="flex flex-col items-center w-full max-w-[300px]">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
            Sponsor Banner (300x250)
          </span>
          <div 
            ref={containerRef300} 
            className="w-full min-h-[250px] flex items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-1 overflow-hidden"
          />
        </div>
      )}

      {/* Native Sponsor Banner (Only shown when showNativeBanner=true, e.g., bottom footer) */}
      {showNativeBanner && (
        <div className="flex flex-col items-center w-full max-w-lg">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
            Native Sponsor Banner
          </span>
          <div 
            ref={nativeRef} 
            className="w-full min-h-[100px] flex items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-2 overflow-hidden shadow-inner"
          />
        </div>
      )}
    </div>
  );
};
