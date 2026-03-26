import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * POST /api/razorpay/verify-payment
 * Verifies the payment signature from Razorpay
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification details" },
        { status: 400 }
      );
    }

    // Check if Razorpay credentials are configured
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.warn("Razorpay credentials not configured, simulating verification");
      
      // In demo mode, always return success
      return NextResponse.json({
        verified: true,
        message: "Payment verified (demo mode)",
        demo: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    }

    // Verify the signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid signature", verified: false },
        { status: 400 }
      );
    }

    // Payment verified successfully
    return NextResponse.json({
      verified: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error.message, verified: false },
      { status: 500 }
    );
  }
}