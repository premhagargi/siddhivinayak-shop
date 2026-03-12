
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Package, Truck, CheckCircle } from "lucide-react";

const ORDERS = [
  {
    id: "ORD-9281",
    date: "Oct 24, 2023",
    status: "Delivered",
    total: 24900,
    items: [
      { name: "Royal Maroon Silk Banarasi", image: "https://picsum.photos/seed/s1/200/300", qty: 1 }
    ]
  },
  {
    id: "ORD-8172",
    date: "Sep 12, 2023",
    status: "Delivered",
    total: 12500,
    items: [
      { name: "Sterling Silver Lakshmi Idol", image: "https://picsum.photos/seed/v1/200/300", qty: 1 }
    ]
  }
];

export default function OrdersPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Order History</h1>
        <p className="text-sm text-muted-foreground">Review and track your past orders.</p>
      </div>

      <div className="space-y-8">
        {ORDERS.map((order) => (
          <div key={order.id} className="border border-muted">
            {/* Header */}
            <div className="bg-secondary/30 px-6 py-4 flex flex-col md:flex-row justify-between gap-4 md:items-center border-b border-muted">
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Date Placed</p>
                  <p className="text-xs font-bold uppercase">{order.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                  <p className="text-xs font-bold uppercase">₹{order.total.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Order #</p>
                  <p className="text-xs font-bold uppercase">{order.id}</p>
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
                {order.status === "Delivered" ? (
                  <CheckCircle className="h-4 w-4 text-accent" />
                ) : (
                  <Truck className="h-4 w-4 text-primary" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {order.status} on Oct 28, 2023
                </span>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-6 items-center">
                  <div className="relative h-20 w-16 bg-muted flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-xs font-bold uppercase tracking-tight mb-1">{item.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Qty: {item.qty}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/product/${idx + 1}`}>
                      <Button variant="outline" className="h-10 rounded-none text-[9px] font-bold uppercase tracking-widest w-32 border-muted hover:border-primary">
                        Buy Again
                      </Button>
                    </Link>
                    <Button variant="ghost" className="h-10 rounded-none text-[9px] font-bold uppercase tracking-widest w-32 hover:bg-muted">
                      Review Item
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {ORDERS.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mb-6" />
            <h3 className="text-xl font-bold uppercase tracking-tight mb-2">No orders found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-8">
              Looks like you haven't made any purchases yet. Your future orders will appear here.
            </p>
            <Link href="/shop">
              <Button className="h-14 w-60 rounded-none bg-primary text-white font-bold uppercase tracking-widest">
                Browse Collection
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
