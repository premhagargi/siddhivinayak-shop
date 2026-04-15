import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

const DEFAULT_CONFIG = {
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
};

/**
 * GET /api/homepage
 * Public endpoint to fetch homepage content (banner + featured categories).
 * Uses the admin SDK to bypass Firestore security rules.
 */
export async function GET() {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    const snap = await adminDb.collection("siteConfig").doc("homepage").get();

    if (!snap.exists) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    return NextResponse.json(snap.data());
  } catch (error) {
    console.error("Error fetching homepage config:", error);
    return NextResponse.json(DEFAULT_CONFIG);
  }
}
