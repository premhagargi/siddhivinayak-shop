
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy, Timestamp } from "firebase/firestore";

/**
 * GET /api/admin/products
 * Fetches all products from the catalog ordered by creation date.
 */
export async function GET() {
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

    const productsCol = collection(db, "products");
    const newDoc = await addDoc(productsCol, {
      name: String(name),
      price: sanitizedPrice,
      mrp: sanitizedMrp,
      category: String(category),
      stock: sanitizedStock,
      description: String(description || ""),
      images: Array.isArray(images) ? images : [],
      sareeDetails: category === "Saree" ? sareeDetails : null,
      silverDetails: category === "Silver" ? silverDetails : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ id: newDoc.id, message: "Product created successfully" });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ 
      error: "Failed to create product", 
      details: error.message 
    }, { status: 500 });
  }
}
