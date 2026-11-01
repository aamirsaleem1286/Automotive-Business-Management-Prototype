"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClock,
  Car,
  CheckCircle2,
  Gauge,
  Pencil,
  Plus,
  Search,
  Trash2,
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
import { PROJECT_SCOPES, PROJECT_STAGES } from "@/lib/constants";
import { projectSchema } from "@/lib/validators";
import type { Project } from "@/lib/types";
import {
  errorMessage,
  formatDate,
  statusTone,
  toDateInput,
} from "@/lib/utils";

type FormValues = z.input<typeof projectSchema>;
type ParsedValues = z.output<typeof projectSchema>;

const EMPTY_PROJECTS: Project[] = [];

function emptyValues(): FormValues {
  const target = new Date();
  target.setDate(target.getDate() + 21);
  return {
    customer: "",
    vehicle: "",
    scope: "Full BICEP",
    stage: "Inspection",
    dueDate: target.toISOString().slice(0, 10),
    owner: "Workshop Lead",
  };
}

function toForm(project: Project | null): FormValues {
  if (!project) return emptyValues();
  return {
    customer: project.customer,
    vehicle: project.vehicle,
    scope: project.scope,
    stage: project.stage,
    dueDate: toDateInput(project.dueDate),
    owner: project.owner,
  };
}

