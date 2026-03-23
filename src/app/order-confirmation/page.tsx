"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Truck, MapPin, CreditCard, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
  };
  shippingMethod: string;
  summary: {
    subtotal: number;
    shipping: number;
    gst: number;
    discount: number;
    total: number;
  };
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  // Support both 'id' (document ID) and 'orderId' for backward compatibility
  const orderDocId = searchParams.get("id") || searchParams.get("orderId");
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderDocId) {
        setLoading(false);
        return;
      }
      
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (user?.id) {
          headers.Authorization = `Bearer ${user.id}`;
        }

        const res = await fetch(`/api/orders?id=${orderDocId}`, { headers });
        
        if (res.ok) {
          const data = await res.json();
          const foundOrder = data.orders?.[0];
          if (foundOrder) {
            setOrder(foundOrder);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderDocId, user?.id]);

  const getPaymentMethodDisplay = (method: string): string => {
    switch (method) {
      case "upi":
        return "UPI";
      case "card":
        return "Cards / Net Banking";
      case "cod":
        return "Cash on Delivery";
      default:
        return method;
    }
  };

  const getEstimatedDelivery = (): string => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (order?.shippingMethod === "express" ? 5 : 10));
    return deliveryDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-40 pb-20 md:px-8 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-40 pb-20 md:px-8 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
          Order Placed Successfully!
        </h1>
        <p className="text-muted-foreground text-lg">
          Thank you for your order. We've received your order and will start processing it shortly.
        </p>
        {orderDocId && (
          <p className="text-sm text-muted-foreground mt-2">
            Order ID: <span className="font-bold text-foreground">{order?.orderId || orderDocId}</span>
          </p>
        )}
      </div>

      {/* Order Details Card */}
      {order && (
        <div className="bg-secondary/30 border rounded-lg p-6 md:p-8 mb-8 animate-in fade-in duration-700 delay-200">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold uppercase tracking-wide">Order Details</h2>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-white/50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-accent" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Estimated Delivery</p>
                <p className="text-lg font-bold text-accent">{getEstimatedDelivery()}</p>
              </div>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Items Ordered</p>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={item.productId || index} className="flex gap-4 items-center">
                  <Link href={`/product/${item.productId}`} className="relative h-20 w-16 bg-muted flex-shrink-0 block overflow-hidden">
                    <Image 
                      src={item.image || "/assets/favicon.png"} 
                      alt={item.name} 
                      fill 
                      className="object-cover" 
                    />
                  </Link>
                  <div className="flex-grow">
                    <Link href={`/product/${item.productId}`} className="hover:underline">
                      <h4 className="text-sm font-bold uppercase">{item.name}</h4>
                    </Link>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">₹{item.price.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shipping Address</p>
              </div>
              <p className="font-bold text-sm">{order.shippingAddress.name}</p>
              <p className="text-xs text-muted-foreground">{order.shippingAddress.street}</p>
              <p className="text-xs text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
              <p className="text-xs text-muted-foreground">{order.shippingAddress.phone}</p>
            </div>

            <div className="bg-white/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment Method</p>
              </div>
              <p className="font-bold text-sm">{getPaymentMethodDisplay(order.paymentMethod)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Payment Status: <span className="font-bold text-yellow-600">Pending</span>
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order Total</p>
                <p className="text-xs text-muted-foreground">Including all taxes</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₹{order.summary.total?.toLocaleString("en-IN") || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 animate-in fade-in duration-700 delay-400">
        {order ? (
          <Link href={`/account/orders/${order.id}`} className="flex-1">
            <Button 
              className="w-full h-14 rounded-none bg-primary font-bold uppercase tracking-widest"
            >
              <Package className="h-4 w-4 mr-2" />
              View Order Details
            </Button>
          </Link>
        ) : orderDocId ? (
          <Link href={`/account/orders/${orderDocId}`} className="flex-1">
            <Button 
              className="w-full h-14 rounded-none bg-primary font-bold uppercase tracking-widest"
            >
              <Package className="h-4 w-4 mr-2" />
              View Order Details
            </Button>
          </Link>
        ) : (
          <Link href="/account/orders" className="flex-1">
            <Button 
              className="w-full h-14 rounded-none bg-primary font-bold uppercase tracking-widest"
            >
              <Package className="h-4 w-4 mr-2" />
              View Order Details
            </Button>
          </Link>
        )}
        <Link href="/shop" className="flex-1">
          <Button 
            variant="outline"
            className="w-full h-14 rounded-none border-primary font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Help Text */}
      <div className="text-center mt-12 pt-8 border-t animate-in fade-in duration-700 delay-500">
        <p className="text-xs text-muted-foreground">
          Need help? <Link href="/contact" className="text-primary underline hover:text-accent">Contact Us</Link>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Order confirmation has been sent to your registered email.
        </p>
      </div>
    </div>
  );
}
