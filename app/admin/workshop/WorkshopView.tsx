"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClock,
  Car,
  Check,
  ClipboardCheck,
  Gauge,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import type { z } from "zod";
import { Page, Reveal } from "@/components/ui/Page";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Meter } from "@/components/ui/Meter";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field } from "@/components/ui/FormField";
import {
  CardSkeleton,
  EmptyState,
  KpiGridSkeleton,
  QueryError,
  Skeleton,
} from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/components/providers/SessionProvider";
import { apiMutate } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";
import { workshopTaskSchema } from "@/lib/validators";
import type { Project, WorkshopTask } from "@/lib/types";
import {
  cn,
  errorMessage,
  formatDate,
  statusTone,
} from "@/lib/utils";

const CATEGORIES = [
  "Customer / sales workflow",
  "Workshop delivery",
  "Parts & procurement",
  "Quality control",
] as const;

type FormValues = z.input<typeof workshopTaskSchema>;
type ParsedValues = z.output<typeof workshopTaskSchema>;

const EMPTY_TASKS: WorkshopTask[] = [];
const EMPTY_PROJECTS: Project[] = [];

const emptyValues: FormValues = {
  title: "",
  category: "Workshop delivery",
};

function TaskFormModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
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
    resolver: zodResolver(workshopTaskSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(emptyValues);
  }, [open, reset]);

  async function submit(values: ParsedValues) {
    try {
      await apiMutate<WorkshopTask>("/api/workshop/tasks", "POST", values);
      toast("Checklist item added.");
      await onSaved();
      onClose();
    } catch (error) {
      applyApiError(error, setError, "Could not add this checklist item.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add checklist item"
      description="Add an operational check to the workshop planner."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="task-form"
            loading={isSubmitting}
          >
            Add item
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Field label="Checklist item" htmlFor="task-title" required error={errors.title?.message}>
          <input
            id="task-title"
            className="input"
            {...register("title")}
            placeholder="e.g. Confirm torque settings with technician"
          />
        </Field>
        <Field label="Category" htmlFor="task-category" error={errors.category?.message}>
          <select id="task-category" className="input" {...register("category")}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
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

export function WorkshopView() {
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<WorkshopTask | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const { toast } = useToast();
  const session = useSession();

  const tasksSwr = useSWR<WorkshopTask[]>("/api/workshop/tasks");
  const projectsSwr = useSWR<Project[]>("/api/projects");
  const tasks = tasksSwr.data ?? EMPTY_TASKS;
  const projects = projectsSwr.data ?? EMPTY_PROJECTS;

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return {
      total: tasks.length,
      completed,
      remaining: tasks.length - completed,
      rate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
    };
  }, [tasks]);

  const grouped = useMemo(() => {
    const map = new Map<string, WorkshopTask[]>();
    for (const task of tasks) {
      const key = task.category || "Workshop delivery";
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [tasks]);

  const activeProjects = useMemo(
    () =>
      projects
        .filter((project) => project.stage !== "Ready for handover")
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        ),
    [projects]
  );

  async function toggleTask(task: WorkshopTask) {
    if (pendingIds.includes(task.id)) return;
    setPendingIds((ids) => [...ids, task.id]);
    try {
      await apiMutate<WorkshopTask>(
        `/api/workshop/tasks/${task.id}`,
        "PATCH",
        { completed: !task.completed }
      );
      await tasksSwr.mutate();
    } catch (caught) {
      toast(errorMessage(caught), "error");
    } finally {
      setPendingIds((ids) => ids.filter((id) => id !== task.id));
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await apiMutate<{ id: string }>(
        `/api/workshop/tasks/${deleting.id}`,
        "DELETE"
      );
      toast("Checklist item deleted.");
      setDeleting(null);
      await tasksSwr.mutate();
    } catch (caught) {
      toast(errorMessage(caught), "error");
    } finally {
      setDeletePending(false);
    }
  }

  const isLoading = tasksSwr.isLoading && !tasksSwr.data;
  const error = tasksSwr.error ?? projectsSwr.error;

  return (
    <Page>
      <PageHeader
        eyebrow="Workshop planner"
        title="Floor readiness"
        subtitle="A disciplined start-of-day checklist and a live bay board, so the workshop runs on facts not memory."
        actions={
          <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add task
          </Button>
        }
      />

      {isLoading ? (
        <>
          <KpiGridSkeleton />
          <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <CardSkeleton className="min-h-[420px]" />
            <CardSkeleton className="min-h-[420px]" />
          </div>
        </>
      ) : null}

      {error && !tasksSwr.data ? (
        <QueryError
          message={errorMessage(error)}
          onRetry={() => {
            tasksSwr.mutate();
            projectsSwr.mutate();
          }}
        />
      ) : null}

      {tasksSwr.data ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard label="Checklist items" value={stats.total} hint="Across the floor workflow" icon={ClipboardCheck} tone="red" />
            <KpiCard label="Completed" value={stats.completed} hint="Signed off for today" icon={Check} />
            <KpiCard label="Remaining" value={stats.remaining} hint="Still requiring attention" icon={Wrench} />
            <KpiCard label="Completion" value={stats.rate} hint="Readiness across the checklist" icon={Gauge} format="percent" />
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-[1.3fr_1fr]">
            <Reveal delay={0.04}>
              <section className="panel overflow-hidden">
                <div className="border-b border-line/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-ink">
                        Daily readiness checklist
                      </h2>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {stats.completed} of {stats.total} complete ·{" "}
                        {stats.rate}%
                      </p>
                    </div>
                    <span className="text-[22px] font-bold tracking-[-0.04em] text-ink">
                      {stats.rate}
                      <span className="text-sm text-muted">%</span>
                    </span>
                  </div>
                  <Meter
                    value={stats.rate}
                    tone={stats.rate === 100 ? "success" : "accent"}
                    className="mt-3"
                  />
                </div>

                {grouped.length ? (
                  <div className="divide-y divide-line/70">
                    {grouped.map(([category, items]) => {
                      const done = items.filter((item) => item.completed).length;
                      return (
                        <div key={category} className="p-3">
                          <div className="mb-1.5 flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7f8b99]">
                              {category}
                            </h3>
                            <span className="text-[9px] text-[#5f6b79]">
                              {done}/{items.length}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {items.map((task) => {
                              const pending = pendingIds.includes(task.id);
                              return (
                                <div
                                  key={task.id}
                                  className={cn(
                                    "group flex items-start gap-2.5 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-line/70 hover:bg-panel2/40",
                                    task.completed && "opacity-70"
                                  )}
                                >
                                  <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={task.completed}
                                    aria-label={task.title}
                                    disabled={pending}
                                    onClick={() => toggleTask(task)}
                                    className={cn(
                                      "mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded border transition-colors disabled:opacity-50",
                                      task.completed
                                        ? "border-success bg-success text-[#062117]"
                                        : "border-[#46515f] bg-[#0e1217] text-transparent hover:border-accent"
                                    )}
                                  >
                                    <Check className="h-3 w-3" strokeWidth={3} />
                                  </button>
                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={cn(
                                        "text-[11px] leading-relaxed",
                                        task.completed
                                          ? "text-muted line-through"
                                          : "text-ink/90"
                                      )}
                                    >
                                      {task.title}
                                    </p>
                                  </div>
                                  {session.role === "admin" ? (
                                    <button
                                      type="button"
                                      onClick={() => setDeleting(task)}
                                      aria-label={`Delete ${task.title}`}
                                      className="grid h-6 w-6 shrink-0 place-items-center rounded text-transparent transition-colors hover:bg-[#2a1a19] hover:text-[#ff9d95] group-hover:text-muted"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4">
                    <EmptyState
                      title="Checklist is empty"
                      description="Add the first readiness check to start the daily workflow."
                      action={
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setFormOpen(true)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add task
                        </Button>
                      }
                    />
                  </div>
                )}
              </section>
            </Reveal>

            <div className="min-w-0 space-y-4">
              <Reveal delay={0.08}>
                <section className="panel overflow-hidden">
                  <div className="flex items-center justify-between border-b border-line/80 px-4 py-3.5">
                    <div>
                      <h2 className="text-sm font-semibold text-ink">Bay board</h2>
                      <p className="mt-0.5 text-[10px] text-muted">
                        {activeProjects.length} active build
                        {activeProjects.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Link
                      href="/admin/projects"
                      className="text-[10px] font-semibold text-muted transition-colors hover:text-ink"
                    >
                      Manage jobs
                    </Link>
                  </div>

                  {projectsSwr.isLoading && !projectsSwr.data ? (
                    <div className="space-y-2.5 p-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : activeProjects.length ? (
                    <div className="space-y-2.5 p-3">
                      {activeProjects.slice(0, 5).map((project) => (
                        <div
                          key={project.id}
                          className="rounded-lg border border-line/75 bg-panel2/45 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] font-semibold text-accent">
                                  {project.ref}
                                </span>
                                <span className="truncate text-[10px] text-muted">
                                  {project.vehicle}
                                </span>
                              </div>
                              <div className="mt-0.5 truncate text-xs font-semibold text-ink">
                                {project.customer}
                              </div>
                            </div>
                            <Badge label={project.stage} tone={statusTone(project.stage)} />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[9px] text-muted">
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="h-3 w-3" />
                              {formatDate(project.dueDate)}
                            </span>
                            <span>{project.progress}%</span>
                          </div>
                          <Meter
                            value={project.progress}
                            tone={project.progress >= 85 ? "success" : "accent"}
                            className="mt-1.5"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4">
                      <EmptyState
                        title="No active builds"
                        description="Jobs will appear here once they enter the restoration floor."
                      />
                    </div>
                  )}
                </section>
              </Reveal>

              <Reveal delay={0.12}>
                <section className="panel p-4">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-accent" />
                    <h2 className="text-sm font-semibold text-ink">
                      Planner discipline
                    </h2>
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {[
                      "Clear customer and sales actions before bay work starts.",
                      "Flag parts blockers before technicians strip a vehicle.",
                      "Never mark a build ready without the quality-control check.",
                    ].map((rule) => (
                      <li
                        key={rule}
                        className="flex items-start gap-2 text-[11px] leading-relaxed text-muted"
                      >
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            </div>
          </div>
        </>
      ) : null}

      <TaskFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => tasksSwr.mutate()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete checklist item"
        description="This permanently removes the item from the workshop planner."
        confirmLabel="Delete item"
        loading={deletePending}
      >
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-semibold text-ink">{deleting?.title}</span> ·{" "}
          {deleting?.category}. This action cannot be undone.
        </p>
      </ConfirmDialog>
    </Page>
  );
}
