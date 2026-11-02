"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { z } from "zod";
import { Page, Reveal } from "@/components/ui/Page";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, FieldGrid } from "@/components/ui/FormField";
import { DataTable, EmptyRow } from "@/components/ui/Table";
import {
  KpiGridSkeleton,
  QueryError,
  TableSkeleton,
} from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/components/providers/SessionProvider";
import { apiMutate } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/constants";
import { leadSchema } from "@/lib/validators";
import type { Lead } from "@/lib/types";
import { errorMessage, money } from "@/lib/utils";

type FormValues = z.input<typeof leadSchema>;
type ParsedValues = z.output<typeof leadSchema>;

const EMPTY_LEADS: Lead[] = [];

const emptyValues: FormValues = {
  name: "",
  vehicle: "",
  interest: "",
  source: "Website form",
  status: "New",
  owner: "Sales",
  value: 0,
  nextAction: "First response",
  notes: "",
};

function toForm(lead: Lead | null): FormValues {
  if (!lead) return { ...emptyValues };
  return {
    name: lead.name,
    vehicle: lead.vehicle,
    interest: lead.interest,
    source: lead.source,
    status: lead.status,
    owner: lead.owner,
    value: lead.value,
    nextAction: lead.nextAction,
    notes: lead.notes ?? "",
  };
}

