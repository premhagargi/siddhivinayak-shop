"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  MoreHorizontal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Package,
  AlertCircle,
  Loader2,
  MapPin,
  CreditCard,
  Truck,
  ShoppingBag,
  X,
  User,
  Hash,
  Calendar,
  IndianRupee,
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
  image?: string;
  quantity: number;
  price: number;
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  gst: number;
  discount?: number;
  total: number;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  label?: string;
}

interface PaymentDetails {
  method: string;
  status: string;
  transactionId?: string;
  paidAt?: string;
  razorpayOrderId?: string;
}

interface Order {
  id: string;
  orderId: string;
  userId: string;
  guestEmail: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentDetails: PaymentDetails | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  summary: OrderSummary;
  createdAt: string | null;
  updatedAt: string | null;
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
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
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

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        toast({ title: "Status Updated", description: `Order ${orderId} marked as ${newStatus}.` });
        setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
      } else {
        throw new Error("Failed to update");
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not update order status." });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus: newPaymentStatus }),
      });

      if (res.ok) {
        toast({ title: "Payment Updated", description: `Payment marked as ${newPaymentStatus}.` });
        setOrders(orders.map(o => o.orderId === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
      } else {
        throw new Error("Failed to update");
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not update payment status." });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return <CheckCircle2 className="h-3 w-3" />;
      case "shipped": return <Package className="h-3 w-3" />;
      case "confirmed":
      case "processing": return <Clock className="h-3 w-3" />;
      case "cancelled": return <X className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "delivered": return "bg-green-500/10 text-green-600";
      case "confirmed":
      case "processing":
      case "shipped": return "bg-blue-500/10 text-blue-600";
      case "pending":
      case "unfulfilled": return "bg-orange-500/10 text-orange-600";
      case "cancelled":
      case "failed": return "bg-red-500/10 text-red-600";
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

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    o.userId?.toLowerCase().includes(search.toLowerCase()) ||
    o.shippingAddress?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.guestEmail?.toLowerCase().includes(search.toLowerCase()))
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
          {["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 md:px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative",
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
              placeholder="Search by order ID, customer name, email..."
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
          </div>
        </div>
      </div>

      {/* Order Table */}
      <div className="border border-muted">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-muted hover:bg-transparent">
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 w-8 px-3"></TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 w-[100px] px-3">Order</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 w-[120px] px-3">Date</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3">Customer</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3">Payment</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3">Status</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3 text-right">Total</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-12 px-3 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <>
                    <TableRow
                      key={order.id}
                      className={cn(
                        "border-muted hover:bg-secondary/10 transition-colors group cursor-pointer",
                        isExpanded && "bg-secondary/10"
                      )}
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    >
                      <TableCell className="py-2 px-3">
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </TableCell>
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
                          <span className="text-[11px] font-bold tracking-tight">
                            {order.shippingAddress?.name || order.userId || "N/A"}
                          </span>
                          {order.guestEmail && (
                            <span className="text-[8px] text-muted-foreground lowercase">{order.guestEmail}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full inline-block w-fit",
                            getStatusColor(order.paymentStatus)
                          )}>
                            {order.paymentStatus || "N/A"}
                          </span>
                          <span className="text-[8px] text-muted-foreground uppercase">
                            {order.paymentMethod || "N/A"}
                          </span>
                        </div>
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
                      <TableCell className="text-right py-2 px-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-primary/5">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-none border-muted min-w-[160px]">
                            <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground p-2">
                              Update Status
                            </DropdownMenuLabel>
                            {["pending", "confirmed", "shipped", "delivered"].map((s) => (
                              <DropdownMenuItem
                                key={s}
                                className="text-[9px] font-bold uppercase tracking-widest p-2 cursor-pointer"
                                disabled={order.status === s || updatingStatus === order.orderId}
                                onClick={() => handleUpdateStatus(order.orderId, s)}
                              >
                                {getStatusIcon(s)}
                                <span className="ml-2">{s}</span>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground p-2">
                              Payment
                            </DropdownMenuLabel>
                            {["pending", "paid", "failed"].map((ps) => (
                              <DropdownMenuItem
                                key={ps}
                                className="text-[9px] font-bold uppercase tracking-widest p-2 cursor-pointer"
                                disabled={order.paymentStatus === ps || updatingStatus === order.orderId}
                                onClick={() => handleUpdatePaymentStatus(order.orderId, ps)}
                              >
                                <span>{ps}</span>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem
                              className="text-[9px] font-bold uppercase tracking-widest p-2 cursor-pointer text-destructive"
                              disabled={order.status === "cancelled" || updatingStatus === order.orderId}
                              onClick={() => handleUpdateStatus(order.orderId, "cancelled")}
                            >
                              <X className="mr-2 h-3 w-3" /> Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <TableRow key={`${order.id}-details`} className="border-muted bg-secondary/5">
                        <TableCell colSpan={8} className="p-0">
                          <div className="p-5 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              {/* Shipping Address */}
                              <div className="space-y-2 border border-muted p-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 text-accent" />
                                  Shipping Address
                                </div>
                                {order.shippingAddress ? (
                                  <div className="space-y-1">
                                    <p className="text-sm font-semibold">{order.shippingAddress.name}</p>
                                    {order.shippingAddress.label && (
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-1.5 py-0.5">
                                        {order.shippingAddress.label}
                                      </span>
                                    )}
                                    <p className="text-xs text-muted-foreground">{order.shippingAddress.street}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{order.shippingAddress.country}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-1">
                                      Phone: {order.shippingAddress.phone}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">No address on file</p>
                                )}
                              </div>

                              {/* Payment Details */}
                              <div className="space-y-2 border border-muted p-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                  <CreditCard className="h-3.5 w-3.5 text-accent" />
                                  Payment Details
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Method</span>
                                    <span className="font-semibold uppercase">{order.paymentMethod || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={cn(
                                      "font-bold uppercase text-[10px] px-2 py-0.5 rounded-full",
                                      getStatusColor(order.paymentStatus)
                                    )}>
                                      {order.paymentStatus}
                                    </span>
                                  </div>
                                  {order.paymentDetails?.transactionId && (
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Transaction ID</span>
                                      <span className="font-mono text-[10px]">{order.paymentDetails.transactionId}</span>
                                    </div>
                                  )}
                                  {order.paymentDetails?.razorpayOrderId && (
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Razorpay Order</span>
                                      <span className="font-mono text-[10px]">{order.paymentDetails.razorpayOrderId}</span>
                                    </div>
                                  )}
                                  {order.paymentDetails?.paidAt && (
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Paid At</span>
                                      <span className="text-[10px]">{formatDateTime(order.paymentDetails.paidAt)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Order Meta */}
                              <div className="space-y-2 border border-muted p-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                  <Truck className="h-3.5 w-3.5 text-accent" />
                                  Shipping & Timing
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Shipping Method</span>
                                    <span className="font-semibold capitalize">{order.shippingMethod || "Standard"}</span>
                                  </div>
                                  {order.trackingNumber && (
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Tracking #</span>
                                      <span className="font-mono text-[10px]">{order.trackingNumber}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Order Placed</span>
                                    <span>{formatDateTime(order.createdAt)}</span>
                                  </div>
                                  {order.updatedAt && (
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Last Updated</span>
                                      <span>{formatDateTime(order.updatedAt)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Customer ID</span>
                                    <span className="font-mono text-[10px] truncate max-w-[140px]">{order.userId || "Guest"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3 border border-muted p-4">
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                <ShoppingBag className="h-3.5 w-3.5 text-accent" />
                                Items ({getTotalItems(order.items || [])})
                              </div>
                              <div className="space-y-2">
                                {(order.items || []).map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-muted/40 last:border-0">
                                    <div className="relative h-12 w-12 flex-shrink-0 bg-muted overflow-hidden">
                                      {item.image ? (
                                        <Image
                                          src={item.image}
                                          alt={item.name}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                          <Package className="h-5 w-5" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold truncate">{item.name}</p>
                                      <p className="text-[10px] text-muted-foreground">
                                        Product ID: {item.productId}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-semibold">₹{formatPrice(item.price)} x {item.quantity}</p>
                                      <p className="text-[11px] font-bold">₹{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div className="max-w-sm ml-auto space-y-2 border border-muted p-4">
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                <IndianRupee className="h-3.5 w-3.5 text-accent" />
                                Order Summary
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{formatPrice(order.summary?.subtotal || 0)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className={order.summary?.shipping === 0 ? "text-green-600 font-semibold" : ""}>
                                  {order.summary?.shipping === 0 ? "Free" : `₹${formatPrice(order.summary?.shipping || 0)}`}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">GST</span>
                                <span>₹{formatPrice(order.summary?.gst || 0)}</span>
                              </div>
                              {(order.summary?.discount || 0) > 0 && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Discount</span>
                                  <span className="text-green-600">-₹{formatPrice(order.summary?.discount || 0)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm font-bold border-t border-muted pt-2 mt-2">
                                <span>Total</span>
                                <span>₹{formatPrice(order.summary?.total || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
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
