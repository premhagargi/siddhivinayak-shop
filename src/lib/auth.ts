import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAdminDb } from "@/lib/firebase-admin";
import bcrypt from "bcryptjs";

function getDbOrNull() {
  try {
    return getAdminDb();
  } catch {
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
            
            // Verify password with bcrypt
            // Migration: if stored password is plaintext (not a bcrypt hash), compare directly and re-hash
            let passwordValid = false;
            if (userData.password.startsWith("$2a$") || userData.password.startsWith("$2b$")) {
              passwordValid = await bcrypt.compare(credentials.password, userData.password);
            } else {
              // Legacy plaintext password — compare directly, then migrate to bcrypt
              passwordValid = userData.password === credentials.password;
              if (passwordValid) {
                try {
                  const hashed = await bcrypt.hash(credentials.password, 12);
                  await adminDb.collection("users").doc(userSnap.id).update({ password: hashed });
                  console.log("Migrated plaintext password to bcrypt for:", userData.email);
                } catch (e) {
                  console.error("Failed to migrate password:", e);
                }
              }
            }

            if (!passwordValid) {
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
          // Demo mode - Firebase not configured, deny login
          console.warn("Firebase not configured, login unavailable");
          return null;
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
  secret: process.env.NEXTAUTH_SECRET,
};
