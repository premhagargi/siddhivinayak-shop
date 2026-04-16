import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  getDeliveryCache,
  setDeliveryCache,
  calculateDeliveryCharge,
  DeliveryChargesConfig,
  DEFAULT_DELIVERY_CONFIG,
} from "@/lib/delivery-cache";

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

/** Fetch delivery charges config from cache or Firestore */
async function getDeliveryConfig(): Promise<DeliveryChargesConfig> {
  const cached = getDeliveryCache();
  if (cached.fresh && cached.data) return cached.data;

  try {
    const adminDb = getAdminDb();
    if (!adminDb) return cached.data || DEFAULT_DELIVERY_CONFIG;
    const docSnap = await adminDb.collection("deliveryCharges").doc("config").get();

    if (!docSnap.exists) return DEFAULT_DELIVERY_CONFIG;

    const data = docSnap.data();
    const config: DeliveryChargesConfig = {
      type: data?.type || "fixed",
      fixedCharge: data?.fixedCharge ?? 0,
      freeDeliveryEnabled: data?.freeDeliveryEnabled ?? true,
      freeDeliveryThreshold: data?.freeDeliveryThreshold ?? 0,
      ranges: data?.ranges || [],
    };

    setDeliveryCache(config);
    return config;
  } catch {
    return cached.data || DEFAULT_DELIVERY_CONFIG;
  }
}

/**
 * GET /api/orders
 * GET /api/orders?id=orderId - Get specific order
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("id");

  try {
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    // Try to get adminDb, return demo data if not available
    let adminDb;
    try {
      adminDb = getAdminDb();
    } catch (dbError) {
      // Return demo orders when Firebase is not configured
      console.log("Firebase not configured, returning demo orders");
      
      const demoOrders = [
        {
          id: "demo-1",
          orderId: "ORD-123456",
          status: "delivered",
          paymentStatus: "paid",
          paymentMethod: "card",
          items: [
            { productId: "demo-p1", name: "Banarasi Silk Saree", image: "https://picsum.photos/seed/s1/200/300", quantity: 1, price: 24900 }
          ],
          shippingAddress: {
            name: "Demo User",
            street: "123 Main Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            country: "India",
            phone: "+91 9876543210",
          },
          shippingMethod: "express",
          summary: { subtotal: 24900, shipping: 0, gst: 1245, discount: 0, total: 26145 },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          paymentDetails: { method: "card", status: "paid" }
        },
        {
          id: "demo-2",
          orderId: "ORD-789012",
          status: "shipped",
          paymentStatus: "paid",
          paymentMethod: "upi",
          items: [
            { productId: "demo-p2", name: "Silver Laxmi Idol", image: "https://picsum.photos/seed/s2/200/300", quantity: 1, price: 8500 }
          ],
          shippingAddress: {
            name: "Demo User",
            street: "123 Main Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            country: "India",
            phone: "+91 9876543210",
          },
          shippingMethod: "express",
          summary: { subtotal: 8500, shipping: 0, gst: 425, discount: 0, total: 8925 },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          paymentDetails: { method: "upi", status: "paid" }
        }
      ];

      // If fetching specific order
      if (orderId) {
        const foundOrder = demoOrders.find(o => o.id === orderId || o.orderId === orderId);
        if (foundOrder) {
          return NextResponse.json({ orders: [foundOrder] });
        }
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      
      return NextResponse.json({ orders: demoOrders });
    }

    // If fetching specific order by ID
    if (orderId) {
      if (!userId) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      
      const orderSnap = await adminDb!.collection("orders").doc(orderId).get();
      
      if (!orderSnap.exists) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      
      const orderData = orderSnap.data();
      
      // Verify the order belongs to this user
      if (orderData?.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      
      return NextResponse.json({
        orders: [{
          id: orderSnap.id,
          orderId: orderData.orderId,
          status: orderData.status,
          paymentStatus: orderData.paymentStatus,
          paymentMethod: orderData.paymentMethod,
          items: orderData.items,
          shippingAddress: orderData.shippingAddress,
          shippingMethod: orderData.shippingMethod,
          summary: orderData.summary,
          createdAt: orderData.createdAt?.toDate?.()?.toISOString() || null,
          paymentDetails: orderData.paymentDetails,
        }]
      });
    }

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const snapshot = await adminDb!.collection("orders").where("userId", "==", userId).orderBy("createdAt", "desc").get();
    
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
        shippingAddress: data.shippingAddress,
        shippingMethod: data.shippingMethod,
        summary: data.summary,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        paymentDetails: data.paymentDetails,
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
    const { items, shippingAddress, paymentMethod, shippingMethod } = body;
    
    const subtotal = items?.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0) || 0;
    const deliveryConf = await getDeliveryConfig();
    const shippingCost = calculateDeliveryCharge(deliveryConf, subtotal);
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + shippingCost + gst;
    
    // Deduct stock in demo mode (using client SDK that should already be imported)
    try {
      console.log("Demo mode: Starting stock deduction, items:", items);
      
      for (const item of items) {
        console.log(`Demo: Processing item: ${item.productId}, quantity: ${item.quantity}`);
        
        const productRef = doc(db, "products", item.productId);
        const productSnapshot = await getDoc(productRef);
        
        if (productSnapshot.exists()) {
          const productData = productSnapshot.data();
          const currentStock = productData.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          
          console.log(`Demo: Current stock: ${currentStock}, New stock: ${newStock}`);
          
          await updateDoc(productRef, {
            stock: newStock,
            updatedAt: new Date(),
          });
          
          console.log(`Demo: Stock deducted for product ${item.productId}`);
        } else {
          console.log(`Demo: Product ${item.productId} not found`);
        }
      }
    } catch (stockError) {
      console.log("Demo mode stock error:", stockError);
    }
    
    return NextResponse.json({
      id: `demo-${Date.now()}`,
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      message: "Order created successfully (demo mode)",
      summary: { subtotal, shipping: shippingCost, gst, total },
    });
  }

  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethod, shippingMethod = "express", guestEmail, paymentDetails } = body;

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
    const deliveryConf = await getDeliveryConfig();
    const shippingCost = calculateDeliveryCharge(deliveryConf, subtotal);
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + shippingCost + gst;

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    const resolvedPaymentStatus = paymentDetails?.status === "paid" ? "paid" : "pending";

    const newDocRef = adminDb!.collection("orders").doc();
    await newDocRef.set({
      orderId,
      userId,
      guestEmail: userId ? null : guestEmail,
      status: resolvedPaymentStatus === "paid" ? "confirmed" : "pending",
      paymentStatus: resolvedPaymentStatus,
      paymentMethod,
      paymentDetails: paymentDetails || null,
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

    // Deduct stock for each item in the order
    try {
      console.log("Starting stock deduction for items:", items);
      
      for (const item of items) {
        console.log(`Processing item: ${item.productId}, quantity: ${item.quantity}`);
        
        const productRef = doc(db, "products", item.productId);
        const productSnapshot = await getDoc(productRef);
        
        if (productSnapshot.exists()) {
          const productData = productSnapshot.data();
          const currentStock = productData.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          
          console.log(`Current stock: ${currentStock}, New stock: ${newStock}`);
          
          await updateDoc(productRef, {
            stock: newStock,
            updatedAt: new Date(),
          });
          
          console.log(`Stock deducted successfully for product ${item.productId}`);
        } else {
          console.log(`Product ${item.productId} not found in database, skipping stock deduction`);
        }
      }
      
      console.log("Stock deduction completed");
    } catch (stockError) {
      console.error("Error deducting stock:", stockError);
      // Order is still created, stock deduction failure shouldn't rollback the order
    }

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
