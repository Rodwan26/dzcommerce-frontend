"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { Button, Badge, SearchBar, PageHeader, TableSkeleton, Chart } from "@/components/ui";
import { Table, type Column } from "@/components/ui/Table";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { Card, CardTitle } from "@/components/ui";
import { formatCurrency, formatDateShort } from "@/lib/utils";

interface Customer {
  id: string;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  orders_count?: number;
  total_spent?: number;
  last_order_date?: string;
  created_at: string;
}

export default function CustomersPage() {
  const t = useTranslations("customers");
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<"all" | "vip" | "high-value" | "new">("all");

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => api.get("/customers").catch(() => []),
    enabled: !!token,
  });

  const filtered = useMemo(() => {
    if (!customers) return [];
    return customers.filter((c) => {
      const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
      const email = c.email.toLowerCase();
      const matchesSearch = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());

      let matchesSegment = true;
      if (segmentFilter === "vip") matchesSegment = (c.orders_count || 0) > 10;
      if (segmentFilter === "high-value") matchesSegment = (c.total_spent || 0) > 50000;
      if (segmentFilter === "new") {
        const createdDate = new Date(c.created_at);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        matchesSegment = createdDate > thirtyDaysAgo;
      }

      return matchesSearch && matchesSegment;
    });
  }, [customers, search, segmentFilter]);

  const stats = {
    total: customers?.length ?? 0,
    vip: customers?.filter((c) => (c.orders_count || 0) > 10).length ?? 0,
    highValue: customers?.filter((c) => (c.total_spent || 0) > 50000).length ?? 0,
    new: customers?.filter((c) => {
      const createdDate = new Date(c.created_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return createdDate > thirtyDaysAgo;
    }).length ?? 0,
  };

  const columns: Column<Customer>[] = [
    {
      key: "name",
      label: t("table_name", { defaultValue: "Name" }),
      sortable: true,
      className: "font-semibold",
      render: (c) => (
        <div>
          <p className="font-semibold">{c.first_name} {c.last_name || "(No name)"}</p>
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">{c.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      label: t("table_phone", { defaultValue: "Phone" }),
      render: (c) => <span className="text-[rgb(var(--color-text-secondary))] text-sm">{c.phone || "—"}</span>,
    },
    {
      key: "orders_count",
      label: t("table_orders", { defaultValue: "Orders" }),
      sortable: true,
      render: (c) => <span className="font-semibold">{c.orders_count ?? 0}</span>,
    },
    {
      key: "total_spent",
      label: t("table_total_spent", { defaultValue: "Total Spent" }),
      sortable: true,
      render: (c) => <span className="font-semibold">{formatCurrency(c.total_spent ?? 0)}</span>,
    },
    {
      key: "last_order_date",
      label: t("table_last_order", { defaultValue: "Last Order" }),
      render: (c) => <span className="text-[rgb(var(--color-text-secondary))] text-xs">{c.last_order_date ? formatDateShort(c.last_order_date) : "—"}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (c) => (
        <Button variant="ghost" size="sm">
          {t("view_profile", { defaultValue: "View" })}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t("title", { defaultValue: "Customers" })}
        description={t("subtitle", { defaultValue: "Manage and analyze customer relationships" })}
      />

      {/* Customer Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-1">
            {t("stat_total", { defaultValue: "Total Customers" })}
          </p>
          <p className="text-2xl font-display font-extrabold">{stats.total}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-1">
            {t("stat_vip", { defaultValue: "VIP" })}
          </p>
          <p className="text-2xl font-display font-extrabold text-[rgb(var(--color-accent))]">{stats.vip}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-1">
            {t("stat_high_value", { defaultValue: "High Value" })}
          </p>
          <p className="text-2xl font-display font-extrabold">{stats.highValue}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-1">
            {t("stat_new", { defaultValue: "New" })}
          </p>
          <p className="text-2xl font-display font-extrabold">{stats.new}</p>
        </Card>
      </div>

      {/* Customer Segment Distribution */}
      <Card>
        <CardTitle>{t("segment_distribution", { defaultValue: "Customer Segment Distribution" })}</CardTitle>
        <Chart
          type="pie"
          data={[
            { name: t("segment_vip", { defaultValue: "VIP" }), value: stats.vip },
            { name: t("segment_high_value", { defaultValue: "High Value" }), value: stats.highValue },
            { name: t("segment_new", { defaultValue: "New" }), value: stats.new },
            { name: t("segment_regular", { defaultValue: "Regular" }), value: Math.max(0, stats.total - stats.vip - stats.highValue - stats.new) },
          ]}
          dataKey="value"
          height={280}
        />
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1">
          {(["all", "vip", "high-value", "new"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSegmentFilter(filter)}
              className={`px-3 py-1.5 text-xs font-display font-semibold rounded-lg transition-colors ${
                segmentFilter === filter
                  ? "bg-[rgb(var(--color-accent))] text-white"
                  : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-accent-soft))]"
              }`}
            >
              {filter === "all" ? t("all", { defaultValue: "All" }) : filter === "vip" ? "VIP" : filter === "high-value" ? t("high_value", { defaultValue: "High Value" }) : t("new", { defaultValue: "New" })}
            </button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder={t("search_placeholder", { defaultValue: "Search by name or email..." })} className="w-full sm:w-64" />
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <Table
            columns={columns}
            data={filtered}
            keyExtractor={(c) => c.id}
            emptyLabel={t("empty", { defaultValue: "No customers found" })}
            searchable={false}
            pageSize={10}
          />
        </div>
      )}
    </div>
  );
}
