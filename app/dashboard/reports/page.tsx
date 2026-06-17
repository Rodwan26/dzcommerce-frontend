"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Button, PageHeader, Card, CardTitle, Badge } from "@/components/ui";
import { useTranslations } from "next-intl";

const REPORT_TEMPLATES = [
  {
    id: "sales_summary",
    name: "Sales Summary",
    description: "Overview of sales, revenue, and orders by period",
    icon: "💰",
    metrics: ["Total Revenue", "Order Count", "Avg Order Value", "Growth Rate"],
  },
  {
    id: "product_performance",
    name: "Product Performance",
    description: "Top selling products, inventory levels, and turnover rates",
    icon: "📊",
    metrics: ["Top Products", "Stock Levels", "Turnover Rate", "Revenue per Product"],
  },
  {
    id: "customer_analysis",
    name: "Customer Analysis",
    description: "Customer segments, lifetime value, and retention rates",
    icon: "👥",
    metrics: ["New Customers", "LTV", "Retention Rate", "Repeat Purchase Rate"],
  },
  {
    id: "channel_performance",
    name: "Channel Performance",
    description: "Revenue and orders by sales channel",
    icon: "🌐",
    metrics: ["Revenue by Channel", "Orders by Channel", "Conversion Rate", "Cost per Acquisition"],
  },
  {
    id: "inventory_report",
    name: "Inventory Report",
    description: "Stock levels, reorder alerts, and inventory value",
    icon: "📦",
    metrics: ["Stock Status", "Low Stock Items", "Total Value", "Turnover Days"],
  },
  {
    id: "financial_summary",
    name: "Financial Summary",
    description: "Detailed P&L, margins, and financial metrics",
    icon: "📈",
    metrics: ["Revenue", "COGS", "Gross Margin", "Net Profit"],
  },
];

const SCHEDULED_REPORTS = [
  {
    id: 1,
    name: "Weekly Sales Report",
    type: "sales_summary",
    frequency: "Weekly (Every Monday)",
    recipients: ["admin@dz.com"],
    last_sent: "2026-06-16",
    next_send: "2026-06-23",
    enabled: true,
  },
  {
    id: 2,
    name: "Monthly Product Performance",
    type: "product_performance",
    frequency: "Monthly (1st of Month)",
    recipients: ["admin@dz.com", "manager@dz.com"],
    last_sent: "2026-06-01",
    next_send: "2026-07-01",
    enabled: true,
  },
  {
    id: 3,
    name: "Quarterly Financial Summary",
    type: "financial_summary",
    frequency: "Quarterly",
    recipients: ["cfo@dz.com"],
    last_sent: "2026-04-01",
    next_send: "2026-07-01",
    enabled: false,
  },
];

export default function ReportsPage() {
  const t = useTranslations("reports");
  const [activeTab, setActiveTab] = useState<"templates" | "scheduled" | "export">("templates");

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t("title", { defaultValue: "Reports & Exports" })}
        description={t("subtitle", { defaultValue: "Generate, schedule, and export business reports" })}
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[rgb(var(--color-border))]">
        {(["templates", "scheduled", "export"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-display font-semibold text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? "border-[rgb(var(--color-accent))] text-[rgb(var(--color-accent))]"
                : "border-transparent text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))]"
            }`}
          >
            {tab === "templates"
              ? t("templates", { defaultValue: "Templates" })
              : tab === "scheduled"
                ? t("scheduled", { defaultValue: "Scheduled" })
                : t("export", { defaultValue: "Export" })}
          </button>
        ))}
      </div>

      {/* Report Templates */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            {t("templates_desc", { defaultValue: "Choose a template to generate a new report" })}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TEMPLATES.map((report) => (
              <Card key={report.id} className="flex flex-col hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{report.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-display font-bold">{report.name}</h3>
                  </div>
                </div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4 flex-1">{report.description}</p>
                <div className="mb-4 pb-4 border-b border-[rgb(var(--color-border))]">
                  <p className="text-xs font-display font-semibold text-[rgb(var(--color-text-secondary))] uppercase mb-2">
                    Metrics Included
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {report.metrics.map((metric) => (
                      <span key={metric} className="text-xs px-2 py-1 rounded bg-[rgb(var(--color-accent-soft))] text-[rgb(var(--color-accent))]">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">{t("generate", { defaultValue: "Generate" })}</Button>
                  <Button variant="secondary">{t("schedule", { defaultValue: "Schedule" })}</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Reports */}
      {activeTab === "scheduled" && (
        <div className="space-y-4">
          <Button>{t("create_schedule", { defaultValue: "Create Scheduled Report" })}</Button>
          <div className="space-y-3">
            {SCHEDULED_REPORTS.map((report) => (
              <Card key={report.id} className="flex items-start justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold">{report.name}</h3>
                    <Badge variant={report.enabled ? "success" : "default"}>
                      {report.enabled ? t("active", { defaultValue: "Active" }) : t("inactive", { defaultValue: "Inactive" })}
                    </Badge>
                  </div>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-2">{report.frequency}</p>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                    {t("next_send", { defaultValue: "Next send" })}: {report.next_send}
                  </p>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                    {t("recipients", { defaultValue: "Recipients" })}: {report.recipients.join(", ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    {t("edit", { defaultValue: "Edit" })}
                  </Button>
                  <Button variant="ghost" size="sm" className="!text-[rgb(var(--color-danger))]">
                    {t("delete", { defaultValue: "Delete" })}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Export Data */}
      {activeTab === "export" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Export Options */}
            <Card>
              <CardTitle>{t("export_data", { defaultValue: "Export Data" })}</CardTitle>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Products", description: "All product information and inventory" },
                  { label: "Orders", description: "Order details, items, and shipping info" },
                  { label: "Customers", description: "Customer profiles and purchase history" },
                  { label: "Transactions", description: "Payment and revenue data" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-lg border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))] transition-colors">
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">{item.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        CSV
                      </Button>
                      <Button size="sm" variant="secondary">
                        Excel
                      </Button>
                      <Button size="sm" variant="secondary">
                        PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* API Export */}
            <Card>
              <CardTitle>{t("api_access", { defaultValue: "API Access" })}</CardTitle>
              <div className="mt-4 space-y-3">
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {t("api_desc", { defaultValue: "Access your data programmatically via REST API. Generate API keys below." })}
                </p>
                <div className="p-3 bg-[rgb(var(--color-accent-soft))] rounded-lg border border-[rgb(var(--color-border))]">
                  <p className="font-mono text-xs text-[rgb(var(--color-accent))] break-all">sk_live_xxxxxxxxxxxxxxxxxxxx</p>
                </div>
                <Button className="w-full">{t("generate_key", { defaultValue: "Generate New API Key" })}</Button>
                <Button variant="secondary" className="w-full">
                  {t("view_docs", { defaultValue: "View API Documentation" })}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
