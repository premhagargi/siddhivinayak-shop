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
 * GET /api/admin/orders
 */
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, returning demo orders");
    return NextResponse.json({
      orders: [
        {
          id: "demo-1",
          orderId: "ORD-123456",
          userId: "demo@example.com",
          guestEmail: null,
          status: "delivered",
          paymentStatus: "paid",
          paymentMethod: "card",
          items: [{ productId: "p1", name: "Saree", quantity: 1, price: 24900 }],
          summary: { subtotal: 24900, shipping: 0, gst: 1245, total: 26145 },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false }
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageLimit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    let query = adminDb.collection("orders").orderBy("createdAt", "desc");
    
    const snapshot = await query.get();
    let orders = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: data.orderId,
        userId: data.userId,
        guestEmail: data.guestEmail,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        paymentDetails: data.paymentDetails || null,
        items: data.items,
        shippingAddress: data.shippingAddress || null,
        shippingMethod: data.shippingMethod || null,
        trackingNumber: data.trackingNumber || null,
        summary: data.summary,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Filter if needed
    if (status && status !== "All") {
      orders = orders.filter((o: any) => o.status === status.toLowerCase());
    }
    
    if (paymentStatus) {
      orders = orders.filter((o: any) => o.paymentStatus === paymentStatus.toLowerCase());
    }

    const totalItems = orders.length;
    const totalPages = Math.ceil(totalItems / pageLimit);
    const start = (page - 1) * pageLimit;
    const paginatedOrders = orders.slice(start, start + pageLimit);

    return NextResponse.json({
      orders: paginatedOrders,
      pagination: {
        page,
        pageSize: pageLimit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders", details: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/orders
 */
export async function PATCH(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    return NextResponse.json({ message: "Order updated successfully (demo mode)" });
  }

  try {
    const body = await request.json();
    const { orderId, status, trackingNumber, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const snapshot = await adminDb.collection("orders").where("orderId", "==", orderId).get();
    
    if (snapshot.empty) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderDocId = snapshot.docs[0].id;
    const updateData: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    await adminDb.collection("orders").doc(orderDocId).update(updateData);

    return NextResponse.json({ message: "Order updated successfully", orderId });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order", details: error.message }, { status: 500 });
  }
}
