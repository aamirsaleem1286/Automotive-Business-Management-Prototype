"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  CircleDollarSign,
  FileText,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  X,
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
import { QUOTE_STATUSES } from "@/lib/constants";
import { quoteSchema } from "@/lib/validators";
import type { Quote } from "@/lib/types";
import { errorMessage, formatDate, money } from "@/lib/utils";

type FormValues = z.input<typeof quoteSchema>;
type ParsedValues = z.output<typeof quoteSchema>;

const EMPTY_QUOTES: Quote[] = [];

const emptyValues: FormValues = {
  customer: "",
  project: "",
  amount: 0,
  status: "Draft",
};

function toForm(quote: Quote | null): FormValues {
  if (!quote) return { ...emptyValues };
  return {
    customer: quote.customer,
    project: quote.project,
    amount: quote.amount,
    status: quote.status,
  };
}

function QuoteFormModal({
  open,
  quote,
  onClose,
  onSaved,
}: {
  open: boolean;
  quote: Quote | null;
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
    resolver: zodResolver(quoteSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(toForm(quote));
  }, [open, quote, reset]);

  async function submit(values: ParsedValues) {
    try {
      if (quote) {
        await apiMutate<Quote>(`/api/quotes/${quote.id}`, "PATCH", values);
        toast("Quote updated.");
      } else {
        await apiMutate<Quote>("/api/quotes", "POST", values);
        toast("Quote issued.");
      }
      await onSaved();
      onClose();
    } catch (error) {
      applyApiError(error, setError, "Could not save this quote.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={quote ? "Edit quote" : "New quote"}
      description={
        quote
          ? "Adjust scope, value or approval status."
          : "Create a customer quote and route it for approval."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="quote-form"
            loading={isSubmitting}
          >
            {quote ? "Save changes" : "Create quote"}
          </Button>
        </>
      }
    >
      <form id="quote-form" onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Field label="Customer" htmlFor="quote-customer" required error={errors.customer?.message}>
          <input id="quote-customer" className="input" {...register("customer")} placeholder="Customer name" />
        </Field>
        <Field label="Project or scope" htmlFor="quote-project" required error={errors.project?.message}>
          <input id="quote-project" className="input" {...register("project")} placeholder="e.g. AF-2601 · Full BICEP" />
        </Field>
        <FieldGrid>
          <Field label="Amount (RM)" htmlFor="quote-amount" required error={errors.amount?.message}>
            <input
              id="quote-amount"
              type="number"
              min={0}
              step={100}
              className="input"
              {...register("amount", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Status" htmlFor="quote-status" error={errors.status?.message}>
            <select id="quote-status" className="input" {...register("status")}>
              {QUOTE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>
        </FieldGrid>
        {errors.root?.message ? (
          <p className="rounded-lg border border-[#5c2b29] bg-[#241716] px-3 py-2.5 text-[11px] text-[#ffb3ad]">
            {errors.root.message}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

export function QuotesView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [deleting, setDeleting] = useState<Quote | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const listRef = useRef<HTMLElement | null>(null);
  const { toast } = useToast();
  const session = useSession();

  const { data, error, isLoading, mutate } = useSWR<Quote[]>("/api/quotes");
  const quotes = data ?? EMPTY_QUOTES;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return quotes.filter((quote) => {
      const matchesStatus =
        status === "all" ||
        (status === "pending"
          ? quote.status === "Draft" || quote.status === "Sent"
          : quote.status === status);
      const matchesQuery =
        !needle ||
        [quote.ref, quote.customer, quote.project]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [quotes, query, status]);

  const stats = useMemo(() => {
    const approved = quotes.filter((quote) => quote.status === "Approved");
    const pending = quotes.filter(
      (quote) => quote.status === "Draft" || quote.status === "Sent"
    );
    return {
      total: quotes.length,
      pending: pending.length,
      approvedValue: approved.reduce((sum, quote) => sum + quote.amount, 0),
      rate: quotes.length
        ? Math.round((approved.length / quotes.length) * 100)
        : 0,
    };
  }, [quotes]);

  function focusList(nextStatus: string) {
    setQuery("");
    setStatus(nextStatus);
    requestAnimationFrame(() =>
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  async function setQuoteStatus(quote: Quote, next: Quote["status"]) {
    setUpdatingId(quote.id);
    try {
      await apiMutate<Quote>(`/api/quotes/${quote.id}`, "PATCH", {
        status: next,
      });
      toast(`Quote ${quote.ref} marked ${next.toLowerCase()}.`);
      await mutate();
    } catch (caught) {
      toast(errorMessage(caught), "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await apiMutate<{ id: string }>(`/api/quotes/${deleting.id}`, "DELETE");
      toast("Quote deleted.");
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
        eyebrow="Quotes & approvals"
        title="Commercial approvals"
        subtitle="Keep estimates visible and move customer sign-off forward without chasing spreadsheets."
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
            New quote
          </Button>
        }
      />

      {isLoading && !data ? (
        <>
          <KpiGridSkeleton />
          <div className="panel p-4">
            <TableSkeleton rows={5} columns={6} />
          </div>
        </>
      ) : null}

      {error && !data ? (
        <QueryError message={errorMessage(error)} onRetry={() => mutate()} />
      ) : null}

      {data ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard label="Quotes" value={stats.total} hint="Across all approval states" icon={FileText} tone="red" onClick={() => focusList("all")} />
            <KpiCard label="Awaiting decision" value={stats.pending} hint="Draft or sent to customer" icon={Send} onClick={() => focusList("pending")} />
            <KpiCard label="Approved value" value={stats.approvedValue} hint="Committed restoration revenue" icon={CircleDollarSign} format="currency" onClick={() => focusList("Approved")} />
            <KpiCard label="Approval rate" value={stats.rate} hint="Approved share of all quotes" icon={Check} format="percent" onClick={() => focusList("all")} />
          </div>

          <Reveal delay={0.04}>
            <section ref={listRef} className="panel overflow-hidden">
              <div className="flex flex-col gap-2.5 border-b border-line/80 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-[320px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5f6b79]" />
                  <input
                    className="input h-9 py-0 pl-9 text-xs"
                    placeholder="Search ref, customer or project"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Search quotes"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="input h-9 w-auto py-0 text-xs"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    aria-label="Filter quotes by status"
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Awaiting decision</option>
                    {QUOTE_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="whitespace-nowrap text-[10px] text-muted">
                    {filtered.length} of {quotes.length}
                  </span>
                </div>
              </div>

              <DataTable
                headers={["Ref", "Customer", "Project", "Amount", "Status", "Issued", "Actions"]}
                minWidth={1030}
              >
                {filtered.map((quote) => (
                  <tr key={quote.id} className="transition-colors hover:bg-panel2/40">
                    <td className="td font-mono text-[11px] font-semibold text-accent">{quote.ref}</td>
                    <td className="td font-semibold text-ink">{quote.customer}</td>
                    <td className="td max-w-[230px] truncate text-muted" title={quote.project}>{quote.project}</td>
                    <td className="td font-semibold text-ink/90">{money(quote.amount)}</td>
                    <td className="td"><Badge label={quote.status} /></td>
                    <td className="td text-muted">{formatDate(quote.issuedAt)}</td>
                    <td className="td">
                      <div className="flex items-center gap-1">
                        {quote.status !== "Approved" ? (
                          <button
                            type="button"
                            onClick={() => setQuoteStatus(quote, "Approved")}
                            disabled={updatingId === quote.id}
                            aria-label={`Approve ${quote.ref}`}
                            title="Approve"
                            className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-success transition-colors hover:border-success/30 hover:bg-success/10 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        {quote.status !== "Declined" ? (
                          <button
                            type="button"
                            onClick={() => setQuoteStatus(quote, "Declined")}
                            disabled={updatingId === quote.id}
                            aria-label={`Decline ${quote.ref}`}
                            title="Decline"
                            className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-muted transition-colors hover:border-[#5c2b29] hover:bg-[#2a1a19] hover:text-[#ff9d95] disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(quote);
                            setFormOpen(true);
                          }}
                          aria-label={`Edit ${quote.ref}`}
                          className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-muted transition-colors hover:border-line hover:bg-panel2 hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {session.role === "admin" ? (
                          <button
                            type="button"
                            onClick={() => setDeleting(quote)}
                            aria-label={`Delete ${quote.ref}`}
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
                    colSpan={7}
                    title={quotes.length ? "No quotes match this filter" : "No quotes yet"}
                    description={
                      quotes.length
                        ? "Try another status or search term."
                        : "Create a quote to route an estimate for approval."
                    }
                  />
                ) : null}
              </DataTable>
            </section>
          </Reveal>
        </>
      ) : null}

      <QuoteFormModal
        open={formOpen}
        quote={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => mutate()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete quote"
        description="This permanently removes the quote record."
        confirmLabel="Delete quote"
        loading={deletePending}
      >
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-mono font-semibold text-ink">{deleting?.ref}</span>{" "}
          — {deleting?.customer}, {deleting ? money(deleting.amount) : ""}. This
          action cannot be undone.
        </p>
      </ConfirmDialog>
    </Page>
  );
}