function ProjectFormModal({
  open,
  project,
  onClose,
  onSaved,
}: {
  open: boolean;
  project: Project | null;
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
    resolver: zodResolver(projectSchema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (open) reset(toForm(project));
  }, [open, project, reset]);

  async function submit(values: ParsedValues) {
    try {
      if (project) {
        await apiMutate<Project>(`/api/projects/${project.id}`, "PATCH", values);
        toast("Restoration job updated.");
      } else {
        await apiMutate<Project>("/api/projects", "POST", values);
        toast("Restoration job created.");
      }
      await onSaved();
      onClose();
    } catch (error) {
      applyApiError(error, setError, "Could not save this job.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? "Edit restoration job" : "New restoration job"}
      description={
        project
          ? "Move the build through the workshop and keep delivery data current."
          : "Open a new build with scope, stage and a committed due date."
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
            form="project-form"
            loading={isSubmitting}
          >
            {project ? "Save changes" : "Create job"}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <FieldGrid>
          <Field label="Customer" htmlFor="project-customer" required error={errors.customer?.message}>
            <input id="project-customer" className="input" {...register("customer")} placeholder="Customer name" />
          </Field>
          <Field label="Vehicle" htmlFor="project-vehicle" required error={errors.vehicle?.message}>
            <input id="project-vehicle" className="input" {...register("vehicle")} placeholder="e.g. Satria Neo · 2008" />
          </Field>
        </FieldGrid>

        <FieldGrid>
          <Field label="Scope" htmlFor="project-scope" error={errors.scope?.message}>
            <select id="project-scope" className="input" {...register("scope")}>
              {PROJECT_SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Stage" htmlFor="project-stage" error={errors.stage?.message}>
            <select id="project-stage" className="input" {...register("stage")}>
              {PROJECT_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </Field>
        </FieldGrid>

        <FieldGrid>
          <Field label="Target handover" htmlFor="project-due" required error={errors.dueDate?.message}>
            <input id="project-due" type="date" className="input" {...register("dueDate")} />
          </Field>
          <Field label="Job owner" htmlFor="project-owner" required error={errors.owner?.message}>
            <input id="project-owner" className="input" {...register("owner")} placeholder="Workshop lead" />
          </Field>
        </FieldGrid>

        <p className="rounded-lg border border-line/70 bg-panel2/45 px-3 py-2.5 text-[11px] leading-relaxed text-muted">
          Progress is derived automatically from the selected stage, keeping the
          workshop board and overview in sync.
        </p>

        {errors.root?.message ? (
          <p className="rounded-lg border border-[#5c2b29] bg-[#241716] px-3 py-2.5 text-[11px] text-[#ffb3ad]">
            {errors.root.message}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

export function ProjectsView() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const { toast } = useToast();
  const session = useSession();

  const { data, error, isLoading, mutate } = useSWR<Project[]>("/api/projects");
  const projects = data ?? EMPTY_PROJECTS;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStage = stage === "all" || project.stage === stage;
      const matchesQuery =
        !needle ||
        [project.ref, project.customer, project.vehicle, project.owner, project.scope]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesStage && matchesQuery;
    });
  }, [projects, query, stage]);

  const stats = useMemo(() => {
    const active = projects.filter(
      (project) => project.stage !== "Ready for handover"
    );
    const today = new Date();
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 14);
    const dueSoon = active.filter((project) => {
      const due = new Date(project.dueDate);
      return due <= horizon && due >= new Date(today.toDateString());
    }).length;
    const average = projects.length
      ? Math.round(
          projects.reduce((sum, project) => sum + project.progress, 0) /
            projects.length
        )
      : 0;
    return {
      active: active.length,
      dueSoon,
      average,
      ready: projects.filter(
        (project) => project.stage === "Ready for handover"
      ).length,
    };
  }, [projects]);

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await apiMutate<{ id: string }>(`/api/projects/${deleting.id}`, "DELETE");
      toast("Restoration job deleted.");
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
        eyebrow="Restoration jobs"
        title="Build control"
        subtitle="Every active restoration in one sequence — scope, stage, target handover and accountable owner."
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
            New job
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
            <KpiCard label="Active builds" value={stats.active} hint="Not yet ready for handover" icon={Car} tone="red" />
            <KpiCard label="Due in 14 days" value={stats.dueSoon} hint="Upcoming delivery commitments" icon={CalendarClock} />
            <KpiCard label="Average progress" value={stats.average} hint="Across all restoration jobs" icon={Gauge} format="percent" />
            <KpiCard label="Ready to hand over" value={stats.ready} hint="Quality check complete" icon={CheckCircle2} />
          </div>

          <Reveal delay={0.04}>
            <section className="panel overflow-hidden">
              <div className="flex flex-col gap-2.5 border-b border-line/80 p-3.5 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-[320px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5f6b79]" />
                  <input
                    className="input h-9 py-0 pl-9 text-xs"
                    placeholder="Search ref, customer or vehicle"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Search restoration jobs"
                  />
                </div>
                <div className="hide-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <button
                    type="button"
                    onClick={() => setStage("all")}
                    className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                      stage === "all"
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : "border-line bg-panel2/40 text-muted hover:text-ink"
                    }`}
                  >
                    All stages
                  </button>
                  {PROJECT_STAGES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStage(option)}
                      className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                        stage === option
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-line bg-panel2/40 text-muted hover:text-ink"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <DataTable
                headers={["Ref", "Customer", "Vehicle", "Scope", "Stage", "Progress", "Handover", "Owner", "Actions"]}
                minWidth={1280}
              >
                {filtered.map((project) => (
                  <tr key={project.id} className="transition-colors hover:bg-panel2/40">
                    <td className="td font-mono text-[11px] font-semibold text-accent">{project.ref}</td>
                    <td className="td font-semibold text-ink">{project.customer}</td>
                    <td className="td text-muted">{project.vehicle}</td>
                    <td className="td text-muted">{project.scope}</td>
                    <td className="td"><Badge label={project.stage} tone={statusTone(project.stage)} /></td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <Meter value={project.progress} tone={project.progress >= 85 ? "success" : "accent"} className="w-[78px]" />
                        <span className="w-7 text-right text-[10px] text-muted">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="td text-muted">{formatDate(project.dueDate)}</td>
                    <td className="td text-muted">{project.owner}</td>
                    <td className="td">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(project);
                            setFormOpen(true);
                          }}
                          aria-label={`Edit ${project.ref}`}
                          className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-muted transition-colors hover:border-line hover:bg-panel2 hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {session.role === "admin" ? (
                          <button
                            type="button"
                            onClick={() => setDeleting(project)}
                            aria-label={`Delete ${project.ref}`}
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
                    colSpan={9}
                    title={projects.length ? "No jobs match this filter" : "No restoration jobs yet"}
                    description={
                      projects.length
                        ? "Try another stage or search term."
                        : "Create a job to start tracking workshop delivery."
                    }
                  />
                ) : null}
              </DataTable>
            </section>
          </Reveal>
        </>
      ) : null}

      <ProjectFormModal
        open={formOpen}
        project={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => mutate()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete restoration job"
        description="This permanently removes the build and its workshop tracking."
        confirmLabel="Delete job"
        loading={deletePending}
      >
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-mono font-semibold text-ink">{deleting?.ref}</span>{" "}
          — {deleting?.customer}, {deleting?.vehicle}. This action cannot be
          undone.
        </p>
      </ConfirmDialog>
    </Page>
  );
}
