
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AccountSidebar from "@/components/account/AccountSidebar";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2 } from "lucide-react";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip redirect on login page
    if (pathname === "/login" || pathname === "/account/login") return;
    
    if (!authLoading && !user) {
      // Redirect to login with the originally requested page as redirect target
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, authLoading, router, pathname]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 pt-40 pb-24 md:px-8 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render content if not logged in (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 pt-40 pb-24 md:px-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        <aside className="lg:w-72 flex-shrink-0">
          <AccountSidebar />
        </aside>
        <main className="flex-grow animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}
