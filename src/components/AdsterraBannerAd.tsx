import React, { useEffect, useRef } from 'react';

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
  const nativeRef = useRef<HTMLDivElement>(null);

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

      container.appendChild(confScript);
      container.appendChild(srcScript);
    } catch (err) {
      console.warn('Adsterra banner 1 script error:', err);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  // Load 300x250 Banner Ad 2 (Right Below Banner 1)
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

      container.appendChild(confScript);
      container.appendChild(srcScript);
    } catch (err) {
      console.warn('Adsterra banner 2 script error:', err);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [showSkyscraper]);

  // Load Native Banner Ad 3 (Right Below Banner 2)
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

    return () => {
      if (parent) {
        parent.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center gap-4 my-4 overflow-hidden google-anno-skip ${className}`}>
      {/* Banner 1: 468x60 */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
          Sponsor Banner 1 (468x60)
        </span>
        <div 
          ref={containerRef1} 
          className="w-full max-w-[468px] min-h-[60px] flex items-center justify-center rounded-xl bg-slate-900/40 border border-slate-800/60 p-1 overflow-hidden"
        />
      </div>

      {/* Banner 2: 300x250 (Right Below Banner 1) */}
      {showSkyscraper && (
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
            Sponsor Banner 2 (300x250)
          </span>
          <div 
            ref={containerRef2} 
            className="w-full max-w-[300px] min-h-[250px] flex items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-1 overflow-hidden"
          />
        </div>
      )}

      {/* Banner 3: Native Banner Ad (Right Below Banner 2) */}
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
