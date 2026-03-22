"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  Package,
  AlertCircle,
  Loader2
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
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  gst: number;
  total: number;
}

interface Order {
  id: string;
  orderId: string;
  userId: string;
  guestEmail: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  items: OrderItem[];
  summary: OrderSummary;
  createdAt: string | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.pageSize.toString(),
      });
      if (activeTab !== "All") params.append("status", activeTab.toLowerCase());

      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      
      const data = await res.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        variant: "destructive",
        title: "Fetch Error",
        description: "Could not load orders.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return <CheckCircle2 className="h-3 w-3" />;
      case "shipped": return <Package className="h-3 w-3" />;
      case "processing": return <Clock className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "delivered": return "bg-green-500/10 text-green-600";
      case "processing":
      case "shipped": return "bg-blue-500/10 text-blue-600";
      case "pending":
      case "unfulfilled": return "bg-orange-500/10 text-orange-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN');
  };

  const getTotalItems = (items: OrderItem[]) => {
    return items?.reduce((sum: number, item: OrderItem) => sum + (item.quantity || 0), 0) || 0;
  };

  const filteredOrders = orders.filter(o => 
    (o.orderId?.toLowerCase().includes(search.toLowerCase()) || 
    o.userId?.toLowerCase().includes(search.toLowerCase()))
  );

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
            <Button 
              onClick={fetchOrders}
              variant="outline" 
              className="h-10 rounded-none border-muted px-4 text-[10px] font-bold uppercase tracking-widest"
            >
              <Loader2 className={cn("h-3 w-3 mr-2", loading && "animate-spin")} />
              Refresh
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-muted hover:bg-secondary/10 transition-colors group">
                  <TableCell className="py-2 px-3">
                    <span className="text-[10px] font-bold uppercase tracking-tight text-primary">
                      {order.orderId || order.id}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <span className="text-[9px] font-medium text-muted-foreground uppercase">
                      {formatDate(order.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-tight">
                        {order.userId}
                      </span>
                      {order.guestEmail && (
                        <span className="text-[8px] text-muted-foreground lowercase">{order.guestEmail}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <span className={cn(
                      "px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full",
                      getStatusColor(order.paymentStatus)
                    )}>
                      {order.paymentStatus || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full",
                      getStatusColor(order.status)
                    )}>
                      {getStatusIcon(order.status || "")}
                      {order.status || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2 px-3">
                    <span className="text-[11px] font-bold">₹{formatPrice(order.summary?.total || 0)}</span>
                    <p className="text-[8px] text-muted-foreground uppercase">
                      {getTotalItems(order.items || [])} {getTotalItems(order.items || []) > 1 ? 'items' : 'item'}
                    </p>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && filteredOrders.length > 0 && (
        <div className="flex items-center justify-between border-t border-muted pt-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Showing {filteredOrders.length} of {pagination.totalItems} orders
          </p>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              className="h-8 rounded-none border-muted text-[9px] font-bold uppercase tracking-widest px-3"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              className="h-8 rounded-none border-muted text-[9px] font-bold uppercase tracking-widest px-3"
              disabled={!pagination.hasNextPage}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
