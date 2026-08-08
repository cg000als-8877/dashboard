import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Replace literal \n with actual newlines if they are escaped in the environment variable
    const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("Firebase Admin Initialized successfully.");
    } else {
      console.warn("Firebase environment variables are missing. Firebase features will be disabled.");
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const db = getApps().length > 0 ? getFirestore() : null;

if (db) {
  db.settings({ ignoreUndefinedProperties: true });
}
