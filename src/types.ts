export type StreamId = 'maths' | 'bio' | 'all';

export type ResourceCategory = 
  | 'past-papers' 
  | 'fwc-papers' 
  | 'term-papers' 
  | 'theory-notes' 
  | 'pilot-papers' 
  | 'useful-resources' 
  | 'theory-videos'
  | 'ai-search';

export interface SubjectItem {
  id: string;
  nameEn: string;
  nameTa?: string;
  stream: StreamId;
  iconName: string;
}

export interface PaperResource {
  id: string;
  titleEn: string;
  titleTa?: string;
  category: ResourceCategory;
  stream: StreamId;
  subjectId: string;
  subjectNameEn: string;
  subjectNameTa?: string;
  year: number;
  term?: '1st Term' | '2nd Term' | '3rd Term' | '4th Term' | '5th Term' | '6th Term' | 'Trial / Final' | 'All Island' | string;
  pilotType?: string;
  schoolOrSource: string;
  schoolOrSourceTa?: string;
  districtOrProvince?: string;
  driveLink: string;
  markingSchemeDriveLink?: string;
  fileSize?: string;
  isPopular?: boolean;
  downloadsCount: number;
  unitOrTopic?: string;
}

export interface VideoChapter {
  time: string;
  seconds: number;
  title: string;
  titleTa?: string;
}

export interface VideoLesson {
  id: string;
  titleEn: string;
  titleTa?: string;
  stream: StreamId;
  subjectId: string;
  subjectNameEn: string;
  subjectNameTa?: string;
  unitNumber: number;
  unitNameEn: string;
  unitNameTa?: string;
  youtubeUrl: string;
  youtubeId: string;
  durationMinutes: number;
  durationSeconds?: number;
  teacherName: string;
  teacherTitleTa?: string;
  descriptionEn: string;
  descriptionTa?: string;
  handoutDriveLink?: string;
  handouts?: Array<{
    id: string;
    title: string;
    url: string;
  }>;
  isUnlisted: boolean;
  chapters: VideoChapter[];
  viewsCount: number;
  uploadedAt: string;
  folderId?: string;
  folderName?: string;
  order?: number;
  streamType?: 'youtube' | 'direct';
  directStreamUrl?: string;
  hideThumbnail?: boolean;
  customThumbnailUrl?: string;
}

export interface VideoFolder {
  id: string;
  name: string;
  nameTa?: string;
  description?: string;
  stream?: StreamId | 'all';
  subjectName?: string;
  parentId?: string | null; // Id of parent folder if this is a subfolder. If null or undefined, this is a root subject/folder.
  color?: string; // 'rose' | 'blue' | 'emerald' | 'amber' | 'purple' | 'cyan'
  createdAt: string;
  isLocked?: boolean;
  accessPasscode?: string;
  allowedEmails?: string[];
  order?: number;
  icon?: string;
  notesDriveLink?: string;
  handouts?: Array<{
    id: string;
    title: string;
    url: string;
  }>;
}

export interface UserNote {
  id: string;
  videoId: string;
  timestampSeconds: number;
  timestampFormatted: string;
  text: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  alYear: number;
  stream: StreamId;
  district: string;
  school: string;
  role: 'student' | 'teacher' | 'admin';
  bookmarks: string[];
  watchedVideoIds: string[];
  unlockedVideoFolderIds?: string[];
  notes: UserNote[];
  xp?: number;
  level?: number;
  streakDays?: number;
  completedQuests?: string[];
}

declare global {
  interface Window {
    google?: any;
  }
}

export interface QuestQuestion {
  id: string;
  stream: StreamId;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

export interface UserReport {
  id: string;
  username: string;
  contactInfo?: string;
  category: string;
  message: string;
  createdAt: number;
  resolved?: boolean;
}

export type VideoAccessScope = 'all' | 'custom';

export interface PaidStudentAccess {
  email: string;
  studentName?: string;
  grantedAt: string;
  grantedBy?: string;
  note?: string;
  // Granular part-by-part video access
  accessScope?: VideoAccessScope; // 'all' (default) or 'custom'
  allowedFolderIds?: string[]; // Specific folder IDs and/or subfolder IDs e.g. ['vf-biology', 'vf-phy-hydro']
  allowedSubjectIds?: string[]; // e.g. ['physics'] or ['chemistry']
  allowedVideoIds?: string[]; // specific video IDs e.g. ['vid-phy-hydro-class1']
  allowedUnits?: number[]; // e.g. [2] for Hydrodynamics, [6] for IUPAC
  accessLabel?: string; // e.g. 'All Videos', 'Physics Hydrodynamics Only', 'Chemistry IUPAC Only'
  expiresAt?: string; // ISO date string e.g. "2026-11-18T10:00:00.000Z" (null or undefined = lifetime)
  durationPreset?: string; // '7days' | '30days' | '90days' | '180days' | '365days' | 'lifetime' | 'custom'
}

export interface VideoAccessRequest {
  id: string;
  userEmail: string;
  userName: string;
  userPhoto?: string;
  folderId?: string;
  folderName?: string;
  videoId?: string;
  videoTitle?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  expiresAt?: string;
  durationPreset?: string;
  allowedFolderIds?: string[]; // Specific folder IDs granted for this request
}

