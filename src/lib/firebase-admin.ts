import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

// Use absolute path for .env.local to ensure it's found in all contexts
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
    }

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
      });
      console.log("Firebase initialized successfully with Project ID:", projectId);
    } else {
      console.warn("Firebase Admin credentials missing or incomplete. Check your .env.local file.");
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const db = admin.apps.length > 0 ? admin.firestore() : null as unknown as admin.firestore.Firestore;

