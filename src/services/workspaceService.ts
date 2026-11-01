import { getCachedAccessToken } from '../firebase';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
  location?: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

// Helper to get bearer headers
const getAuthHeaders = (): HeadersInit => {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Please sign in with your Google account to access Google Workspace services.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/* =========================================================================
   1. GOOGLE DRIVE API
   ========================================================================= */

export async function listDriveFiles(searchQuery?: string): Promise<DriveFileItem[]> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Authentication required for Google Drive');

  let url = 'https://www.googleapis.com/drive/v3/files?pageSize=25&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)&orderBy=modifiedTime desc';
  if (searchQuery && searchQuery.trim()) {
    const cleanQ = searchQuery.trim().replace(/'/g, "\\'");
    url += `&q=name contains '${cleanQ}' and trashed = false`;
  } else {
    url += '&q=trashed = false';
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Drive error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

export async function createDriveFile(name: string, content: string, mimeType = 'text/plain'): Promise<DriveFileItem> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Authentication required for Google Drive');

  const metadata = {
    name,
    mimeType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create file on Google Drive: ${res.statusText}`);
  }

  return await res.json();
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Authentication required for Google Drive');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete file from Google Drive: ${res.statusText}`);
  }
}

/* =========================================================================
   2. GOOGLE TASKS API
   ========================================================================= */

export async function getTaskLists(): Promise<GoogleTaskList[]> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Authentication required for Google Tasks');

  const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Tasks error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function listTasks(taskListId = '@default'): Promise<GoogleTaskItem[]> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Authentication required for Google Tasks');

  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&showHidden=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch tasks: ${res.statusText}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function createTask(taskListId = '@default', task: { title: string; notes?: string; due?: string }): Promise<GoogleTaskItem> {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create task: ${res.statusText}`);
  }

  return await res.json();
}

export async function updateTaskStatus(taskListId = '@default', taskId: string, completed: boolean): Promise<GoogleTaskItem> {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status: completed ? 'completed' : 'needsAction',
      completed: completed ? new Date().toISOString() : null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to update task status: ${res.statusText}`);
  }

  return await res.json();
}

export async function deleteTask(taskListId = '@default', taskId: string): Promise<void> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Authentication required for Google Tasks');

  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete task: ${res.statusText}`);
  }
}

/* =========================================================================
   3. GOOGLE CALENDAR API
   ========================================================================= */

export async function listCalendarEvents(): Promise<GoogleCalendarEvent[]> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Authentication required for Google Calendar');

  const now = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // From yesterday onwards
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(now)}&maxResults=25&singleEvents=true&orderBy=startTime`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Calendar error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function createCalendarEvent(event: {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
}): Promise<GoogleCalendarEvent> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.startDateTime },
      end: { dateTime: event.endDateTime },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create calendar event: ${res.statusText}`);
  }

  return await res.json();
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Authentication required for Google Calendar');

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete calendar event: ${res.statusText}`);
  }
}

/* =========================================================================
   4. GMAIL API
   ========================================================================= */

export async function listGmailMessages(searchQuery = ''): Promise<GmailMessageSummary[]> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Authentication required for Gmail');

  let url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15';
  if (searchQuery.trim()) {
    url += `&q=${encodeURIComponent(searchQuery.trim())}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail error: ${res.statusText}`);
  }

  const data = await res.json();
  const rawList: { id: string; threadId: string }[] = data.messages || [];

  if (rawList.length === 0) return [];

  // Fetch headers for each message (parallel with limit)
  const summaries: GmailMessageSummary[] = await Promise.all(
    rawList.slice(0, 12).map(async (item) => {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!msgRes.ok) return { id: item.id, threadId: item.threadId };
        const msgData = await msgRes.json();
        const headers: { name: string; value: string }[] = msgData.payload?.headers || [];
        const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'Unknown sender';
        const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';
        return {
          id: item.id,
          threadId: item.threadId,
          snippet: msgData.snippet,
          subject,
          from,
          date,
        };
      } catch {
        return { id: item.id, threadId: item.threadId };
      }
    })
  );

  return summaries;
}

export async function sendGmailMessage(to: string, subject: string, body: string): Promise<{ id: string }> {
  const token = getCachedAccessToken();
  if (!token) throw new Error('Authentication required for Gmail');

  // Construct RFC 2822 email format
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    body,
  ];
  const email = emailLines.join('\r\n');

  // Base64URL encode
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64EncodedEmail }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send email: ${res.statusText}`);
  }

  return await res.json();
}
