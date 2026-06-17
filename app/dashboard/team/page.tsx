"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Button, Badge, PageHeader, Card, CardTitle, Modal, Input, useToast, Table, type Column } from "@/components/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "editor" | "viewer";
  status: "active" | "pending" | "inactive";
  joined_at: string;
}

const ROLES = [
  {
    value: "admin",
    label: "Administrator",
    description: "Full access to all features and settings",
    permissions: ["all"],
  },
  {
    value: "manager",
    label: "Manager",
    description: "Manage products, orders, and customers",
    permissions: ["products", "orders", "customers", "analytics"],
  },
  {
    value: "editor",
    label: "Editor",
    description: "Create and edit products and orders",
    permissions: ["products", "orders", "customers"],
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "View-only access to all data",
    permissions: ["view_only"],
  },
];

export default function TeamPage() {
  const t = useTranslations("team");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"admin" | "manager" | "editor" | "viewer">("editor");

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const { data: members, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["team-members"],
    queryFn: () => api.get("/team/members").catch(() => []),
    enabled: !!token,
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      api.post("/team/invite", data),
    onSuccess: () => {
      toast(t("invite_sent", { defaultValue: "Invitation sent successfully" }), "success");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setModalOpen(false);
      setNewMemberEmail("");
      setNewMemberRole("editor");
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      api.put(`/team/members/${memberId}`, { role }),
    onSuccess: () => {
      toast(t("role_updated", { defaultValue: "Role updated successfully" }), "success");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      api.delete(`/team/members/${memberId}`),
    onSuccess: () => {
      toast(t("member_removed", { defaultValue: "Member removed from team" }), "success");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({ email: newMemberEmail, role: newMemberRole });
  };

  const columns: Column<TeamMember>[] = [
    {
      key: "name",
      label: t("table_name", { defaultValue: "Name" }),
      sortable: true,
      render: (member) => (
        <div>
          <p className="font-semibold">{member.name}</p>
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">{member.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: t("table_role", { defaultValue: "Role" }),
      sortable: true,
      render: (member) => {
        const roleInfo = ROLES.find((r) => r.value === member.role);
        return (
          <div>
            <p className="text-sm font-semibold capitalize">{roleInfo?.label}</p>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">{roleInfo?.description}</p>
          </div>
        );
      },
    },
    {
      key: "status",
      label: t("table_status", { defaultValue: "Status" }),
      render: (member) => {
        const variants: Record<string, "success" | "warning" | "danger" | "default"> = {
          active: "success",
          pending: "warning",
          inactive: "danger",
        };
        return <Badge variant={variants[member.status]}>{member.status.charAt(0).toUpperCase() + member.status.slice(1)}</Badge>;
      },
    },
    {
      key: "joined_at",
      label: t("table_joined", { defaultValue: "Joined" }),
      render: (member) => <span className="text-sm">{new Date(member.joined_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (member) => (
        <div className="flex gap-2">
          <select
            value={member.role}
            onChange={(e) => updateRoleMutation.mutate({ memberId: member.id, role: e.target.value })}
            className="text-xs px-2 py-1 rounded border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent))]"
            disabled={updateRoleMutation.isPending}
          >
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            className="!text-[rgb(var(--color-danger))]"
            onClick={() => removeMemberMutation.mutate(member.id)}
            loading={removeMemberMutation.isPending}
          >
            {t("remove", { defaultValue: "Remove" })}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <PageHeader
          title={t("title", { defaultValue: "Team Management" })}
          description={t("subtitle", { defaultValue: "Manage team members and permissions" })}
        />
        <Button onClick={() => setModalOpen(true)} className="mt-6">
          {t("invite_member", { defaultValue: "Invite Member" })}
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("stat_total", { defaultValue: "Total Members" }), value: members?.length ?? 0 },
          { label: t("stat_active", { defaultValue: "Active" }), value: members?.filter((m) => m.status === "active").length ?? 0 },
          { label: t("stat_pending", { defaultValue: "Pending" }), value: members?.filter((m) => m.status === "pending").length ?? 0 },
          { label: t("stat_roles", { defaultValue: "Roles" }), value: new Set(members?.map((m) => m.role)).size },
        ].map((stat) => (
          <Card key={stat.label} className="!p-4">
            <p className="text-xs text-[rgb(var(--color-text-secondary))] font-display font-semibold uppercase mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-display font-extrabold">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Role Information */}
      <Card>
        <CardTitle>{t("roles", { defaultValue: "Roles & Permissions" })}</CardTitle>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          {ROLES.map((role) => (
            <div key={role.value} className="p-4 rounded-lg border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))] transition-colors">
              <h4 className="font-semibold text-sm mb-1">{role.label}</h4>
              <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-3">{role.description}</p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((perm) => (
                  <span key={perm} className="text-xs px-2 py-0.5 rounded bg-[rgb(var(--color-accent-soft))] text-[rgb(var(--color-accent))]">
                    {perm === "all" ? "All Permissions" : perm.replace(/_/g, " ").toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Team Members Table */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-[rgb(var(--color-text-secondary))]">{t("loading", { defaultValue: "Loading members..." })}</p>
        </div>
      ) : !members || members.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-[rgb(var(--color-text-secondary))]">{t("no_members", { defaultValue: "No team members yet. Invite someone to get started!" })}</p>
        </Card>
      ) : (
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <Table
            columns={columns}
            data={members}
            keyExtractor={(member) => member.id}
            emptyLabel={t("empty", { defaultValue: "No team members found" })}
            searchable={false}
          />
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setNewMemberEmail("");
          setNewMemberRole("editor");
        }}
        title={t("invite_member", { defaultValue: "Invite Team Member" })}
        size="sm"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label={t("email_label", { defaultValue: "Email Address" })}
            id="email"
            type="email"
            placeholder="member@example.com"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="label">{t("role_label", { defaultValue: "Role" })}</label>
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg font-body text-sm text-[rgb(var(--color-text))] focus:outline-none focus:border-[rgb(var(--color-accent))]"
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
              {ROLES.find((r) => r.value === newMemberRole)?.description}
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setNewMemberEmail("");
                setNewMemberRole("editor");
              }}
              disabled={inviteMutation.isPending}
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button type="submit" loading={inviteMutation.isPending}>
              {t("send_invite", { defaultValue: "Send Invite" })}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
