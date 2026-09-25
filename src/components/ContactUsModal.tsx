import React, { useState } from 'react';
import { X, Send, MessageSquare, CheckCircle, AlertCircle, HelpCircle, Mail, User } from 'lucide-react';
import { UserReport } from '../types';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
}

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export const ContactUsModal: React.FC<ContactUsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [username, setUsername] = useState(currentUser?.name || '');
  const [contactInfo, setContactInfo] = useState(currentUser?.email || '');
  const [category, setCategory] = useState<string>('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your name or username.');
      return;
    }
    if (!message.trim()) {
      setError('Please type your message or report details.');
      return;
    }

    try {
      const newReport: UserReport = {
        id: 'rep_' + Date.now(),
        username: username.trim(),
        contactInfo: contactInfo.trim() || undefined,
        category,
        message: message.trim(),
        createdAt: Date.now(),
        resolved: false,
      };

      // Load existing reports & purge anything older than 3 days
      const raw = localStorage.getItem('studypro_user_reports');
      const existing: UserReport[] = raw ? JSON.parse(raw) : [];
      const valid = existing.filter((r) => Date.now() - r.createdAt < THREE_DAYS_MS);

      const updated = [newReport, ...valid];
      localStorage.setItem('studypro_user_reports', JSON.stringify(updated));

      setIsSubmitted(true);
      setError('');
    } catch (err) {
      console.error('Failed to save report:', err);
      setError('Could not submit message. Please try again.');
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setMessage('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Contact Us & Student Help Desk</h3>
              <p className="text-xs text-blue-100">Send inquiries, report issues, or request materials</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900">Message Sent to Admin!</h4>
              <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                Thank you, <span className="font-bold text-slate-800">{username}</span>. Your message has been safely delivered to the Study Pro administrative desk.
              </p>
              <button
                onClick={handleResetAndClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Close Help Desk
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Name / Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Asman or Student Name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Contact Info (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Email / WhatsApp <span className="text-slate-400 font-normal">(Optional for reply)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="e.g. student@gmail.com or 077xxxxxxx"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message Topic
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer font-medium"
                >
                  <option value="General Inquiry">General Question / Inquiry</option>
                  <option value="Broken Link Report">Report Broken Drive / Video Link</option>
                  <option value="Past Paper Request">Request Missing Past Paper / Marking Scheme</option>
                  <option value="Video Feedback">Video Player Feedback / Suggestions</option>
                  <option value="Curriculum Suggestion">Syllabus & Theory Notes Suggestion</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Message Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Message / Report Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message, question, or broken paper details here..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Admin</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
