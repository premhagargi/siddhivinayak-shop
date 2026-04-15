"use client";

import { useState, useEffect } from "react";
import {
  Users,
  CreditCard,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import SectionFadeIn from "@/components/animations/SectionFadeIn";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardData {
  kpis: {
    revenue: { value: number; change: number };
    orders: { value: number; change: number };
    newCustomers: { value: number; change: number };
    avgOrderValue: { value: number; change: number };
  };
  dailyRevenue: { name: string; total: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  recentOrders: { id: string; customer: string; total: number; status: string; date: string }[];
  totals: { totalProducts: number; totalCustomers: number; totalOrders: number };
}

function formatCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-sm text-muted-foreground">{error || "Could not load dashboard data."}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const { kpis, dailyRevenue, topProducts, recentOrders } = data;

  // Find the peak day for chart highlight
  const maxDayIdx = dailyRevenue.reduce(
    (maxIdx, item, idx, arr) => (item.total > arr[maxIdx].total ? idx : maxIdx),
    0
  );

  return (
    <SectionFadeIn className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl font-bold uppercase tracking-tight">Business Overview</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Performance metrics for the last 7 days.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products">
            <Button className="h-10 rounded-none bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6">
              Manage Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(kpis.revenue.value)}
          change={kpis.revenue.change}
          icon={<CreditCard className="h-3 w-3 text-accent" />}
        />
        <KpiCard
          label="Orders"
          value={`${kpis.orders.value}`}
          change={kpis.orders.change}
          icon={<ShoppingBag className="h-3 w-3 text-accent" />}
        />
        <KpiCard
          label="New Customers"
          value={`${kpis.newCustomers.value}`}
          change={kpis.newCustomers.change}
          icon={<Users className="h-3 w-3 text-accent" />}
        />
        <KpiCard
          label="Avg. Order Value"
          value={formatCurrency(kpis.avgOrderValue.value)}
          change={kpis.avgOrderValue.change}
          icon={<Package className="h-3 w-3 text-accent" />}
        />
      </div>

      {/* Charts & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 rounded-none border-muted shadow-none">
          <CardHeader className="py-4 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Sales Velocity</CardTitle>
            <CardDescription className="text-[8px] uppercase tracking-widest">Revenue generated per day this week.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] pt-4 px-4">
            {dailyRevenue.every((d) => d.total === 0) ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No revenue data this week
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenue}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "#888" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "#888" }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "0",
                      border: "1px solid #eee",
                      fontSize: "9px",
                      textTransform: "uppercase",
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                  />
                  <Bar dataKey="total" radius={[0, 0, 0, 0]}>
                    {dailyRevenue.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === maxDayIdx ? "#444" : "#eee"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="rounded-none border-muted shadow-none">
          <CardHeader className="py-4 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Top Products</CardTitle>
            <CardDescription className="text-[8px] uppercase tracking-widest">Best sellers by volume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4">
            {topProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No sales data yet</p>
            ) : (
              topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-muted pb-3 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold uppercase tracking-tight line-clamp-1">{product.name}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{product.quantity} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))
            )}
            <Link href="/admin/products" className="block pt-2">
              <Button variant="link" className="p-0 h-auto text-[9px] font-bold uppercase tracking-widest">
                Full Inventory <ArrowUpRight className="h-2 w-2 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="rounded-none border-muted shadow-none">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-4">
          <div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Recent Orders</CardTitle>
            <CardDescription className="text-[8px] uppercase tracking-widest">Latest customer activity across the storefront.</CardDescription>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" className="h-8 rounded-none border-muted text-[9px] font-bold uppercase tracking-widest px-4">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0 border-t border-muted">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-muted hover:bg-transparent">
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4">Order</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4">Customer</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4">Status</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-4 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id} className="border-muted hover:bg-secondary/10 transition-colors">
                    <TableCell className="py-2 px-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-primary">{order.id}</span>
                        <span className="text-[8px] text-muted-foreground uppercase tracking-widest">{order.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-4">
                      <span className="text-[11px] font-bold uppercase tracking-tight">{order.customer}</span>
                    </TableCell>
                    <TableCell className="py-2 px-4">
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right py-2 px-4">
                      <span className="text-[11px] font-bold">₹{order.total.toLocaleString("en-IN")}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SectionFadeIn>
  );
}

function KpiCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}) {
  const isPositive = change >= 0;
  return (
    <Card className="rounded-none border-muted shadow-none bg-secondary/10">
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
        <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-xl font-bold">{value}</div>
        <p
          className={cn(
            "text-[9px] flex items-center gap-1 font-bold uppercase tracking-widest mt-0.5",
            isPositive ? "text-green-600" : "text-orange-600"
          )}
        >
          {isPositive ? <ArrowUpRight className="h-2 w-2" /> : <ArrowDownRight className="h-2 w-2" />}
          {Math.abs(change)}% vs last week
        </p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    delivered: "bg-green-500/10 text-green-600 border-green-500/20",
    shipped: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    processing: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    pending: "bg-accent/5 text-accent border-accent/10",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };
  const colors = colorMap[status.toLowerCase()] || colorMap.pending;
  return (
    <span className={cn("inline-block px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full border", colors)}>
      {status}
    </span>
  );
}
