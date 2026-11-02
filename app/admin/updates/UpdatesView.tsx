"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  MessagesSquare,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
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
import { EmptyState, KpiGridSkeleton, QueryError, CardsSkeleton } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/components/providers/SessionProvider";
import { apiMutate } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";
import {
  CUSTOMER_UPDATE_PILLARS,
  UPDATE_CHANNELS,
  UPDATE_STATUSES,
} from "@/lib/constants";
import { customerUpdateSchema } from "@/lib/validators";
import type { CustomerUpdate } from "@/lib/types";
import { errorMessage, formatDate, formatDateTime, statusTone } from "@/lib/utils";

type FormValues = z.input<typeof customerUpdateSchema>;
type ParsedValues = z.output<typeof customerUpdateSchema>;

const EMPTY_UPDATES: CustomerUpdate[] = [];

const emptyValues: FormValues = {
  customer: "",
  channel: "Email (planned)",
  subject: "",
  message: "",
  status: "Draft",
};

function toForm(update: CustomerUpdate | null): FormValues {
  if (!update) return { ...emptyValues };
  return {
    customer: update.customer,
    channel: update.channel,
    subject: update.subject,
    message: update.message ?? "",
    status: update.status,
  };
}

function UpdateFormModal({
  open,
  update,
  onClose,
  onSaved,
}: {
  open: boolean;
  update: CustomerUpdate | null;
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
    resolver: zodResolver(customerUpdateSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(toForm(update));
  }, [open, update, reset]);

  async function submit(values: ParsedValues) {
    try {
      if (update) {
        await apiMutate<CustomerUpdate>(
          `/api/updates/${update.id}`,
          "PATCH",
          values
        );
        toast("Customer update saved.");
      } else {
        await apiMutate<CustomerUpdate>("/api/updates", "POST", values);
        toast("Customer update created.");
      }
      await onSaved();
      onClose();
    } catch (error) {
      applyApiError(error, setError, "Could not save this update.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={update ? "Edit customer update" : "Compose customer update"}
      description="Draft the message and set its place in the communication queue."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="update-form"
            loading={isSubmitting}
          >
            {update ? "Save changes" : "Save update"}
          </Button>
        </>
      }
    >
      <form id="update-form" onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <FieldGrid>
          <Field label="Customer" htmlFor="update-customer" required error={errors.customer?.message}>
            <input id="update-customer" className="input" {...register("customer")} placeholder="Customer name" />
          </Field>
          <Field label="Channel" htmlFor="update-channel" error={errors.channel?.message}>
            <select id="update-channel" className="input" {...register("channel")}>
              {UPDATE_CHANNELS.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </Field>
        </FieldGrid>

        <Field label="Message purpose" htmlFor="update-subject" required error={errors.subject?.message}>
          <input id="update-subject" className="input" {...register("subject")} placeholder="e.g. Inspection received" />
        </Field>

        <Field label="Message" htmlFor="update-message" error={errors.message?.message}>
          <textarea
            id="update-message"
            className="input min-h-[130px] resize-y"
            {...register("message")}
            placeholder="Write the customer-facing message or internal notes"
          />
        </Field>

        <Field label="Status" htmlFor="update-status" error={errors.status?.message}>
          <select id="update-status" className="input" {...register("status")}>
            {UPDATE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
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

export function UpdatesView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerUpdate | null>(null);
  const [deleting, setDeleting] = useState<CustomerUpdate | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const session = useSession();

  const { data, error, isLoading, mutate } = useSWR<CustomerUpdate[]>(
    "/api/updates"
  );
  const updates = data ?? EMPTY_UPDATES;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return updates.filter((update) => {
      const matchesStatus = status === "all" || update.status === status;
      const matchesQuery =
        !needle ||
        [update.customer, update.subject, update.channel, update.message ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [updates, query, status]);

  const stats = useMemo(
    () => ({
      total: updates.length,
      drafts: updates.filter((update) => update.status === "Draft").length,
      queued: updates.filter((update) => update.status === "Queued").length,
      sent: updates.filter((update) => update.status === "Sent").length,
    }),
    [updates]
  );

  function focusList(nextStatus: string) {
    setQuery("");
    setStatus(nextStatus);
    requestAnimationFrame(() =>
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  async function markSent(update: CustomerUpdate) {
    setSendingId(update.id);
    try {
      await apiMutate<CustomerUpdate>(`/api/updates/${update.id}`, "PATCH", {
        status: "Sent",
      });
      toast(`Update for ${update.customer} marked sent.`);
      await mutate();
    } catch (caught) {
      toast(errorMessage(caught), "error");
    } finally {
      setSendingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await apiMutate<{ id: string }>(`/api/updates/${deleting.id}`, "DELETE");
      toast("Customer update deleted.");
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
        eyebrow="Customer updates"
        title="Communication log"
        subtitle="Draft, queue and record every customer touchpoint so nobody is left guessing about build progress."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Compose update
          </Button>
        }
      />

      {isLoading && !data ? (
        <>
          <KpiGridSkeleton />
          <CardsSkeleton count={3} />
        </>
      ) : null}

      {error && !data ? (
        <QueryError message={errorMessage(error)} onRetry={() => mutate()} />
      ) : null}

      {data ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard label="Updates" value={stats.total} hint="Full communication history" icon={MessagesSquare} tone="red" onClick={() => focusList("all")} />
            <KpiCard label="Drafts" value={stats.drafts} hint="Awaiting message detail" icon={Pencil} onClick={() => focusList("Draft")} />
            <KpiCard label="Queued" value={stats.queued} hint="Ready to send to customer" icon={Mail} onClick={() => focusList("Queued")} />
            <KpiCard label="Sent" value={stats.sent} hint="Recorded customer contact" icon={Send} onClick={() => focusList("Sent")} />
          </div>

          <Reveal delay={0.04}>
            <div ref={listRef} className="mb-4 panel flex flex-col gap-2.5 p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5f6b79]" />
                <input
                  className="input h-9 py-0 pl-9 text-xs"
                  placeholder="Search customer, subject or message"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search customer updates"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="input h-9 w-auto py-0 text-xs"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  aria-label="Filter updates by status"
                >
                  <option value="all">All statuses</option>
                  {UPDATE_STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="whitespace-nowrap text-[10px] text-muted">
                  {filtered.length} of {updates.length}
                </span>
              </div>
            </div>
          </Reveal>

          {filtered.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((update, index) => (
                <Reveal key={update.id} delay={Math.min(index * 0.03, 0.18)}>
                  <article className="flex h-full flex-col rounded-[13px] border border-line/90 bg-panel p-4 shadow-panel">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-ink">
                          {update.customer}
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted">
                          <Mail className="h-3 w-3" />
                          {update.channel}
                        </div>
                      </div>
                      <Badge label={update.status} tone={statusTone(update.status)} />
                    </div>

                    <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-snug text-ink">
                      {update.subject}
                    </h3>
                    <p className="mt-1.5 line-clamp-3 flex-1 text-[11px] leading-relaxed text-muted">
                      {update.message?.trim()
                        ? update.message
                        : "No message body added yet."}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/70 pt-3 text-[9px] text-[#7f8b99]">
                      <span>
                        {update.sentAt
                          ? `Sent ${formatDateTime(update.sentAt)}`
                          : `Created ${formatDate(update.createdAt)}`}
                      </span>
                      <div className="flex items-center gap-1">
                        {update.status !== "Sent" ? (
                          <button
                            type="button"
                            onClick={() => markSent(update)}
                            disabled={sendingId === update.id}
                            title="Mark sent"
                            aria-label={`Mark update for ${update.customer} sent`}
                            className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-success transition-colors hover:border-success/30 hover:bg-success/10 disabled:opacity-50"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(update);
                            setFormOpen(true);
                          }}
                          aria-label={`Edit update for ${update.customer}`}
                          className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-muted transition-colors hover:border-line hover:bg-panel2 hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {session.role === "admin" ? (
                          <button
                            type="button"
                            onClick={() => setDeleting(update)}
                            aria-label={`Delete update for ${update.customer}`}
                            className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-muted transition-colors hover:border-[#5c2b29] hover:bg-[#2a1a19] hover:text-[#ff9d95]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title={updates.length ? "No updates match this filter" : "No customer updates yet"}
              description={
                updates.length
                  ? "Try another status or search term."
                  : "Compose the first update to keep customers close to the build."
              }
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Compose update
                </Button>
              }
            />
          )}

          <Reveal delay={0.1}>
            <section className="mt-4 panel p-4">
              <div className="mb-3 flex items-center gap-2">
                <MessagesSquare className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold text-ink">
                  Communication playbook
                </h2>
              </div>
              <div className="grid gap-2.5 md:grid-cols-3">
                {CUSTOMER_UPDATE_PILLARS.map((pillar, index) => (
                  <div
                    key={pillar.title}
                    className="rounded-lg border border-line/75 bg-panel2/45 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded bg-accent/12 text-[9px] font-bold text-accent">
                        0{index + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-ink">
                        {pillar.title}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        </>
      ) : null}

      <UpdateFormModal
        open={formOpen}
        update={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => mutate()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete customer update"
        description="This permanently removes the update from the communication log."
        confirmLabel="Delete update"
        loading={deletePending}
      >
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-semibold text-ink">{deleting?.subject}</span> for{" "}
          {deleting?.customer}. This action cannot be undone.
        </p>
      </ConfirmDialog>
    </Page>
  );
}
