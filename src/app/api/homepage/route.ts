import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getHomepageCache, setHomepageCache } from "@/lib/homepage-cache";

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

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

/**
 * GET /api/homepage
 * Public endpoint to fetch homepage content (banner + featured categories).
 * Cached server-side for 5 minutes + browser-cached via Cache-Control.
 */
export async function GET() {
  try {
    // Serve from server-side cache if fresh
    const { data: cached, fresh } = getHomepageCache();
    if (cached && fresh) {
      return NextResponse.json(cached, { headers: CACHE_HEADERS });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(DEFAULT_CONFIG, { headers: CACHE_HEADERS });
    }

    const snap = await adminDb.collection("siteConfig").doc("homepage").get();
    const data = snap.exists ? snap.data() : DEFAULT_CONFIG;

    setHomepageCache(data);

    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error("Error fetching homepage config:", error);
    const { data: stale } = getHomepageCache();
    return NextResponse.json(stale || DEFAULT_CONFIG, {
      headers: { "Cache-Control": "public, s-maxage=60" },
    });
  }
}
