"use client";
export const dynamic = "force-dynamic";

import { Badge, Button, PageHeader, TableSkeleton, SearchBar, Select } from "@/components/ui";
import { Table, type Column } from "@/components/ui/Table";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";

interface ShipmentBrief {
  id: string;
  provider_name: string;
  tracking_code: string | null;
  status: string;
}

interface Order {
  id: string;
  status: string;
  confirmation_status: string;
  shipping_status: string;
  confirmed_at: string | null;
  total: number;
  created_at: string;
  items: { quantity: number; product_id: string | null }[];
  shipments: ShipmentBrief[];
}

const confirmationConfig: Record<string, { labelKey: string; variant: "warning" | "success" | "danger" | "default" }> = {
  pending: { labelKey: "confirmation_pending", variant: "warning" },
  confirmed: { labelKey: "confirmation_confirmed", variant: "success" },
  cancelled: { labelKey: "confirmation_cancelled", variant: "danger" },
};

const shippingConfig: Record<string, { labelKey: string; variant: "default" | "info" | "success" | "danger" | "warning" }> = {
  not_sent: { labelKey: "shipping_not_sent", variant: "default" },
  picked_up: { labelKey: "shipping_picked_up", variant: "info" },
  in_transit: { labelKey: "shipping_in_transit", variant: "info" },
  delivered: { labelKey: "shipping_delivered", variant: "success" },
  returned: { labelKey: "shipping_returned", variant: "danger" },
  failed: { labelKey: "shipping_failed", variant: "danger" },
};

export default function OrdersPage() {
  const t = useTranslations("orders");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterConfirmation, setFilterConfirmation] = useState("all");
  const [filterShipping, setFilterShipping] = useState("all");

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: () => api.get("/orders"),
    enabled: !!token,
  });

  const filtered = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const matchesSearch = !search || o.id.toLowerCase().includes(search.toLowerCase());
      const matchesConfirm = filterConfirmation === "all" || o.confirmation_status === filterConfirmation;
      const matchesShipping = filterShipping === "all" || o.shipping_status === filterShipping;
      return matchesSearch && matchesConfirm && matchesShipping;
    });
  }, [orders, search, filterConfirmation, filterShipping]);

  const confirmationOptions = [
    {       value: "all", label: `${t("table_confirmation")}: ${t("all")}` },
    ...Object.entries(confirmationConfig).map(([value, cfg]) => ({
      value,
      label: t(cfg.labelKey),
    })),
  ];

  const shippingOptions = [
    { value: "all", label: `${t("table_shipping_status")}: ${t("all", {defaultValue: "All"})}` },
    ...Object.entries(shippingConfig).map(([value, cfg]) => ({
      value,
      label: t(cfg.labelKey),
    })),
  ];

  const columns: Column<Order>[] = [
    {
      key: "id",
      label: t("table_id"),
      render: (o) => <span className="font-display font-semibold">#{o.id.slice(0, 8)}</span>,
    },
    {
      key: "items",
      label: t("table_items"),
      render: (o) => <span className="text-[rgb(var(--color-text-secondary))]">{o.items?.length || 0}</span>,
    },
    {
      key: "total",
      label: t("table_total"),
      sortable: true,
      render: (o) => <span className="font-semibold">{formatCurrency(o.total)}</span>,
    },
    {
      key: "confirmation_status",
      label: t("table_confirmation"),
      render: (o) => {
        const cfg = confirmationConfig[o.confirmation_status] || confirmationConfig.pending;
        return <Badge variant={cfg.variant}>{t(cfg.labelKey)}</Badge>;
      },
    },
    {
      key: "shipping_status",
      label: t("table_shipping_status"),
      render: (o) => {
        const cfg = shippingConfig[o.shipping_status] || shippingConfig.not_sent;
        return <Badge variant={cfg.variant}>{t(cfg.labelKey)}</Badge>;
      },
    },
    {
      key: "shipping",
      label: t("table_shipping"),
      render: (o) =>
        o.shipments?.[0] ? (
          <div className="text-xs text-[rgb(var(--color-text-secondary))]">
            {o.shipments[0].provider_name}
            {o.shipments[0].tracking_code && (
              <span className="font-mono block text-[10px]">#{o.shipments[0].tracking_code}</span>
            )}
          </div>
        ) : (
          <span className="text-[rgb(var(--color-text-secondary))]">—</span>
        ),
    },
    {
      key: "created_at",
      label: t("table_date"),
      sortable: true,
      render: (o) => <span className="text-[rgb(var(--color-text-secondary))] text-xs">{formatDateShort(o.created_at)}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (o) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/orders/${o.id}`); }}>
          {t("details")}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--color-text))]">{t("title")}</h1>
          <p className="text-[rgb(var(--color-text-secondary))] mt-2 text-sm lg:text-base">{t("subtitle")}</p>
        </div>
        <Button onClick={() => router.push("/dashboard/orders/new")} className="shrink-0">{t("new_order")}</Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-3 flex-wrap">
          <Select
            value={filterConfirmation}
            onChange={(e) => setFilterConfirmation(e.target.value)}
            options={confirmationOptions}
            className="w-48"
          />
          <Select
            value={filterShipping}
            onChange={(e) => setFilterShipping(e.target.value)}
            options={shippingOptions}
            className="w-48"
          />
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder={`البحث برقم الطلب...`} className="w-full lg:w-80" />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : (
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={filtered}
              keyExtractor={(o) => o.id}
              emptyLabel={t("empty")}
              searchable={false}
              pageSize={10}
              onRowClick={(o) => router.push(`/dashboard/orders/${o.id}`)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
