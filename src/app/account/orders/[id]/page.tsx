"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, Package, Truck, CheckCircle, CreditCard, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionFadeIn from "@/components/animations/SectionFadeIn";
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
    label?: string;
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
  paymentDetails?: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (user?.id) {
          headers.Authorization = `Bearer ${user.id}`;
        }

        const res = await fetch(`/api/orders?id=${id}`, { headers });
        
        if (res.ok) {
          const data = await res.json();
          // Find the specific order from the orders array
          const foundOrder = data.orders?.find((o: Order) => o.id === id || o.orderId === id);
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError("Order not found");
          }
        } else {
          setError("Failed to fetch order");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user?.id]);

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

  const getShippingMethodDisplay = (method: string): string => {
    switch (method) {
      case "express":
        return "Express Premium (3-5 Business Days)";
      case "standard":
        return "Standard Care (7-10 Business Days)";
      default:
        return method;
    }
  };

  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-40 pb-12 md:px-8 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <SectionFadeIn className="space-y-12 pb-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b pb-8">
          <Link href="/account/orders" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-4">
            <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> Back to Orders
          </Link>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error || "Order not found"}</p>
          <Link href="/account/orders">
            <Button className="mt-4 rounded-none bg-primary font-bold uppercase tracking-widest">
              View All Orders
            </Button>
          </Link>
        </div>
      </SectionFadeIn>
    );
  }

  return (
    <SectionFadeIn className="space-y-12 pb-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b pb-8">
        <div className="space-y-2">
          <Link href="/account/orders" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-4">
            <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> Back to Orders
          </Link>
          <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Order {order.orderId}</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
            {getStatusDisplay(order.status)}
          </span>
          <Button variant="outline" className="h-10 rounded-none border-muted text-[10px] font-bold uppercase tracking-widest">
            Invoice PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Items & Status */}
        <div className="lg:col-span-2 space-y-12">
          {/* Status Timeline */}
          <div className="border border-muted p-8 bg-secondary/10">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
              <Package className="h-4 w-4" /> Shipment Status
            </h3>
            <div className="flex justify-between items-start max-w-md relative">
              <div className="absolute top-4 left-0 right-0 h-[1px] bg-muted -z-0" />
              {[
                { label: "Confirmed", done: ["pending", "confirmed", "processing", "shipped", "delivered"].includes(order.status) },
                { label: "Shipped", done: ["shipped", "delivered"].includes(order.status) },
                { label: "Delivered", done: order.status === "delivered" },
              ].map((s, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 relative z-10 bg-background md:bg-transparent px-2">
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                    s.done ? "border-accent bg-accent text-white" : "border-muted bg-white text-muted-foreground"
                  }`}>
                    {s.done ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest">{s.label}</p>
                    <p className="text-[8px] text-muted-foreground uppercase">{s.done ? "Done" : "Pending"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b pb-4">Ordered Items</h3>
            {order.items.map((item, index) => (
              <div key={item.productId || index} className="flex gap-8 items-center py-4">
                <Link href={`/product/${item.productId}`} className="relative h-28 w-20 bg-muted flex-shrink-0 block">
                  <Image src={item.image || "/assets/favicon.png"} alt={item.name} fill className="object-cover" />
                </Link>
                <div className="flex-grow">
                  <Link href={`/product/${item.productId}`} className="hover:underline">
                    <h4 className="text-sm font-bold uppercase tracking-tight mt-1">{item.name}</h4>
                  </Link>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Quantity: {item.quantity}</p>
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
                  <p className="font-bold">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="text-muted-foreground mt-1">Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-3 w-3" /> Payment Method
                </p>
                <p className="text-xs font-medium">{getPaymentMethodDisplay(order.paymentMethod)}</p>
                {order.paymentDetails?.status && (
                  <p className={`text-[10px] font-bold uppercase ${
                    order.paymentDetails.status === "paid" ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {order.paymentDetails.status === "paid" ? "Paid" : "Pending Payment"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Shipping Method</p>
                <p className="text-xs font-medium">{getShippingMethodDisplay(order.shippingMethod)}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-secondary/30 p-8 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-muted pb-4">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.summary.subtotal?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>Shipping</span>
                <span className={order.summary.shipping === 0 ? "text-accent" : ""}>
                  {order.summary.shipping === 0 ? "Free" : `₹${order.summary.shipping?.toLocaleString('en-IN') || 0}`}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>GST (5%)</span>
                <span>₹{order.summary.gst?.toLocaleString('en-IN') || 0}</span>
              </div>
              {order.summary.discount > 0 && (
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.summary.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-4 border-t border-muted flex justify-between text-sm font-bold uppercase tracking-tight">
                <span>Total Paid</span>
                <span>₹{order.summary.total?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionFadeIn>
  );
}
