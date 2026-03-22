import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit, startAfter, QueryDocumentSnapshot } from "firebase/firestore";

interface SearchParams {
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  inStock?: string;
  page?: string;
  limit?: string;
}

/**
 * GET /api/products
 * Public endpoint for fetching products with filtering, sorting, and pagination
 * 
 * Query Parameters:
 * - category: Filter by category (Saree, Silver)
 * - sort: Sort order (newest, price-asc, price-desc, popularity)
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - search: Search query for product name
 * - inStock: Filter for in-stock items only (true/false)
 * - page: Page number for pagination (default: 1)
 * - limit: Items per page (default: 12)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params: SearchParams = {
      category: searchParams.get("category") || undefined,
      sort: searchParams.get("sort") || "newest",
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      search: searchParams.get("search") || undefined,
      inStock: searchParams.get("inStock") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "12",
    };

    const page = parseInt(params.page || "1", 10);
    const pageSize = Math.min(parseInt(params.limit || "12", 10), 50); // Cap at 50 items
    const offset = (page - 1) * pageSize;

    // Build the query
    const productsRef = collection(db, "products");
    const queryConstraints: any[] = [];

    // Only fetch active products for public API
    queryConstraints.push(where("isActive", "==", true));

    // Category filter
    if (params.category && params.category !== "All") {
      queryConstraints.push(where("category", "==", params.category));
    }

    // In-stock filter
    if (params.inStock === "true") {
      queryConstraints.push(where("stock", ">", 0));
    }

    // Price range filter (requires client-side filtering for range)
    
    // Sorting - Firestore only supports orderBy on indexed fields
    switch (params.sort) {
      case "price-asc":
        queryConstraints.push(orderBy("price", "asc"));
        break;
      case "price-desc":
        queryConstraints.push(orderBy("price", "desc"));
        break;
      case "newest":
      default:
        queryConstraints.push(orderBy("createdAt", "desc"));
        break;
    }

    // Pagination
    queryConstraints.push(limit(pageSize));

    // Execute query
    const q = query(productsRef, ...queryConstraints);
    const snapshot = await getDocs(q);

    // Transform documents
    let products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        price: data.price,
        mrp: data.mrp,
        category: data.category,
        stock: data.stock,
        images: data.images || [],
        description: data.description,
        sareeDetails: data.sareeDetails || null,
        silverDetails: data.silverDetails || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Client-side filtering for price range (Firestore limitation)
    if (params.minPrice) {
      const min = parseFloat(params.minPrice);
      products = products.filter((p) => p.price >= min);
    }
    if (params.maxPrice) {
      const max = parseFloat(params.maxPrice);
      products = products.filter((p) => p.price <= max);
    }

    // Search filter (Firestore limitation - can't do text search efficiently)
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Get total count for pagination
    const countQuery = query(collection(db, "products"), where("isActive", "==", true));
    const countSnapshot = await getDocs(countQuery);
    const totalItems = countSnapshot.size;
    const totalPages = Math.ceil(totalItems / pageSize);

    return NextResponse.json({
      products,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: error.message },
      { status: 500 }
    );
  }
}
