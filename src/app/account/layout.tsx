"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getLayoutConfig } from "@/lib/layout-config";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Skip redirect on login page
    if (pathname === "/login" || pathname === "/account/login") return;
    
    if (!authLoading && !user) {
      // Redirect to login with the originally requested page as redirect target
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, authLoading, router, pathname]);

  // Show loading while checking auth
  if (authLoading || !mounted) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12 md:px-8 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render content if not logged in (will redirect)
  if (!user) {
    return null;
  }

  // Desktop layout - Keep existing sidebar + content
  // Mobile: AppLayout handles minimal navbar, so we just render the content
  if (!isMobile) {
    const AccountSidebar = require("@/components/account/AccountSidebar").default;
    return (
      <div className="container mx-auto px-4 pt-24 pb-24 md:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <aside className="lg:w-64 flex-shrink-0">
            <AccountSidebar />
          </aside>
          <main className="flex-grow animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Mobile: Just render children - AppLayout handles the minimal navbar
  // Content has proper padding from the page
  return (
    <div className="px-4 pb-8">
      {children}
    </div>
  );
}
