
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ChevronRight, MapPin, CreditCard, Heart, Settings } from "lucide-react";

export default function ProfilePage() {
  const recentOrders = [
    { id: "ORD-9281", date: "Oct 24, 2023", status: "Delivered", total: 24900 },
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Account Overview</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information and track your latest orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-none border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.2em]">Personal Details</CardTitle>
            <Button variant="link" className="text-[10px] font-bold uppercase tracking-widest p-0">Edit</Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</p>
              <p className="font-medium">Anjali Kapoor</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Email Address</p>
              <p className="font-medium">anjali.k@example.com</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Phone</p>
              <p className="font-medium">+91 98765 43210</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.2em]">Default Address</CardTitle>
            <Button variant="link" className="text-[10px] font-bold uppercase tracking-widest p-0">Manage</Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex gap-3">
              <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="font-medium">Home</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  45/A, Platinum Towers, Link Road<br />
                  Andheri West, Mumbai, MH 400053<br />
                  India
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> Recent Order
          </h2>
          <Link href="/account/orders" className="text-[10px] font-bold uppercase tracking-widest hover:text-accent flex items-center gap-1 transition-colors">
            View All Orders <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="border border-muted p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-secondary/20 transition-colors">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order ID</p>
              <p className="font-medium">#{recentOrders[0].id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Placed On</p>
              <p className="font-medium">{recentOrders[0].date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
              <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest">
                {recentOrders[0].status}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="font-bold text-lg">₹{recentOrders[0].total.toLocaleString('en-IN')}</p>
            </div>
            <Link href={`/account/orders/${recentOrders[0].id}`}>
              <Button variant="outline" size="sm" className="rounded-none border-primary text-[10px] font-bold uppercase tracking-widest w-full md:w-auto">
                Details
              </Button>
            </Link>
          </div>
        ) : (
          <div className="border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Link href="/shop">
              <Button className="rounded-none bg-primary text-[10px] font-bold uppercase tracking-widest">Start Shopping</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="border p-8 flex flex-col gap-4 text-center items-center group cursor-pointer hover:border-accent transition-colors">
          <CreditCard className="h-8 w-8 text-accent/60 group-hover:text-accent transition-colors" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Payment Methods</h3>
          <p className="text-xs text-muted-foreground">Saved cards & UPI</p>
        </div>
        <div className="border p-8 flex flex-col gap-4 text-center items-center group cursor-pointer hover:border-accent transition-colors">
          <Heart className="h-8 w-8 text-accent/60 group-hover:text-accent transition-colors" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">My Wishlist</h3>
          <p className="text-xs text-muted-foreground">Items you love</p>
        </div>
        <div className="border p-8 flex flex-col gap-4 text-center items-center group cursor-pointer hover:border-accent transition-colors">
          <Settings className="h-8 w-8 text-accent/60 group-hover:text-accent transition-colors" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Security</h3>
          <p className="text-xs text-muted-foreground">Password & Auth</p>
        </div>
      </div>
    </div>
  );
}
