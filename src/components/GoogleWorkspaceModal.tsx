import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, HardDrive, CheckSquare, Calendar, Mail, RefreshCw, Plus, Trash2, 
  ExternalLink, Search, Clock, AlertTriangle, FileText, Folder, CheckCircle, 
  Send, Sparkles, UserCheck, ShieldCheck, Lock
} from 'lucide-react';
import { 
  getCachedAccessToken, 
  signInWithGoogleWorkspace 
} from '../firebase';
import { 
  listDriveFiles, 
  createDriveFile, 
  deleteDriveFile, 
  DriveFileItem,
  listTasks, 
  createTask, 
  updateTaskStatus, 
  deleteTask, 
  GoogleTaskItem,
  listCalendarEvents, 
  createCalendarEvent, 
  deleteCalendarEvent, 
  GoogleCalendarEvent,
  listGmailMessages, 
  sendGmailMessage, 
  GmailMessageSummary 
} from '../services/workspaceService';
import { playRoboticClick, playRoboticTab } from '../utils/audio';

type ActiveTab = 'drive' | 'tasks' | 'calendar' | 'gmail';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: ActiveTab;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'drive',
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(defaultTab);
  const [hasToken, setHasToken] = useState<boolean>(() => !!getCachedAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveSearch, setDriveSearch] = useState('');
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Tasks state
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');

  // Calendar state
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('10:30');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Gmail state
  const [emails, setEmails] = useState<GmailMessageSummary[]>([]);
  const [emailSearch, setEmailSearch] = useState('');
  const [isGmailLoading, setIsGmailLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Explicit confirmation dialog for destructive actions
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    isDangerous?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: async () => {},
  });

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Check token on mount/open
  useEffect(() => {
    if (isOpen) {
      const token = getCachedAccessToken();
      setHasToken(!!token);
    }
  }, [isOpen]);

  // Handle Google Workspace Sign In
  const handleConnectWorkspace = async () => {
    playRoboticClick();
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await signInWithGoogleWorkspace();
      if (result.accessToken) {
        setHasToken(true);
        showNotification('Successfully connected to Google Workspace!');
      } else {
        setAuthError('OAuth token was not returned. Please try signing in again.');
      }
    } catch (err: any) {
      console.error('Workspace OAuth error:', err);
      setAuthError(err.message || 'Failed to authenticate with Google Workspace');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Fetch Drive Files
  const fetchDrive = useCallback(async () => {
    if (!getCachedAccessToken()) return;
    setIsDriveLoading(true);
    try {
      const files = await listDriveFiles(driveSearch);
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Drive fetch error:', err);
      if (err.message?.includes('sign in') || err.message?.includes('401')) {
        setHasToken(false);
      }
    } finally {
      setIsDriveLoading(false);
    }
  }, [driveSearch]);

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    if (!getCachedAccessToken()) return;
    setIsTasksLoading(true);
    try {
      const items = await listTasks();
      setTasks(items);
    } catch (err: any) {
      console.warn('Tasks fetch error:', err);
      if (err.message?.includes('sign in') || err.message?.includes('401')) {
        setHasToken(false);
      }
    } finally {
      setIsTasksLoading(false);
    }
  }, []);

  // Fetch Calendar
  const fetchCalendar = useCallback(async () => {
    if (!getCachedAccessToken()) return;
    setIsCalendarLoading(true);
    try {
      const items = await listCalendarEvents();
      setEvents(items);
    } catch (err: any) {
      console.warn('Calendar fetch error:', err);
      if (err.message?.includes('sign in') || err.message?.includes('401')) {
        setHasToken(false);
      }
    } finally {
      setIsCalendarLoading(false);
    }
  }, []);

  // Fetch Gmail
  const fetchGmail = useCallback(async () => {
    if (!getCachedAccessToken()) return;
    setIsGmailLoading(true);
    try {
      const messages = await listGmailMessages(emailSearch);
      setEmails(messages);
    } catch (err: any) {
      console.warn('Gmail fetch error:', err);
      if (err.message?.includes('sign in') || err.message?.includes('401')) {
        setHasToken(false);
      }
    } finally {
      setIsGmailLoading(false);
    }
  }, [emailSearch]);

  // Reload current tab data
  useEffect(() => {
    if (!isOpen || !hasToken) return;
    if (activeTab === 'drive') fetchDrive();
    if (activeTab === 'tasks') fetchTasks();
    if (activeTab === 'calendar') fetchCalendar();
    if (activeTab === 'gmail') fetchGmail();
  }, [isOpen, hasToken, activeTab, fetchDrive, fetchTasks, fetchCalendar, fetchGmail]);

  if (!isOpen) return null;

  // ---------------- DRIVE ACTIONS ----------------
  const handleSaveDriveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    try {
      await createDriveFile(
        newNoteTitle.endsWith('.txt') ? newNoteTitle : `${newNoteTitle}.txt`,
        newNoteContent,
        'text/plain'
      );
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowCreateNote(false);
      showNotification('Note saved successfully to Google Drive!');
      fetchDrive();
    } catch (err: any) {
      alert('Error saving note: ' + err.message);
    }
  };

  const promptDeleteDriveFile = (file: DriveFileItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Google Drive File',
      message: `Are you sure you want to permanently delete "${file.name}" from your Google Drive? This action cannot be undone.`,
      confirmText: 'Delete File',
      isDangerous: true,
      onConfirm: async () => {
        await deleteDriveFile(file.id);
        showNotification(`File "${file.name}" deleted from Drive.`);
        fetchDrive();
      },
    });
  };

  // ---------------- TASKS ACTIONS ----------------
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await createTask('@default', {
        title: newTaskTitle.trim(),
        notes: newTaskNotes.trim() || undefined,
        due: newTaskDue ? new Date(newTaskDue).toISOString() : undefined,
      });
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDue('');
      setShowCreateTask(false);
      showNotification('Task created in Google Tasks!');
      fetchTasks();
    } catch (err: any) {
      alert('Error creating task: ' + err.message);
    }
  };

  const handleToggleTask = async (task: GoogleTaskItem) => {
    const isCompleted = task.status === 'completed';
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: isCompleted ? 'needsAction' : 'completed' } : t))
      );
      await updateTaskStatus('@default', task.id, !isCompleted);
      fetchTasks();
    } catch (err: any) {
      alert('Failed to update task: ' + err.message);
      fetchTasks();
    }
  };

  const promptDeleteTask = (task: GoogleTaskItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Google Task',
      message: `Are you sure you want to delete task "${task.title}"? This action cannot be undone.`,
      confirmText: 'Delete Task',
      isDangerous: true,
      onConfirm: async () => {
        await deleteTask('@default', task.id);
        showNotification('Task deleted from Google Tasks.');
        fetchTasks();
      },
    });
  };

  // ---------------- CALENDAR ACTIONS ----------------
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;
    try {
      const startDateTime = new Date(`${newEventDate}T${newEventStartTime}:00`).toISOString();
      const endDateTime = new Date(`${newEventDate}T${newEventEndTime}:00`).toISOString();

      await createCalendarEvent({
        summary: newEventTitle.trim(),
        description: newEventDesc.trim() || undefined,
        startDateTime,
        endDateTime,
      });

      setNewEventTitle('');
      setNewEventDesc('');
      setShowCreateEvent(false);
      showNotification('Study event added to your Google Calendar!');
      fetchCalendar();
    } catch (err: any) {
      alert('Failed to schedule event: ' + err.message);
    }
  };

  const promptDeleteEvent = (event: GoogleCalendarEvent) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Calendar Event',
      message: `Are you sure you want to delete event "${event.summary}" from your Google Calendar?`,
      confirmText: 'Delete Event',
      isDangerous: true,
      onConfirm: async () => {
        await deleteCalendarEvent(event.id);
        showNotification('Calendar event deleted.');
        fetchCalendar();
      },
    });
  };

  // ---------------- GMAIL ACTIONS ----------------
  const promptSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;

    // MANDATORY USER CONFIRMATION BEFORE SENDING EMAIL
    setConfirmDialog({
      isOpen: true,
      title: 'Send Email via Gmail',
      message: `Are you sure you want to send this email?\n\nTo: ${composeTo}\nSubject: ${composeSubject}\n\nThis will send a real email directly through your Gmail account.`,
      confirmText: 'Send Email Now',
      isDangerous: false,
      onConfirm: async () => {
        await sendGmailMessage(composeTo.trim(), composeSubject.trim(), composeBody);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setShowCompose(false);
        showNotification('Email sent successfully via Gmail!');
        fetchGmail();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[820px] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Google Workspace Hub
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Drive · Tasks · Calendar · Gmail
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct integration with your real Google account for study documents, deadlines & communications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Action Notice */}
        {actionNotice && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
          <button
            type="button"
            onClick={() => { playRoboticTab(); setActiveTab('drive'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'drive'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Google Drive</span>
          </button>

          <button
            type="button"
            onClick={() => { playRoboticTab(); setActiveTab('tasks'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Google Tasks</span>
          </button>

          <button
            type="button"
            onClick={() => { playRoboticTab(); setActiveTab('calendar'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Google Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => { playRoboticTab(); setActiveTab('gmail'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'gmail'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Gmail</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/30">
          {!hasToken ? (
            /* Sign in required banner */
            <div className="max-w-md mx-auto my-12 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Authorize Google Workspace Access
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  To view and organize your Drive files, study tasks, exam countdown calendars, and Gmail notifications, sign in with your Google account.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-500">
                  {authError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConnectWorkspace}
                  disabled={isAuthenticating}
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isAuthenticating ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* =========================================================================
                 1. GOOGLE DRIVE TAB
                 ========================================================================= */}
              {activeTab === 'drive' && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={driveSearch}
                        onChange={(e) => setDriveSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchDrive()}
                        placeholder="Search files in Google Drive..."
                        className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fetchDrive}
                        disabled={isDriveLoading}
                        className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Refresh Drive files"
                      >
                        <RefreshCw className={`w-4 h-4 ${isDriveLoading ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCreateNote(!showCreateNote)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Save Note to Drive</span>
                      </button>
                    </div>
                  </div>

                  {/* Create Note Drawer */}
                  {showCreateNote && (
                    <form onSubmit={handleSaveDriveNote} className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-blue-500/30 space-y-3 animate-fadeIn">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">
                        Create Study Note File on Google Drive
                      </h4>
                      <input
                        type="text"
                        required
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        placeholder="File Name (e.g. Physics-Mechanics-Formulas.txt)"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                      />
                      <textarea
                        required
                        rows={3}
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Write your study notes, revision tips, or lecture highlights..."
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCreateNote(false)}
                          className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-sm"
                        >
                          Upload to Drive
                        </button>
                      </div>
                    </form>
                  )}

                  {/* File List */}
                  {isDriveLoading ? (
                    <div className="p-12 text-center text-slate-400 text-xs">Loading files from Google Drive...</div>
                  ) : driveFiles.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <HardDrive className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Google Drive files found</p>
                      <p className="text-[11px] text-slate-400">Click "Save Note to Drive" to create your first file directly from Paper Express.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {driveFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/40 transition-all flex items-start justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                              {file.mimeType.includes('folder') ? <Folder className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {file.name}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {file.modifiedTime ? `Modified ${new Date(file.modifiedTime).toLocaleDateString()}` : 'Google Drive Document'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => promptDeleteDriveFile(file)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                              title="Delete from Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                 2. GOOGLE TASKS TAB
                 ========================================================================= */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Study To-Do & Exam Tasks
                      </h4>
                      <p className="text-xs text-slate-400">
                        Synchronized with your official Google Tasks list
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fetchTasks}
                        disabled={isTasksLoading}
                        className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <RefreshCw className={`w-4 h-4 ${isTasksLoading ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCreateTask(!showCreateTask)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>

                  {/* Create Task Form */}
                  {showCreateTask && (
                    <form onSubmit={handleCreateTask} className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-blue-500/30 space-y-3 animate-fadeIn">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">
                        New Google Task
                      </h4>
                      <input
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Task Title (e.g. Finish Chemistry 2023 Past Paper Revision)"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                      />
                      <input
                        type="text"
                        value={newTaskNotes}
                        onChange={(e) => setNewTaskNotes(e.target.value)}
                        placeholder="Notes or Chapter details (optional)"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                      />
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-slate-400">Due Date:</label>
                        <input
                          type="date"
                          value={newTaskDue}
                          onChange={(e) => setNewTaskDue(e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowCreateTask(false)}
                          className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-sm"
                        >
                          Create Task
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Tasks List */}
                  {isTasksLoading ? (
                    <div className="p-12 text-center text-slate-400 text-xs">Loading tasks...</div>
                  ) : tasks.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <CheckSquare className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">All tasks completed!</p>
                      <p className="text-[11px] text-slate-400">Create a task to track your A/L syllabus revision and homework deadlines.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => {
                        const isCompleted = task.status === 'completed';
                        return (
                          <div
                            key={task.id}
                            className={`p-3.5 bg-white dark:bg-slate-900 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-xs ${
                              isCompleted
                                ? 'border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10'
                                : 'border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleTask(task)}
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                                  isCompleted
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
                                }`}
                              >
                                {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                              </button>
                              <div className="min-w-0">
                                <span className={`text-xs sm:text-sm font-semibold block truncate ${
                                  isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                                }`}>
                                  {task.title}
                                </span>
                                {task.notes && (
                                  <p className="text-[11px] text-slate-400 truncate">{task.notes}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {task.due && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(task.due).toLocaleDateString()}</span>
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => promptDeleteTask(task)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                 3. GOOGLE CALENDAR TAB
                 ========================================================================= */}
              {activeTab === 'calendar' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Upcoming Study Sessions & Exam Dates
                      </h4>
                      <p className="text-xs text-slate-400">
                        Synchronized with your primary Google Calendar
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fetchCalendar}
                        disabled={isCalendarLoading}
                        className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <RefreshCw className={`w-4 h-4 ${isCalendarLoading ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCreateEvent(!showCreateEvent)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Schedule Study Session</span>
                      </button>
                    </div>
                  </div>

                  {/* Schedule Event Form */}
                  {showCreateEvent && (
                    <form onSubmit={handleCreateEvent} className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-blue-500/30 space-y-3 animate-fadeIn">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">
                        Schedule Google Calendar Event
                      </h4>
                      <input
                        type="text"
                        required
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="Session Title (e.g. Physics Unit 2 Hydrodynamics Masterclass)"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Date:</label>
                          <input
                            type="date"
                            required
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Start Time:</label>
                          <input
                            type="time"
                            required
                            value={newEventStartTime}
                            onChange={(e) => setNewEventStartTime(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">End Time:</label>
                          <input
                            type="time"
                            required
                            value={newEventEndTime}
                            onChange={(e) => setNewEventEndTime(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={newEventDesc}
                        onChange={(e) => setNewEventDesc(e.target.value)}
                        placeholder="Description / Google Meet link / Syllabus topics"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowCreateEvent(false)}
                          className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-sm"
                        >
                          Add to Calendar
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Calendar Events List */}
                  {isCalendarLoading ? (
                    <div className="p-12 text-center text-slate-400 text-xs">Loading calendar events...</div>
                  ) : events.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No upcoming events scheduled</p>
                      <p className="text-[11px] text-slate-400">Click "Schedule Study Session" to plan your upcoming lectures and past paper mock tests.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {events.map((ev) => {
                        const start = ev.start?.dateTime || ev.start?.date;
                        return (
                          <div
                            key={ev.id}
                            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/40 transition-all flex items-start justify-between gap-3 shadow-xs"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {ev.summary}
                                </h5>
                                {start && (
                                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                  </p>
                                )}
                                {ev.description && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                    {ev.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {ev.htmlLink && (
                                <a
                                  href={ev.htmlLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="View on Google Calendar"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => promptDeleteEvent(ev)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                                title="Delete event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                 4. GMAIL TAB
                 ========================================================================= */}
              {activeTab === 'gmail' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={emailSearch}
                        onChange={(e) => setEmailSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchGmail()}
                        placeholder="Search emails in Gmail..."
                        className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fetchGmail}
                        disabled={isGmailLoading}
                        className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Refresh Gmail"
                      >
                        <RefreshCw className={`w-4 h-4 ${isGmailLoading ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCompose(!showCompose)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
                      >
                        <Send className="w-4 h-4" />
                        <span>Compose Email</span>
                      </button>
                    </div>
                  </div>

                  {/* Compose Drawer */}
                  {showCompose && (
                    <form onSubmit={promptSendEmail} className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-blue-500/30 space-y-3 animate-fadeIn">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">
                        Compose Email (Gmail)
                      </h4>
                      <input
                        type="email"
                        required
                        value={composeTo}
                        onChange={(e) => setComposeTo(e.target.value)}
                        placeholder="Recipient Email (e.g. teacher@school.lk or student@gmail.com)"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                      />
                      <input
                        type="text"
                        required
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        placeholder="Subject (e.g. Paper Express Physics Doubt Clarification)"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                      />
                      <textarea
                        required
                        rows={4}
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        placeholder="Write your email message..."
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCompose(false)}
                          className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-sm flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Review & Send</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Gmail Inbox List */}
                  {isGmailLoading ? (
                    <div className="p-12 text-center text-slate-400 text-xs">Loading emails from Gmail...</div>
                  ) : emails.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <Mail className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No emails found</p>
                      <p className="text-[11px] text-slate-400">Your recent Gmail messages and study correspondences will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {emails.map((msg) => (
                        <div
                          key={msg.id}
                          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all space-y-1 shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate max-w-[60%]">
                              {msg.from}
                            </span>
                            {msg.date && (
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(msg.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {msg.subject}
                          </h5>
                          {msg.snippet && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {msg.snippet}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>OAuth 2.0 Connected via Google Workspace Platform</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Close
          </button>
        </div>
      </div>

      {/* Explicit Confirmation Dialog (Mandatory for destructive/send actions) */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                confirmDialog.isDangerous
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-500'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-500'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {confirmDialog.title}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {confirmDialog.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await confirmDialog.onConfirm();
                  } catch (err: any) {
                    alert('Action failed: ' + err.message);
                  } finally {
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                  }
                }}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                  confirmDialog.isDangerous
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
