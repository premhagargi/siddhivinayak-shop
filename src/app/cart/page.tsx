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
    <div className="container mx-auto px-3 pt-4 pb-20 md:px-8 md:pt-6">
      <h1 className="text-lg font-semibold tracking-tight uppercase mb-4 md:text-xl md:mb-6">Your Shopping Bag</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-base font-semibold uppercase tracking-tight mb-2">Your cart is empty</h2>
          <p className="text-xs text-muted-foreground mb-6">Add items to your cart to see them here.</p>
          <Link href="/shop">
            <Button className="h-10 px-6 rounded-none bg-primary font-semibold uppercase text-xs tracking-wider">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-8">
          {/* Items */}
          <div className="lg:col-span-8">
            <div className="flex flex-col">
              {items.map((item) => {
                const stock = productStock[item.productId];
                const isOutOfStock = stock === undefined ? false : stock <= 0;
                const isLowStock = stock !== undefined && stock > 0 && stock <= 5;
                
                return (
                <div key={item.productId} className={`flex gap-3 py-3 border-b border-border/60 ${isOutOfStock ? 'opacity-60' : ''}`}>
                  <Link href={`/product/${item.productId}`} className="relative w-16 h-16 md:w-[68px] md:h-[68px] overflow-hidden bg-muted flex-shrink-0 block">
                    <Image src={item.image || "/assets/favicon.png"} alt={item.name} fill className="object-cover" />
                  </Link>
                  <div className="flex flex-col flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <Link href={`/product/${item.productId}`} className="hover:underline underline-offset-2 block">
                          <h3 className="text-[13px] font-medium leading-tight line-clamp-2">{item.name}</h3>
                        </Link>
                        {/* Stock status */}
                        {isOutOfStock && (
                          <p className="text-[11px] font-semibold text-destructive mt-0.5">Out of Stock</p>
                        )}
                        {isLowStock && (
                          <p className="text-[11px] font-semibold text-orange-600 mt-0.5">Only {stock} left</p>
                        )}
                      </div>
                      <p className="text-[13px] font-semibold whitespace-nowrap">₹{item.price?.toLocaleString("en-IN")}</p>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-input rounded-sm h-7">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              handleQuantityChange(item.productId, item.quantity - 1);
                            }
                          }}
                          disabled={item.quantity <= 1 || isOutOfStock}
                          className="px-2 hover:text-accent transition-colors disabled:opacity-30 min-w-[24px]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={isOutOfStock}
                          className="px-2 hover:text-accent transition-colors disabled:opacity-30 min-w-[24px]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        disabled={removingItem === item.productId}
                        className="text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        {removingItem === item.productId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-1">
                            <Trash2 className="h-3 w-3" /> Remove
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handleClearCart}
                disabled={clearing}
                className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              >
                {clearing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Clear Cart"
                )}
              </button>
              <Link href="/shop" className="group text-xs font-medium text-primary hover:text-accent transition-colors flex items-center gap-1">
                Continue Shopping <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Summary - Desktop Only */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="bg-secondary/30 p-4 md:p-5">
              <h2 className="text-sm font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-3 border-t border-border/60 flex justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-sm font-semibold">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button
                onClick={handleProceedToCheckout}
                disabled={isCheckingOut || clearing || items.length === 0 || hasOutOfStockItem}
                className="w-full mt-4 h-11 rounded-sm bg-primary text-white font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : hasOutOfStockItem ? (
                  "Remove Out of Stock Items"
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
              {hasOutOfStockItem && (
                <p className="text-[10px] text-destructive text-center mt-2">
                  Please remove out of stock items to proceed
                </p>
              )}

              <div className="mt-4">
                <p className="text-[10px] font-medium text-muted-foreground text-center mb-2">We Accept</p>
                <div className="flex justify-center gap-3 grayscale opacity-50">
                  <span className="text-[10px] font-medium">UPI</span>
                  <span className="text-[10px] font-medium">VISA</span>
                  <span className="text-[10px] font-medium">MC</span>
                  <span className="text-[10px] font-medium">AMEX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-3 md:hidden z-50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground">Total</span>
              <span className="text-sm font-semibold">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <Button
              onClick={handleProceedToCheckout}
              disabled={isCheckingOut || clearing || items.length === 0 || hasOutOfStockItem}
              className="h-10 px-6 rounded-sm bg-primary text-white font-semibold text-xs disabled:opacity-50"
            >
              {isCheckingOut ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : hasOutOfStockItem ? (
                "Remove Out of Stock"
              ) : (
                "Checkout"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
