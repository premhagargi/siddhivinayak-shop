
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, ChevronRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Product Catalog", href: "/admin/products", icon: Package },
  { name: "Order History", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customer Data", href: "/admin/customers", icon: Users },
  { name: "Homepage Manager", href: "/admin/homepage", icon: ImageIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    router.push("/admin/login");
  };

  return (
    <div className="flex flex-col h-screen sticky top-0 p-8">
      <div className="mb-12">
        <Link href="/" className="font-headline text-lg font-bold tracking-[0.3em] uppercase">
          SIDDHIVINAYAK
          <span className="block text-[8px] tracking-[0.4em] text-accent mt-1">Management Portal</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between py-4 px-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b border-transparent",
                isActive 
                  ? "text-primary border-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <span className="flex items-center gap-4">
                <item.icon className={cn("h-4 w-4", isActive ? "text-accent" : "text-muted-foreground group-hover:text-primary")} />
                {item.name}
              </span>
              {isActive && <div className="h-1 w-1 bg-accent rounded-full" />}
            </Link>
          );
        })}
      </nav>

      <div className="pt-8 border-t space-y-4">
        <Link 
          href="/admin/settings"
          className="flex items-center gap-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
        >
          <Settings className="h-4 w-4" />
          General Settings
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
