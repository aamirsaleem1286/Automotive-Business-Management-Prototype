"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Boxes,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  Trash2,
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
import { PART_CATEGORIES } from "@/lib/constants";
import { partSchema } from "@/lib/validators";
import type { Part } from "@/lib/types";
import { errorMessage, money } from "@/lib/utils";
import { cn } from "@/lib/utils";

type FormValues = z.input<typeof partSchema>;
type ParsedValues = z.output<typeof partSchema>;

const EMPTY_PARTS: Part[] = [];

const emptyValues: FormValues = {
  sku: "",
  name: "",
  category: "Accessories",
  stock: 0,
  minStock: 0,
  price: 0,
};

function toForm(part: Part | null): FormValues {
  if (!part) return { ...emptyValues };
  return {
    sku: part.sku,
    name: part.name,
    category: part.category,
    stock: part.stock,
    minStock: part.minStock,
    price: part.price,
  };
}

function stockState(part: Part) {
  if (part.stock === 0) {
    return { label: "Out of stock", tone: "red" as const };
  }
  if (part.stock <= part.minStock) {
    return { label: "Low stock", tone: "amber" as const };
  }
  return { label: "In stock", tone: "green" as const };
}

function PartFormModal({
  open,
  part,
  onClose,
  onSaved,
}: {
  open: boolean;
  part: Part | null;
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
    resolver: zodResolver(partSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(toForm(part));
  }, [open, part, reset]);

  async function submit(values: ParsedValues) {
    try {
      if (part) {
        await apiMutate<Part>(`/api/parts/${part.id}`, "PATCH", values);
        toast("Part updated.");
      } else {
        await apiMutate<Part>("/api/parts", "POST", values);
        toast("Part added to inventory.");
      }
      await onSaved();
      onClose();
    } catch (error) {
      applyApiError(error, setError, "Could not save this part.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={part ? "Edit part" : "New part"}
      description={
        part
          ? "Adjust stock, minimum levels or pricing."
          : "Add an SKU to the workshop or store inventory."
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
            form="part-form"
            loading={isSubmitting}
          >
            {part ? "Save changes" : "Create part"}
          </Button>
        </>
      }
    >
      <form id="part-form" onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <FieldGrid>
          <Field label="SKU" htmlFor="part-sku" required error={errors.sku?.message} hint="Letters, numbers and dashes only">
            <input id="part-sku" className="input font-mono uppercase" {...register("sku")} placeholder="AF-ACC-014" />
          </Field>
          <Field label="Category" htmlFor="part-category" error={errors.category?.message}>
            <select id="part-category" className="input" {...register("category")}>
              {PART_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
        </FieldGrid>

        <Field label="Part name" htmlFor="part-name" required error={errors.name?.message}>
          <input id="part-name" className="input" {...register("name")} placeholder="e.g. Aluminium Sports Pedal Set" />
        </Field>

        <FieldGrid className="sm:grid-cols-3">
          <Field label="Stock" htmlFor="part-stock" error={errors.stock?.message}>
            <input
              id="part-stock"
              type="number"
              min={0}
              step={1}
              className="input"
              {...register("stock", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Minimum stock" htmlFor="part-min" error={errors.minStock?.message}>
            <input
              id="part-min"
              type="number"
              min={0}
              step={1}
              className="input"
              {...register("minStock", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Price (RM)" htmlFor="part-price" error={errors.price?.message}>
            <input
              id="part-price"
              type="number"
              min={0}
              step={1}
              className="input"
              {...register("price", { valueAsNumber: true })}
            />
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

export function PartsView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);
  const [deleting, setDeleting] = useState<Part | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const { toast } = useToast();
  const session = useSession();

  const { data, error, isLoading, mutate } = useSWR<Part[]>("/api/parts");
  const parts = data ?? EMPTY_PARTS;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return parts.filter((part) => {
      const matchesCategory = category === "all" || part.category === category;
      const matchesLow = !lowOnly || part.stock <= part.minStock;
      const matchesQuery =
        !needle ||
        [part.sku, part.name, part.category]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesCategory && matchesLow && matchesQuery;
    });
  }, [parts, query, category, lowOnly]);

  const stats = useMemo(() => {
    const low = parts.filter((part) => part.stock <= part.minStock);
    return {
      skus: parts.length,
      value: parts.reduce((sum, part) => sum + part.stock * part.price, 0),
      low: low.length,
      out: parts.filter((part) => part.stock === 0).length,
    };
  }, [parts]);

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await apiMutate<{ id: string }>(`/api/parts/${deleting.id}`, "DELETE");
      toast("Part deleted.");
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
        eyebrow="Parts & inventory"
        title="Stock control"
        subtitle="Protect build momentum with live stock levels, reorder thresholds and catalog pricing."
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
            New part
          </Button>
        }
      />

      {isLoading && !data ? (
        <>
          <KpiGridSkeleton />
          <div className="panel p-4">
            <TableSkeleton rows={6} columns={7} />
          </div>
        </>
      ) : null}

      {error && !data ? (
        <QueryError message={errorMessage(error)} onRetry={() => mutate()} />
      ) : null}

      {data ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard label="Active SKUs" value={stats.skus} hint="Tracked across all categories" icon={Boxes} tone="red" />
            <KpiCard label="Stock value" value={stats.value} hint="At current catalog prices" icon={Wallet} format="currency" />
            <KpiCard label="At reorder point" value={stats.low} hint="At or below minimum stock" icon={AlertTriangle} />
            <KpiCard label="Out of stock" value={stats.out} hint="Blocking potential build work" icon={PackageCheck} />
          </div>

          <Reveal delay={0.04}>
            <section className="panel overflow-hidden">
              <div className="flex flex-col gap-2.5 border-b border-line/80 p-3.5 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-[320px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5f6b79]" />
                  <input
                    className="input h-9 py-0 pl-9 text-xs"
                    placeholder="Search SKU, part or category"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Search parts"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="input h-9 w-auto py-0 text-xs"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    aria-label="Filter by category"
                  >
                    <option value="all">All categories</option>
                    {PART_CATEGORIES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setLowOnly((value) => !value)}
                    aria-pressed={lowOnly}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[11px] font-semibold transition-colors",
                      lowOnly
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : "border-line bg-panel2/40 text-muted hover:text-ink"
                    )}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Reorder only
                  </button>
                  <span className="whitespace-nowrap text-[10px] text-muted">
                    {filtered.length} of {parts.length}
                  </span>
                </div>
              </div>

              <DataTable
                headers={["SKU", "Part", "Category", "Stock", "Minimum", "Price", "State", "Actions"]}
                minWidth={1050}
              >
                {filtered.map((part) => {
                  const state = stockState(part);
                  return (
                    <tr key={part.id} className="transition-colors hover:bg-panel2/40">
                      <td className="td font-mono text-[11px] font-semibold text-accent">{part.sku}</td>
                      <td className="td max-w-[240px] truncate font-semibold text-ink" title={part.name}>{part.name}</td>
                      <td className="td text-muted">{part.category}</td>
                      <td className="td font-semibold text-ink/90">{part.stock}</td>
                      <td className="td text-muted">{part.minStock}</td>
                      <td className="td font-semibold text-ink/90">{money(part.price)}</td>
                      <td className="td"><Badge label={state.label} tone={state.tone} /></td>
                      <td className="td">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(part);
                              setFormOpen(true);
                            }}
                            aria-label={`Edit ${part.sku}`}
                            className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-muted transition-colors hover:border-line hover:bg-panel2 hover:text-ink"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {session.role === "admin" ? (
                            <button
                              type="button"
                              onClick={() => setDeleting(part)}
                              aria-label={`Delete ${part.sku}`}
                              className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-muted transition-colors hover:border-[#5c2b29] hover:bg-[#2a1a19] hover:text-[#ff9d95]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length ? (
                  <EmptyRow
                    colSpan={8}
                    title={parts.length ? "No parts match this filter" : "No inventory yet"}
                    description={
                      parts.length
                        ? "Try a different category, reorder filter or search term."
                        : "Add the first SKU to start tracking stock."
                    }
                  />
                ) : null}
              </DataTable>
            </section>
          </Reveal>
        </>
      ) : null}

      <PartFormModal
        open={formOpen}
        part={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => mutate()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete part"
        description="This permanently removes the SKU from inventory."
        confirmLabel="Delete part"
        loading={deletePending}
      >
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-mono font-semibold text-ink">{deleting?.sku}</span>{" "}
          — {deleting?.name}. This action cannot be undone.
        </p>
      </ConfirmDialog>
    </Page>
  );
}
