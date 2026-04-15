import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyAdmin } from "@/lib/verify-admin";

function getDbOrNull() {
  try {
    return getAdminDb();
  } catch {
    return null;
  }
}

/**
 * GET /api/admin/dashboard
 * Aggregates real-time KPIs, recent orders, top products, and daily revenue
 * from Firestore orders, products, and users collections.
 */
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();

  if (!adminDb) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Fetch all orders, products, users in parallel
    const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
      adminDb.collection("orders").orderBy("createdAt", "desc").get(),
      adminDb.collection("products").get(),
      adminDb.collection("users").get(),
    ]);

    // ── Parse all orders ──
    const allOrders = ordersSnap.docs.map((doc: any) => {
      const d = doc.data();
      return {
        id: doc.id,
        orderId: d.orderId || doc.id,
        userId: d.userId || d.guestEmail || "Guest",
        customerName: d.shippingAddress?.name || d.userId || "Guest",
        status: d.status || "pending",
        paymentStatus: d.paymentStatus || "pending",
        total: d.summary?.total || 0,
        items: d.items || [],
        createdAt: d.createdAt?.toDate?.() || null,
      };
    });

    // ── Split into this week / last week ──
    const thisWeekOrders = allOrders.filter(
      (o: any) => o.createdAt && o.createdAt >= sevenDaysAgo
    );
    const lastWeekOrders = allOrders.filter(
      (o: any) => o.createdAt && o.createdAt >= fourteenDaysAgo && o.createdAt < sevenDaysAgo
    );

    // ── KPIs ──
    const thisWeekRevenue = thisWeekOrders.reduce((sum: number, o: any) => sum + o.total, 0);
    const lastWeekRevenue = lastWeekOrders.reduce((sum: number, o: any) => sum + o.total, 0);
    const revenueChange = lastWeekRevenue > 0
      ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
      : thisWeekRevenue > 0 ? 100 : 0;

    const thisWeekOrderCount = thisWeekOrders.length;
    const lastWeekOrderCount = lastWeekOrders.length;
    const orderChange = lastWeekOrderCount > 0
      ? Math.round(((thisWeekOrderCount - lastWeekOrderCount) / lastWeekOrderCount) * 100)
      : thisWeekOrderCount > 0 ? 100 : 0;

    // New customers this week vs last week
    const allUsers = usersSnap.docs.map((doc: any) => {
      const d = doc.data();
      return { createdAt: d.createdAt?.toDate?.() || null };
    });
    const newCustomersThisWeek = allUsers.filter(
      (u: any) => u.createdAt && u.createdAt >= sevenDaysAgo
    ).length;
    const newCustomersLastWeek = allUsers.filter(
      (u: any) => u.createdAt && u.createdAt >= fourteenDaysAgo && u.createdAt < sevenDaysAgo
    ).length;
    const customerChange = newCustomersLastWeek > 0
      ? Math.round(((newCustomersThisWeek - newCustomersLastWeek) / newCustomersLastWeek) * 100)
      : newCustomersThisWeek > 0 ? 100 : 0;

    // Average order value
    const avgOrderValue = thisWeekOrderCount > 0
      ? Math.round(thisWeekRevenue / thisWeekOrderCount)
      : 0;
    const lastWeekAvg = lastWeekOrderCount > 0
      ? Math.round(lastWeekRevenue / lastWeekOrderCount)
      : 0;
    const avgChange = lastWeekAvg > 0
      ? Math.round(((avgOrderValue - lastWeekAvg) / lastWeekAvg) * 100)
      : avgOrderValue > 0 ? 100 : 0;

    // ── Daily revenue for chart (last 7 days) ──
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyRevenue: { name: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTotal = allOrders
        .filter((o: any) => o.createdAt && o.createdAt >= dayStart && o.createdAt <= dayEnd)
        .reduce((sum: number, o: any) => sum + o.total, 0);

      dailyRevenue.push({
        name: dayNames[dayStart.getDay()],
        total: dayTotal,
      });
    }

    // ── Top products by quantity sold (from all orders) ──
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of allOrders) {
      for (const item of order.items) {
        const key = item.productId || item.name;
        if (!productSales[key]) {
          productSales[key] = { name: item.name || key, quantity: 0, revenue: 0 };
        }
        productSales[key].quantity += item.quantity || 1;
        productSales[key].revenue += (item.price || 0) * (item.quantity || 1);
      }
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // ── Recent orders (latest 5) ──
    const recentOrders = allOrders.slice(0, 5).map((o: any) => ({
      id: o.orderId,
      customer: o.customerName,
      total: o.total,
      status: o.status,
      date: o.createdAt ? formatRelativeTime(o.createdAt) : "Unknown",
    }));

    // ── Totals ──
    const totalProducts = productsSnap.size;
    const totalCustomers = usersSnap.size;
    const totalOrders = allOrders.length;

    return NextResponse.json({
      kpis: {
        revenue: { value: thisWeekRevenue, change: revenueChange },
        orders: { value: thisWeekOrderCount, change: orderChange },
        newCustomers: { value: newCustomersThisWeek, change: customerChange },
        avgOrderValue: { value: avgOrderValue, change: avgChange },
      },
      dailyRevenue,
      topProducts,
      recentOrders,
      totals: { totalProducts, totalCustomers, totalOrders },
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
