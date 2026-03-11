"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const cartItems = [
    {
      id: "1",
      name: "Royal Maroon Silk Banarasi",
      price: 24900,
      image: "https://picsum.photos/seed/s1/600/800",
      quantity: 1,
      category: "Saree"
    },
    {
      id: "3",
      name: "Sterling Silver Lakshmi Idol",
      price: 12500,
      image: "https://picsum.photos/seed/v1/600/600",
      quantity: 1,
      category: "Silver"
    }
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-20 md:px-8">
      <h1 className="font-headline text-4xl font-bold tracking-tight uppercase mb-12">Your Shopping Bag</h1>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Items */}
        <div className="lg:col-span-8">
          <div className="flex flex-col border-t">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-6 py-8 border-b">
                <Link href={`/product/${item.id}`} className="relative aspect-[3/4] w-32 overflow-hidden bg-muted flex-shrink-0 block">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </Link>
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.category}</span>
                      <Link href={`/product/${item.id}`} className="hover:underline underline-offset-4 block mt-1">
                        <h3 className="text-lg font-bold uppercase tracking-tight">{item.name}</h3>
                      </Link>
                    </div>
                    <p className="font-bold">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border h-10">
                      <button className="px-3 hover:text-accent"><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button className="px-3 hover:text-accent"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10">
            <Link href="/shop" className="group text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:text-accent transition-colors">
              Continue Shopping <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <div className="bg-secondary/50 p-8">
            <h2 className="text-xl font-bold uppercase tracking-tight mb-8">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground uppercase tracking-widest">Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground uppercase tracking-widest">Estimated Shipping</span>
                <span className="text-accent uppercase font-bold">Free</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground uppercase tracking-widest">GST (Included)</span>
                <span>₹0</span>
              </div>
              <div className="pt-6 border-t flex justify-between">
                <span className="text-lg font-bold uppercase tracking-tight">Total</span>
                <span className="text-lg font-bold">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link href="/checkout">
              <Button className="w-full mt-10 h-16 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-sm hover:bg-primary/90">
                Proceed to Checkout
              </Button>
            </Link>

            <div className="mt-8 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">We Accept</p>
              <div className="flex justify-center gap-4 grayscale opacity-60">
                <span className="text-xs font-bold">UPI</span>
                <span className="text-xs font-bold">VISA</span>
                <span className="text-xs font-bold">MASTERCARD</span>
                <span className="text-xs font-bold">AMEX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
