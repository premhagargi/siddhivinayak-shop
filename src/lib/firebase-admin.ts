import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Use globalThis to persist the singleton across Next.js hot reloads in dev.
// Without this, every HMR cycle re-imports the module and re-initializes Firebase.
const globalForFirebase = globalThis as unknown as {
  _firebaseAdminApp?: App;
  _firebaseAdminDb?: Firestore;
  _firebaseAdminInitAttempted?: boolean;
};

function initFirebaseAdmin(): Firestore | null {
  if (globalForFirebase._firebaseAdminDb) {
    return globalForFirebase._firebaseAdminDb;
  }

  if (globalForFirebase._firebaseAdminInitAttempted) {
    return null;
  }

  globalForFirebase._firebaseAdminInitAttempted = true;

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      console.warn("Firebase Admin: Missing env vars — demo mode.");
      return null;
    }

    const existingApps = getApps();
    const app =
      existingApps.length > 0
        ? (existingApps[0] as App)
        : initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
          });

    const db = getFirestore(app);

    globalForFirebase._firebaseAdminApp = app;
    globalForFirebase._firebaseAdminDb = db;

    console.log("Firebase Admin initialized");
    return db;
  } catch (error) {
    console.error("Firebase Admin init failed:", error);
    return null;
  }
}

// Run once on first import
const _db = initFirebaseAdmin();

export function getAdminDb(): Firestore | null {
  return globalForFirebase._firebaseAdminDb ?? null;
}

export const adminDb = _db;
