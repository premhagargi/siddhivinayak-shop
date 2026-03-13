"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Admin Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50">
        <span className="font-headline text-xs font-bold uppercase tracking-widest">Siddhivinayak Admin</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-secondary/10 hidden md:block shrink-0">
        <AdminSidebar />
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
