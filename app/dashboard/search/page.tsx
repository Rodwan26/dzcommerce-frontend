"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { Button, Badge, PageHeader, Card, Input } from "@/components/ui";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  type: "product" | "order" | "customer";
  title: string;
  description: string;
  metadata: Record<string, any>;
}

export default function SearchPage() {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: ["search", query, filters],
    queryFn: () => api.get("/search", { params: { q: query, filters: filters.join(",") } }).catch(() => []),
    enabled: !!token && query.length > 0,
  });

  const grouped = useMemo(() => {
    if (!results) return {};
    return results.reduce(
      (acc, result) => {
        if (!acc[result.type]) acc[result.type] = [];
        acc[result.type].push(result);
        return acc;
      },
      {} as Record<string, SearchResult[]>
    );
  }, [results]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "product") {
      router.push(`/dashboard/products/${result.id}`);
    } else if (result.type === "order") {
      router.push(`/dashboard/orders/${result.id}`);
    } else if (result.type === "customer") {
      router.push(`/dashboard/customers/${result.id}`);
    }
  };

  const typeConfig: Record<string, { color: string; icon: string; label: string }> = {
    product: { color: "success", icon: "📦", label: "Product" },
    order: { color: "info", icon: "📋", label: "Order" },
    customer: { color: "warning", icon: "👥", label: "Customer" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t("title", { defaultValue: "Search" })}
        description={t("subtitle", { defaultValue: "Search across all your business data" })}
      />

      {/* Search Bar */}
      <Card className="!p-6">
        <div className="flex gap-3">
          <Input
            placeholder={t("placeholder", { defaultValue: "Search products, orders, customers..." })}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button disabled={!query}>{t("search", { defaultValue: "Search" })}</Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["product", "order", "customer"].map((type) => (
          <button
            key={type}
            onClick={() =>
              setFilters((prev) => (prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]))
            }
            className={`px-4 py-2 rounded-lg border transition-colors text-sm font-display font-semibold ${
              filters.includes(type)
                ? "bg-[rgb(var(--color-accent))] text-white border-[rgb(var(--color-accent))]"
                : "border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:border-[rgb(var(--color-accent))]"
            }`}
          >
            {typeConfig[type].icon} {typeConfig[type].label}
          </button>
        ))}
      </div>

      {/* Results */}
      {query.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-[rgb(var(--color-text-secondary))]">
            {t("empty", { defaultValue: "Start typing to search..." })}
          </p>
        </Card>
      ) : isLoading ? (
        <Card className="py-8 text-center">
          <p className="text-[rgb(var(--color-text-secondary))]">{t("loading", { defaultValue: "Searching..." })}</p>
        </Card>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-[rgb(var(--color-text-secondary))]">
            {t("no_results", { defaultValue: "No results found" })}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, typeResults]) => (
            <div key={type}>
              <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
                <span>{typeConfig[type].icon}</span>
                {typeConfig[type].label} ({typeResults.length})
              </h2>
              <div className="space-y-2">
                {typeResults.map((result) => (
                  <Card
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="cursor-pointer hover:shadow-md transition-all p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{result.title}</h3>
                          <Badge variant={typeConfig[type].color as any}>{typeConfig[type].label}</Badge>
                        </div>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">{result.description}</p>
                        {Object.keys(result.metadata).length > 0 && (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {Object.entries(result.metadata).map(([key, value]) => (
                              <span key={key} className="text-xs px-2 py-1 rounded bg-[rgb(var(--color-accent-soft))] text-[rgb(var(--color-accent))]">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
