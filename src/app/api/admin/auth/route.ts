import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Helper to get adminDb or null
function getDbOrNull() {
  try {
    return getAdminDb();
  } catch {
    return null;
  }
}

/**
 * GET /api/admin/auth
 * Checks if the currently authenticated user (via NextAuth session) has admin privileges.
 * Used after NextAuth signIn to verify admin status.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const adminDb = getDbOrNull();
  if (!adminDb) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }

  try {
    const emailInput = session.user.email.toLowerCase().trim();
    let userSnap = await adminDb.collection("users").doc(emailInput).get();

    if (!userSnap.exists) {
      const emailQuery = await adminDb
        .collection("users")
        .where("email", "==", emailInput)
        .get();
      if (!emailQuery.empty) {
        userSnap = emailQuery.docs[0];
      }
    }

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    const userData = userSnap.data();
    if (!userData?.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      admin: true,
      user: {
        id: userSnap.id,
        email: userData.email,
        name: userData.name,
      },
    });
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/auth
 * Admin login - verifies email, password, and isAdmin flag
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const adminDb = getDbOrNull();

    if (!adminDb) {
      // When Firebase is not configured, deny admin access
      // Admin login must work with real Firebase data
      return NextResponse.json(
        { error: "Admin login is not available. Please configure Firebase." },
        { status: 401 }
      );
    }

    // Normalize email
    const emailInput = email.toLowerCase().trim();

    // Try to find user in users collection
    let userSnap;
    
    // First, try to find user by email directly (doc ID)
    try {
      userSnap = await adminDb.collection("users").doc(emailInput).get();
    } catch (e) {
      console.log("Error getting user by doc:", e);
    }

    // If not found by doc, try querying by email field
    if (!userSnap || !userSnap.exists) {
      try {
        const emailQuery = await adminDb.collection("users")
          .where("email", "==", emailInput)
          .get();
        
        if (!emailQuery.empty) {
          userSnap = emailQuery.docs[0];
        }
      } catch (e) {
        console.log("Error querying by email:", e);
      }
    }

    // Also check if they registered with phone number
    if (!userSnap || !userSnap.exists) {
      const phoneClean = email.replace(/\D/g, "");
      if (phoneClean.length >= 10) {
        try {
          const phoneQuery = await adminDb.collection("users")
            .where("phone", "==", phoneClean)
            .get();
          
          if (!phoneQuery.empty) {
            userSnap = phoneQuery.docs[0];
          }
        } catch (e) {
          console.log("Error querying by phone:", e);
        }
      }
    }

    // If still not found, user doesn't exist
    // Use generic error to avoid leaking whether user exists
    if (!userSnap || !userSnap.exists) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const userData = userSnap.data();

    if (!userData) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password with bcrypt (with plaintext migration fallback)
    let passwordValid = false;
    if (userData.password.startsWith("$2a$") || userData.password.startsWith("$2b$")) {
      passwordValid = await bcrypt.compare(password, userData.password);
    } else {
      passwordValid = userData.password === password;
      if (passwordValid && adminDb) {
        try {
          const hashed = await bcrypt.hash(password, 12);
          await adminDb.collection("users").doc(userSnap!.id).update({ password: hashed });
        } catch (e) {
          console.error("Failed to migrate admin password:", e);
        }
      }
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!userData.isAdmin) {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    // Login successful
    return NextResponse.json({
      success: true,
      user: {
        id: userSnap.id,
        email: userData.email,
        name: userData.name,
        isAdmin: userData.isAdmin,
      },
    });

  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
