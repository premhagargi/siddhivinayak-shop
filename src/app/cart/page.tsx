"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function CartPage() {
  const router = useRouter();
  const { items, total, loading, clearing, removingItem, updateQuantity, removeItem, clearCart } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [productStock, setProductStock] = useState<Record<string, number>>({});

  // Fetch product stock status
  useEffect(() => {
    const fetchStock = async () => {
      if (items.length === 0) return;
      
      const stockMap: Record<string, number> = {};
      await Promise.all(
        items.map(async (item) => {
          try {
            const res = await fetch(`/api/products/${item.productId}`);
            if (res.ok) {
              const data = await res.json();
              stockMap[item.productId] = data.product?.stock || 0;
            }
          } catch (error) {
            console.error("Error fetching stock:", error);
            stockMap[item.productId] = 0;
          }
        })
      );
      setProductStock(stockMap);
    };
    
    fetchStock();
  }, [items]);

  // Check if any item is out of stock
  const hasOutOfStockItem = items.some(item => {
    const stock = productStock[item.productId];
    return stock !== undefined && stock <= 0;
  });

  const handleProceedToCheckout = () => {
    setIsCheckingOut(true);
    router.push("/checkout");
  };

  const subtotal = total;
  const grandTotal = subtotal;

  // Optimistic quantity update - update UI immediately, then sync with server
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    // Update immediately for smooth UX, background sync happens automatically
    updateQuantity(productId, newQuantity);
  };

  const handleRemove = (productId: string) => {
    // Remove immediately for smooth UX, background sync happens automatically
    removeItem(productId);
  };

  const handleClearCart = () => {
    // Clear immediately for smooth UX, background sync happens automatically
    clearCart();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-16 pb-20 md:px-8 md:pt-40 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-6 pb-20 md:px-8 md:pt-10">
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
              {items.map((item) => {
                const stock = productStock[item.productId];
                const isOutOfStock = stock === undefined ? false : stock <= 0;
                const isLowStock = stock !== undefined && stock > 0 && stock <= 5;
                
                return (
                <div key={item.productId} className={`flex gap-6 py-8 border-b ${isOutOfStock ? 'opacity-60' : ''}`}>
                  <Link href={`/product/${item.productId}`} className="relative aspect-square w-32 overflow-hidden bg-muted flex-shrink-0 block">
                    <Image src={item.image || "/assets/favicon.png"} alt={item.name} fill className="object-cover" />
                  </Link>
                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <Link href={`/product/${item.productId}`} className="hover:underline underline-offset-4 block mt-1">
                          <h3 className="text-lg font-bold uppercase tracking-tight">{item.name}</h3>
                        </Link>
                        {/* Stock status */}
                        {isOutOfStock && (
                          <p className="text-xs font-bold text-destructive uppercase tracking-widest mt-1">Out of Stock</p>
                        )}
                        {isLowStock && (
                          <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mt-1">Only {stock} left</p>
                        )}
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
                          disabled={item.quantity <= 1 || isOutOfStock}
                          className="px-3 hover:text-accent transition-colors disabled:opacity-30"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={isOutOfStock}
                          className="px-3 hover:text-accent transition-colors disabled:opacity-30"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.productId)}
                        disabled={removingItem === item.productId}
                        className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        {removingItem === item.productId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )} Remove
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
           
            <div className="mt-10 flex items-center justify-between">
              <button 
                onClick={handleClearCart}
                disabled={clearing}
                className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              >
                {clearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )} Clear Cart
              </button>
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
                <div className="pt-6 border-t flex justify-between">
                  <span className="text-lg font-bold uppercase tracking-tight">Total</span>
                  <span className="text-lg font-bold">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button 
                onClick={handleProceedToCheckout}
                disabled={isCheckingOut || clearing || items.length === 0 || hasOutOfStockItem}
                className="w-full mt-10 h-16 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : hasOutOfStockItem ? (
                  "Remove Out of Stock Items"
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
              {hasOutOfStockItem && (
                <p className="text-xs text-destructive text-center mt-2">
                  Please remove out of stock items to proceed
                </p>
              )}

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
