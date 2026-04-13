import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

/**
 * POST /api/razorpay/create-order
 * Creates a Razorpay order for the checkout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", items, userId, guestEmail } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount: Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Check if Razorpay credentials are configured
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If no credentials, return demo mode response
    if (!keyId || !keySecret || keyId === "" || keySecret === "") {
      console.log("Razorpay credentials not configured, using demo mode");
      
      const demoOrderId = `demo_${Date.now()}`;
      
      return NextResponse.json({
        id: demoOrderId,
        entity: "order",
        amount: Math.round(amount * 100),
        amount_paid: 0,
        amount_due: Math.round(amount * 100),
        currency,
        receipt: `receipt_${Date.now()}`,
        status: "created",
        notes: {
          userId: userId || "guest",
          itemsCount: items?.length || 0,
        },
        createdAt: Date.now(),
        key_id: "demo",
        demo: true,
      });
    }

    // Initialize Razorpay with actual credentials
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create actual Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId || "guest",
        itemsCount: items?.length || 0,
        guestEmail: guestEmail || "",
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      entity: order.entity,
      amount: order.amount,
      amount_paid: order.amount_paid,
      amount_due: order.amount_due,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      notes: order.notes,
      createdAt: order.created_at,
      key_id: keyId,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    
    // Return detailed error message
    const errorMessage = error.message || "Unknown error";
    
    return NextResponse.json(
      { 
        error: "Failed to create payment order", 
        details: errorMessage,
        hint: errorMessage.includes("invalid") ? "Check your Razorpay API keys" : undefined
      },
      { status: 500 }
    );
  }
}