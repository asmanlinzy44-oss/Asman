import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { UserAdProgress, AdStats } from '../types';
import { cleanFirestoreData } from './firestoreClean';

export const AD_SMART_LINK = 'https://www.profitableratecpmnetwork.com/stcczpa5?key=f6cfae61e2eead30a4cf19c544c5f6cd';
export const AD_SCRIPT_URL = 'https://pl32196932.profitableratecpmnetwork.com/f9/4c/a2/f94ca273d4170805f1944e71fc19c070.js';
export const TARGET_ADS_REQUIRED = 40;

// Aliases for compatibility
export const ADSTERRA_SMART_LINK = AD_SMART_LINK;
export const ADSTERRA_SCRIPT_URL = AD_SCRIPT_URL;

export const sanitizeEmailForDocId = (email: string): string => {
  return email.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_');
};

/**
 * Fetch current ad progress for a student email
 */
export async function getStudentAdProgress(email: string): Promise<UserAdProgress> {
  const cleanEmail = email.toLowerCase().trim();
  const defaultProgress: UserAdProgress = {
    userEmail: cleanEmail,
    adsWatched: 0,
    targetAds: TARGET_ADS_REQUIRED,
    isUnlocked: false,
  };

  if (!cleanEmail) return defaultProgress;

  try {
    const docId = sanitizeEmailForDocId(cleanEmail);
    const snap = await getDoc(doc(db, 'ad_progress', docId));
    if (snap.exists()) {
      const data = snap.data() as UserAdProgress;
      return {
        userEmail: cleanEmail,
        userName: data.userName,
        adsWatched: Math.min(TARGET_ADS_REQUIRED, Math.max(0, data.adsWatched || 0)),
        targetAds: TARGET_ADS_REQUIRED,
        isUnlocked: Boolean(data.isUnlocked || (data.adsWatched || 0) >= TARGET_ADS_REQUIRED),
        unlockedAt: data.unlockedAt,
        lastAdWatchedAt: data.lastAdWatchedAt,
      };
    }
  } catch (err) {
    console.warn('Get student ad progress error:', err);
  }

  // Fallback to localStorage if offline
  try {
    const saved = localStorage.getItem(`studypro_ad_progress_${cleanEmail}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        userEmail: cleanEmail,
        userName: parsed.userName,
        adsWatched: Math.min(TARGET_ADS_REQUIRED, Math.max(0, parsed.adsWatched || 0)),
        targetAds: TARGET_ADS_REQUIRED,
        isUnlocked: Boolean(parsed.isUnlocked || (parsed.adsWatched || 0) >= TARGET_ADS_REQUIRED),
        unlockedAt: parsed.unlockedAt,
        lastAdWatchedAt: parsed.lastAdWatchedAt,
      };
    }
  } catch {}

  return defaultProgress;
}

/**
 * Record a successfully viewed ad, increment count in Firestore and global metrics
 */
export async function recordAdWatched(
  email: string,
  userName?: string
): Promise<{ progress: UserAdProgress; justUnlocked: boolean }> {
  const cleanEmail = email.toLowerCase().trim();
  const docId = sanitizeEmailForDocId(cleanEmail);

  const current = await getStudentAdProgress(cleanEmail);
  const newCount = Math.min(TARGET_ADS_REQUIRED, current.adsWatched + 1);
  const justUnlocked = newCount >= TARGET_ADS_REQUIRED && !current.isUnlocked;
  const now = new Date().toISOString();

  const updatedProgress: UserAdProgress = {
    userEmail: cleanEmail,
    userName: userName || current.userName,
    adsWatched: newCount,
    targetAds: TARGET_ADS_REQUIRED,
    isUnlocked: newCount >= TARGET_ADS_REQUIRED,
    unlockedAt: justUnlocked ? now : current.unlockedAt,
    lastAdWatchedAt: now,
  };

  // 1. Save user ad progress in Firestore
  try {
    await setDoc(doc(db, 'ad_progress', docId), cleanFirestoreData(updatedProgress), { merge: true });
  } catch (err) {
    console.warn('Save ad progress error:', err);
  }

  // 2. Increment global ad views counter in settings/ad_stats
  try {
    const statsRef = doc(db, 'settings', 'ad_stats');
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
      await updateDoc(statsRef, {
        totalAdViews: increment(1),
        ...(justUnlocked ? { totalUnlockedUsers: increment(1) } : {}),
        lastUpdated: now,
      });
    } else {
      await setDoc(statsRef, {
        totalAdViews: 1,
        totalUnlockedUsers: justUnlocked ? 1 : 0,
        lastUpdated: now,
      });
    }
  } catch (err) {
    console.warn('Increment global ad views error:', err);
  }

  // 3. Local storage caching
  try {
    localStorage.setItem(`studypro_ad_progress_${cleanEmail}`, JSON.stringify(updatedProgress));
  } catch {}

  return { progress: updatedProgress, justUnlocked };
}
