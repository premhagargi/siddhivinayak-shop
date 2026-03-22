
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, ShoppingBag, Heart, MapPin, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { name: "Dashboard", href: "/account", icon: User },
  { name: "Orders", href: "/account/orders", icon: ShoppingBag },
  { name: "Wishlist", href: "/wishlist", icon: Heart },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  // Get display name - prefer fresh profile name, then session name, then email
  const fullName = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") : null;
  const displayName = fullName || user?.name || user?.email?.split('@')[0] || "User";
  const displayEmail = user?.email || "";

  return (
    <div className="flex flex-col gap-12 sticky top-40">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-tight font-headline">My Account</h2>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Authenticated as</p>
          <p className="text-xs font-medium truncate" title={displayEmail}>{displayName}</p>
          {displayEmail && displayName !== displayEmail && (
            <p className="text-[10px] text-muted-foreground truncate" title={displayEmail}>{displayEmail}</p>
          )}
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between py-3 px-0 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b border-transparent",
                  isActive 
                    ? "text-primary border-primary" 
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <span className="flex items-center gap-4">
                  <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-accent" : "text-muted-foreground group-hover:text-primary")} strokeWidth={1.5} />
                  {item.name}
                </span>
                {isActive && <div className="h-1 w-1 bg-accent rounded-full" />}
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 pt-8 border-t border-muted/30 space-y-1">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors text-left w-full"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </nav>
      
      <div className="pt-8 border-t mt-auto">
        <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground leading-relaxed">
          Need assistance?<br />
          <Link href="/contact" className="text-primary hover:underline">Contact Concierge</Link>
        </p>
      </div>
    </div>
  );
}
