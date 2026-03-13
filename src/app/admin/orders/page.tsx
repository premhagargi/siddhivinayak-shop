"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  ExternalLink, 
  MoreHorizontal,
  ChevronRight,
  Clock,
  CheckCircle2,
  Package,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

const INITIAL_ORDERS = [
  { 
    id: "ORD-9281", 
    date: "Oct 24, 2023", 
    customer: "Anjali Kapoor", 
    email: "anjali.k@example.com",
    total: 24900, 
    payment: "Paid", 
    fulfillment: "Delivered",
    items: 1 
  },
  { 
    id: "ORD-9282", 
    date: "Oct 25, 2023", 
    customer: "Rajesh Mehta", 
    email: "rajesh.m@gmail.com",
    total: 12500, 
    payment: "Paid", 
    fulfillment: "Processing",
    items: 2 
  },
  { 
    id: "ORD-9283", 
    date: "Oct 25, 2023", 
    customer: "Priya Sharma", 
    email: "priya.s@outlook.com",
    total: 32500, 
    payment: "Pending", 
    fulfillment: "Unfulfilled",
    items: 1 
  },
  { 
    id: "ORD-9284", 
    date: "Oct 26, 2023", 
    customer: "Vikram Singh", 
    email: "v.singh@corporate.in",
    total: 15800, 
    payment: "Paid", 
    fulfillment: "Shipped",
    items: 3 
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filteredOrders = orders.filter(o => 
    (o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.customer.toLowerCase().includes(search.toLowerCase())) &&
    (activeTab === "All" || o.fulfillment === activeTab)
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered": return <CheckCircle2 className="h-3 w-3" />;
      case "Shipped": return <Package className="h-3 w-3" />;
      case "Processing": return <Clock className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
      case "Delivered": return "bg-green-500/10 text-green-600";
      case "Processing":
      case "Shipped": return "bg-blue-500/10 text-blue-600";
      case "Pending":
      case "Unfulfilled": return "bg-orange-500/10 text-orange-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1 border-b pb-4">
        <h1 className="font-headline text-2xl font-bold uppercase tracking-tight">Orders</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Track and manage customer purchases and fulfillment.</p>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-4">
        <div className="flex border-b">
          {["All", "Unfulfilled", "Shipped", "Delivered"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                activeTab === tab 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-none h-10 pl-10 border-muted bg-secondary/10 text-xs" 
              placeholder="Filter orders..." 
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 rounded-none border-muted px-4 text-[10px] font-bold uppercase tracking-widest">
              <Filter className="h-3 w-3 mr-2" /> More Filters
            </Button>
            <Button variant="outline" className="h-10 rounded-none border-muted px-4 text-[10px] font-bold uppercase tracking-widest">
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Order Table */}
      <div className="border border-muted">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-muted hover:bg-transparent">
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 w-[100px] px-3">Order</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 w-[120px] px-3">Date</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3">Customer</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3">Payment</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3">Fulfillment</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3 text-right">Total</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="border-muted hover:bg-secondary/10 transition-colors group">
                <TableCell className="py-2 px-3">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-primary">
                    {order.id}
                  </span>
                </TableCell>
                <TableCell className="py-2 px-3">
                  <span className="text-[9px] font-medium text-muted-foreground uppercase">{order.date}</span>
                </TableCell>
                <TableCell className="py-2 px-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-tight">{order.customer}</span>
                    <span className="text-[8px] text-muted-foreground lowercase">{order.email}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2 px-3">
                  <span className={cn(
                    "px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full",
                    getStatusColor(order.payment)
                  )}>
                    {order.payment}
                  </span>
                </TableCell>
                <TableCell className="py-2 px-3">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full",
                    getStatusColor(order.fulfillment)
                  )}>
                    {getStatusIcon(order.fulfillment)}
                    {order.fulfillment}
                  </div>
                </TableCell>
                <TableCell className="text-right py-2 px-3">
                  <span className="text-[11px] font-bold">₹{order.total.toLocaleString('en-IN')}</span>
                  <p className="text-[8px] text-muted-foreground uppercase">{order.items} {order.items > 1 ? 'items' : 'item'}</p>
                </TableCell>
                <TableCell className="text-right py-2 px-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-primary/5">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border-muted min-w-[140px]">
                      <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground p-2">Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="text-[9px] font-bold uppercase tracking-widest p-2 cursor-pointer">
                        <ExternalLink className="mr-2 h-3 w-3" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[9px] font-bold uppercase tracking-widest p-2 cursor-pointer">
                        Edit Order
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-muted" />
                      <DropdownMenuItem className="text-[9px] font-bold uppercase tracking-widest p-2 cursor-pointer text-destructive">
                        Cancel Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-muted pt-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
        <div className="flex gap-1">
          <Button variant="outline" className="h-8 rounded-none border-muted text-[9px] font-bold uppercase tracking-widest px-3" disabled>
            Previous
          </Button>
          <Button variant="outline" className="h-8 rounded-none border-muted text-[9px] font-bold uppercase tracking-widest px-3">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
