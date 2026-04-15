import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyAdmin } from "@/lib/verify-admin";

/**
 * GET /api/admin/homepage
 * Fetches homepage content (banner + featured categories) for admin.
 */
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const doc = await adminDb.collection("siteConfig").doc("homepage").get();

    if (!doc.exists) {
      // Return defaults
      return NextResponse.json({
        banner: {
          imageUrl: "",
          title: "Timeless Sarees.\nMeaningful Silver Gifts.",
          subtitle: "Crafted for weddings, festivals, and your most cherished occasions.",
        },
        categories: [
          { id: "saree", label: "Sarees", subtitle: "Handcrafted elegance for every occasion", imageUrl: "", linkCategory: "Saree" },
          { id: "silver", label: "Silver Collection", subtitle: "", imageUrl: "", linkCategory: "Silver" },
          { id: "new-arrivals", label: "New Arrivals", subtitle: "", imageUrl: "", linkCategory: "" },
          { id: "silver-gifts", label: "Silver Gifts", subtitle: "Perfect for every celebration", imageUrl: "", linkCategory: "Silver" },
        ],
      });
    }

    return NextResponse.json(doc.data());
  } catch (error) {
    console.error("Error fetching homepage config:", error);
    return NextResponse.json({ error: "Failed to fetch homepage config" }, { status: 500 });
  }
}

/**
 * POST /api/admin/homepage
 * Updates homepage content (banner + featured categories).
 */
export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const body = await request.json();
    const { banner, categories } = body;

    if (!banner || !categories) {
      return NextResponse.json({ error: "banner and categories are required" }, { status: 400 });
    }

    await adminDb.collection("siteConfig").doc("homepage").set(
      { banner, categories, updatedAt: new Date().toISOString() },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating homepage config:", error);
    return NextResponse.json({ error: "Failed to update homepage config" }, { status: 500 });
  }
}
