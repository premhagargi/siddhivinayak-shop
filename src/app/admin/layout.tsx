
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAdminAuthenticated");
    
    if (pathname === "/admin/login") {
      setIsAuthorized(true);
      return;
    }

    if (authStatus !== "true") {
      router.push("/admin/login");
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [router, pathname]);

  if (isAuthorized === null) return null;

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-72 border-r bg-secondary/10 hidden md:block">
        <AdminSidebar />
      </aside>
      <main className="flex-1 overflow-y-auto pt-24 md:pt-0">
        <div className="container mx-auto p-6 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
