"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const { items, total, loading, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();

  const subtotal = total;
  const shipping = subtotal > 10000 ? 0 : 500;
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shipping;

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity",
      });
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeItem(productId);
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-40 pb-20 md:px-8 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-40 pb-20 md:px-8">
      <h1 className="font-headline text-4xl font-bold tracking-tight uppercase mb-12">Your Shopping Bag</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-4">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground mb-8">Add items to your cart to see them here.</p>
          <Link href="/shop">
            <Button className="h-14 px-8 rounded-none bg-primary font-bold uppercase tracking-widest">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          {/* Items */}
          <div className="lg:col-span-8">
            <div className="flex flex-col border-t">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-6 py-8 border-b">
                  <Link href={`/product/${item.productId}`} className="relative aspect-square w-32 overflow-hidden bg-muted flex-shrink-0 block">
                    <Image src={item.image || "/assets/favicon.png"} alt={item.name} fill className="object-cover" />
                  </Link>
                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <Link href={`/product/${item.productId}`} className="hover:underline underline-offset-4 block mt-1">
                          <h3 className="text-lg font-bold uppercase tracking-tight">{item.name}</h3>
                        </Link>
                      </div>
                      <p className="font-bold">₹{item.price?.toLocaleString("en-IN")}</p>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border h-10">
                        <button 
                          onClick={() => {
                            if (item.quantity > 1) {
                              handleQuantityChange(item.productId, item.quantity - 1);
                            }
                          }}
                          disabled={item.quantity <= 1}
                          className="px-3 hover:text-accent transition-colors disabled:opacity-30"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          className="px-3 hover:text-accent transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.productId)}
                        className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
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
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground uppercase tracking-widest">Shipping</span>
                  <span className={shipping === 0 ? "text-accent font-bold" : ""}>
                    {shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground uppercase tracking-widest">GST (5%)</span>
                  <span>₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-6 border-t flex justify-between">
                  <span className="text-lg font-bold uppercase tracking-tight">Total</span>
                  <span className="text-lg font-bold">₹{grandTotal.toLocaleString("en-IN")}</span>
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
      )}
    </div>
  );
}
