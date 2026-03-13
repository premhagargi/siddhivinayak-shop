
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
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString()
    }));

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

    if (!name || !price || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const productsCol = collection(db, "products");
    const newDoc = await addDoc(productsCol, {
      name,
      price: Number(price),
      mrp: Number(mrp || price),
      category,
      stock: Number(stock || 0),
      description: description || "",
      images: images || [],
      sareeDetails: category === "Saree" ? sareeDetails : null,
      silverDetails: category === "Silver" ? silverDetails : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ id: newDoc.id, message: "Product created successfully" });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
