import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Verifies that the request is from an authenticated admin user.
 * Checks the Authorization header for a valid admin email.
 * Returns the admin user ID on success, or a NextResponse error on failure.
 */
export async function verifyAdmin(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const match = authHeader.match(/Bearer\s+(.+)/);
  if (!match) {
    return NextResponse.json(
      { error: "Invalid authorization format" },
      { status: 401 }
    );
  }

  const userId = match[1];

  const adminDb = getAdminDb();
  if (!adminDb) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }

  try {
    const userSnap = await adminDb.collection("users").doc(userId).get();

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