function LeadFormModal({
  open,
  lead,
  onClose,
  onSaved,
}: {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSaved: () => Promise<unknown>;
}) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, ParsedValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(toForm(lead));
  }, [open, lead, reset]);

  async function submit(values: ParsedValues) {
    try {
      if (lead) {
        await apiMutate<Lead>(`/api/leads/${lead.id}`, "PATCH", values);
        toast("Lead updated.");
      } else {
        await apiMutate<Lead>("/api/leads", "POST", values);
        toast("Lead added to the pipeline.");
      }
      await onSaved();
      onClose();
    } catch (error) {
      applyApiError(error, setError, "Could not save this lead.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lead ? "Edit lead" : "New lead"}
      description={
        lead
          ? "Update the opportunity, ownership and next action."
          : "Capture an enquiry and assign it to the right owner."
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="lead-form"
            loading={isSubmitting}
          >
            {lead ? "Save changes" : "Create lead"}
          </Button>
        </>
      }
    >
      <form id="lead-form" onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <FieldGrid>
          <Field label="Customer name" htmlFor="lead-name" required error={errors.name?.message}>
            <input id="lead-name" className="input" {...register("name")} placeholder="e.g. Amir Hakim" />
          </Field>
          <Field label="Vehicle" htmlFor="lead-vehicle" required error={errors.vehicle?.message}>
            <input id="lead-vehicle" className="input" {...register("vehicle")} placeholder="e.g. Proton Satria Neo" />
          </Field>
        </FieldGrid>

        <Field label="Requirement" htmlFor="lead-interest" required error={errors.interest?.message}>
          <input id="lead-interest" className="input" {...register("interest")} placeholder="e.g. Full BICEP restoration" />
        </Field>

        <FieldGrid>
          <Field label="Source" htmlFor="lead-source" error={errors.source?.message}>
            <select id="lead-source" className="input" {...register("source")}>
              {LEAD_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="lead-status" error={errors.status?.message}>
            <select id="lead-status" className="input" {...register("status")}>
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>
        </FieldGrid>

        <FieldGrid>
          <Field label="Owner" htmlFor="lead-owner" required error={errors.owner?.message}>
            <input id="lead-owner" className="input" {...register("owner")} placeholder="Sales advisor" />
          </Field>
          <Field label="Estimated value (RM)" htmlFor="lead-value" error={errors.value?.message}>
            <input
              id="lead-value"
              type="number"
              min={0}
              step={100}
              className="input"
              {...register("value", { valueAsNumber: true })}
            />
          </Field>
        </FieldGrid>

        <Field label="Next action" htmlFor="lead-next" error={errors.nextAction?.message}>
          <input id="lead-next" className="input" {...register("nextAction")} placeholder="e.g. Book inspection" />
        </Field>

        <Field label="Notes" htmlFor="lead-notes" error={errors.notes?.message}>
          <textarea
            id="lead-notes"
            className="input min-h-[88px] resize-y"
            {...register("notes")}
            placeholder="Context, preferences or follow-up detail"
          />
        </Field>

        {errors.root?.message ? (
          <p className="rounded-lg border border-[#5c2b29] bg-[#241716] px-3 py-2.5 text-[11px] text-[#ffb3ad]">
            {errors.root.message}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

export function LeadsView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState<Lead | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const listRef = useRef<HTMLElement | null>(null);
  const { toast } = useToast();
  const session = useSession();

  const { data, error, isLoading, mutate } = useSWR<Lead[]>("/api/leads");

  const leads = data ?? EMPTY_LEADS;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus =
        status === "all" ||
        (status === "open"
          ? lead.status !== "Won" && lead.status !== "Lost"
          : lead.status === status);
      const matchesQuery =
        !needle ||
        [lead.name, lead.vehicle, lead.interest, lead.owner, lead.nextAction]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [leads, query, status]);

  const stats = useMemo(() => {
    const open = leads.filter(
      (lead) => lead.status !== "Won" && lead.status !== "Lost"
    );
    return {
      total: leads.length,
      open: open.length,
      value: open.reduce((sum, lead) => sum + lead.value, 0),
      won: leads.filter((lead) => lead.status === "Won").length,
    };
  }, [leads]);

  function focusList(nextStatus: string) {
    setQuery("");
    setStatus(nextStatus);
    requestAnimationFrame(() =>
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(lead: Lead) {
    setEditing(lead);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await apiMutate<{ id: string }>(`/api/leads/${deleting.id}`, "DELETE");
      toast("Lead deleted.");
      setDeleting(null);
      await mutate();
    } catch (caught) {
      toast(errorMessage(caught), "error");
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Leads & CRM"
        title="Enquiry pipeline"
        subtitle="Capture every conversation, qualify demand and keep a named owner on each opportunity."
        actions={
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            New lead
          </Button>
        }
      />

      {isLoading && !data ? (
        <>
          <KpiGridSkeleton />
          <div className="panel p-4">
            <TableSkeleton rows={6} columns={6} />
          </div>
        </>
      ) : null}

      {error && !data ? (
        <QueryError message={errorMessage(error)} onRetry={() => mutate()} />
      ) : null}

      {data ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard
              label="Total leads"
              value={stats.total}
              hint="All captured opportunities"
              icon={Users}
              tone="red"
              onClick={() => focusList("all")}
            />
            <KpiCard
              label="Open pipeline"
              value={stats.open}
              hint="Excludes won and lost"
              icon={UserCheck}
              onClick={() => focusList("open")}
            />
            <KpiCard
              label="Open value"
              value={stats.value}
              hint="Estimated value in play"
              icon={Wallet}
              format="currency"
              onClick={() => focusList("open")}
            />
            <KpiCard
              label="Won"
              value={stats.won}
              hint="Converted to restoration work"
              icon={UserCheck}
              onClick={() => focusList("Won")}
            />
          </div>

          <Reveal delay={0.04}>
            <section ref={listRef} className="panel overflow-hidden">
              <div className="flex flex-col gap-2.5 border-b border-line/80 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-[320px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5f6b79]" />
                  <input
                    className="input h-9 py-0 pl-9 text-xs"
                    placeholder="Search customer, vehicle or owner"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Search leads"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="input h-9 w-auto py-0 text-xs"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    aria-label="Filter by status"
                  >
                    <option value="all">All statuses</option>
                    <option value="open">Open (excludes won/lost)</option>
                    {LEAD_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="whitespace-nowrap text-[10px] text-muted">
                    {filtered.length} of {leads.length}
                  </span>
                </div>
              </div>

              <DataTable
                headers={[
                  "Customer",
                  "Vehicle",
                  "Requirement",
                  "Source",
                  "Owner",
                  "Status",
                  "Value",
                  "Actions",
                ]}
                minWidth={1180}
              >
                {filtered.map((lead) => (
                  <tr key={lead.id} className="group transition-colors hover:bg-panel2/40">
                    <td className="td font-semibold text-ink">{lead.name}</td>
                    <td className="td text-muted">{lead.vehicle}</td>
                    <td className="td max-w-[230px] truncate text-muted" title={lead.interest}>
                      {lead.interest}
                    </td>
                    <td className="td text-muted">{lead.source}</td>
                    <td className="td text-muted">{lead.owner}</td>
                    <td className="td">
                      <Badge label={lead.status} />
                    </td>
                    <td className="td font-semibold text-ink/90">{money(lead.value)}</td>
                    <td className="td">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(lead)}
                          aria-label={`Edit ${lead.name}`}
                          className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-muted transition-colors hover:border-line hover:bg-panel2 hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {session.role === "admin" ? (
                          <button
                            type="button"
                            onClick={() => setDeleting(lead)}
                            aria-label={`Delete ${lead.name}`}
                            className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-muted transition-colors hover:border-[#5c2b29] hover:bg-[#2a1a19] hover:text-[#ff9d95]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length ? (
                  <EmptyRow
                    colSpan={8}
                    title={leads.length ? "No leads match this filter" : "No leads yet"}
                    description={
                      leads.length
                        ? "Try a different status or search term."
                        : "Create the first enquiry to start building the pipeline."
                    }
                  />
                ) : null}
              </DataTable>
            </section>
          </Reveal>
        </>
      ) : null}

      <LeadFormModal
        open={formOpen}
        lead={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => mutate()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete lead"
        description="This permanently removes the enquiry from the CRM."
        confirmLabel="Delete lead"
        loading={deletePending}
      >
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-semibold text-ink">{deleting?.name}</span> —{" "}
          {deleting?.vehicle}. This action cannot be undone.
        </p>
      </ConfirmDialog>
    </Page>
  );
}
