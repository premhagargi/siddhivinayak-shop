import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

/**
 * GET /api/orders
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
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Try to get adminDb, return demo data if not available
    let adminDb;
    try {
      adminDb = getAdminDb();
    } catch (dbError) {
      // Return demo orders when Firebase is not configured
      console.log("Firebase not configured, returning demo orders");
      return NextResponse.json({ 
        orders: [
          {
            id: "demo-1",
            orderId: "ORD-123456",
            status: "delivered",
            paymentStatus: "paid",
            paymentMethod: "card",
            items: [
              { productId: "demo-p1", name: "Banarasi Silk Saree", quantity: 1, price: 24900 }
            ],
            summary: { subtotal: 24900, shipping: 0, gst: 1245, total: 26145 },
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "demo-2",
            orderId: "ORD-789012",
            status: "shipped",
            paymentStatus: "paid",
            paymentMethod: "upi",
            items: [
              { productId: "demo-p2", name: "Silver Laxmi Idol", quantity: 1, price: 8500 }
            ],
            summary: { subtotal: 8500, shipping: 0, gst: 425, total: 8925 },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ] 
      });
    }

    const snapshot = await adminDb.collection("orders").where("userId", "==", userId).orderBy("createdAt", "desc").get();
    
    if (snapshot.empty) {
      return NextResponse.json({ orders: [] });
    }

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: data.orderId,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        items: data.items,
        summary: data.summary,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders", details: error.message }, { status: 500 });
  }
}

/**
 * POST /api/orders
 */
export async function POST(request: NextRequest) {
  let adminDb;
  
  // Try to get adminDb, return error if not available
  try {
    adminDb = getAdminDb();
  } catch (dbError) {
    // In demo mode, simulate order creation
    console.log("Firebase not configured, creating demo order");
    const body = await request.json();
    const { items, shippingAddress, paymentMethod } = body;
    
    const subtotal = items?.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0) || 0;
    const shippingCost = subtotal > 10000 ? 0 : 500;
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + shippingCost + gst;
    
    return NextResponse.json({
      id: `demo-${Date.now()}`,
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      message: "Order created successfully (demo mode)",
      summary: { subtotal, shipping: shippingCost, gst, total },
    });
  }

  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethod, shippingMethod = "express", guestEmail } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return NextResponse.json({ error: "Shipping address is incomplete" }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    const subtotal = items.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0);
    const shippingCost = subtotal > 10000 || shippingMethod === "express" ? 0 : 500;
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + shippingCost + gst;

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    const newDocRef = adminDb.collection("orders").doc();
    await newDocRef.set({
      orderId,
      userId,
      guestEmail: userId ? null : guestEmail,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod,
      items,
      shippingAddress,
      summary: {
        subtotal,
        shipping: shippingCost,
        gst,
        total,
      },
      shippingMethod,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: newDocRef.id,
      orderId,
      message: "Order created successfully",
      summary: { subtotal, shipping: shippingCost, gst, total },
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 });
  }
}
