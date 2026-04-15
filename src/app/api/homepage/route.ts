import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * GET /api/homepage
 * Public endpoint to fetch homepage content (banner + featured categories).
 */
export async function GET() {
  try {
    const docRef = doc(db, "siteConfig", "homepage");
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      // Return defaults when no config saved yet
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

    return NextResponse.json(snap.data());
  } catch (error) {
    console.error("Error fetching homepage config:", error);
    return NextResponse.json({ error: "Failed to fetch homepage config" }, { status: 500 });
  }
}
