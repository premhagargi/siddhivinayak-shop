"use client";

import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingBag
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
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
  Cell
} from "recharts";
import SectionFadeIn from "@/components/animations/SectionFadeIn";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const REVENUE_DATA = [
  { name: "Mon", total: 4500 },
  { name: "Tue", total: 5200 },
  { name: "Wed", total: 4800 },
  { name: "Thu", total: 6100 },
  { name: "Fri", total: 5900 },
  { name: "Sat", total: 8200 },
  { name: "Sun", total: 7500 },
];

const RECENT_ORDERS = [
  { id: "ORD-9281", customer: "Anjali Kapoor", total: 24900, status: "Delivered", date: "2 mins ago" },
  { id: "ORD-9282", customer: "Rajesh Mehta", total: 12500, status: "Processing", date: "15 mins ago" },
  { id: "ORD-9283", customer: "Priya Sharma", total: 32500, status: "Unfulfilled", date: "1 hour ago" },
  { id: "ORD-9284", customer: "Vikram Singh", total: 15800, status: "Shipped", date: "3 hours ago" },
];

const TOP_PRODUCTS = [
  { name: "Royal Maroon Silk Banarasi", sales: 42, revenue: 1045800 },
  { name: "Sterling Silver Lakshmi Idol", sales: 38, revenue: 475000 },
  { name: "Emerald Kanjeevaram", sales: 29, revenue: 942500 },
];

export default function AdminDashboardPage() {
  return (
    <SectionFadeIn className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl font-bold uppercase tracking-tight">Business Overview</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Performance metrics for the last 7 days.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 rounded-none border-muted text-[10px] font-bold uppercase tracking-widest px-4">
            Download Report
          </Button>
          <Link href="/admin/products">
            <Button className="h-10 rounded-none bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6">
              Manage Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-none border-muted shadow-none bg-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
            <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Total Revenue</CardTitle>
            <CreditCard className="h-3 w-3 text-accent" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">₹42,200</div>
            <p className="text-[9px] text-green-600 flex items-center gap-1 font-bold uppercase tracking-widest mt-0.5">
              <ArrowUpRight className="h-2 w-2" /> 12% vs last week
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-muted shadow-none bg-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
            <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Orders</CardTitle>
            <ShoppingBag className="h-3 w-3 text-accent" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">+156</div>
            <p className="text-[9px] text-green-600 flex items-center gap-1 font-bold uppercase tracking-widest mt-0.5">
              <ArrowUpRight className="h-2 w-2" /> 8% vs last week
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-muted shadow-none bg-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
            <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">New Customers</CardTitle>
            <Users className="h-3 w-3 text-accent" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">+42</div>
            <p className="text-[9px] text-orange-600 flex items-center gap-1 font-bold uppercase tracking-widest mt-0.5">
              <ArrowDownRight className="h-2 w-2" /> 3% vs last week
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-muted shadow-none bg-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
            <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Avg. Order Value</CardTitle>
            <Package className="h-3 w-3 text-accent" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">₹2,840</div>
            <p className="text-[9px] text-green-600 flex items-center gap-1 font-bold uppercase tracking-widest mt-0.5">
              <ArrowUpRight className="h-2 w-2" /> 5% vs last week
            </p>
          </CardContent>
        </Card>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#888' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#888' }} 
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '0', border: '1px solid #eee', fontSize: '9px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="total" radius={[0, 0, 0, 0]}>
                  {REVENUE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === REVENUE_DATA.length - 2 ? '#444' : '#eee'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="rounded-none border-muted shadow-none">
          <CardHeader className="py-4 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Top Products</CardTitle>
            <CardDescription className="text-[8px] uppercase tracking-widest">Best sellers by volume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4">
            {TOP_PRODUCTS.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-muted pb-3 last:border-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold uppercase tracking-tight line-clamp-1">{product.name}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold">₹{(product.revenue / 100000).toFixed(1)}L</p>
                </div>
              </div>
            ))}
            <Link href="/admin/products" className="block pt-2">
              <Button variant="link" className="p-0 h-auto text-[9px] font-bold uppercase tracking-widest">
                Full Inventory <ArrowUpRight className="h-2 w-2 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
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
              {RECENT_ORDERS.map((order) => (
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
                    <span className="inline-block px-2 py-0.5 bg-accent/5 text-accent text-[8px] font-bold uppercase tracking-widest rounded-full border border-accent/10">
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-2 px-4">
                    <span className="text-[11px] font-bold">₹{order.total.toLocaleString('en-IN')}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SectionFadeIn>
  );
}
