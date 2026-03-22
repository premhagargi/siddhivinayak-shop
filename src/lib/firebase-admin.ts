import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;
let initAttempted = false;

function initFirebaseAdmin(): { adminApp: App; adminDb: Firestore } | null {
  // If already initialized, return existing
  if (adminApp && adminDb) {
    return { adminApp, adminDb };
  }

  // Prevent multiple initialization attempts
  if (initAttempted) {
    console.log("Firebase Admin: Initialization already attempted, skipping...");
    return null;
  }
  
  initAttempted = true;

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    console.log("Firebase Admin init check:", {
      projectId: projectId ? "set" : "missing",
      clientEmail: clientEmail ? "set" : "missing", 
      privateKey: privateKey ? "set" : "missing"
    });

    if (!projectId || !clientEmail || !privateKey) {
      console.warn("Firebase Admin: Missing environment variables. Using demo mode.");
      return null;
    }

    // Check if app already exists to avoid duplicate initialization
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0] as App;
    } else {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }

    adminDb = getFirestore(adminApp);
    console.log("Firebase Admin initialized successfully");
    return { adminApp, adminDb };
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    return null;
  }
}

// Initialize on import - try to initialize, but don't throw
const initResult = initFirebaseAdmin();
if (initResult) {
  adminApp = initResult.adminApp;
  adminDb = initResult.adminDb;
}

// Helper function to get adminDb or throw helpful error
export function getAdminDb(): Firestore | null {
  if (!adminDb) {
    console.warn("Firebase Admin not initialized. Using demo mode.");
    return null;
  }
  return adminDb;
}

// Export for backwards compatibility
export { adminDb };
