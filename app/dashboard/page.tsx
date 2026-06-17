"use client";
export const dynamic = "force-dynamic";

import { cn } from "@/lib/utils";
import { Card, CardTitle, Badge, PageSkeleton, KpiCard, Chart } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Stats {
  products_count?: number;
  orders_count?: number;
  revenue?: number;
  pending_orders?: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: { quantity: number }[];
}

export default function DashboardPage() {
  const t = useTranslations("dashboard_page");
  const to = useTranslations("orders");
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["dashboard-stats"],
    queryFn: (): Promise<Stats> =>
      api.get<Stats>("/dashboard/stats").catch(() => ({
        products_count: 0,
        orders_count: 0,
        revenue: 0,
        pending_orders: 0,
      })),
    enabled: !!token,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["orders-recent"],
    queryFn: () => api.get("/orders"),
    enabled: !!token,
  });

  const statusBadge: Record<string, { label: string; variant: "warning" | "info" | "success" | "danger" }> = {
    pending: { label: to("status_pending"), variant: "warning" },
    confirmed: { label: to("status_confirmed"), variant: "info" },
    shipped: { label: to("status_shipped"), variant: "info" },
    delivered: { label: to("status_delivered"), variant: "success" },
    returned: { label: to("status_returned"), variant: "danger" },
    cancelled: { label: to("status_cancelled"), variant: "danger" },
  };

  const latestOrders = (recentOrders ?? []).slice(0, 5);

  if (statsLoading && ordersLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--color-text))]">{t("title")}</h1>
          <p className="text-[rgb(var(--color-text-secondary))] mt-2 text-sm lg:text-base">{t("welcome")}</p>
        </div>
        <div className="hidden sm:block text-5xl opacity-10">📊</div>
      </div>

      {/* KPI Cards Grid - 4 columns on desktop, 2 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard
          icon="📦"
          value={String(stats?.products_count ?? 0)}
          label={t("stat_products")}
          color="navy"
          isLoading={statsLoading}
          trend={{ value: "12%", positive: true }}
        />
        <KpiCard
          icon="📋"
          value={String(stats?.orders_count ?? 0)}
          label={t("stat_orders")}
          color="terra"
          isLoading={statsLoading}
          trend={{ value: "8%", positive: true }}
        />
        <KpiCard
          icon="💰"
          value={stats?.revenue ? `${stats.revenue.toLocaleString()} د.ج` : "0 د.ج"}
          label={t("stat_revenue")}
          color="emerald"
          isLoading={statsLoading}
          trend={{ value: "23%", positive: true }}
        />
        <KpiCard
          icon="⏳"
          value={String(stats?.pending_orders ?? 0)}
          label={t("stat_pending")}
          color="amber"
          isLoading={statsLoading}
          trend={{ value: "3%", positive: false }}
        />
      </div>

      {/* Quick Actions - 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t("action_add_product"), href: "/dashboard/products", icon: "➕", color: "bg-blue-50 dark:bg-blue-950" },
          { label: t("action_new_order"), href: "/dashboard/orders/new", icon: "🛒", color: "bg-green-50 dark:bg-green-950" },
          { label: t("action_sales_report"), href: "/dashboard/orders", icon: "📊", color: "bg-purple-50 dark:bg-purple-950" },
          { label: t("action_settings"), href: "/dashboard/settings", icon: "⚙️", color: "bg-orange-50 dark:bg-orange-950" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${action.color}`}
          >
            <span className="text-3xl">{action.icon}</span>
            <span className="font-display text-xs font-semibold text-[rgb(var(--color-text-secondary))] text-center">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Charts Section - Two columns on desktop */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart - Spans 2 columns on desktop */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <CardTitle>{t("revenue_trend")}</CardTitle>
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">آخر 10 أيام</p>
            </div>
            <div className="flex gap-1">
              {["weekly", "monthly", "yearly"].map((label) => (
                <button key={label} className={cn(
                  "px-3 py-1 text-xs font-display font-semibold rounded-lg transition-all",
                  label === "monthly"
                    ? "bg-[rgb(var(--color-accent))] text-white shadow-md"
                    : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-accent-soft))] hover:text-[rgb(var(--color-text))]"
                )}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <Chart
            type="line"
            data={[
              { date: "1", revenue: 4000 },
              { date: "2", revenue: 3000 },
              { date: "3", revenue: 2000 },
              { date: "4", revenue: 2780 },
              { date: "5", revenue: 1890 },
              { date: "6", revenue: 2390 },
              { date: "7", revenue: 3490 },
              { date: "8", revenue: 4200 },
              { date: "9", revenue: 3800 },
              { date: "10", revenue: 4500 },
            ]}
            dataKey="revenue"
            height={320}
            colors={["#3a5f84"]}
          />
        </Card>

        {/* Order Status Breakdown */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <CardTitle>{t("order_status_breakdown")}</CardTitle>
          </div>
          <Chart
            type="pie"
            data={[
              { name: to("status_pending"), value: 45 },
              { name: to("status_confirmed"), value: 30 },
              { name: to("status_shipped"), value: 15 },
              { name: to("status_delivered"), value: 10 },
            ]}
            dataKey="value"
            height={280}
          />
        </Card>
      </div>

      {/* Top Products Chart - Full width on mobile, auto on desktop */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <CardTitle>{t("top_products")}</CardTitle>
          <span className="text-xs font-display font-semibold text-[rgb(var(--color-text-secondary))]">آخر 30 يوم</span>
        </div>
        <Chart
          type="bar"
          data={[
            { name: "Product A", sales: 400 },
            { name: "Product B", sales: 300 },
            { name: "Product C", sales: 200 },
            { name: "Product D", sales: 278 },
            { name: "Product E", sales: 189 },
          ]}
          dataKey="sales"
          height={300}
          colors={["#b6612e"]}
        />
      </Card>

      {/* Recent Orders Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <CardTitle>آخر الطلبات</CardTitle>
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">أحدث 5 طلبات من العملاء</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="px-4 py-2 rounded-lg bg-[rgb(var(--color-accent-soft))] text-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent))] hover:text-white font-display font-semibold text-sm transition-all"
          >
            عرض الكل
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[rgb(var(--color-border))]">
                <th className="text-right py-4 px-4 font-display font-semibold text-xs text-[rgb(var(--color-text-secondary))] uppercase">رقم الطلب</th>
                <th className="text-right py-4 px-4 font-display font-semibold text-xs text-[rgb(var(--color-text-secondary))] uppercase">العدد</th>
                <th className="text-right py-4 px-4 font-display font-semibold text-xs text-[rgb(var(--color-text-secondary))] uppercase">الإجمالي</th>
                <th className="text-right py-4 px-4 font-display font-semibold text-xs text-[rgb(var(--color-text-secondary))] uppercase">الحالة</th>
                <th className="text-right py-4 px-4 font-display font-semibold text-xs text-[rgb(var(--color-text-secondary))] uppercase">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[rgb(var(--color-text-secondary))] text-sm">{to("empty")}</td>
                </tr>
              ) : (
                latestOrders.map((order) => {
                  const st = statusBadge[order.status] || statusBadge.pending;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                      className="border-b border-[rgb(var(--color-border))] last:border-0 hover:bg-[rgb(var(--color-accent-soft))]/40 hover:shadow-sm transition-all duration-150 cursor-pointer"
                    >
                      <td className="py-4 px-4 font-display font-semibold text-[rgb(var(--color-accent))]">#{order.id.slice(0, 8)}</td>
                      <td className="py-4 px-4 text-[rgb(var(--color-text-secondary))]">{order.items?.length ?? 0} عناصر</td>
                      <td className="py-4 px-4 font-semibold text-[rgb(var(--color-text))]">{formatCurrency(order.total)}</td>
                      <td className="py-4 px-4"><Badge variant={st.variant}>{st.label}</Badge></td>
                      <td className="py-4 px-4 text-[rgb(var(--color-text-secondary))] text-xs">{formatDateShort(order.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Activity Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <CardTitle>النشاط الأخير</CardTitle>
          <span className="text-xs font-display font-semibold text-[rgb(var(--color-text-secondary))]">آخر 5 أنشطة</span>
        </div>
        <div className="space-y-3">
          {[
            { icon: "📦", text: "تم إضافة منتج جديد - \"منتج جديد متميز\"", time: "منذ 5 دقائق" },
            { icon: "📋", text: "طلب جديد من أحمد محمد - #abc123", time: "منذ 15 دقيقة" },
            { icon: "🚚", text: "تم شحن الطلب #abc120 - FedEx", time: "منذ ساعة" },
            { icon: "💰", text: "تم تأكيد الطلب #abc119 - المبلغ: 5000 د.ج", time: "منذ ساعتين" },
            { icon: "⚙️", text: "تم تحديث إعدادات المتجر بواسطة Admin", time: "منذ 3 ساعات" },
          ].map((activity, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-[rgb(var(--color-border))] last:border-0">
              <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-accent-soft))] flex items-center justify-center shrink-0 text-lg">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0 mt-0.5">
                <p className="text-sm font-display font-semibold text-[rgb(var(--color-text))]">{activity.text}</p>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
}
