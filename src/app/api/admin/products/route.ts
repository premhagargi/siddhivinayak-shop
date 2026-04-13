import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getAdminDb } from "@/lib/firebase-admin";
import { collection, getDocs, addDoc, query, orderBy, Timestamp } from "firebase/firestore";
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
 * GET /api/admin/products
 * Fetches all products from the catalog ordered by creation date.
 */
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const productsCol = collection(db, "products");
    const q = query(productsCol, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
      };
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

/**
 * POST /api/admin/products
 * Creates a new product in the catalog.
 */
export async function POST(req: NextRequest) {
  const authResult = await verifyAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    const body = await req.json();
    const { name, price, category } = body;
    return NextResponse.json({ 
      id: `demo-${Date.now()}`,
      message: "Product created successfully (demo mode)" 
    });
  }

  try {
    const body = await req.json();
    const { name, price, mrp, category, stock, description, images, sareeDetails, silverDetails } = body;

    if (!name || price === undefined || !category) {
      return NextResponse.json({ error: "Missing required fields (name, price, or category)" }, { status: 400 });
    }

    // Ensure numeric types for Firestore to prevent errors
    const sanitizedPrice = parseFloat(price);
    const sanitizedMrp = parseFloat(mrp || price);
    const sanitizedStock = parseInt(stock || 0, 10);

    if (isNaN(sanitizedPrice)) {
      return NextResponse.json({ error: "Invalid price value" }, { status: 400 });
    }

    // Use admin SDK directly
    const newDocRef = adminDb.collection("products").doc();
    await newDocRef.set({
      name: String(name),
      price: sanitizedPrice,
      mrp: sanitizedMrp,
      category: String(category),
      stock: sanitizedStock,
      description: String(description || ""),
      images: Array.isArray(images) ? images : [],
      sareeDetails: category === "Saree" ? sareeDetails : null,
      silverDetails: category === "Silver" ? silverDetails : null,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: newDocRef.id, message: "Product created successfully" });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ 
      error: "Failed to create product", 
      details: error.message 
    }, { status: 500 });
  }
}
