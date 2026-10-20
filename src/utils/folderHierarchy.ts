import { VideoFolder, VideoLesson } from '../types';

/**
 * 4 Primary Root Subject Folder IDs
 */
export const PRIMARY_ROOT_SUBJECT_IDS = [
  'vf-biology',
  'vf-physics',
  'vf-chemistry',
  'vf-combined-maths',
] as const;

/**
 * Checks if a folder is considered a root (top-level) subject/folder.
 */
export function isRootFolder(folder: VideoFolder): boolean {
  return !folder.parentId || folder.parentId === 'none' || folder.parentId === '';
}

/**
 * Returns root folders, prioritizing the 4 primary subjects:
 * Biology, Physics, Chemistry, Combined Maths.
 */
export function getRootFolders(folders: VideoFolder[]): VideoFolder[] {
  const roots = folders.filter(isRootFolder);
  return [...roots].sort((a, b) => {
    const idxA = PRIMARY_ROOT_SUBJECT_IDS.indexOf(a.id as any);
    const idxB = PRIMARY_ROOT_SUBJECT_IDS.indexOf(b.id as any);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    if ((a.order ?? 999) !== (b.order ?? 999)) return (a.order ?? 999) - (b.order ?? 999);
    return a.name.localeCompare(b.name);
  });
}

/**
 * Returns all direct subfolders of a given parent folder.
 */
export function getChildFolders(parentId: string, folders: VideoFolder[]): VideoFolder[] {
  return folders
    .filter((f) => f.parentId === parentId)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name));
}

/**
 * Returns all descendant folder IDs (children, grandchildren, etc.) of a folder.
 */
export function getAllDescendantFolderIds(folderId: string, folders: VideoFolder[]): string[] {
  const result: string[] = [];
  const queue = [folderId];
  const visited = new Set<string>([folderId]);

  while (queue.length > 0) {
    const currId = queue.shift()!;
    for (const f of folders) {
      if (f.parentId === currId && !visited.has(f.id)) {
        visited.add(f.id);
        result.push(f.id);
        queue.push(f.id);
      }
    }
  }

  return result;
}

/**
 * Checks if candidateId is equal to targetId or a descendant of targetId (prevents circular loops).
 */
export function isDescendant(candidateId: string, targetId: string, folders: VideoFolder[]): boolean {
  if (candidateId === targetId) return true;
  const descendants = getAllDescendantFolderIds(targetId, folders);
  return descendants.includes(candidateId);
}

/**
 * Computes breadcrumb path from root down to folderId:
 * e.g. [Physics, Physics Practical Workshop]
 */
export function getFolderPath(folderId: string, folders: VideoFolder[]): VideoFolder[] {
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return [];

  const path: VideoFolder[] = [folder];
  let curr = folder;
  const visited = new Set<string>([curr.id]);

  while (curr.parentId && curr.parentId !== 'none') {
    const parent = folders.find((f) => f.id === curr.parentId);
    if (!parent || visited.has(parent.id)) break;
    visited.add(parent.id);
    path.unshift(parent);
    curr = parent;
  }

  return path;
}

export interface FlattenedFolderOption {
  folder: VideoFolder;
  depth: number;
  label: string;
  pathString: string;
}

/**
 * Returns a flattened array of folders with indentation for <select> options,
 * with optional exclusion of a folder and its entire descendant subtree (used when editing parent).
 */
export function getFlattenedFolderTree(
  folders: VideoFolder[],
  excludeSubtreeOfId?: string
): FlattenedFolderOption[] {
  const excludedSet = new Set<string>();
  if (excludeSubtreeOfId) {
    excludedSet.add(excludeSubtreeOfId);
    getAllDescendantFolderIds(excludeSubtreeOfId, folders).forEach((id) => excludedSet.add(id));
  }

  const validFolders = folders.filter((f) => !excludedSet.has(f.id));
  const roots = getRootFolders(validFolders);
  const result: FlattenedFolderOption[] = [];

  function traverse(folder: VideoFolder, depth: number, parentPath: string) {
    const currentPath = parentPath ? `${parentPath} ➜ ${folder.name}` : folder.name;
    const indent = '   '.repeat(depth);
    const prefix = depth === 0 ? (folder.icon || '📁') + ' ' : indent + '↳ ' + (folder.icon || '📂') + ' ';

    result.push({
      folder,
      depth,
      label: `${prefix}${folder.name}${folder.subjectName ? ` (${folder.subjectName})` : ''}`,
      pathString: currentPath,
    });

    const children = getChildFolders(folder.id, validFolders);
    for (const child of children) {
      traverse(child, depth + 1, currentPath);
    }
  }

  for (const root of roots) {
    traverse(root, 0, '');
  }

  return result;
}

/**
 * Returns all videos directly in a folder OR inside any of its subfolders.
 */
export function getAllVideosForFolderRecursive(
  folderId: string,
  folders: VideoFolder[],
  videos: VideoLesson[]
): VideoLesson[] {
  const allFolderIds = new Set<string>([folderId, ...getAllDescendantFolderIds(folderId, folders)]);
  return videos.filter((v) => v.folderId && allFolderIds.has(v.folderId));
}

/**
 * Checks if a specific folder is accessible given an array of allowedFolderIds.
 * Returns true if:
 * 1) allowedFolderIds includes this folder's id directly
 * 2) OR any ancestor of this folder (e.g. its parent, or root subject folder) is in allowedFolderIds
 */
export function isFolderAllowedByList(
  folderId: string,
  allowedFolderIds: string[] | undefined,
  folders: VideoFolder[]
): boolean {
  if (!allowedFolderIds || allowedFolderIds.length === 0) return false;
  if (allowedFolderIds.includes(folderId)) return true;
  const path = getFolderPath(folderId, folders);
  return path.some((ancestor) => allowedFolderIds.includes(ancestor.id));
}

