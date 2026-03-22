import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAdminDb } from "@/lib/firebase-admin";

// Helper to get adminDb or null
let adminDbInstance: any = null;

function getDbOrNull() {
  // Return cached instance if available
  if (adminDbInstance) {
    return adminDbInstance;
  }
  
  try {
    const db = getAdminDb();
    adminDbInstance = db;
    console.log("Firebase Admin DB initialized successfully");
    return db;
  } catch (error) {
    console.log("Firebase Admin DB not available - using demo mode");
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text", placeholder: "Your Name" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const adminDb = getDbOrNull();
        
        // If Firebase is configured, verify against users collection
        if (adminDb) {
          try {
            // Get the email - try both original and lowercase
            const emailInput = credentials.email.toLowerCase().trim();
            
            // First, try to find user by email directly (doc ID)
            let userSnap = await adminDb.collection("users").doc(emailInput).get();
            
            // If not found by doc, try querying by email field
            if (!userSnap.exists) {
              const emailQuery = await adminDb.collection("users")
                .where("email", "==", emailInput)
                .get();
              
              if (!emailQuery.empty) {
                userSnap = emailQuery.docs[0];
              }
            }
            
            // Also check if they registered with phone number
            if (!userSnap.exists) {
              const phoneClean = credentials.email.replace(/\D/g, "");
              if (phoneClean.length >= 10) {
                const phoneQuery = await adminDb.collection("users")
                  .where("phone", "==", phoneClean)
                  .get();
                
                if (!phoneQuery.empty) {
                  userSnap = phoneQuery.docs[0];
                }
              }
            }
            
            if (!userSnap.exists) {
              // User not found - need to register first
              console.log("User not found for:", credentials.email);
              return null;
            }
            
            const userData = userSnap.data();
            
            if (!userData) {
              console.log("User data is empty for:", credentials.email);
              return null;
            }
            
            console.log("Found user:", userData.email, "password match:", userData.password === credentials.password);
            
            // Verify password (in production, use proper password hashing like bcrypt)
            if (userData.password !== credentials.password) {
              console.log("Password mismatch for:", credentials.email);
              return null;
            }
            
            // Return verified user - use email as ID for consistency
            return {
              id: userData.email.toLowerCase(),
              email: userData.email,
              name: userData.name,
            };
          } catch (error) {
            console.error("Auth error:", error);
            return null;
          }
        } else {
          // Demo mode - only allow predefined demo users
          const demoUsers = [
            { email: "demo@siddhivinayak.com", password: "demo123", name: "Demo User" },
            { email: "anjali.k@example.com", password: "password123", name: "Anjali Kumar" },
          ];
          
          const validUser = demoUsers.find(
            u => u.email === credentials.email && u.password === credentials.password
          );
          
          if (!validUser) {
            return null;
          }
          
          return {
            id: validUser.email,
            email: validUser.email,
            name: validUser.name,
          };
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      // Handle session update (e.g., after sign up with name)
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "siddhivinayak-shop-secret-key",
};
