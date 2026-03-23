"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  User, 
  ChevronRight, 
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * AccountMobileView - Mobile card-based account home
 * Used on: /account (mobile only)
 * 
 * This component provides the account home screen with card-based navigation
 * to various account sections. Header is handled by AppLayout.
 */
export default function AccountMobileView() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [orderCount, setOrderCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.id) return;

      try {
        // Fetch order count
        const ordersRes = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${user.id}` },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrderCount(ordersData.orders?.length || 0);
        }

        // Fetch address count
        const addressesRes = await fetch("/api/users/addresses", {
          headers: { Authorization: `Bearer ${user.id}` },
        });
        if (addressesRes.ok) {
          const addressesData = await addressesRes.json();
          setAddressCount(addressesData.addresses?.length || 0);
        }

        // Fetch wishlist count
        const wishlistRes = await fetch("/api/wishlist", {
          headers: { Authorization: `Bearer ${user.id}` },
        });
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          setWishlistCount(wishlistData.wishlist?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchCounts();
    }
  }, [user?.id]);

  // Account Home - Card-based layout
  const fullName = profile 
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") 
    : null;
  const displayName = fullName || user?.name || user?.email?.split('@')[0] || "User";

  const menuItems = [
    {
      title: "My Orders",
      subtitle: orderCount > 0 ? `${orderCount} order${orderCount !== 1 ? 's' : ''}` : "No orders yet",
      icon: ShoppingBag,
      href: "/account/orders",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "My Wishlist",
      subtitle: wishlistCount > 0 ? `${wishlistCount} item${wishlistCount !== 1 ? 's' : ''} saved` : "No items saved",
      icon: Heart,
      href: "/wishlist",
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Manage Addresses",
      subtitle: addressCount > 0 ? `${addressCount} address${addressCount !== 1 ? 's' : ''}` : "No addresses added",
      icon: MapPin,
      href: "/account/addresses",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Profile Details",
      subtitle: "Update your personal info",
      icon: User,
      href: "/account/profile",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-4">
      {/* User Greeting */}
      <div className="py-2">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <p className="text-lg font-semibold">{displayName}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
            {menuItems.slice(0, 4).map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="h-full border hover:border-accent transition-colors cursor-pointer">
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Links List */}
          <div className="space-y-1 pt-2">
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex items-center justify-between p-3 bg-card rounded-lg border hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Sign Out Button */}
      <div className="pt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={async () => {
            const { useAuth } = await import("@/components/providers/AuthProvider");
            const { useToast } = await import("@/hooks/use-toast");
            const { signOut } = useAuth();
            const { toast } = useToast();
            
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
          }}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
