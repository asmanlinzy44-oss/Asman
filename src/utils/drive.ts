/**
 * Utility functions for Google Drive links and YouTube links
 */

/**
 * Extract Google Drive file ID from various Drive URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://docs.google.com/document/d/FILE_ID/...
 */
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  
  // Format 1: /file/d/ID/
  const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // Format 2: ?id=ID or &id=ID
  const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Format 3: /d/ID/ (Google Docs/Sheets/Slides)
  const matchDoc = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchDoc && matchDoc[1]) return matchDoc[1];

  // Format 4: /folders/ID (Google Drive folder)
  const matchFolder = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolder && matchFolder[1]) return matchFolder[1];

  return null;
}

/**
 * Get Google Drive direct view/open link for seamless opening in Google Drive app/browser
 */
export function getDriveDirectViewUrl(urlOrId: string): string {
  if (!urlOrId) return '#';
  if (urlOrId.includes('/folders/')) {
    return urlOrId;
  }
  const fileId = extractDriveFileId(urlOrId) || urlOrId;
  if (fileId && fileId.length > 15 && !fileId.startsWith('http')) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  return urlOrId;
}

/**
 * Get Google Drive in-app embedded preview URL
 */
export function getDriveEmbedPreviewUrl(urlOrId: string): string {
  if (!urlOrId) return '';
  if (urlOrId.includes('/folders/')) {
    const folderMatch = urlOrId.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1]) {
      return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#list`;
    }
  }
  const fileId = extractDriveFileId(urlOrId) || urlOrId;
  if (fileId && fileId.length > 15 && !fileId.startsWith('http')) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  if (urlOrId.includes('drive.google.com') && !urlOrId.includes('/preview')) {
    const extracted = extractDriveFileId(urlOrId);
    if (extracted) return `https://drive.google.com/file/d/${extracted}/preview`;
  }
  return urlOrId;
}

/**
 * Get Google Drive direct download link
 */
export function getDriveDirectDownloadUrl(urlOrId: string): string {
  if (!urlOrId) return '#';
  if (urlOrId.includes('/folders/')) {
    return urlOrId;
  }
  const fileId = extractDriveFileId(urlOrId) || urlOrId;
  if (fileId && fileId.length > 15 && !fileId.startsWith('http')) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return getDriveDirectViewUrl(urlOrId);
}

/**
 * Extract YouTube video ID from various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Direct ID
 */
export function extractYoutubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  
  const clean = urlOrId.trim();
  if (clean.length === 11 && !clean.includes('/') && !clean.includes('?')) {
    return clean;
  }

  // youtu.be/ID
  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // watch?v=ID
  const watchMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // embed/ID
  const embedMatch = clean.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  return clean;
}

/**
 * Generate embed URL configured for in-app distraction-free player
 * rel=0 prevents related external videos
 * modestbranding=1 minimizes branding
 * iv_load_policy=3 disables annotations
 */
export function getYoutubeEmbedUrl(
  youtubeId: string, 
  options: { autoplay?: boolean; startSeconds?: number; controls?: number; quality?: string } = {}
): string {
  const cleanId = extractYoutubeId(youtubeId);
  const autoplay = options.autoplay ? 1 : 0;
  const controls = typeof options.controls === 'number' ? options.controls : 0;
  const start = options.startSeconds ? `&start=${Math.floor(options.startSeconds)}` : '';
  const vq = options.quality && options.quality !== 'auto' ? `&vq=${options.quality}` : '';
  const origin = typeof window !== 'undefined' && window.location?.origin 
    ? `&origin=${encodeURIComponent(window.location.origin)}` 
    : '';
  
  return `https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=${autoplay}&rel=0&modestbranding=1&controls=${controls}&playsinline=1&enablejsapi=1&iv_load_policy=3&fs=0${origin}${vq}${start}`;
}
