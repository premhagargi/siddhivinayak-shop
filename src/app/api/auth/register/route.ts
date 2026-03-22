import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

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
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
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
        
        // Create new user (in production, hash the password with bcrypt!)
        await adminDb.collection("users").doc(email.toLowerCase()).set({
          email: email.toLowerCase(),
          password, // In production: hash this with bcrypt!
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
      // Demo mode - check against predefined users and limit registration
      const allowedEmails = ["demo@siddhivinayak.com", "anjali.k@example.com"];
      
      if (allowedEmails.includes(email.toLowerCase())) {
        return NextResponse.json(
          { error: "This email is reserved in demo mode" },
          { status: 409 }
        );
      }

      // Check if already registered in demo users
      const existingDemoUsers = [
        { email: "demo@siddhivinayak.com", password: "demo123", name: "Demo User" },
        { email: "anjali.k@example.com", password: "password123", name: "Anjali Kumar" },
      ];
      
      const exists = existingDemoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in." },
          { status: 409 }
        );
      }

      // Allow registration in demo mode
      console.log("Demo mode: Registration for", email);
      return NextResponse.json({
        message: "Account created successfully (demo mode)",
        user: { email: email.toLowerCase(), name: name.trim() }
      });
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again.", details: error.message },
      { status: 500 }
    );
  }
}
