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

  // Load 160x300 Vertical Banner Ad 2 (Right Below Banner 1)
  useEffect(() => {
    if (!showSkyscraper || !containerRef2.current) return;
    const container = containerRef2.current;
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

  return (
    <div className={`flex flex-col items-center justify-center gap-3 my-4 overflow-hidden google-anno-skip ${className}`}>
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

      {/* Banner 2: 160x300 (Right Below Banner 1) */}
      {showSkyscraper && (
        <div className="flex flex-col items-center mt-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 opacity-70">
            Sponsor Banner 2 (160x300)
          </span>
          <div 
            ref={containerRef2} 
            className="w-full max-w-[160px] min-h-[300px] flex items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-1 overflow-hidden"
          />
        </div>
      )}
    </div>
  );
};
