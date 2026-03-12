
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, Heart, MapPin, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Profile Overview", href: "/account", icon: User },
  { name: "My Orders", href: "/account/orders", icon: ShoppingBag },
  { name: "Wishlist", href: "/wishlist", icon: Heart },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Account Settings", href: "/account/settings", icon: Settings },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold uppercase tracking-tight">My Account</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Welcome back, Anjali</p>
      </div>

      <nav className="flex flex-col border-t pt-8">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b last:border-0",
                isActive ? "text-accent border-accent" : "text-muted-foreground hover:text-primary border-transparent"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-accent" : "text-muted-foreground")} />
              {item.name}
            </Link>
          );
        })}
        <button className="flex items-center gap-3 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors text-left">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </nav>
    </div>
  );
}
