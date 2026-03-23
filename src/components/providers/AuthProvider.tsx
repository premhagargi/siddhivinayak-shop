"use client";

import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  profileLoading: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  // For handling add to cart when not logged in
  pendingCartAction: { productId: string; quantity: number; price: number; name: string; image: string } | null;
  setPendingCartAction: (action: { productId: string; quantity: number; price: number; name: string; image: string } | null) => void;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (path: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}

function AuthProviderInner({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingCartAction, setPendingCartAction] = useState<{ productId: string; quantity: number; price: number; name: string; image: string } | null>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
  const profileFetchedRef = useRef(false);

  // Fetch profile data from API
  const fetchProfile = async (userId: string) => {
    // Prevent duplicate fetches
    if (profileFetchedRef.current) return;
    profileFetchedRef.current = true;
    
    setProfileLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${userId}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      profileFetchedRef.current = false; // Allow retry on error
    } finally {
      setProfileLoading(false);
    }
  };

  // Refresh profile data (without showing loading state)
  const refreshProfile = async () => {
    if (user?.id) {
      // Fetch without setting loading state to avoid UI flicker
      try {
        const res = await fetch("/api/users/profile", {
          headers: { Authorization: `Bearer ${user.id}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
          });
        }
      } catch (error) {
        console.error("Error refreshing profile:", error);
      }
    }
  };

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (session?.user) {
      const userId = (session.user as any).id || session.user.email || "";
      setUser({
        id: userId,
        email: session.user.email || "",
        name: session.user.name || undefined,
      });
      // Fetch profile data when session is available
      fetchProfile(userId);
    } else {
      setUser(null);
      setProfile(null);
      profileFetchedRef.current = false; // Reset on logout
    }
    setLoading(false);
  }, [session, status]);

  // Process pending cart action after login
  useEffect(() => {
    // If user is logged in and there's a pending cart action, process it
    if (user && pendingCartAction) {
      console.log("Processing pending cart action after login:", pendingCartAction);
      // The actual add to cart will be handled by the component that watches for this
      // We just clear the pending action here - the component should watch for user changes
    }
  }, [user, pendingCartAction]);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      
      // User state will be updated by the useEffect that watches session
      // But for demo mode, also set user directly
      if (!session?.user) {
        setUser({
          id: email,
          email: email,
          name: email.split('@')[0],
        });
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // For demo, create a demo user session
      // In production, this would create a Firebase user
      const result = await signIn("credentials", {
        email,
        password,
        name,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Update user state with the provided name
      setUser({
        id: email,
        email: email,
        name: name,
      });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      // Update local state
      if (user) {
        setUser({ ...user, ...data });
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileLoading,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        updateProfile,
        refreshProfile,
        pendingCartAction,
        setPendingCartAction,
        redirectAfterLogin,
        setRedirectAfterLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
