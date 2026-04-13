import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyAdmin } from "@/lib/verify-admin";

// Helper to get adminDb or null
function getDbOrNull() {
  try {
    return getAdminDb();
  } catch {
    return null;
  }
}

/**
 * GET /api/admin/users
 * Returns all registered users
 */
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, returning demo users");
    return NextResponse.json({
      users: [
        {
          id: "demo@example.com",
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User",
          phone: "+91 9876543210",
          isAdmin: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "anjali.k@example.com",
          email: "anjali.k@example.com",
          firstName: "Anjali",
          lastName: "Kapoor",
          phone: "+91 9988776655",
          isAdmin: false,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "rajesh.m@gmail.com",
          email: "rajesh.m@gmail.com",
          firstName: "Rajesh",
          lastName: "Mehta",
          phone: "+91 9876123450",
          isAdmin: false,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "priya.s@outlook.com",
          email: "priya.s@outlook.com",
          firstName: "Priya",
          lastName: "Sharma",
          phone: "+91 9123456789",
          isAdmin: false,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      pagination: { page: 1, pageSize: 20, totalItems: 4, totalPages: 1, hasNextPage: false, hasPrevPage: false }
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageLimit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const search = searchParams.get("search")?.toLowerCase() || "";

    const snapshot = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    
    let users = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        isAdmin: data.isAdmin || false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Filter by search if provided
    if (search) {
      users = users.filter((u: any) => 
        u.email?.toLowerCase().includes(search) ||
        u.firstName?.toLowerCase().includes(search) ||
        u.lastName?.toLowerCase().includes(search) ||
        u.phone?.includes(search)
      );
    }

    const totalItems = users.length;
    const totalPages = Math.ceil(totalItems / pageLimit);
    const start = (page - 1) * pageLimit;
    const paginatedUsers = users.slice(start, start + pageLimit);

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        pageSize: pageLimit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users
 * Update user (e.g., make admin)
 */
export async function PATCH(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    return NextResponse.json({ message: "User updated successfully (demo mode)" });
  }

  try {
    const body = await request.json();
    const { userId, isAdmin } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      isAdmin: isAdmin,
      updatedAt: new Date(),
    };

    await adminDb.collection("users").doc(userId).set(updateData, { merge: true });

    return NextResponse.json({ message: "User updated successfully", userId });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user", details: error.message }, { status: 500 });
  }
}
