"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CircleDollarSign,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
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
import { ORDER_STATUSES } from "@/lib/constants";
import { orderSchema } from "@/lib/validators";
import type { Order } from "@/lib/types";
import { errorMessage, formatDate, money } from "@/lib/utils";

type FormValues = z.input<typeof orderSchema>;
type ParsedValues = z.output<typeof orderSchema>;

const EMPTY_ORDERS: Order[] = [];

const emptyValues: FormValues = {
  customer: "",
  item: "",
  total: 0,
  status: "Processing",
};

function toForm(order: Order | null): FormValues {
  if (!order) return { ...emptyValues };
  return {
    customer: order.customer,
    item: order.item,
    total: order.total,
    status: order.status,
  };
}

function OrderFormModal({
  open,
  order,
  onClose,
  onSaved,
}: {
  open: boolean;
  order: Order | null;
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
    resolver: zodResolver(orderSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(toForm(order));
  }, [open, order, reset]);

  async function submit(values: ParsedValues) {
    try {
      if (order) {
        await apiMutate<Order>(`/api/orders/${order.id}`, "PATCH", values);
        toast("Order updated.");
      } else {
        await apiMutate<Order>("/api/orders", "POST", values);
        toast("Order created.");
      }
      await onSaved();
      onClose();
    } catch (error) {
      applyApiError(error, setError, "Could not save this order.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={order ? "Edit order" : "New order"}
      description={
        order
          ? "Update fulfilment status or order detail."
          : "Record a store order and move it through fulfilment."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="order-form"
            loading={isSubmitting}
          >
            {order ? "Save changes" : "Create order"}
          </Button>
        </>
      }
    >
      <form id="order-form" onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <FieldGrid>
          <Field label="Customer" htmlFor="order-customer" required error={errors.customer?.message}>
            <input id="order-customer" className="input" {...register("customer")} placeholder="Customer name" />
          </Field>
          <Field label="Status" htmlFor="order-status" error={errors.status?.message}>
            <select id="order-status" className="input" {...register("status")}>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>
        </FieldGrid>

        <Field label="Item" htmlFor="order-item" required error={errors.item?.message}>
          <input id="order-item" className="input" {...register("item")} placeholder="e.g. Carpet Mat Set" />
        </Field>

        <Field label="Order total (RM)" htmlFor="order-total" required error={errors.total?.message}>
          <input
            id="order-total"
            type="number"
            min={0}
            step={1}
            className="input"
            {...register("total", { valueAsNumber: true })}
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

export function StoreView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const listRef = useRef<HTMLElement | null>(null);
  const { toast } = useToast();
  const session = useSession();

  const { data, error, isLoading, mutate } = useSWR<Order[]>("/api/orders");
  const orders = data ?? EMPTY_ORDERS;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        status === "all" ||
        (status === "active"
          ? order.status === "Processing" || order.status === "Ready to ship"
          : order.status === status);
      const matchesQuery =
        !needle ||
        [order.ref, order.customer, order.item]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, status]);

  const stats = useMemo(() => {
    const completed = orders.filter((order) => order.status === "Completed");
    const processing = orders.filter(
      (order) => order.status === "Processing" || order.status === "Ready to ship"
    );
    return {
      total: orders.length,
      revenue: completed.reduce((sum, order) => sum + order.total, 0),
      processing: processing.length,
      average: orders.length
        ? Math.round(
            orders.reduce((sum, order) => sum + order.total, 0) / orders.length
          )
        : 0,
    };
  }, [orders]);

  function focusList(nextStatus: string) {
    setQuery("");
    setStatus(nextStatus);
    requestAnimationFrame(() =>
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  async function advance(order: Order) {
    const next =
      order.status === "Processing"
        ? "Ready to ship"
        : order.status === "Ready to ship"
          ? "Completed"
          : null;
    if (!next) return;
    setAdvancingId(order.id);
    try {
      await apiMutate<Order>(`/api/orders/${order.id}`, "PATCH", {
        status: next,
      });
      toast(`Order ${order.ref} moved to ${next.toLowerCase()}.`);
      await mutate();
    } catch (caught) {
      toast(errorMessage(caught), "error");
    } finally {
      setAdvancingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await apiMutate<{ id: string }>(`/api/orders/${deleting.id}`, "DELETE");
      toast("Order deleted.");
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
        eyebrow="Online store"
        title="Order fulfilment"
        subtitle="Track every store order from processing through to delivery, with revenue visible at a glance."
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
            New order
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
            <KpiCard label="Store orders" value={stats.total} hint="Across all fulfilment states" icon={ShoppingBag} tone="red" onClick={() => focusList("all")} />
            <KpiCard label="Completed revenue" value={stats.revenue} hint="Fulfilled order value" icon={CircleDollarSign} format="currency" onClick={() => focusList("Completed")} />
            <KpiCard label="In fulfilment" value={stats.processing} hint="Processing or ready to ship" icon={Truck} onClick={() => focusList("active")} />
            <KpiCard label="Average order" value={stats.average} hint="Mean order value" icon={CircleDollarSign} format="currency" onClick={() => focusList("all")} />
          </div>

          <Reveal delay={0.04}>
            <section ref={listRef} className="panel overflow-hidden">
              <div className="flex flex-col gap-2.5 border-b border-line/80 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-[320px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5f6b79]" />
                  <input
                    className="input h-9 py-0 pl-9 text-xs"
                    placeholder="Search ref, customer or item"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Search orders"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="input h-9 w-auto py-0 text-xs"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    aria-label="Filter orders by status"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">In fulfilment</option>
                    {ORDER_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="whitespace-nowrap text-[10px] text-muted">
                    {filtered.length} of {orders.length}
                  </span>
                </div>
              </div>

              <DataTable
                headers={["Ref", "Customer", "Item", "Total", "Status", "Ordered", "Actions"]}
                minWidth={990}
              >
                {filtered.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-panel2/40">
                    <td className="td font-mono text-[11px] font-semibold text-accent">{order.ref}</td>
                    <td className="td font-semibold text-ink">{order.customer}</td>
                    <td className="td max-w-[230px] truncate text-muted" title={order.item}>{order.item}</td>
                    <td className="td font-semibold text-ink/90">{money(order.total)}</td>
                    <td className="td"><Badge label={order.status} /></td>
                    <td className="td text-muted">{formatDate(order.orderedAt)}</td>
                    <td className="td">
                      <div className="flex items-center gap-1">
                        {order.status === "Processing" || order.status === "Ready to ship" ? (
                          <button
                            type="button"
                            onClick={() => advance(order)}
                            disabled={advancingId === order.id}
                            aria-label={`Advance ${order.ref}`}
                            title={
                              order.status === "Processing"
                                ? "Mark ready to ship"
                                : "Mark completed"
                            }
                            className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-success transition-colors hover:border-success/30 hover:bg-success/10 disabled:opacity-50"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(order);
                            setFormOpen(true);
                          }}
                          aria-label={`Edit ${order.ref}`}
                          className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-muted transition-colors hover:border-line hover:bg-panel2 hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {session.role === "admin" ? (
                          <button
                            type="button"
                            onClick={() => setDeleting(order)}
                            aria-label={`Delete ${order.ref}`}
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
                    title={orders.length ? "No orders match this filter" : "No store orders yet"}
                    description={
                      orders.length
                        ? "Try another status or search term."
                        : "Create an order to start fulfilment tracking."
                    }
                  />
                ) : null}
              </DataTable>
            </section>
          </Reveal>
        </>
      ) : null}

      <OrderFormModal
        open={formOpen}
        order={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => mutate()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete order"
        description="This permanently removes the store order."
        confirmLabel="Delete order"
        loading={deletePending}
      >
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-mono font-semibold text-ink">{deleting?.ref}</span>{" "}
          — {deleting?.customer}, {deleting?.item}. This action cannot be undone.
        </p>
      </ConfirmDialog>
    </Page>
  );
}
