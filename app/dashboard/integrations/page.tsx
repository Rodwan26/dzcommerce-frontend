"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Button, Badge, PageHeader, Card, CardTitle, Modal, Input, useToast } from "@/components/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { formatDateShort } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  last_sync: string | null;
  config: Record<string, any>;
}

const AVAILABLE_INTEGRATIONS = [
  {
    id: "shopify",
    name: "Shopify",
    description: "Connect your Shopify store to manage products and orders",
    icon: "🛍️",
    category: "Marketplace",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Integrate with WooCommerce for WordPress stores",
    icon: "📦",
    category: "Marketplace",
  },
  {
    id: "facebook",
    name: "Facebook Shop",
    description: "Sync with your Facebook Business page",
    icon: "📱",
    category: "Social Commerce",
  },
  {
    id: "instagram",
    name: "Instagram Shopping",
    description: "Connect Instagram for social selling",
    icon: "📸",
    category: "Social Commerce",
  },
  {
    id: "tiktok",
    name: "TikTok Shop",
    description: "Integrate TikTok Shop for short-form commerce",
    icon: "🎬",
    category: "Social Commerce",
  },
  {
    id: "amazon",
    name: "Amazon",
    description: "Manage Amazon seller central products",
    icon: "🏪",
    category: "Marketplace",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept online payments with Stripe",
    icon: "💳",
    category: "Payments",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Accept PayPal payments",
    icon: "🅿️",
    category: "Payments",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Send order updates via WhatsApp",
    icon: "💬",
    category: "Messaging",
  },
  {
    id: "email",
    name: "Email Marketing",
    description: "Connect with Mailchimp or email services",
    icon: "✉️",
    category: "Marketing",
  },
];

export default function IntegrationsPage() {
  const t = useTranslations("integrations");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ["integrations"],
    queryFn: () => api.get("/integrations").catch(() => []),
    enabled: !!token,
  });

  const connectMutation = useMutation({
    mutationFn: (data: { integration_id: string; api_key: string }) =>
      api.post("/integrations/connect", data),
    onSuccess: () => {
      toast(t("connected_success", { defaultValue: "Integration connected successfully" }), "success");
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setModalOpen(false);
      setApiKey("");
      setSelectedIntegration(null);
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  const disconnectMutation = useMutation({
    mutationFn: (integration_id: string) =>
      api.post(`/integrations/${integration_id}/disconnect`, {}),
    onSuccess: () => {
      toast(t("disconnected_success", { defaultValue: "Integration disconnected" }), "success");
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  const getConnectedIntegration = (integrationId: string) => {
    return integrations?.find((i) => i.id === integrationId);
  };

  const handleConnect = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration) return;
    connectMutation.mutate({ integration_id: selectedIntegration, api_key: apiKey });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--color-text))]">{t("title", { defaultValue: "Integrations" })}</h1>
        <p className="text-[rgb(var(--color-text-secondary))] mt-2 text-sm lg:text-base">{t("subtitle", { defaultValue: "Connect third-party services to expand functionality" })}</p>
      </div>

      {/* Connected Integrations */}
      {integrations && integrations.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold mb-4">{t("connected", { defaultValue: "Connected Integrations" })}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const avail = AVAILABLE_INTEGRATIONS.find((a) => a.id === integration.type);
              return (
                <Card key={integration.id} className="flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{avail?.icon}</span>
                      <div>
                        <h3 className="font-display font-bold text-sm">{avail?.name || integration.name}</h3>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))]">{avail?.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3 pb-3 border-b border-[rgb(var(--color-border))]">
                    <Badge
                      variant={
                        integration.status === "connected"
                          ? "success"
                          : integration.status === "error"
                            ? "danger"
                            : "default"
                      }
                    >
                      {integration.status === "connected"
                        ? t("status_connected", { defaultValue: "Connected" })
                        : integration.status === "error"
                          ? t("status_error", { defaultValue: "Error" })
                          : t("status_disconnected", { defaultValue: "Disconnected" })}
                    </Badge>
                  </div>
                  {integration.last_sync && (
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-3">
                      {t("last_sync", { defaultValue: "Last sync" })}: {formatDateShort(integration.last_sync)}
                    </p>
                  )}
                  <div className="mt-auto flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleConnect(integration.type)}>
                      {t("configure", { defaultValue: "Configure" })}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!text-[rgb(var(--color-danger))]"
                      onClick={() => disconnectMutation.mutate(integration.id)}
                      loading={disconnectMutation.isPending}
                    >
                      {t("disconnect", { defaultValue: "Disconnect" })}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div>
        <h2 className="font-display text-lg font-bold mb-4">{t("available", { defaultValue: "Available Integrations" })}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_INTEGRATIONS.filter((a) => !getConnectedIntegration(a.id)).map((integration) => (
            <Card key={integration.id} className="flex flex-col hover:shadow-md transition-all duration-200">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{integration.icon}</span>
                <div className="flex-1">
                  <h3 className="font-display font-bold">{integration.name}</h3>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))]">{integration.category}</p>
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4 flex-1">{integration.description}</p>
              <Button
                onClick={() => handleConnect(integration.id)}
                className="w-full"
              >
                {t("connect", { defaultValue: "Connect" })}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Connection Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedIntegration(null);
          setApiKey("");
        }}
        title={`${t("connect", { defaultValue: "Connect" })} ${
          AVAILABLE_INTEGRATIONS.find((a) => a.id === selectedIntegration)?.name
        }`}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-[rgb(var(--color-accent-soft))] rounded-lg border border-[rgb(var(--color-accent))] text-sm text-[rgb(var(--color-accent))]">
            {t("setup_instructions", { defaultValue: "Enter your API key or credentials below. You can find this in your account settings." })}
          </div>
          <Input
            label={t("api_key_label", { defaultValue: "API Key" })}
            id="api_key"
            type="password"
            placeholder="••••••••••"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setSelectedIntegration(null);
                setApiKey("");
              }}
              disabled={connectMutation.isPending}
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button type="submit" loading={connectMutation.isPending}>
              {t("connect", { defaultValue: "Connect" })}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
