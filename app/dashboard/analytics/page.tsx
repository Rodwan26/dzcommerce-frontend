"use client";
export const dynamic = "force-dynamic";

import { Card, CardTitle, PageHeader, PageSkeleton, Chart, Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface AnalyticsData {
  daily_revenue: Array<{ date: string; revenue: number }>;
  revenue_by_channel: Array<{ name: string; value: number }>;
  product_performance: Array<{ name: string; sales: number }>;
  customer_metrics: Array<{ month: string; new_customers: number; repeat_customers: number }>;
  geographic_sales: Array<{ region: string; value: number }>;
}

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "custom">("30d");

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics", dateRange],
    queryFn: () =>
      api.get("/analytics/dashboard", { params: { range: dateRange } }).catch(() => ({
        daily_revenue: [
          { date: "1", revenue: 4500 },
          { date: "2", revenue: 5200 },
          { date: "3", revenue: 4800 },
          { date: "4", revenue: 6100 },
          { date: "5", revenue: 5900 },
          { date: "6", revenue: 6500 },
          { date: "7", revenue: 7200 },
          { date: "8", revenue: 6800 },
          { date: "9", revenue: 7500 },
          { date: "10", revenue: 8100 },
        ],
        revenue_by_channel: [
          { name: "Direct", value: 35000 },
          { name: "Marketplace", value: 25000 },
          { name: "Social", value: 15000 },
          { name: "Email", value: 10000 },
        ],
        product_performance: [
          { name: "Product A", sales: 450 },
          { name: "Product B", sales: 380 },
          { name: "Product C", sales: 290 },
          { name: "Product D", sales: 210 },
          { name: "Product E", sales: 150 },
        ],
        customer_metrics: [
          { month: "Jan", new_customers: 120, repeat_customers: 85 },
          { month: "Feb", new_customers: 150, repeat_customers: 105 },
          { month: "Mar", new_customers: 180, repeat_customers: 135 },
          { month: "Apr", new_customers: 165, repeat_customers: 140 },
          { month: "May", new_customers: 200, repeat_customers: 160 },
          { month: "Jun", new_customers: 220, repeat_customers: 185 },
        ],
        geographic_sales: [
          { region: "North Africa", value: 45000 },
          { region: "West Africa", value: 28000 },
          { region: "Sub-Saharan", value: 18000 },
          { region: "Middle East", value: 12000 },
        ],
      })),
    enabled: !!token,
  });

  if (isLoading) return <PageSkeleton />;

  const metrics = [
    {
      label: t("total_revenue", { defaultValue: "Total Revenue" }),
      value: "850,000 د.ج",
      trend: { value: "+23%", positive: true },
    },
    {
      label: t("total_orders", { defaultValue: "Total Orders" }),
      value: "1,245",
      trend: { value: "+18%", positive: true },
    },
    {
      label: t("avg_order_value", { defaultValue: "Avg Order Value" }),
      value: "6,800 د.ج",
      trend: { value: "+12%", positive: true },
    },
    {
      label: t("conversion_rate", { defaultValue: "Conversion Rate" }),
      value: "3.24%",
      trend: { value: "+1.2%", positive: true },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--color-text))]">{t("title", { defaultValue: "Analytics & Reports" })}</h1>
          <p className="text-[rgb(var(--color-text-secondary))] mt-2 text-sm lg:text-base">تحليل شامل لأداء المتجر والمبيعات</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-2 text-xs font-display font-semibold rounded-lg transition-all ${
                dateRange === range
                  ? "bg-[rgb(var(--color-accent))] text-white shadow-md"
                  : "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-accent-soft))]"
              }`}
            >
              {range === "7d" ? "7 أيام" : range === "30d" ? "30 يوم" : "90 يوم"}
            </button>
          ))}
        </div>
          description={t("subtitle", { defaultValue: "Track your business performance in real-time" })}
        />
        <div className="flex gap-1">
          {(["7d", "30d", "90d", "custom"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 text-xs font-display font-semibold rounded-lg transition-colors ${
                dateRange === range
                  ? "bg-[rgb(var(--color-accent))] text-white"
                  : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-accent-soft))]"
              }`}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "Custom"}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="!p-4">
            <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-1">
              {metric.label}
            </p>
            <p className="text-2xl font-display font-extrabold mb-2">{metric.value}</p>
            <div className="flex items-center gap-1 text-xs font-semibold">
              <span className={metric.trend.positive ? "text-[rgb(var(--color-success))]" : "text-[rgb(var(--color-danger))]"}>
                {metric.trend.positive ? "↑" : "↓"} {metric.trend.value}
              </span>
              <span className="text-[rgb(var(--color-text-secondary))]">vs last period</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardTitle>{t("revenue_trend", { defaultValue: "Revenue Trend" })}</CardTitle>
        <Chart
          type="line"
          data={analytics?.daily_revenue || []}
          dataKey="revenue"
          height={320}
          colors={["#3a5f84"]}
        />
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Channel */}
        <Card>
          <CardTitle>{t("revenue_by_channel", { defaultValue: "Revenue by Channel" })}</CardTitle>
          <Chart
            type="pie"
            data={analytics?.revenue_by_channel || []}
            dataKey="value"
            height={300}
          />
        </Card>

        {/* Top Products */}
        <Card>
          <CardTitle>{t("top_products", { defaultValue: "Top Products" })}</CardTitle>
          <Chart
            type="bar"
            data={analytics?.product_performance || []}
            dataKey="sales"
            height={300}
            colors={["#b6612e"]}
          />
        </Card>
      </div>

      {/* Customer Acquisition */}
      <Card>
        <CardTitle>{t("customer_acquisition", { defaultValue: "Customer Acquisition & Retention" })}</CardTitle>
        <Chart
          type="bar"
          data={analytics?.customer_metrics || []}
          dataKey={["new_customers", "repeat_customers"]}
          height={300}
          colors={["#3a5f84", "#b6612e"]}
        />
      </Card>

      {/* Geographic Sales */}
      <Card>
        <CardTitle>{t("geographic_sales", { defaultValue: "Sales by Region" })}</CardTitle>
        <Chart
          type="pie"
          data={analytics?.geographic_sales || []}
          dataKey="value"
          height={300}
        />
      </Card>

      {/* Export Section */}
      <Card>
        <CardTitle>{t("export_reports", { defaultValue: "Export Reports" })}</CardTitle>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary">{t("export_csv", { defaultValue: "Export CSV" })}</Button>
          <Button variant="secondary">{t("export_pdf", { defaultValue: "Export PDF" })}</Button>
          <Button variant="secondary">{t("export_excel", { defaultValue: "Export Excel" })}</Button>
          <Button variant="secondary">{t("schedule_report", { defaultValue: "Schedule Report" })}</Button>
        </div>
      </Card>
    </div>
  );
}
