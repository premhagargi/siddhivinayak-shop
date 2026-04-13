import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, limit, getDocs } from "firebase/firestore";

/**
 * GET /api/products/[id]
 * Public endpoint for fetching a single product by ID
 * Also returns related products for "You may also like" section
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the main product
    const productRef = doc(db, "products", id);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const productData = productSnapshot.data();

    // Don't expose inactive products publicly
    if (productData.isActive === false) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Transform main product data
    const product = {
      id: productSnapshot.id,
      name: productData.name,
      price: productData.price,
      mrp: productData.mrp,
      category: productData.category,
      stock: productData.stock,
      images: productData.images || [],
      description: productData.description,
      sareeDetails: productData.sareeDetails || null,
      silverDetails: productData.silverDetails || null,
      createdAt: productData.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: productData.updatedAt?.toDate?.()?.toISOString() || null,
    };

    // Fetch related products (same category, excluding current product)
    const relatedProducts: any[] = [];
    
    if (product.category) {
      const relatedQuery = query(
        collection(db, "products"),
        where("category", "==", product.category),
        where("isActive", "==", true),
        limit(4)
      );
      
      const relatedSnapshot = await getDocs(relatedQuery);
      
      relatedSnapshot.docs.forEach((doc) => {
        if (doc.id !== id) {
          const data = doc.data();
          relatedProducts.push({
            id: doc.id,
            name: data.name,
            price: data.price,
            mrp: data.mrp,
            category: data.category,
            stock: data.stock,
            images: data.images || [],
          });
        }
      });

      // Limit to 3 related products
      while (relatedProducts.length > 3) {
        relatedProducts.pop();
      }
    }

    const response = NextResponse.json({
      product,
      relatedProducts,
    });

    // Cache individual product for 60 seconds
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

    return response;
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[id]
 * Update product stock or other fields
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { stock, decreaseStock } = body;

    const productRef = doc(db, "products", id);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const productData = productSnapshot.data();
    let newStock = productData.stock || 0;

    // If decreaseStock is provided, reduce the stock by that amount
    if (typeof decreaseStock === "number" && decreaseStock > 0) {
      newStock = Math.max(0, newStock - decreaseStock);
    } else if (typeof stock === "number") {
      // Otherwise, set the stock directly
      newStock = stock;
    }

    await updateDoc(productRef, {
      stock: newStock,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      productId: id,
      stock: newStock,
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
      { status: 500 }
    );
  }
}
