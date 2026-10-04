import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Custom authDomain for custom branding on Vercel
// Displays "paperexpress.vercel.app" instead of "inlaid-doodad-65p7n.firebaseapp.com" in the Google Sign-In popup
const getEffectiveAuthDomain = (): string => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host.includes('paperexpress.vercel.app') || (host.includes('vercel.app') && !host.includes('localhost'))) {
      if (localStorage.getItem('studypro_use_default_auth_domain') !== 'true') {
        return host;
      }
    }
  }
  return firebaseConfig.authDomain;
};

const app = initializeApp({
  ...firebaseConfig,
  authDomain: getEffectiveAuthDomain(),
});
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Validate connection on boot as mandated by the skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
