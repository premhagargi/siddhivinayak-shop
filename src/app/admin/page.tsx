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
    <SectionFadeIn className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Business Overview</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Performance metrics for the last 7 days.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 rounded-none border-muted text-[10px] font-bold uppercase tracking-widest">
            Download Report
          </Button>
          <Link href="/admin/products">
            <Button className="h-12 rounded-none bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-8">
              Manage Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-none border-muted shadow-none bg-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹42,200</div>
            <p className="text-[10px] text-green-600 flex items-center gap-1 font-bold uppercase tracking-widest mt-1">
              <ArrowUpRight className="h-3 w-3" /> 12% vs last week
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-muted shadow-none bg-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+156</div>
            <p className="text-[10px] text-green-600 flex items-center gap-1 font-bold uppercase tracking-widest mt-1">
              <ArrowUpRight className="h-3 w-3" /> 8% vs last week
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-muted shadow-none bg-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Customers</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+42</div>
            <p className="text-[10px] text-orange-600 flex items-center gap-1 font-bold uppercase tracking-widest mt-1">
              <ArrowDownRight className="h-3 w-3" /> 3% vs last week
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-muted shadow-none bg-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Avg. Order Value</CardTitle>
            <Package className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,840</div>
            <p className="text-[10px] text-green-600 flex items-center gap-1 font-bold uppercase tracking-widest mt-1">
              <ArrowUpRight className="h-3 w-3" /> 5% vs last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 rounded-none border-muted shadow-none">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-widest">Sales Velocity</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest">Revenue generated per day this week.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] pt-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }} 
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '0', border: '1px solid #eee', fontSize: '10px', textTransform: 'uppercase' }}
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
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-widest">Top Products</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest">Best sellers by volume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {TOP_PRODUCTS.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-tight line-clamp-1">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">₹{(product.revenue / 100000).toFixed(1)}L</p>
                </div>
              </div>
            ))}
            <Link href="/admin/products" className="block pt-4">
              <Button variant="link" className="p-0 h-auto text-[10px] font-bold uppercase tracking-widest">
                Full Inventory <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="rounded-none border-muted shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs font-bold uppercase tracking-widest">Recent Orders</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest">Latest customer activity across the storefront.</CardDescription>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" className="h-10 rounded-none border-muted text-[10px] font-bold uppercase tracking-widest px-6">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-muted hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-14">Order</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-14">Customer</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-14">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-14 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_ORDERS.map((order) => (
                <TableRow key={order.id} className="border-muted hover:bg-secondary/10 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-primary">{order.id}</span>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest">{order.date}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold uppercase tracking-tight">{order.customer}</span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-block px-3 py-1 bg-accent/5 text-accent text-[8px] font-bold uppercase tracking-widest rounded-full border border-accent/10">
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-bold">₹{order.total.toLocaleString('en-IN')}</span>
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
