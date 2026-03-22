import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// Helper to get adminDb or null
function getDbOrNull() {
  try {
    return getAdminDb();
  } catch {
    return null;
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
    if (!userSnap || !userSnap.exists) {
      return NextResponse.json(
        { error: "Invalid credentials. User not found." },
        { status: 401 }
      );
    }

    const userData = userSnap.data();

    if (!userData) {
      return NextResponse.json(
        { error: "Invalid credentials. User data is corrupted." },
        { status: 401 }
      );
    }

    // Verify password (in production, use proper password hashing like bcrypt)
    if (userData.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials. Password mismatch." },
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
