import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Helper to get adminDb or null
function getDbOrNull() {
  try {
    return getAdminDb();
  } catch {
    return null;
  }
}

/**
 * GET /api/users/profile
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const adminDb = getDbOrNull();
    if (!adminDb) {
      // Return demo profile when Firebase is not configured
      console.log("Firebase not configured, returning demo profile");
      return NextResponse.json({
        id: userId,
        email: userId,
        firstName: "Demo",
        lastName: "User",
        phone: "+91 9876543210",
        isAdmin: false,
      });
    }

    const userSnap = await adminDb.collection("users").doc(userId).get();

    if (!userSnap.exists) {
      return NextResponse.json({
        id: userId,
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        isAdmin: false,
      });
    }

    const userData = userSnap.data();
    
    // Handle legacy data: if no firstName but has name, split it
    let firstName = userData?.firstName || "";
    let lastName = userData?.lastName || "";
    
    if (!firstName && userData?.name) {
      const nameParts = userData.name.split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    }

    return NextResponse.json({
      id: userSnap.id,
      email: userData?.email || "",
      firstName,
      lastName,
      phone: userData?.phone || "",
      isAdmin: userData?.isAdmin || false,
      createdAt: userData?.createdAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile", details: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/users/profile
 */
export async function PATCH(request: NextRequest) {
  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    return NextResponse.json({ message: "Profile updated successfully (demo mode)" });
  }

  try {
    const body = await request.json();
    const { firstName, lastName, phone } = body;

    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const updateData: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (firstName !== undefined) {
      updateData.firstName = firstName;
      // Also update the full name
      const lastNameVal = lastName !== undefined ? lastName : "";
      updateData.name = [firstName, lastNameVal].filter(Boolean).join(" ");
    }
    if (lastName !== undefined) {
      updateData.lastName = lastName;
      // Also update the full name if firstName exists
      const firstNameVal = firstName !== undefined ? firstName : "";
      updateData.name = [firstNameVal, lastName].filter(Boolean).join(" ");
    }
    if (phone !== undefined) updateData.phone = phone;

    await adminDb.collection("users").doc(userId).set(updateData, { merge: true });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
  }
}
