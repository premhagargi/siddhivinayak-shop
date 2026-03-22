import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  mrp?: number;
  category: string;
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
 * GET /api/wishlist
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    if (!userId) {
      return NextResponse.json({ items: [] });
    }

    const adminDb = getDbOrNull();
    if (!adminDb) {
      // Return demo wishlist when Firebase is not configured
      console.log("Firebase not configured, returning demo wishlist");
      return NextResponse.json({ 
        items: [
          {
            productId: "demo-1",
            name: "Banarasi Silk Saree - Maroon",
            price: 24900,
            mrp: 29900,
            category: "Saree",
            image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400",
            addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        count: 1
      });
    }

    const snapshot = await adminDb.collection("wishlists").where("userId", "==", userId).get();
    
    if (snapshot.empty) {
      return NextResponse.json({ items: [], count: 0 });
    }

    const wishlistDoc = snapshot.docs[0];
    const wishlistData = wishlistDoc.data();
    
    return NextResponse.json({
      id: wishlistDoc.id,
      items: wishlistData.items || [],
      count: wishlistData.items?.length || 0,
    });
  } catch (error: any) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist", details: error.message }, { status: 500 });
  }
}

/**
 * POST /api/wishlist
 */
export async function POST(request: NextRequest) {
  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    const body = await request.json();
    const { productId, name, price, mrp, category, image } = body;
    return NextResponse.json({ 
      id: `demo-${Date.now()}`,
      items: [{ productId, name, price, mrp, category, image, addedAt: new Date().toISOString() }],
      count: 1
    });
  }

  try {
    const body = await request.json();
    const { productId, name, price, mrp, category, image } = body;

    if (!productId || !name || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const existingDocs = await adminDb.collection("wishlists").where("userId", "==", userId).get();
    
    let wishlistDocId: string | null = null;
    let existingItems: WishlistItem[] = [];

    if (!existingDocs.empty) {
      wishlistDocId = existingDocs.docs[0].id;
      existingItems = existingDocs.docs[0].data().items || [];
    }

    const existingItemIndex = existingItems.findIndex((item: WishlistItem) => item.productId === productId);

    if (existingItemIndex >= 0) {
      return NextResponse.json({ message: "Item already in wishlist", items: existingItems });
    }

    existingItems.push({
      productId,
      name,
      price,
      mrp: mrp || price,
      category: category || "",
      image: image || "",
      addedAt: new Date().toISOString(),
    });

    const wishlistData = {
      userId,
      items: existingItems,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (wishlistDocId) {
      await adminDb.collection("wishlists").doc(wishlistDocId).set(wishlistData);
    } else {
      const newDocRef = adminDb.collection("wishlists").doc();
      await newDocRef.set({
        ...wishlistData,
        createdAt: FieldValue.serverTimestamp(),
      });
      wishlistDocId = newDocRef.id;
    }

    return NextResponse.json({
      id: wishlistDocId,
      items: existingItems,
      count: existingItems.length,
    });
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "Failed to add to wishlist", details: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/wishlist
 */
export async function DELETE(request: NextRequest) {
  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    return NextResponse.json({ items: [], count: 0 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!productId) {
      return NextResponse.json({ error: "Missing productId parameter" }, { status: 400 });
    }

    const existingDocs = await adminDb.collection("wishlists").where("userId", "==", userId).get();
    
    if (existingDocs.empty) {
      return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
    }

    const wishlistDocId = existingDocs.docs[0].id;
    const wishlistData = existingDocs.docs[0].data();
    let items: WishlistItem[] = wishlistData.items || [];

    items = items.filter((item: WishlistItem) => item.productId !== productId);

    await adminDb.collection("wishlists").doc(wishlistDocId).set({
      userId,
      items,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: wishlistDocId,
      items,
      count: items.length,
    });
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist", details: error.message }, { status: 500 });
  }
}
