"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { Button, Badge, SearchBar, PageHeader, TableSkeleton, Chart, Card, CardTitle } from "@/components/ui";
import { Table, type Column } from "@/components/ui/Table";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";

interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  reorder_point: number;
  min_stock: number;
  max_stock: number;
  unit_cost: number;
  last_restocked: string;
  status: "in_stock" | "low_stock" | "out_of_stock" | "overstock";
}

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock" | "overstock">("all");

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const { data: inventory, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: () => api.get("/inventory").catch(() => []),
    enabled: !!token,
  });

  const filtered = useMemo(() => {
    if (!inventory) return [];
    return inventory.filter((item) => {
      const matchesSearch = !search || item.product_name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

  const stats = {
    total_items: inventory?.length ?? 0,
    low_stock: inventory?.filter((i) => i.status === "low_stock").length ?? 0,
    out_of_stock: inventory?.filter((i) => i.status === "out_of_stock").length ?? 0,
    total_value: inventory?.reduce((sum, i) => sum + i.current_stock * i.unit_cost, 0) ?? 0,
  };

  const statusConfig: Record<string, { label: string; variant: "warning" | "danger" | "success" | "default" }> = {
    in_stock: { label: t("status_in_stock", { defaultValue: "In Stock" }), variant: "success" },
    low_stock: { label: t("status_low_stock", { defaultValue: "Low Stock" }), variant: "warning" },
    out_of_stock: { label: t("status_out_of_stock", { defaultValue: "Out of Stock" }), variant: "danger" },
    overstock: { label: t("status_overstock", { defaultValue: "Overstock" }), variant: "default" },
  };

  const stockDistribution = [
    { name: t("in_stock", { defaultValue: "In Stock" }), value: inventory?.filter((i) => i.status === "in_stock").length ?? 0 },
    { name: t("low_stock", { defaultValue: "Low Stock" }), value: inventory?.filter((i) => i.status === "low_stock").length ?? 0 },
    { name: t("out_of_stock", { defaultValue: "Out of Stock" }), value: inventory?.filter((i) => i.status === "out_of_stock").length ?? 0 },
  ];

  const columns: Column<InventoryItem>[] = [
    {
      key: "product_name",
      label: t("table_product", { defaultValue: "Product" }),
      sortable: true,
      className: "font-semibold",
      render: (item) => (
        <div>
          <p className="font-semibold">{item.product_name}</p>
          <p className="text-xs text-[rgb(var(--color-text-secondary))] font-mono">{item.sku}</p>
        </div>
      ),
    },
    {
      key: "current_stock",
      label: t("table_current", { defaultValue: "Current Stock" }),
      sortable: true,
      render: (item) => <span className="font-semibold">{item.current_stock}</span>,
    },
    {
      key: "reorder_point",
      label: t("table_reorder", { defaultValue: "Reorder Point" }),
      render: (item) => <span className="text-[rgb(var(--color-text-secondary))]">{item.reorder_point}</span>,
    },
    {
      key: "status",
      label: t("table_status", { defaultValue: "Status" }),
      render: (item) => {
        const cfg = statusConfig[item.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: "unit_cost",
      label: t("table_unit_cost", { defaultValue: "Unit Cost" }),
      render: (item) => <span dir="ltr">{(item.unit_cost * item.current_stock).toLocaleString()} د.ج</span>,
    },
    {
      key: "actions",
      label: "",
      render: (item) => (
        <Button variant="ghost" size="sm">
          {t("adjust", { defaultValue: "Adjust" })}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t("title", { defaultValue: "Inventory Management" })}
        description={t("subtitle", { defaultValue: "Track stock levels and manage inventory" })}
      />

      {/* Inventory Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-1">
            {t("stat_total_items", { defaultValue: "Total Items" })}
          </p>
          <p className="text-2xl font-display font-extrabold">{stats.total_items}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-1">
            {t("stat_low_stock", { defaultValue: "Low Stock" })}
          </p>
          <p className="text-2xl font-display font-extrabold text-[rgb(var(--color-warning))]">{stats.low_stock}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-1">
            {t("stat_out_of_stock", { defaultValue: "Out of Stock" })}
          </p>
          <p className="text-2xl font-display font-extrabold text-[rgb(var(--color-danger))]">{stats.out_of_stock}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-1">
            {t("stat_total_value", { defaultValue: "Total Value" })}
          </p>
          <p className="text-xl font-display font-extrabold">{(stats.total_value / 1000000).toFixed(1)}M د.ج</p>
        </Card>
      </div>

      {/* Stock Distribution Chart */}
      <Card>
        <CardTitle>{t("stock_distribution", { defaultValue: "Stock Distribution" })}</CardTitle>
        <Chart
          type="pie"
          data={stockDistribution}
          dataKey="value"
          height={280}
        />
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1">
          {(["all", "in_stock", "low_stock", "out_of_stock", "overstock"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 text-xs font-display font-semibold rounded-lg transition-colors ${
                statusFilter === filter
                  ? "bg-[rgb(var(--color-accent))] text-white"
                  : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-accent-soft))]"
              }`}
            >
              {filter === "all" ? t("all", { defaultValue: "All" }) : statusConfig[filter as keyof typeof statusConfig]?.label}
            </button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder={t("search_placeholder", { defaultValue: "Search by product name or SKU..." })} className="w-full sm:w-64" />
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <Table
            columns={columns}
            data={filtered}
            keyExtractor={(item) => item.id}
            emptyLabel={t("empty", { defaultValue: "No inventory items found" })}
            searchable={false}
            pageSize={10}
          />
        </div>
      )}
    </div>
  );
}
