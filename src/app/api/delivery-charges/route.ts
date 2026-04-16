import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  getDeliveryCache,
  setDeliveryCache,
  calculateDeliveryCharge,
  DeliveryChargesConfig,
  DEFAULT_DELIVERY_CONFIG,
} from "@/lib/delivery-cache";

function getDbOrNull() {
  try {
    return getAdminDb();
  } catch {
    return null;
  }
}

/**
 * GET /api/delivery-charges
 * Public endpoint for checkout to fetch delivery charges config.
 * Uses server-side cache with 5-min TTL.
 */
export async function GET() {
  // Try cache first
  const cached = getDeliveryCache();
  if (cached.fresh && cached.data) {
    return NextResponse.json({ config: cached.data });
  }

  const adminDb = getDbOrNull();

  if (!adminDb) {
    return NextResponse.json({ config: DEFAULT_DELIVERY_CONFIG });
  }

  try {
    const docSnap = await adminDb
      .collection("deliveryCharges")
      .doc("config")
      .get();

    let config: DeliveryChargesConfig;

    if (!docSnap.exists) {
      config = DEFAULT_DELIVERY_CONFIG;
    } else {
      const data = docSnap.data();
      config = {
        type: data?.type || "fixed",
        fixedCharge: data?.fixedCharge ?? 0,
        freeDeliveryEnabled: data?.freeDeliveryEnabled ?? true,
        freeDeliveryThreshold: data?.freeDeliveryThreshold ?? 0,
        ranges: data?.ranges || [],
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || null,
      };
    }

    // Populate cache
    setDeliveryCache(config);

    return NextResponse.json({ config });
  } catch (error: any) {
    console.error("Error fetching delivery charges:", error);
    // Return cached data even if stale, or default
    if (cached.data) {
      return NextResponse.json({ config: cached.data });
    }
    return NextResponse.json({ config: DEFAULT_DELIVERY_CONFIG });
  }
}
