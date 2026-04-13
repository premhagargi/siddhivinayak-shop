import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
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
 * GET /api/admin/products/[id]
 * Fetches a single product.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  try {
    const { id } = await params;
    const snapshot = await adminDb.collection("products").doc(id).get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/products/[id]
 * Updates an existing product.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    return NextResponse.json({ message: "Product updated successfully (demo mode)" });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    await adminDb.collection("products").doc(id).update({
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: "Product updated successfully" });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Removes a product from the catalog.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await verifyAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    return NextResponse.json({ message: "Product deleted successfully (demo mode)" });
  }

  try {
    const { id } = await params;
    await adminDb.collection("products").doc(id).delete();
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
