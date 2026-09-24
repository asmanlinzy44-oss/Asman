import React, { useState } from 'react';
import { X, Lock, UserCheck, Shield, Zap } from 'lucide-react';
import { User, StreamId } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  initialReason?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  initialReason,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [stream, setStream] = useState<StreamId>('maths');
  const [alYear, setAlYear] = useState<number>(2025);
  const [district, setDistrict] = useState('Jaffna');
  const [school, setSchool] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: 'user_' + Date.now(),
      name: name.trim() || 'A/L Student',
      email: email.trim() || 'student@studypro.lk',
      alYear,
      stream,
      district,
      school: school.trim() || 'Jaffna Hindu College',
      role: 'student',
      bookmarks: [],
      watchedVideoIds: [],
      notes: [],
    };
    onLogin(newUser);
    onClose();
  };

  const handleQuickDemoStudent = () => {
    const demoStudent: User = {
      id: 'demo_student_01',
      name: 'Kajan Ganapathipillai',
      email: 'kajan.student@studypro.lk',
      alYear: 2025,
      stream: 'maths',
      district: 'Jaffna',
      school: 'Hartley College',
      role: 'student',
      bookmarks: ['pp-cm-2023', 'fwc-phy-2024'],
      watchedVideoIds: ['vid-cm-01'],
      notes: [
        {
          id: 'note_1',
          videoId: 'vid-cm-01',
          timestampSeconds: 525,
          timestampFormatted: '08:45',
          text: 'ILATE integration rule: logarithmic functions take precedence over exponential functions.',
          createdAt: '2024-09-10',
        },
      ],
    };
    onLogin(demoStudent);
    onClose();
  };

  const handleQuickTeacherAdmin = () => {
    const demoAdmin: User = {
      id: 'admin_teacher_01',
      name: 'Mr. K. Sivanesan (A/L Instructor)',
      email: 'teacher.sivanesan@studypro.lk',
      alYear: 2024,
      stream: 'maths',
      district: 'Colombo',
      school: 'National Resource Panel',
      role: 'admin',
      bookmarks: [],
      watchedVideoIds: [],
      notes: [],
    };
    onLogin(demoAdmin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        {/* Modal Top Header */}
        <div className="px-6 pt-6 pb-4 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-sky-400">
              <Lock className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Student Access
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Study Pro Member Portal
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {initialReason ||
                'Sign in to watch theory video lectures directly in our distraction-free player and save your study bookmarks.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick 1-Click Access Box */}
        <div className="px-6 pt-4 pb-3 bg-blue-50/50 border-b border-blue-100">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="font-bold flex items-center gap-1 text-slate-800">
              <Zap className="w-3.5 h-3.5 fill-[#0066FF] text-[#0066FF]" />
              Instant 1-Click Access:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleQuickDemoStudent}
              className="px-3 py-2 text-xs font-bold text-[#0066FF] bg-blue-100/70 hover:bg-blue-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Demo Student</span>
            </button>
            <button
              onClick={handleQuickTeacherAdmin}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Teacher / Admin</span>
            </button>
          </div>
        </div>

        {/* Form Mode Toggle */}
        <div className="px-6 pt-4 flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`pb-2.5 text-xs font-bold mr-6 transition-colors cursor-pointer border-b-2 ${
              mode === 'login'
                ? 'border-[#0066FF] text-[#0066FF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`pb-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
              mode === 'register'
                ? 'border-[#0066FF] text-[#0066FF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. S. Praveen"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0066FF] text-xs"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@studypro.lk"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0066FF] text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                A/L Stream
              </label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value as StreamId)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0066FF] text-xs bg-white"
              >
                <option value="maths">Physical Science (Maths)</option>
                <option value="bio">Biological Science (Bio)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Exam Year
              </label>
              <select
                value={alYear}
                onChange={(e) => setAlYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0066FF] text-xs bg-white"
              >
                <option value={2025}>2025 A/L</option>
                <option value={2026}>2026 A/L</option>
                <option value={2027}>2027 A/L</option>
                <option value={2024}>2024 Revision</option>
              </select>
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0066FF] text-xs bg-white"
                >
                  <option value="Jaffna">Jaffna</option>
                  <option value="Batticaloa">Batticaloa</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Trincomalee">Trincomalee</option>
                  <option value="Vavuniya">Vavuniya</option>
                  <option value="Kilinochchi">Kilinochchi</option>
                  <option value="Mannar">Mannar</option>
                  <option value="Mullaitivu">Mullaitivu</option>
                  <option value="Badulla">Badulla</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Hindu College"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0066FF] text-xs"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#0066FF] hover:bg-blue-600 rounded-xl transition-all cursor-pointer shadow-md"
            >
              {mode === 'login' ? 'Continue to Study Pro' : 'Create Student Profile'}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Dedicated Academic Portal for Sri Lankan G.C.E. Advanced Level Students.
          </p>
        </form>
      </div>
    </div>
  );
};
