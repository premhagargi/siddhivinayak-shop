"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, Package, Truck, CheckCircle, Loader2 } from "lucide-react";
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
  items: OrderItem[];
  summary: {
    total: number;
  };
  createdAt: string;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/account/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${user.id}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id]);

  if (authLoading || loading) {
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
    <div className="space-y-12">
 <div className="hidden md:block space-y-2">
  <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">
    Order History
  </h1>
  <p className="text-sm text-muted-foreground">
    Review and track your past orders.
  </p>
</div>

      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.id} className="border border-muted">
            {/* Header */}
            <div className="bg-secondary/30 px-6 py-4 flex flex-col md:flex-row justify-between gap-4 md:items-center border-b border-muted">
              <div className="flex gap-8 flex-wrap">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Date Placed</p>
                  <p className="text-xs font-bold uppercase">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                  <p className="text-xs font-bold uppercase">₹{order.summary?.total?.toLocaleString("en-IN") || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Order #</p>
                  <p className="text-xs font-bold uppercase">{order.orderId}</p>
                </div>
              </div>
              <Link href={`/account/orders/${order.id}`}>
                <Button variant="link" className="p-0 h-auto text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  Order Details <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                {order.status === "delivered" ? (
                  <CheckCircle className="h-4 w-4 text-accent" />
                ) : (
                  <Truck className="h-4 w-4 text-primary" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {order.status} • {order.paymentStatus}
                </span>
              </div>

              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-6 items-center">
                  <div className="relative h-20 w-16 bg-muted flex-shrink-0">
                    <Image src={item.image || "/assets/favicon.png"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-xs font-bold uppercase tracking-tight mb-1">{item.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/product/${item.productId}`}>
                      <Button variant="outline" className="h-10 rounded-none text-[9px] font-bold uppercase tracking-widest w-32 border-muted hover:border-primary">
                        Buy Again
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
 <div className="md:hidden flex flex-col items-center justify-center flex-1 text-center px-4 min-h-[50vh]">
            <div className="relative mb-2">
              <Package className="h-16 w-16 text-muted/30" strokeWidth={1} />
              <Package className="h-8 w-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-base font-medium">No orders found</h2>
            <p className="text-sm text-gray-500 mt-1">
            Looks like you haven't made any purchases yet. Your future orders will appear here.
            </p>
            <Link href="/shop">
              <Button className="mt-6 h-12 px-8 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-xs">
                Browse Collection
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
