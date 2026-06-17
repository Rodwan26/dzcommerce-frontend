"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { Button, Badge, SearchBar, PageHeader, TableSkeleton } from "@/components/ui";
import { Table, type Column } from "@/components/ui/Table";
import { ProductFormModal } from "@/components/forms/ProductFormModal";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
  is_active: boolean;
}

export default function ProductsPage() {
  const t = useTranslations("products");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => api.get("/products"),
    enabled: !!token,
  });

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku?.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" && p.is_active) || (statusFilter === "inactive" && !p.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const columns: Column<Product>[] = [
    { key: "name", label: t("table_name"), sortable: true, className: "font-semibold" },
    {
      key: "price",
      label: t("table_price"),
      sortable: true,
      render: (p) => <span dir="ltr">{p.price.toLocaleString()} د.ج</span>,
    },
    { key: "stock", label: t("table_stock"), sortable: true },
    {
      key: "is_active",
      label: t("table_status"),
      render: (p) =>
        p.is_active ? (
          <Badge variant="success">{t("status_active")}</Badge>
        ) : (
          <Badge variant="danger">{t("status_inactive")}</Badge>
        ),
    },
    {
      key: "actions",
      label: "",
      render: (p) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(p); }}>
          {t("edit")}
        </Button>
      ),
    },
  ];

  function openCreateModal() {
    setSelectedProduct(null);
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ProductFormModal isOpen={isModalOpen} onClose={closeModal} product={selectedProduct} />

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--color-text))]">{t("title")}</h1>
          <p className="text-[rgb(var(--color-text-secondary))] mt-2 text-sm lg:text-base">{t("subtitle")}</p>
        </div>
        <Button onClick={openCreateModal} className="shrink-0">{t("add_product")}</Button>
      </div>

      {/* Filters and Search - Improved layout */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 flex-wrap">
          {(["all", "active", "inactive"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 text-xs font-display font-semibold rounded-lg transition-all ${
                statusFilter === filter
                  ? "bg-[rgb(var(--color-accent))] text-white shadow-md"
                  : "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-accent-soft))] hover:text-[rgb(var(--color-text))]"
              }`}
            >
              {filter === "all" ? t("filter_all") : filter === "active" ? t("status_active") : t("status_inactive")}
            </button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder={`البحث في ${t("table_name")}...`} className="w-full lg:w-80" />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : (
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={filtered}
              keyExtractor={(p) => p.id}
              emptyLabel={t("empty")}
              searchable={false}
              pageSize={10}
            />
          </div>
        </div>
      )}
    </div>
  );
}
