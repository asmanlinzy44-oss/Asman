import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, Copy, Check, X, Globe, Sparkles, Settings } from 'lucide-react';

interface DomainAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

export const DomainAuthModal: React.FC<DomainAuthModalProps> = ({
  isOpen,
  onClose,
  projectId = 'inlaid-doodad-65p7n',
}) => {
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);
  const [activeTab, setActiveTab] = useState<'domain' | 'branding'>('domain');

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'paperexpress.vercel.app';
  const redirectUri = `https://${currentDomain}/__/auth/handler`;
  const settingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;
  const consentScreenUrl = `https://console.cloud.google.com/apis/credentials/consent?project=${projectId}`;
  const credentialsUrl = `https://console.cloud.google.com/apis/credentials?project=${projectId}`;

  if (!isOpen) return null;

  const handleCopyDomain = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleCopyRedirectUri = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(redirectUri);
      setCopiedRedirectUri(true);
      setTimeout(() => setCopiedRedirectUri(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 google-anno-skip">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col google-anno-skip">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-[#0066FF] p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Google Login & Custom Branding</h3>
              <p className="text-xs text-blue-100 font-medium">Paper Express Domain & Name Setup</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/20">
            <button
              onClick={() => setActiveTab('domain')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'domain'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              1. Fix Login Error (Vercel)
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'branding'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              2. Hide Firebase / AI Name
            </button>
          </div>
        </div>

        {/* Tab 1: Fix Unauthorized Domain */}
        {activeTab === 'domain' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <p className="font-bold mb-1">ஏன் இந்த பிழை (auth/unauthorized-domain) வருகிறது?</p>
              <p>
                Firebase Authentication பாதுகாப்புக் காரணங்களுக்காக புதிய டொமைன்களை (எ.கா: <strong>{currentDomain}</strong>)
                தானாக அனுமதிக்காது. Firebase Console-ல் ஒரு முறை மட்டும் சேர்த்தால் Google Login தடையின்றி இயங்கும்.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>உங்கள் Vercel டொமைன்:</span>
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-100 border border-slate-300">
                <code className="text-xs font-mono font-bold text-slate-800 flex-1 truncate px-1">
                  {currentDomain}
                </code>
                <button
                  onClick={handleCopyDomain}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">3 எளிய வழிகள்:</h4>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</span>
                <span>மேலே உள்ள டொமைனை Copy செய்யவும்.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">2</span>
                <span>கீழேயுள்ள பொத்தானை அழுத்தி Firebase Console Settings திறக்கவும்.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">3</span>
                <span><strong>Authorized domains</strong> பகுதியில் <strong>Add domain</strong> அழுத்தி Paste செய்து Save செய்யவும்.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={settingsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-center"
              >
                <span>Firebase Console Settings திறக்க</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Branding & Hide Firebase Name */}
        {activeTab === 'branding' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
              <p className="font-bold mb-1">Firebase / AI பெயர் வராமல் மாற்றுவது எப்படி?</p>
              <p>
                Google Login திரையில் "Firebase" அல்லது "inlaid-doodad" வராமல், அதிகாரப்பூர்வமாக <strong>Paper Express</strong> என காட்ட
                தளத்தில் Custom Proxy சேர்க்கப்பட்டுவிட்டது. மேலும் Google Cloud Console-ல் App Name-ஐ "Paper Express" என மாற்றவும்.
              </p>
            </div>

            {/* Step A: Firebase Public Name */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-900">1. Firebase Public Name மாற்ற:</h5>
                <a
                  href={`https://console.firebase.google.com/project/${projectId}/settings/general`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 underline"
                >
                  Firebase Settings <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Firebase General Settings பக்கத்தில் <strong>Public-facing name</strong> (பொதுப் பெயர்) பக்கத்தில் உள்ள Edit ஐகானை அழுத்தி <strong>Paper Express</strong> என மாற்றி Save செய்யவும்.
              </p>
            </div>

            {/* Step B: Google Cloud App Name */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-900">2. Google OAuth App Name மாற்ற:</h5>
                <a
                  href={consentScreenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 underline"
                >
                  Consent Screen <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                OAuth Consent Screen பக்கத்தில் <strong>App name</strong> என்ற இடத்தில் <strong>Paper Express</strong> என மாற்றி, கீழே உங்கள் மின்னஞ்சலை Support Email ஆகக் கொடுத்து Save செய்யவும்.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="py-2 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
