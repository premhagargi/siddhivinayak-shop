import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Verifies that the request is from an authenticated admin user.
 * Uses the NextAuth session to identify the user, then checks Firestore for admin status.
 * Returns the admin user ID on success, or a NextResponse error on failure.
 */
export async function verifyAdmin(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const userId = (session.user as any).id || session.user.email.toLowerCase();

  const adminDb = getAdminDb();
  if (!adminDb) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }

  try {
    // Try finding user by their ID (email-based)
    let userSnap = await adminDb.collection("users").doc(userId).get();

    // If not found by doc ID, try querying by email
    if (!userSnap.exists) {
      const emailQuery = await adminDb
        .collection("users")
        .where("email", "==", session.user.email.toLowerCase())
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

    return { userId };
  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
