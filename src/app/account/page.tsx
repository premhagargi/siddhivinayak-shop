"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, MapPin, Heart, Settings, Loader2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ProfilePage() {
  const { user, profile, profileLoading, loading: authLoading } = useAuth();
  const router = useRouter();
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push(`/login?redirect=/account`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!user?.id) return;

      try {
        const addressesRes = await fetch("/api/users/addresses", {
          headers: { Authorization: `Bearer ${user.id}` },
        });
        if (addressesRes.ok) {
          const addressesData = await addressesRes.json();
          const defaultAddr = addressesData.addresses?.find((a: any) => a.isDefault) || addressesData.addresses?.[0];
          setDefaultAddress(defaultAddr);
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAddress();
    }
  }, [user?.id]);

  if (authLoading || profileLoading || loading) {
    return (
      <div className="container mx-auto px-4 pt-40 pb-12 md:px-8 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline text-2xl font-bold uppercase tracking-tight">Account Overview</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information and view your account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
  <Card className="rounded-none border-muted">
  <CardHeader className="flex flex-row items-center justify-between 
                         px-3 py-2 md:px-6 md:py-4 
                         pb-1 md:pb-2 space-y-0">
    <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
      Personal Details
    </CardTitle>

    <Link href="/account/profile">
      <Button 
        variant="link" 
        className="text-[10px] font-bold uppercase tracking-widest p-0 h-auto"
      >
        Edit
      </Button>
    </Link>
  </CardHeader>

  <CardContent className="px-3 pb-2 pt-0 
                          md:px-6 md:pt-4 md:pb-6 
                          space-y-2 md:space-y-4">
    
    <div className="space-y-0">
      <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground">
        Full Name
      </p>
      <p className="font-medium text-sm md:text-base leading-tight">
        {profile?.firstName || profile?.lastName 
          ? `${profile.firstName} ${profile.lastName}`.trim() 
          : user.name || "Not set"}
      </p>
    </div>

    <div className="space-y-0">
      <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground">
        Email Address
      </p>
      <p className="font-medium text-sm md:text-base leading-tight">
        {user.email}
      </p>
    </div>

  </CardContent>
</Card>

     <Card className="rounded-none border-muted">
  <CardHeader className="flex flex-row items-center justify-between 
                         px-3 py-2 md:px-6 md:py-4 
                         pb-1 md:pb-2 space-y-0">
    
    <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
      Default Address
    </CardTitle>

    <Link href="/account/addresses">
      <Button 
        variant="link" 
        className="text-[10px] font-bold uppercase tracking-widest p-0 h-auto"
      >
        Manage
      </Button>
    </Link>
  </CardHeader>

  <CardContent className="px-3 pb-2 pt-0 
                          md:px-6 md:pt-4 md:pb-6 
                          space-y-2 md:space-y-4">
    
    {defaultAddress ? (
      <div className="space-y-0.5">
        <p className="font-medium text-sm md:text-base leading-tight">
          {defaultAddress.label || "Home"}
        </p>

        <p className="text-[11px] md:text-xs text-muted-foreground leading-snug md:leading-relaxed">
          {defaultAddress.street}<br />
          {defaultAddress.city}, {defaultAddress.state} {defaultAddress.pincode}<br />
          {defaultAddress.country}
        </p>
      </div>
    ) : (
      <div className="space-y-2 md:space-y-3">
        <p className="text-xs md:text-sm text-muted-foreground">
          No address added yet.
        </p>

        <Link href="/account/addresses">
          <Button 
            variant="outline" 
            className="rounded-none text-[10px] font-bold uppercase tracking-widest py-1 px-2 md:px-4 md:py-2"
          >
            Add Address
          </Button>
        </Link>
      </div>
    )}

  </CardContent>
</Card>
      </div>

      <div className="space-y-4">
        <Link href="/account/orders" className="flex items-center justify-between p-4 border hover:bg-secondary/50 transition-colors">
          <span className="flex items-center gap-3 text-sm font-medium">
            <ShoppingBag className="h-4 w-4" /> My Orders
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link href="/account/addresses" className="flex items-center justify-between p-4 border hover:bg-secondary/50 transition-colors">
          <span className="flex items-center gap-3 text-sm font-medium">
            <MapPin className="h-4 w-4" /> Manage Addresses
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link href="/wishlist" className="flex items-center justify-between p-4 border hover:bg-secondary/50 transition-colors">
          <span className="flex items-center gap-3 text-sm font-medium">
            <Heart className="h-4 w-4" /> My Wishlist
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/account/profile" className="border p-6 flex flex-col gap-3 text-center items-center group cursor-pointer hover:border-accent transition-colors">
          <Settings className="h-8 w-8 text-accent/60 group-hover:text-accent transition-colors" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Security</h3>
          <p className="text-xs text-muted-foreground">Password & Profile Settings</p>
        </Link>
        <Link href="/shop" className="border p-8 flex flex-col gap-4 text-center items-center group cursor-pointer hover:border-accent transition-colors">
          <Heart className="h-8 w-8 text-accent/60 group-hover:text-accent transition-colors" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Continue Shopping</h3>
          <p className="text-xs text-muted-foreground">Browse our latest collection</p>
        </Link>
      </div>
    </div>
  );
}
