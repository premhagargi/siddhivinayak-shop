
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Package, Truck, CheckCircle, CreditCard, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionFadeIn from "@/components/animations/SectionFadeIn";

const ORDER_MOCK = {
  id: "ORD-9281",
  date: "Oct 24, 2023",
  status: "Delivered",
  deliveryDate: "Oct 28, 2023",
  shippingMethod: "Express Premium",
  paymentMethod: "Visa ending in 4242",
  address: {
    name: "Anjali Kapoor",
    street: "45/A, Platinum Towers, Link Road",
    city: "Andheri West, Mumbai, MH 400053",
    country: "India"
  },
  items: [
    { 
      id: "1", 
      name: "Royal Maroon Silk Banarasi", 
      image: "https://picsum.photos/seed/s1/200/300", 
      qty: 1, 
      price: 24900,
      category: "Saree"
    }
  ],
  summary: {
    subtotal: 24900,
    shipping: 0,
    gst: 0,
    total: 24900
  }
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const order = ORDER_MOCK; // In a real app, fetch by id

  return (
    <SectionFadeIn className="space-y-12 pb-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b pb-8">
        <div className="space-y-2">
          <Link href="/account/orders" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-4">
            <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> Back to Orders
          </Link>
          <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Order {order.id}</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Placed on {order.date}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest">
            {order.status}
          </span>
          <Button variant="outline" className="h-10 rounded-none border-muted text-[10px] font-bold uppercase tracking-widest">
            Invoice PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Items & Status */}
        <div className="lg:col-span-2 space-y-12">
          {/* Status Timeline Placeholder */}
          <div className="border border-muted p-8 bg-secondary/10">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
              <Package className="h-4 w-4" /> Shipment Status
            </h3>
            <div className="flex justify-between items-start max-w-md relative">
              <div className="absolute top-4 left-0 right-0 h-[1px] bg-muted -z-0" />
              {[
                { label: "Confirmed", date: "Oct 24", done: true },
                { label: "Shipped", date: "Oct 26", done: true },
                { label: "Delivered", date: "Oct 28", done: true },
              ].map((s, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 relative z-10 bg-background md:bg-transparent px-2">
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                    s.done ? "border-accent bg-accent text-white" : "border-muted bg-white text-muted-foreground"
                  }`}>
                    {s.done ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest">{s.label}</p>
                    <p className="text-[8px] text-muted-foreground uppercase">{s.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b pb-4">Ordered Items</h3>
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-8 items-center py-4">
                <div className="relative h-28 w-20 bg-muted flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-grow">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{item.category}</span>
                  <h4 className="text-sm font-bold uppercase tracking-tight mt-1">{item.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Quantity: {item.qty}</p>
                </div>
                <p className="text-sm font-bold">₹{item.price.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details Sidebar */}
        <div className="space-y-12">
          {/* Shipping Info */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b pb-4 flex items-center gap-2">
              <Truck className="h-4 w-4" /> Shipping & Payment
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <MapPin className="h-3 w-3" /> Delivery Address
                </p>
                <div className="text-xs font-medium leading-relaxed">
                  <p>{order.address.name}</p>
                  <p>{order.address.street}</p>
                  <p>{order.address.city}</p>
                  <p>{order.address.country}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-3 w-3" /> Payment Method
                </p>
                <p className="text-xs font-medium">{order.paymentMethod}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Shipping Method</p>
                <p className="text-xs font-medium">{order.shippingMethod}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-secondary/30 p-8 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-muted pb-4">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.summary.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>Shipping</span>
                <span className="text-accent">Free</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>GST (Included)</span>
                <span>₹0</span>
              </div>
              <div className="pt-4 border-t border-muted flex justify-between text-sm font-bold uppercase tracking-tight">
                <span>Total Paid</span>
                <span>₹{order.summary.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionFadeIn>
  );
}
