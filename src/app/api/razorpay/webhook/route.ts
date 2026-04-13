import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * POST /api/razorpay/webhook
 * Handles Razorpay webhook events (payment.captured, payment.failed, etc.)
 * Configure this URL in Razorpay Dashboard > Settings > Webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET not configured, skipping webhook");
      return NextResponse.json({ status: "skipped" }, { status: 200 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    console.log("Razorpay webhook received:", eventType);

    if (eventType === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount; // in paise

      const adminDb = getAdminDb();
      if (!adminDb) {
        console.warn("Firebase not available, cannot process webhook");
        return NextResponse.json({ status: "ok" }, { status: 200 });
      }

      // Find the order by razorpayOrderId in paymentDetails or metadata
      const ordersSnapshot = await adminDb
        .collection("orders")
        .where("paymentDetails.razorpayOrderId", "==", razorpayOrderId)
        .limit(1)
        .get();

      if (!ordersSnapshot.empty) {
        const orderDoc = ordersSnapshot.docs[0];
        const orderData = orderDoc.data();

        // Only update if not already marked as paid
        if (orderData.paymentStatus !== "paid") {
          await orderDoc.ref.update({
            paymentStatus: "paid",
            status: "confirmed",
            "paymentDetails.status": "paid",
            "paymentDetails.transactionId": paymentId,
            "paymentDetails.paidAt": new Date().toISOString(),
            "paymentDetails.amountPaise": amount,
            updatedAt: new Date(),
          });
          console.log(`Order ${orderDoc.id} marked as paid via webhook`);
        }
      } else {
        console.log(`No order found for Razorpay order ${razorpayOrderId}`);
      }
    }

    if (eventType === "payment.failed") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const adminDb = getAdminDb();
      if (!adminDb) {
        return NextResponse.json({ status: "ok" }, { status: 200 });
      }

      const ordersSnapshot = await adminDb
        .collection("orders")
        .where("paymentDetails.razorpayOrderId", "==", razorpayOrderId)
        .limit(1)
        .get();

      if (!ordersSnapshot.empty) {
        const orderDoc = ordersSnapshot.docs[0];
        await orderDoc.ref.update({
          paymentStatus: "failed",
          "paymentDetails.status": "failed",
          "paymentDetails.failedAt": new Date().toISOString(),
          "paymentDetails.failReason": payment.error_description || "Payment failed",
          updatedAt: new Date(),
        });
        console.log(`Order ${orderDoc.id} marked as failed via webhook`);
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    // Return 200 even on error to prevent Razorpay from retrying indefinitely
    return NextResponse.json({ status: "error", message: error.message }, { status: 200 });
  }
}
