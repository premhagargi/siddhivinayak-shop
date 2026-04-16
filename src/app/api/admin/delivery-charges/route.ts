import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdmin } from "@/lib/verify-admin";
import {
  invalidateDeliveryCache,
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
 * GET /api/admin/delivery-charges
 * Fetch the current delivery charges configuration.
 */
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();

  if (!adminDb) {
    return NextResponse.json({ config: DEFAULT_DELIVERY_CONFIG });
  }

  try {
    const docSnap = await adminDb
      .collection("deliveryCharges")
      .doc("config")
      .get();

    if (!docSnap.exists) {
      return NextResponse.json({ config: DEFAULT_DELIVERY_CONFIG });
    }

    const data = docSnap.data();
    const config: DeliveryChargesConfig = {
      type: data?.type || "fixed",
      fixedCharge: data?.fixedCharge ?? 0,
      freeDeliveryEnabled: data?.freeDeliveryEnabled ?? true,
      freeDeliveryThreshold: data?.freeDeliveryThreshold ?? 0,
      ranges: data?.ranges || [],
      updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || null,
    };

    return NextResponse.json({ config });
  } catch (error: any) {
    console.error("Error fetching delivery charges:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery charges", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/delivery-charges
 * Save delivery charges configuration.
 */
export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();

  if (!adminDb) {
    return NextResponse.json({
      message: "Delivery charges updated (demo mode)",
    });
  }

  try {
    const body = await request.json();
    const { type, fixedCharge, freeDeliveryEnabled, freeDeliveryThreshold, ranges } = body;

    if (!type || !["fixed", "range-based"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'fixed' or 'range-based'" },
        { status: 400 }
      );
    }

    if (type === "fixed" && (fixedCharge === undefined || fixedCharge < 0)) {
      return NextResponse.json(
        { error: "Fixed charge must be a non-negative number" },
        { status: 400 }
      );
    }

    if (type === "range-based") {
      if (!ranges || !Array.isArray(ranges) || ranges.length === 0) {
        return NextResponse.json(
          { error: "At least one price range is required" },
          { status: 400 }
        );
      }

      for (const range of ranges) {
        if (range.minOrderValue === undefined || range.charge === undefined || range.charge < 0) {
          return NextResponse.json(
            { error: "Each range must have minOrderValue and a non-negative charge" },
            { status: 400 }
          );
        }
      }
    }

    const configData: Record<string, any> = {
      type,
      fixedCharge: type === "fixed" ? Number(fixedCharge) : 0,
      freeDeliveryEnabled: Boolean(freeDeliveryEnabled),
      freeDeliveryThreshold:
        type === "fixed" && freeDeliveryEnabled
          ? Number(freeDeliveryThreshold) || 0
          : null,
      ranges: type === "range-based" ? ranges.map((r: any) => ({
        minOrderValue: Number(r.minOrderValue),
        maxOrderValue: r.maxOrderValue !== null && r.maxOrderValue !== undefined && r.maxOrderValue !== ""
          ? Number(r.maxOrderValue)
          : null,
        charge: Number(r.charge),
      })) : [],
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb
      .collection("deliveryCharges")
      .doc("config")
      .set(configData, { merge: true });

    // Invalidate cache so next request fetches fresh data
    invalidateDeliveryCache();

    return NextResponse.json({
      message: "Delivery charges updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating delivery charges:", error);
    return NextResponse.json(
      { error: "Failed to update delivery charges", details: error.message },
      { status: 500 }
    );
  }
}
