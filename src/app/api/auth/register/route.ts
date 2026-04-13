import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import bcrypt from "bcryptjs";

// Helper to get adminDb or null
function getDbOrNull() {
  try {
    return getAdminDb();
  } catch {
    return null;
  }
}

/**
 * POST /api/auth/register
 * Register a new customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name" },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (phone) {
      const phoneRegex = /^[6-9]\d{9}$/; // Indian phone format
      const phoneClean = phone.replace(/\D/g, ""); // Remove non-digits
      if (phoneClean.length > 0 && !phoneRegex.test(phoneClean)) {
        return NextResponse.json(
          { error: "Please enter a valid 10-digit phone number" },
          { status: 400 }
        );
      }
    }

    const adminDb = getDbOrNull();

    // If Firebase is configured, create user in Firestore
    if (adminDb) {
      try {
        // Check if user already exists by email
        const existingSnap = await adminDb.collection("users").doc(email.toLowerCase()).get();

        if (existingSnap.exists) {
          return NextResponse.json(
            { error: "An account with this email already exists. Please sign in." },
            { status: 409 }
          );
        }

        // Check if phone number is already registered (if provided)
        if (phone) {
          const phoneQuery = await adminDb.collection("users")
            .where("phone", "==", phone.replace(/\D/g, ""))
            .get();
          
          if (!phoneQuery.empty) {
            return NextResponse.json(
              { error: "This phone number is already registered. Please use a different number." },
              { status: 409 }
            );
          }
        }

        // Split name into firstName and lastName
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 12);

        await adminDb.collection("users").doc(email.toLowerCase()).set({
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name.trim(),
          firstName,
          lastName,
          phone: phone ? phone.replace(/\D/g, "") : "",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
          message: "Account created successfully",
          user: { email: email.toLowerCase(), name: name.trim() }
        });
      } catch (dbError: any) {
        console.error("Database error:", dbError);
        return NextResponse.json(
          { error: "Failed to create account", details: dbError.message },
          { status: 500 }
        );
      }
    } else {
      // Firebase not configured — registration unavailable
      return NextResponse.json(
        { error: "Registration is currently unavailable. Please try again later." },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again.", details: error.message },
      { status: 500 }
    );
  }
}
