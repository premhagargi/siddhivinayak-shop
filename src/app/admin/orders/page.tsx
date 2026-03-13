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
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b pb-8">
        <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Orders</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Track and manage customer purchases and fulfillment.</p>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-6">
        <div className="flex border-b">
          {["All", "Unfulfilled", "Shipped", "Delivered"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative",
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

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-none h-12 pl-12 border-muted bg-secondary/10" 
              placeholder="Filter orders..." 
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-12 rounded-none border-muted px-6 text-[10px] font-bold uppercase tracking-widest">
              <Filter className="h-3 w-3 mr-2" /> More Filters
            </Button>
            <Button variant="outline" className="h-12 rounded-none border-muted px-6 text-[10px] font-bold uppercase tracking-widest">
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
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16 w-[120px]">Order</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16 w-[150px]">Date</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16">Customer</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16">Payment</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16">Fulfillment</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16 text-right">Total</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="border-muted hover:bg-secondary/10 transition-colors group">
                <TableCell className="py-6">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-primary">
                    {order.id}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">{order.date}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-tight">{order.customer}</span>
                    <span className="text-[9px] text-muted-foreground lowercase">{order.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full",
                    getStatusColor(order.payment)
                  )}>
                    {order.payment}
                  </span>
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full",
                    getStatusColor(order.fulfillment)
                  )}>
                    {getStatusIcon(order.fulfillment)}
                    {order.fulfillment}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs font-bold">₹{order.total.toLocaleString('en-IN')}</span>
                  <p className="text-[8px] text-muted-foreground uppercase">{order.items} {order.items > 1 ? 'items' : 'item'}</p>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/5">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border-muted min-w-[160px]">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground p-3">Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest p-3 cursor-pointer">
                        <ExternalLink className="mr-2 h-3 w-3" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest p-3 cursor-pointer">
                        Edit Order
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-muted" />
                      <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest p-3 cursor-pointer text-destructive">
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
      <div className="flex items-center justify-between border-t border-muted pt-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 rounded-none border-muted text-[10px] font-bold uppercase tracking-widest" disabled>
            Previous
          </Button>
          <Button variant="outline" className="h-10 rounded-none border-muted text-[10px] font-bold uppercase tracking-widest">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}