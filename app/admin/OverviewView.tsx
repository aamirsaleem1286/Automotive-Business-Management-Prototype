"use client";

import useSWR from "swr";
import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  CalendarClock,
  Car,
  ChevronRight,
  CircleDollarSign,
  Plus,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { Page, Reveal } from "@/components/ui/Page";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { DataTable } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Meter } from "@/components/ui/Meter";
import {
  CardSkeleton,
  KpiGridSkeleton,
  QueryError,
  Skeleton,
} from "@/components/ui/States";
import { CarShowcase } from "@/components/three/CarShowcase";
import { BICEP } from "@/lib/constants";
import type { DashboardData } from "@/lib/types";
import {
  compactMoney,
  errorMessage,
  formatDate,
  money,
  statusTone,
} from "@/lib/utils";

function meterTone(status: string) {
  switch (statusTone(status)) {
    case "green":
      return "success" as const;
    case "blue":
      return "blue" as const;
    case "amber":
      return "amber" as const;
    case "red":
      return "accent" as const;
    default:
      return "muted" as const;
  }
}

function Hero() {
  return (
    <section className="relative mb-4 overflow-hidden rounded-2xl border border-line/90 bg-[linear-gradient(112deg,#171b21_0%,#11151a_42%,#0b0e12_100%)]">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.14]" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-[90px]" />
      <div className="relative grid lg:grid-cols-[1.04fr_0.96fr]">
        <div className="relative z-10 flex flex-col justify-center px-5 py-6 sm:px-7 sm:py-8">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-success">
              Live operations
            </span>
            <span className="text-[9px] uppercase tracking-[0.16em] text-[#5f6b79]">
              · BICEP framework
            </span>
          </div>
          <h2 className="mt-3 max-w-[440px] text-[23px] font-bold leading-[1.14] tracking-[-0.04em] text-ink sm:text-[29px]">
            Restoration work,
            <br />
            without the blind spots.
          </h2>
          <p className="mt-2.5 max-w-[420px] text-[11px] leading-relaxed text-muted sm:text-xs">
            One cockpit for every enquiry, bay, quote, part and customer update
            — calibrated for high-accountability restoration builds.
          </p>

          <div className="mt-4 hidden flex-wrap gap-1.5 sm:flex">
            {BICEP.map((item) => (
              <span
                key={item.letter}
                className="inline-flex items-center gap-1.5 rounded-md border border-line/80 bg-[#0e1217]/80 px-2 py-1 text-[9px] font-semibold text-muted"
              >
                <span className="grid h-4 w-4 place-items-center rounded bg-accent/12 text-[9px] font-bold text-accent">
                  {item.letter}
                </span>
                {item.title}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <ButtonLink href="/admin/leads" variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" />
              New lead
            </ButtonLink>
            <ButtonLink href="/admin/workshop" variant="soft" size="sm">
              <CalendarClock className="h-3.5 w-3.5" />
              Workshop planner
            </ButtonLink>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1 px-1 text-[11px] font-semibold text-muted transition-colors hover:text-ink"
            >
              View reports
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="relative h-[220px] border-t border-line/50 sm:h-[260px] lg:h-auto lg:min-h-[300px] lg:border-l lg:border-t-0">
          <CarShowcase className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0b0e12] to-transparent" />
          <div className="absolute bottom-3 right-4 flex items-center gap-2 rounded-lg border border-line/80 bg-[#0b0e12]/80 px-2.5 py-1.5 backdrop-blur">
            <Sparkles className="h-3 w-3 text-accent" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
              Interactive build view
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Loading() {
  return (
    <>
      <div className="mb-4 h-[260px] rounded-2xl border border-line/80 bg-panel sm:h-[300px]">
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
      <KpiGridSkeleton />
      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <CardSkeleton className="min-h-[360px]" />
        <CardSkeleton className="min-h-[360px]" />
      </div>
    </>
  );
}

export function OverviewView() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    "/api/dashboard"
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Operations cockpit"
        title="Workshop overview"
        subtitle="A live read of demand, delivery and revenue across the AutoForge restoration floor."
        actions={
          <>
            <ButtonLink href="/admin/reports" variant="soft" size="sm">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Reports
            </ButtonLink>
            <ButtonLink href="/admin/leads" variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" />
              New lead
            </ButtonLink>
          </>
        }
      />

      <Reveal>
        <Hero />
      </Reveal>

      {isLoading && !data ? <Loading /> : null}
      {error && !data ? (
        <QueryError message={errorMessage(error)} onRetry={() => mutate()} />
      ) : null}

      {data ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard
              label="Open leads"
              value={data.kpis.openLeads}
              hint="Live across the CRM pipeline"
              icon={Users}
              tone="red"
              href="/admin/leads"
            />
            <KpiCard
              label="Active jobs"
              value={data.kpis.activeProjects}
              hint="In workshop or awaiting approval"
              icon={Car}
              href="/admin/projects"
            />
            <KpiCard
              label="Pipeline value"
              value={data.kpis.pipelineValue}
              hint="Open lead value in the funnel"
              icon={Wallet}
              format="currency"
              href="/admin/leads"
            />
            <KpiCard
              label="Parts to reorder"
              value={data.kpis.partsToReorder}
              hint="At or below minimum stock"
              icon={Boxes}
              href="/admin/parts"
            />
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-[1.45fr_1fr]">
            <div className="min-w-0 space-y-4">
              <Reveal delay={0.05}>
                <section className="panel overflow-hidden">
                  <div className="border-b border-line/80 px-4 py-3.5">
                    <SectionTitle
                      title="Lead pipeline"
                      subtitle="Value by CRM stage"
                      action={
                        <Link
                          href="/admin/leads"
                          className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-muted transition-colors hover:text-ink"
                        >
                          Open CRM
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      }
                      className="mb-0"
                    />
                  </div>
                  <div className="space-y-3 px-4 py-4">
                    {data.pipeline.map((stage) => {
                      const max = Math.max(
                        1,
                        ...data.pipeline.map((row) => row.count)
                      );
                      return (
                        <div key={stage.stage}>
                          <div className="mb-1.5 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5f6b79]" />
                              <span className="truncate text-[11px] font-medium text-ink/90">
                                {stage.stage}
                              </span>
                            </div>
                            <div className="flex shrink-0 items-baseline gap-2 text-[10px]">
                              <span className="text-muted">
                                {stage.count}{" "}
                                {stage.count === 1 ? "lead" : "leads"}
                              </span>
                              <span className="font-semibold text-ink/80">
                                {compactMoney(stage.value)}
                              </span>
                            </div>
                          </div>
                          <Meter
                            value={(stage.count / max) * 100}
                            tone={meterTone(stage.stage)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              </Reveal>

              <Reveal delay={0.1}>
                <section className="panel overflow-hidden">
                  <div className="border-b border-line/80 px-4 py-3.5">
                    <SectionTitle
                      title="Recent enquiries"
                      subtitle="Latest conversations entering the funnel"
                      action={
                        <Link
                          href="/admin/leads"
                          className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-muted transition-colors hover:text-ink"
                        >
                          All leads
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      }
                      className="mb-0"
                    />
                  </div>
                  {data.leads.length ? (
                    <DataTable
                      headers={["Customer", "Vehicle", "Status", "Value", "Owner"]}
                      minWidth={600}
                    >
                      {data.leads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="transition-colors hover:bg-panel2/40"
                        >
                          <td className="td">
                            <div className="font-semibold text-ink">
                              {lead.name}
                            </div>
                            <div className="mt-0.5 max-w-[190px] truncate text-[10px] text-muted">
                              {lead.interest}
                            </div>
                          </td>
                          <td className="td text-muted">{lead.vehicle}</td>
                          <td className="td">
                            <Badge label={lead.status} />
                          </td>
                          <td className="td font-semibold text-ink/90">
                            {money(lead.value)}
                          </td>
                          <td className="td text-muted">{lead.owner}</td>
                        </tr>
                      ))}
                    </DataTable>
                  ) : (
                    <div className="px-4 py-8 text-center text-xs text-muted">
                      No enquiries yet. Create the first lead to start the
                      pipeline.
                    </div>
                  )}
                </section>
              </Reveal>
            </div>

            <div className="min-w-0 space-y-4">
              <Reveal delay={0.08}>
                <section className="panel overflow-hidden">
                  <div className="border-b border-line/80 px-4 py-3.5">
                    <SectionTitle
                      title="Active jobs"
                      subtitle="Builds currently moving through the floor"
                      action={
                        <Link
                          href="/admin/projects"
                          className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-muted transition-colors hover:text-ink"
                        >
                          All jobs
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      }
                      className="mb-0"
                    />
                  </div>
                  <div className="space-y-2.5 p-3">
                    {data.projects.slice(0, 4).map((project) => (
                      <div
                        key={project.id}
                        className="rounded-lg border border-line/75 bg-panel2/45 p-3 transition-colors hover:border-[#3d4855]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-semibold text-accent">
                                {project.ref}
                              </span>
                              <span className="truncate text-[11px] text-muted">
                                {project.customer}
                              </span>
                            </div>
                            <div className="mt-0.5 truncate text-xs font-semibold text-ink">
                              {project.vehicle}
                            </div>
                          </div>
                          <Badge label={project.stage} />
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-[9px] text-muted">
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            Due {formatDate(project.dueDate)}
                          </span>
                          <span className="font-semibold text-ink/80">
                            {project.progress}%
                          </span>
                        </div>
                        <Meter
                          value={project.progress}
                          tone={project.progress >= 85 ? "success" : "accent"}
                          className="mt-1.5"
                        />
                      </div>
                    ))}
                    {!data.projects.length ? (
                      <p className="px-2 py-6 text-center text-xs text-muted">
                        No active restoration jobs.
                      </p>
                    ) : null}
                  </div>
                </section>
              </Reveal>

              <Reveal delay={0.12}>
                <section className="panel overflow-hidden">
                  <div className="border-b border-line/80 px-4 py-3.5">
                    <SectionTitle
                      title="BICEP coverage"
                      subtitle="Jobs touching each restoration discipline"
                      className="mb-0"
                    />
                  </div>
                  <div className="space-y-3 p-4">
                    {BICEP.map((item) => {
                      const count = data.bicepJobs[item.title] ?? 0;
                      const max = Math.max(
                        1,
                        ...Object.values(data.bicepJobs)
                      );
                      return (
                        <div key={item.letter} className="flex items-center gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-line bg-panel2 text-[10px] font-bold text-accent">
                            {item.letter}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex justify-between gap-2">
                              <span className="text-[10px] font-medium text-ink/90">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-muted">
                                {count} {count === 1 ? "job" : "jobs"}
                              </span>
                            </div>
                            <Meter
                              value={(count / max) * 100}
                              tone={count ? "accent" : "muted"}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </Reveal>

              <Reveal delay={0.16}>
                <section className="panel p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-amber/25 bg-amber/10 text-amber">
                      <Boxes className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink">
                        Inventory attention
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted">
                        {data.kpis.partsToReorder > 0
                          ? `${data.kpis.partsToReorder} SKU${
                              data.kpis.partsToReorder === 1 ? " is" : "s are"
                            } at or below minimum stock. Review supplier ETAs before the next build phase.`
                          : "All parts are above minimum stock. Inventory is clear for the current build plan."}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <ButtonLink href="/admin/parts" variant="soft" size="sm">
                          <Boxes className="h-3.5 w-3.5" />
                          Review inventory
                        </ButtonLink>
                        <ButtonLink
                          href="/admin/quotes"
                          variant="ghost"
                          size="sm"
                        >
                          <CircleDollarSign className="h-3.5 w-3.5" />
                          Quotes
                        </ButtonLink>
                      </div>
                    </div>
                  </div>
                </section>
              </Reveal>
            </div>
          </div>
        </>
      ) : null}
    </Page>
  );
}
