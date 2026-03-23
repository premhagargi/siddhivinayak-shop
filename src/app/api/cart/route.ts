import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Cart item interface
interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  addedAt: string;
}

// Helper to get adminDb or null
function getDbOrNull() {
  try {
    return getAdminDb();
  } catch {
    return null;
  }
}

/**
 * GET /api/cart - Get the current user's cart
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    const sessionId = request.cookies.get("cart_session_id")?.value || null;

    if (!userId && !sessionId) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const adminDb = getDbOrNull();
    if (!adminDb) {
      // Return empty cart in demo mode
      return NextResponse.json({ items: [], total: 0 });
    }

    let snapshot;
    if (userId) {
      const docs = await adminDb.collection("carts").where("userId", "==", userId).get();
      snapshot = docs.docs[0];
    } else if (sessionId) {
      const docs = await adminDb.collection("carts").where("sessionId", "==", sessionId).get();
      snapshot = docs.docs[0];
    }

    if (!snapshot) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const cartData = snapshot.data();
    const total = (cartData.items || []).reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      id: snapshot.id,
      items: cartData.items || [],
      total,
    });
  } catch (error: any) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart", details: error.message }, { status: 500 });
  }
}

/**
 * POST /api/cart - Add item to cart
 */
export async function POST(request: NextRequest) {
  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode - item added to local state only");
    const body = await request.json();
    const { productId, quantity = 1, price, name, image } = body;
    // Return success but cart will be empty until Firebase is configured
    return NextResponse.json({ 
      id: `demo-${Date.now()}`, 
      items: [{ productId, quantity, price, name, image, addedAt: new Date().toISOString() }], 
      total: price * quantity 
    });
  }

  try {
    const body = await request.json();
    const { productId, quantity = 1, price, name, image } = body;

    if (!productId || !price || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    let sessionId = request.cookies.get("cart_session_id")?.value;
    if (!sessionId && !userId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    // Find existing cart
    let cartDocId: string | null = null;
    let existingItems: CartItem[] = [];

    let existingDocs;
    if (userId) {
      existingDocs = await adminDb.collection("carts").where("userId", "==", userId).get();
    } else if (sessionId) {
      existingDocs = await adminDb.collection("carts").where("sessionId", "==", sessionId).get();
    }

    if (existingDocs && !existingDocs.empty) {
      cartDocId = existingDocs.docs[0].id;
      existingItems = existingDocs.docs[0].data().items || [];
    }

    // Check if item exists
    const existingItemIndex = existingItems.findIndex((item: CartItem) => item.productId === productId);
    if (existingItemIndex >= 0) {
      existingItems[existingItemIndex].quantity += quantity;
    } else {
      existingItems.push({
        productId,
        quantity,
        price,
        name,
        image: image || "",
        addedAt: new Date().toISOString(),
      });
    }

    const total = existingItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

    const cartData: Record<string, any> = {
      items: existingItems,
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    // Only include userId or sessionId if they exist
    if (userId) {
      cartData.userId = userId;
    }
    if (sessionId) {
      cartData.sessionId = sessionId;
    }

    if (cartDocId) {
      await adminDb.collection("carts").doc(cartDocId).update(cartData);
    } else {
      const newDocRef = adminDb.collection("carts").doc();
      await newDocRef.set({
        ...cartData,
        createdAt: FieldValue.serverTimestamp(),
      });
      cartDocId = newDocRef.id;
    }

    const response = NextResponse.json({ id: cartDocId, items: existingItems, total });

    if (sessionId && !userId) {
      response.cookies.set("cart_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: "Failed to add to cart", details: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/cart - Update cart item quantity
 */
export async function PATCH(request: NextRequest) {
  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    // In demo mode, return success without actually updating
    const body = await request.json();
    const { productId, quantity } = body;
    return NextResponse.json({ 
      id: `demo-${Date.now()}`, 
      items: [{ productId, quantity, price: 0, name: "", image: "", addedAt: new Date().toISOString() }], 
      total: 0 
    });
  }

  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    const sessionId = request.cookies.get("cart_session_id")?.value || null;

    if (!userId && !sessionId) {
      return NextResponse.json({ error: "No cart found" }, { status: 404 });
    }

    let existingDocs;
    if (userId) {
      existingDocs = await adminDb.collection("carts").where("userId", "==", userId).get();
    } else if (sessionId) {
      existingDocs = await adminDb.collection("carts").where("sessionId", "==", sessionId).get();
    }

    if (!existingDocs || existingDocs.empty) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cartDocId = existingDocs.docs[0].id;
    const cartData = existingDocs.docs[0].data();
    let items: CartItem[] = cartData.items || [];

    const itemIndex = items.findIndex((item: CartItem) => item.productId === productId);
    if (itemIndex < 0) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    if (quantity <= 0) {
      items = items.filter((item: CartItem) => item.productId !== productId);
    } else {
      items[itemIndex].quantity = quantity;
    }

    const total = items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

    await adminDb.collection("carts").doc(cartDocId).update({
      items,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: cartDocId, items, total });
  } catch (error: any) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ error: "Failed to update cart", details: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/cart - Remove item from cart or clear cart
 */
export async function DELETE(request: NextRequest) {
  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    // In demo mode, return success without actually deleting
    return NextResponse.json({ 
      id: `demo-${Date.now()}`, 
      items: [], 
      total: 0 
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const clear = searchParams.get("clear") === "true";

    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    const sessionId = request.cookies.get("cart_session_id")?.value || null;

    if (!userId && !sessionId) {
      return NextResponse.json({ error: "No cart found" }, { status: 404 });
    }

    let existingDocs;
    if (userId) {
      existingDocs = await adminDb.collection("carts").where("userId", "==", userId).get();
    } else if (sessionId) {
      existingDocs = await adminDb.collection("carts").where("sessionId", "==", sessionId).get();
    }

    if (!existingDocs || existingDocs.empty) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cartDocId = existingDocs.docs[0].id;
    const cartData = existingDocs.docs[0].data();
    let items: CartItem[] = cartData.items || [];

    if (clear) {
      items = [];
    } else if (productId) {
      items = items.filter((item: CartItem) => item.productId !== productId);
    } else {
      return NextResponse.json({ error: "Must specify productId or clear=true" }, { status: 400 });
    }

    const total = items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

    await adminDb.collection("carts").doc(cartDocId).update({
      items,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const response = NextResponse.json({ id: cartDocId, items, total });

    if (clear && !userId) {
      response.cookies.delete("cart_session_id");
    }

    return response;
  } catch (error: any) {
    console.error("Error deleting from cart:", error);
    return NextResponse.json({ error: "Failed to delete from cart", details: error.message }, { status: 500 });
  }
}
