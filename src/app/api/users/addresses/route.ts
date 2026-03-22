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
 * GET /api/users/addresses
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

    const adminDb = getDbOrNull();
    if (!adminDb) {
      // Return demo addresses when Firebase is not configured
      console.log("Firebase not configured, returning demo addresses");
      return NextResponse.json({ 
        addresses: [
          {
            id: "demo-1",
            label: "Home",
            isDefault: true,
            name: "Demo User",
            street: "123 Main Street, Apt 4B",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            country: "India",
            phone: "+91 9876543210"
          }
        ] 
      });
    }

    const snapshot = await adminDb.collection("addresses").where("userId", "==", userId).get();
    
    const addresses = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        label: data.label,
        isDefault: data.isDefault,
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country || "India",
        phone: data.phone,
      };
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ error: "Failed to fetch addresses", details: error.message }, { status: 500 });
  }
}

/**
 * POST /api/users/addresses
 */
export async function POST(request: NextRequest) {
  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    const body = await request.json();
    return NextResponse.json({ 
      id: `demo-${Date.now()}`,
      message: "Address added successfully (demo mode)" 
    });
  }

  try {
    const body = await request.json();
    const { label, name, street, city, state, pincode, country, phone, isDefault } = body;

    if (!name || !street || !city || !state || !pincode || !phone) {
      return NextResponse.json({ error: "All address fields are required" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check if this is the first address - auto-set as default
    const existing = await adminDb.collection("addresses").where("userId", "==", userId).get();
    const isFirstAddress = existing.empty;
    const shouldBeDefault = isFirstAddress || isDefault;

    // If setting as default (or first address), unset others
    if (shouldBeDefault) {
      for (const docSnap of existing.docs) {
        await adminDb.collection("addresses").doc(docSnap.id).update({ isDefault: false });
      }
    }

    const newDocRef = adminDb.collection("addresses").doc();
    await newDocRef.set({
      userId,
      label: label || "Home",
      isDefault: shouldBeDefault,
      name,
      street,
      city,
      state,
      pincode,
      country: country || "India",
      phone,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: newDocRef.id, message: "Address added successfully" });
  } catch (error: any) {
    console.error("Error adding address:", error);
    return NextResponse.json({ error: "Failed to add address", details: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/users/addresses
 */
export async function PATCH(request: NextRequest) {
  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    return NextResponse.json({ message: "Address updated successfully (demo mode)" });
  }

  try {
    const body = await request.json();
    const { addressId, label, name, street, city, state, pincode, country, phone, isDefault } = body;

    // Support both query param and body for addressId
    if (!addressId) {
      const { searchParams } = new URL(request.url);
      const queryAddressId = searchParams.get("addressId");
      if (!queryAddressId) {
        return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
      }
    }
    
    const finalAddressId = addressId || new URL(request.url).searchParams.get("addressId");

    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const addressSnap = await adminDb.collection("addresses").doc(finalAddressId).get();
    
    if (!addressSnap.exists) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    
    const addressData = addressSnap.data();
    if (addressData?.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If setting as default, unset others
    if (isDefault) {
      const existing = await adminDb.collection("addresses").where("userId", "==", userId).get();
      for (const docSnap of existing.docs) {
        if (docSnap.id !== finalAddressId) {
          await adminDb.collection("addresses").doc(docSnap.id).update({ isDefault: false });
        }
      }
    }

    const updateData: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
    if (label !== undefined) updateData.label = label;
    if (name !== undefined) updateData.name = name;
    if (street !== undefined) updateData.street = street;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (country !== undefined) updateData.country = country;
    if (phone !== undefined) updateData.phone = phone;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    await adminDb.collection("addresses").doc(finalAddressId).update(updateData);

    return NextResponse.json({ message: "Address updated successfully" });
  } catch (error: any) {
    console.error("Error updating address:", error);
    return NextResponse.json({ error: "Failed to update address", details: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/users/addresses
 */
export async function DELETE(request: NextRequest) {
  const adminDb = getDbOrNull();
  
  if (!adminDb) {
    console.log("Firebase not configured, demo mode");
    return NextResponse.json({ message: "Address deleted successfully (demo mode)" });
  }

  try {
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("addressId");

    if (!addressId) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const userMatch = authHeader.match(/Bearer\s+(.+)/);
      if (userMatch) userId = userMatch[1];
    }

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const addressSnap = await adminDb.collection("addresses").doc(addressId).get();
    
    if (!addressSnap.exists) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    
    const addressData = addressSnap.data();
    if (addressData?.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await adminDb.collection("addresses").doc(addressId).delete();

    return NextResponse.json({ message: "Address deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting address:", error);
    return NextResponse.json({ error: "Failed to delete address", details: error.message }, { status: 500 });
  }
}
