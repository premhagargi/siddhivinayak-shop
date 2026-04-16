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

type RangeKey = "today" | "week" | "month" | "custom";

function computeRange(range: RangeKey, fromStr?: string | null, toStr?: string | null) {
  const now = new Date();
  let start: Date;
  let end: Date;
  let bucket: "hour" | "day" = "day";

  if (range === "today") {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setHours(23, 59, 59, 999);
    bucket = "hour";
  } else if (range === "week") {
    // Start of current week (Monday) to end of week (Sunday)
    start = new Date(now);
    const dayOfWeek = start.getDay();
    const daysToMonday = (dayOfWeek + 6) % 7;
    start.setDate(start.getDate() - daysToMonday);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (range === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    start = fromStr ? new Date(fromStr) : new Date(now.getTime() - 7 * 86400000);
    if (isNaN(start.getTime())) start = new Date(now.getTime() - 7 * 86400000);
    start.setHours(0, 0, 0, 0);
    end = toStr ? new Date(toStr) : new Date(now);
    if (isNaN(end.getTime())) end = new Date(now);
    end.setHours(23, 59, 59, 999);
    if (end < start) {
      const tmp = start;
      start = end;
      end = tmp;
    }
  }

  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);

  return { start, end, prevStart, prevEnd, bucket };
}

function buildChart(
  orders: any[],
  r: { start: Date; end: Date; bucket: "hour" | "day" }
): { name: string; total: number }[] {
  const buckets: { name: string; total: number }[] = [];
  const now = new Date();

  if (r.bucket === "hour") {
    for (let h = 0; h < 24; h++) {
      const bStart = new Date(r.start);
      bStart.setHours(h, 0, 0, 0);
      if (bStart > now) break;
      const bEnd = new Date(bStart);
      bEnd.setHours(h, 59, 59, 999);
      const total = orders
        .filter((o: any) => o.createdAt && o.createdAt >= bStart && o.createdAt <= bEnd)
        .reduce((sum: number, o: any) => sum + o.total, 0);
      const label = h === 0 ? "12A" : h === 12 ? "12P" : h < 12 ? `${h}A` : `${h - 12}P`;
      buckets.push({ name: label, total });
    }
  } else {
    const msPerDay = 86400000;
    const days = Math.max(1, Math.ceil((r.end.getTime() - r.start.getTime() + 1) / msPerDay));
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < days; i++) {
      const bStart = new Date(r.start);
      bStart.setDate(bStart.getDate() + i);
      bStart.setHours(0, 0, 0, 0);
      if (bStart > now) break;
      const bEnd = new Date(bStart);
      bEnd.setHours(23, 59, 59, 999);
      const total = orders
        .filter((o: any) => o.createdAt && o.createdAt >= bStart && o.createdAt <= bEnd)
        .reduce((sum: number, o: any) => sum + o.total, 0);
      const label = days <= 7 ? dayNames[bStart.getDay()] : `${bStart.getDate()}`;
      buckets.push({ name: label, total });
    }
  }

  return buckets;
}

/**
 * GET /api/admin/dashboard
 * Query params:
 *   range: today | week | month | custom (defaults to month)
 *   from, to: ISO dates (required when range=custom)
 * Aggregates KPIs, chart data, top products, and recent orders
 * filtered to the requested time range. Comparison metrics use the
 * immediately preceding period of the same duration.
 */
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const adminDb = getDbOrNull();

  if (!adminDb) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = (searchParams.get("range") || "month") as RangeKey;
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const validRanges: RangeKey[] = ["today", "week", "month", "custom"];
    const range: RangeKey = validRanges.includes(rangeParam) ? rangeParam : "month";
    const { start, end, prevStart, prevEnd, bucket } = computeRange(range, fromParam, toParam);

    // Fetch all orders, products, users in parallel
    const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
      adminDb.collection("orders").orderBy("createdAt", "desc").get(),
      adminDb.collection("products").get(),
      adminDb.collection("users").get(),
    ]);

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

    const inRange = allOrders.filter(
      (o: any) => o.createdAt && o.createdAt >= start && o.createdAt <= end
    );
    const inPrevRange = allOrders.filter(
      (o: any) => o.createdAt && o.createdAt >= prevStart && o.createdAt <= prevEnd
    );

    // ── KPIs ──
    const currentRevenue = inRange.reduce((sum: number, o: any) => sum + o.total, 0);
    const prevRevenue = inPrevRange.reduce((sum: number, o: any) => sum + o.total, 0);
    const revenueChange =
      prevRevenue > 0
        ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
        : currentRevenue > 0
        ? 100
        : 0;

    const currentOrderCount = inRange.length;
    const prevOrderCount = inPrevRange.length;
    const orderChange =
      prevOrderCount > 0
        ? Math.round(((currentOrderCount - prevOrderCount) / prevOrderCount) * 100)
        : currentOrderCount > 0
        ? 100
        : 0;

    const allUsers = usersSnap.docs.map((doc: any) => {
      const d = doc.data();
      return { createdAt: d.createdAt?.toDate?.() || null };
    });
    const newCustomersCurrent = allUsers.filter(
      (u: any) => u.createdAt && u.createdAt >= start && u.createdAt <= end
    ).length;
    const newCustomersPrev = allUsers.filter(
      (u: any) => u.createdAt && u.createdAt >= prevStart && u.createdAt <= prevEnd
    ).length;
    const customerChange =
      newCustomersPrev > 0
        ? Math.round(((newCustomersCurrent - newCustomersPrev) / newCustomersPrev) * 100)
        : newCustomersCurrent > 0
        ? 100
        : 0;

    const avgOrderValue =
      currentOrderCount > 0 ? Math.round(currentRevenue / currentOrderCount) : 0;
    const prevAvg = prevOrderCount > 0 ? Math.round(prevRevenue / prevOrderCount) : 0;
    const avgChange =
      prevAvg > 0
        ? Math.round(((avgOrderValue - prevAvg) / prevAvg) * 100)
        : avgOrderValue > 0
        ? 100
        : 0;

    const dailyRevenue = buildChart(allOrders, { start, end, bucket });

    // ── Top products (filtered by selected range) ──
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of inRange) {
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

    // ── Recent orders (latest 5 overall; not filtered by range) ──
    const recentOrders = allOrders.slice(0, 5).map((o: any) => ({
      id: o.orderId,
      customer: o.customerName,
      total: o.total,
      status: o.status,
      date: o.createdAt ? formatRelativeTime(o.createdAt) : "Unknown",
    }));

    const totalProducts = productsSnap.size;
    const totalCustomers = usersSnap.size;
    const totalOrders = allOrders.length;

    return NextResponse.json({
      kpis: {
        revenue: { value: currentRevenue, change: revenueChange },
        orders: { value: currentOrderCount, change: orderChange },
        newCustomers: { value: newCustomersCurrent, change: customerChange },
        avgOrderValue: { value: avgOrderValue, change: avgChange },
      },
      range: {
        key: range,
        start: start.toISOString(),
        end: end.toISOString(),
        bucket,
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
