"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Badge, Card, CardTitle, useToast, Modal, Input } from "@/components/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";

interface CustomerOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: "active" | "inactive" | "blocked";
  lifetime_value: number;
  order_count: number;
  last_order_at: string | null;
  joined_at: string;
  orders: CustomerOrder[];
  notes?: string;
}

export default function CustomerDetailsPage() {
  const t = useTranslations("customers");
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState<Customer["status"]>("active");

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ["customer", params.id],
    queryFn: () => api.get(`/customers/${params.id}`),
    enabled: !!token && !!params.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: Customer["status"]) =>
      api.patch(`/customers/${params.id}`, { status }),
    onSuccess: () => {
      toast(t("status_updated", { defaultValue: "Customer status updated" }), "success");
      queryClient.invalidateQueries({ queryKey: ["customer", params.id] });
      setStatusModalOpen(false);
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  const updateNotesMutation = useMutation({
    mutationFn: () =>
      api.patch(`/customers/${params.id}`, { notes }),
    onSuccess: () => {
      toast(t("notes_updated", { defaultValue: "Notes updated successfully" }), "success");
      queryClient.invalidateQueries({ queryKey: ["customer", params.id] });
      setNotesModalOpen(false);
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[rgb(var(--color-text-secondary))]">Loading customer details...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-[rgb(var(--color-text-secondary))]">Customer not found</p>
        <Button onClick={() => router.push("/dashboard/customers")}>Back to Customers</Button>
      </div>
    );
  }

  const statusColors: Record<Customer["status"], string> = {
    active: "success",
    inactive: "warning",
    blocked: "danger",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">{customer.name}</h1>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t("joined", { defaultValue: "Joined" })} {formatDate(customer.joined_at)}</p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/dashboard/customers")}>
          {t("back", { defaultValue: "Back" })}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Metrics */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="!p-4">
              <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-2">
                {t("lifetime_value", { defaultValue: "Lifetime Value" })}
              </p>
              <p className="text-2xl font-display font-extrabold">{customer.lifetime_value.toLocaleString()} د.ج</p>
            </Card>
            <Card className="!p-4">
              <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-2">
                {t("orders_count", { defaultValue: "Total Orders" })}
              </p>
              <p className="text-2xl font-display font-extrabold">{customer.order_count}</p>
            </Card>
            <Card className="!p-4">
              <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-2">
                {t("avg_order", { defaultValue: "Avg. Order Value" })}
              </p>
              <p className="text-2xl font-display font-extrabold">
                {customer.order_count > 0 ? (customer.lifetime_value / customer.order_count).toLocaleString() : 0} د.ج
              </p>
            </Card>
          </div>

          {/* Order History */}
          <Card>
            <CardTitle>{t("order_history", { defaultValue: "Order History" })}</CardTitle>
            <div className="mt-4 space-y-2">
              {customer.orders && customer.orders.length > 0 ? (
                customer.orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    className="p-4 rounded-lg border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">Order #{order.order_number}</p>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))]">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.total.toLocaleString()} د.ج</p>
                        <Badge variant={order.status === "delivered" ? "success" : "warning"} className="text-xs">
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[rgb(var(--color-text-secondary))]">{t("no_orders", { defaultValue: "No orders yet" })}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardTitle>{t("contact", { defaultValue: "Contact Information" })}</CardTitle>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] uppercase font-display font-semibold mb-1">
                  {t("email", { defaultValue: "Email" })}
                </p>
                <p className="text-sm break-all">{customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] uppercase font-display font-semibold mb-1">
                  {t("phone", { defaultValue: "Phone" })}
                </p>
                <p className="text-sm font-mono">{customer.phone}</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] uppercase font-display font-semibold mb-1">
                  {t("city", { defaultValue: "City" })}
                </p>
                <p className="text-sm">{customer.city}</p>
              </div>
              <div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] uppercase font-display font-semibold mb-1">
                  {t("country", { defaultValue: "Country" })}
                </p>
                <p className="text-sm">{customer.country}</p>
              </div>
            </div>
          </Card>

          {/* Address */}
          <Card>
            <CardTitle>{t("address", { defaultValue: "Address" })}</CardTitle>
            <p className="text-sm mt-4 whitespace-pre-line">{customer.address}</p>
          </Card>

          {/* Notes */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <CardTitle>{t("notes", { defaultValue: "Internal Notes" })}</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setNotesModalOpen(true)}>
                {t("edit", { defaultValue: "Edit" })}
              </Button>
            </div>
            {customer.notes ? (
              <p className="text-sm whitespace-pre-line">{customer.notes}</p>
            ) : (
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t("no_notes", { defaultValue: "No notes added" })}</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card>
            <CardTitle>{t("status", { defaultValue: "Status" })}</CardTitle>
            <div className="mt-4 space-y-3">
              <Badge variant={statusColors[customer.status]}>{customer.status.toUpperCase()}</Badge>
              <Button onClick={() => setStatusModalOpen(true)} className="w-full" variant="secondary" size="sm">
                {t("change_status", { defaultValue: "Change Status" })}
              </Button>
            </div>
          </Card>

          {/* Activity */}
          <Card>
            <CardTitle>{t("activity", { defaultValue: "Activity" })}</CardTitle>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] uppercase font-display font-semibold mb-1">
                  {t("member_since", { defaultValue: "Member Since" })}
                </p>
                <p className="font-semibold">{formatDate(customer.joined_at)}</p>
              </div>
              {customer.last_order_at && (
                <div>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] uppercase font-display font-semibold mb-1">
                    {t("last_order", { defaultValue: "Last Order" })}
                  </p>
                  <p className="font-semibold">{formatDate(customer.last_order_at)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <CardTitle>{t("actions", { defaultValue: "Actions" })}</CardTitle>
            <div className="mt-4 flex flex-col gap-2">
              <Button size="sm" variant="secondary" className="w-full">
                {t("send_email", { defaultValue: "Send Email" })}
              </Button>
              <Button size="sm" variant="secondary" className="w-full">
                {t("create_order", { defaultValue: "Create Order" })}
              </Button>
              <Button size="sm" variant="secondary" className="w-full !text-[rgb(var(--color-danger))]">
                {t("block_customer", { defaultValue: "Block Customer" })}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={t("change_status", { defaultValue: "Change Customer Status" })}
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {(["active", "inactive", "blocked"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setNewStatus(status);
                  updateStatusMutation.mutate(status);
                }}
                className={`w-full px-4 py-2 text-left rounded-lg border transition-colors ${
                  newStatus === status
                    ? "border-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent-soft))] text-[rgb(var(--color-accent))]"
                    : "border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))]"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Notes Modal */}
      <Modal
        isOpen={notesModalOpen}
        onClose={() => {
          setNotesModalOpen(false);
          setNotes(customer.notes || "");
        }}
        title={t("edit_notes", { defaultValue: "Edit Notes" })}
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateNotesMutation.mutate();
          }}
          className="space-y-4"
        >
          <textarea
            placeholder="Add internal notes about this customer..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-sm font-body focus:outline-none focus:border-[rgb(var(--color-accent))]"
            rows={5}
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setNotesModalOpen(false);
                setNotes(customer.notes || "");
              }}
              disabled={updateNotesMutation.isPending}
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button type="submit" loading={updateNotesMutation.isPending}>
              {t("save", { defaultValue: "Save" })}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
