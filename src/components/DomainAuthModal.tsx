import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, Copy, Check, X, Globe, Sparkles, CheckCircle2, UserPlus, Rocket } from 'lucide-react';

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
  const [copiedVercelApp, setCopiedVercelApp] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [activeTab, setActiveTab] = useState<'blocked' | 'domain' | 'branding'>('blocked');

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'paperexpress.vercel.app';
  const settingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;
  const consentScreenUrl = `https://console.cloud.google.com/apis/credentials/consent?project=${projectId}`;

  if (!isOpen) return null;

  const handleCopyVercelApp = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText('vercel.app');
      setCopiedVercelApp(true);
      setTimeout(() => setCopiedVercelApp(false), 2500);
    }
  };

  const handleCopyDomain = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 google-anno-skip">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col google-anno-skip">
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
              <h3 className="text-base font-bold">Google Login & Vercel Fix</h3>
              <p className="text-xs text-blue-100 font-medium">Solve Error 403 & Domain Authorization in 1 Minute</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-4 pt-2 border-t border-white/20 overflow-x-auto">
            <button
              onClick={() => setActiveTab('blocked')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'blocked'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              1. Fix Error 403 (Access Blocked)
            </button>
            <button
              onClick={() => setActiveTab('domain')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'domain'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              2. Vercel Domain (vercel.app)
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'branding'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              3. App Branding
            </button>
          </div>
        </div>

        {/* Tab 1: Fix Error 403: Access Blocked (Verification Process) */}
        {activeTab === 'blocked' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            {/* Visual Callout of exact error */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ஏன் இந்த "Access blocked / Error 403" வருகிறது?</span>
              </div>
              <p>
                Google Cloud-ல் உங்கள் செயலானது <strong>"Testing"</strong> முறையில் உள்ளது. Testing நிலையில் இருக்கும்போது, Developer அனுமதித்த நபர்கள் (Test users) தவிர வேறு யாருக்கும் Google உள்நுழைய அனுமதி தராது.
              </p>
            </div>

            {/* Permanent Fix Option 1 */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <Rocket className="w-4 h-4 text-blue-600 shrink-0" />
                <span>நிரந்தர தீர்வு: "PUBLISH APP" செய்து அனைவருக்கும் Login திறக்க (பரிந்துரைக்கப்படுகிறது)</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                நாம் மாணவர் Login-ல் அடிப்படை பெயர் & மின்னஞ்சல் மட்டுமே கேட்கிறோம் (எந்த sensitive அனுமதியும் இல்லை). எனவே <strong>Google Verification தேவையின்றி உடனே Publish செய்யலாம்</strong>.
              </p>
              <ol className="space-y-1.5 text-slate-800 text-[11px] list-decimal list-inside font-medium bg-white p-3 rounded-xl border border-blue-100">
                <li>கீழேயுள்ள நீல நிற <strong>"Open Google Consent Screen"</strong> பொத்தானை அழுத்தவும்.</li>
                <li><strong>Publishing status</strong> கீழ் உள்ள <strong>"PUBLISH APP"</strong> பொத்தானை அழுத்தவும்.</li>
                <li>தோன்றும் திரையில் <strong>"Confirm"</strong> என்பதை அழுத்தவும்.</li>
              </ol>
              <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>இனி எந்த மாணவரும் (எ.கா: abithaff2121@gmail.com) பிழையின்றி தடையின்றி Login செய்யலாம்!</span>
              </p>
            </div>

            {/* Alternative Option 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <UserPlus className="w-4 h-4 text-slate-600 shrink-0" />
                <span>மாற்று வழி: Testing நிலையிலேயே குறிப்பிட்ட மாணவர்களை அனுமதிக்க:</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                அதே Google Consent Screen பக்கத்தில் கீழே உள்ள <strong>Test users</strong> பகுதிக்குச் சென்று <strong>+ ADD USERS</strong> அழுத்தி மாணவர்களின் ஜிமெயில் முகவரியைச் சேர்த்து Save செய்யவும்.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={consentScreenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-center"
              >
                <span>Google OAuth Consent Screen திறக்க (Publish App)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Fix Unauthorized Domain */}
        {activeTab === 'domain' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1.5">
              <p className="font-bold">Vercel Authorized Domain பிழை (auth/unauthorized-domain) தீர்வு:</p>
              <p>
                Vercel-ல் ஒவ்வொரு முறையும் புதிய preview URL உருவாகலாம். ஒவ்வொன்றாக சேர்ப்பதை விட, Firebase Console-ல் <strong>vercel.app</strong> என்று சேர்த்தால் அனைத்து Vercel முகவரிகளிலும் Login இயங்கும்!
              </p>
            </div>

            {/* Quick Copy 1: vercel.app (Wildcard) */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>1. அனைத்து Vercel டொமைன்களையும் அனுமதிக்க (பரிந்துரைக்கப்படுகிறது):</span>
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-300">
                <code className="text-xs font-mono font-bold text-blue-700 flex-1 truncate px-2">
                  vercel.app
                </code>
                <button
                  onClick={handleCopyVercelApp}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  {copiedVercelApp ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied vercel.app!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy vercel.app</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Copy 2: current domain */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-600" />
                <span>2. தற்போதைய குறிப்பிட்ட டொமைன்:</span>
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-300">
                <code className="text-xs font-mono font-bold text-slate-800 flex-1 truncate px-2">
                  {currentDomain}
                </code>
                <button
                  onClick={handleCopyDomain}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Domain</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Firebase-ல் சேர்க்கும் 3 படிகள்:</h4>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</span>
                <span>மேலே உள்ள <strong>"Copy vercel.app"</strong> பொத்தானை அழுத்தவும்.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">2</span>
                <span>கீழேயுள்ள பொத்தானை அழுத்தி <strong>Firebase Console Settings</strong> திறக்கவும்.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">3</span>
                <span><strong>Authorized domains</strong> கீழ் <strong>Add domain</strong> அழுத்தி <strong>vercel.app</strong>-ஐ Paste செய்து Save செய்யவும்.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={settingsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-center"
              >
                <span>Firebase Console Settings திறக்க</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Custom Branding & Hide Firebase Name */}
        {activeTab === 'branding' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
              <p className="font-bold mb-1">Google Login திரையில் "Paper Express" என காட்டுவது எப்படி?</p>
              <p>
                Google Login திரையில் "inlaid-doodad" வராமல், அதிகாரப்பூர்வமாக <strong>Paper Express</strong> என காட்ட
                தளத்தில் Custom Vercel Proxy சேர்க்கப்பட்டுவிட்டது. மேலும் Google Cloud Console-ல் App Name-ஐ "Paper Express" என மாற்றவும்.
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
                className="py-2.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
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
