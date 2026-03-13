
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";

/**
 * GET /api/admin/products/[id]
 * Fetches a single product.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productDoc = doc(db, "products", params.id);
    const snapshot = await getDoc(productDoc);

    if (!snapshot.exists()) {
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
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const productRef = doc(db, "products", params.id);

    await updateDoc(productRef, {
      ...body,
      updatedAt: Timestamp.now()
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
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productRef = doc(db, "products", params.id);
    await deleteDoc(productRef);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
