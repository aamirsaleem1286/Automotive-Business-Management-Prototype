"use client";

import { useMemo } from "react";
import useSWR from "swr";
import {
  BarChart3,
  Boxes,
  Download,
  FileCheck2,
  Users,
  Wallet,
} from "lucide-react";
import { Page, Reveal } from "@/components/ui/Page";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  CardSkeleton,
  KpiGridSkeleton,
  QueryError,
} from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { OPERATIONAL_MEASURES } from "@/lib/constants";
import type { ReportData } from "@/lib/types";
import {
  downloadCsv,
  errorMessage,
  money,
  statusTone,
} from "@/lib/utils";

const barColors: Record<string, string> = {
  green: "bg-success",
  blue: "bg-info",
  amber: "bg-amber",
  red: "bg-accent",
  neutral: "bg-[#728092]",
};

const donutColors: Record<string, string> = {
  green: "#35c98a",
  blue: "#66a9ff",
  amber: "#f5b942",
  red: "#f04438",
  neutral: "#728092",
};

export function ReportsView() {
  const { data, error, isLoading, mutate } = useSWR<ReportData>("/api/reports");
  const { toast } = useToast();

  const totals = useMemo(() => {
    if (!data) {
      return { leads: 0, quotes: 0, pipeline: 0, converted: 0, conversion: 0 };
    }
    const leads = data.leadMix.reduce((sum, row) => sum + row.count, 0);
    const quotes = data.quoteMix.reduce((sum, row) => sum + row.count, 0);
    const won = data.leadMix.find((row) => row.status === "Won")?.count ?? 0;
    const lost = data.leadMix.find((row) => row.status === "Lost")?.count ?? 0;
    const decided = won + lost;
    return {
      leads,
      quotes,
      pipeline: data.kpis.openJobValue,
      converted: won,
      conversion: decided ? Math.round((won / decided) * 100) : 0,
    };
  }, [data]);

  const donut = useMemo(() => {
    if (!data) return { gradient: "#262d36", total: 0 };
    const total = data.quoteMix.reduce((sum, row) => sum + row.count, 0);
    if (!total) {
      return {
        gradient: "conic-gradient(#262d36 0% 100%)",
        total: 0,
      };
    }
    let cursor = 0;
    const stops: string[] = [];
    for (const row of data.quoteMix) {
      if (!row.count) continue;
      const share = (row.count / total) * 100;
      const color = donutColors[statusTone(row.status)] ?? donutColors.neutral;
      stops.push(`${color} ${cursor}% ${cursor + share}%`);
      cursor += share;
    }
    return {
      gradient: `conic-gradient(${stops.join(", ")})`,
      total,
    };
  }, [data]);

  function exportReport() {
    if (!data) return;
    const rows: Array<Record<string, unknown>> = [
      { metric: "Total leads", value: data.kpis.leadCount },
      { metric: "Quote approval rate (%)", value: data.kpis.quoteApprovalRate },
      { metric: "Open job value (RM)", value: data.kpis.openJobValue },
      { metric: "Low stock SKUs", value: data.kpis.lowStockSkus },
      ...data.leadMix.map((row) => ({
        metric: `Leads — ${row.status}`,
        value: row.count,
      })),
      ...data.quoteMix.map((row) => ({
        metric: `Quotes — ${row.status}`,
        value: row.count,
      })),
    ];
    downloadCsv("autoforge-report.csv", rows);
    toast("Report exported as CSV.");
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Reports"
        title="Business intelligence"
        subtitle="A concise operating read on lead flow, quote conversion and working capital tied up in jobs."
        actions={
          <Button
            variant="soft"
            size="sm"
            onClick={exportReport}
            disabled={!data}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
      />

      {isLoading && !data ? (
        <>
          <KpiGridSkeleton />
          <div className="grid gap-4 xl:grid-cols-2">
            <CardSkeleton className="min-h-[340px]" />
            <CardSkeleton className="min-h-[340px]" />
          </div>
        </>
      ) : null}

      {error && !data ? (
        <QueryError message={errorMessage(error)} onRetry={() => mutate()} />
      ) : null}

      {data ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard label="Total leads" value={data.kpis.leadCount} hint="All captured enquiries" icon={Users} tone="red" href="/admin/leads" />
            <KpiCard label="Quote approval" value={data.kpis.quoteApprovalRate} hint="Approved share of quotes" icon={FileCheck2} format="percent" href="/admin/quotes" />
            <KpiCard label="Open job value" value={data.kpis.openJobValue} hint="Unclosed lead pipeline value" icon={Wallet} format="currency" href="/admin/leads" />
            <KpiCard label="Low stock SKUs" value={data.kpis.lowStockSkus} hint="At or below reorder threshold" icon={Boxes} href="/admin/parts" />
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-2">
            <Reveal delay={0.04}>
              <section className="panel overflow-hidden">
                <div className="border-b border-line/80 px-4 py-3.5">
                  <SectionTitle
                    title="Lead flow by stage"
                    subtitle={`${totals.leads} enquiries across the CRM`}
                    action={
                      <span className="rounded-full border border-line bg-panel2/50 px-2 py-1 text-[10px] text-muted">
                        {totals.conversion}% won of decided
                      </span>
                    }
                    className="mb-0"
                  />
                </div>
                <div className="space-y-3.5 p-4">
                  {data.leadMix.map((row) => {
                    const max = Math.max(
                      1,
                      ...data.leadMix.map((item) => item.count)
                    );
                    const tone = statusTone(row.status);
                    return (
                      <div key={row.status}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="text-[11px] font-medium text-ink/90">
                            {row.status}
                          </span>
                          <span className="text-[10px] text-muted">
                            {row.count}{" "}
                            {row.count === 1 ? "lead" : "leads"}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#262d36]">
                          <div
                            className={`h-full rounded-full ${barColors[tone]}`}
                            style={{ width: `${(row.count / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-line/70 p-4">
                  <div>
                    <div className="text-lg font-bold tracking-[-0.03em] text-ink">
                      {totals.converted}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.1em] text-muted">
                      Won leads
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold tracking-[-0.03em] text-ink">
                      {money(totals.pipeline)}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.1em] text-muted">
                      Open value
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold tracking-[-0.03em] text-ink">
                      {totals.conversion}%
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.1em] text-muted">
                      Conversion
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>

            <Reveal delay={0.08}>
              <section className="panel overflow-hidden">
                <div className="border-b border-line/80 px-4 py-3.5">
                  <SectionTitle
                    title="Quote outcomes"
                    subtitle={`${donut.total} quotes issued`}
                    className="mb-0"
                  />
                </div>
                <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:items-center sm:justify-around">
                  <div className="relative h-[148px] w-[148px] shrink-0">
                    <div
                      className="h-full w-full rounded-full"
                      style={{ background: donut.gradient }}
                    />
                    <div className="absolute inset-[18px] grid place-items-center rounded-full bg-panel">
                      <div className="text-center">
                        <div className="text-2xl font-bold tracking-[-0.04em] text-ink">
                          {donut.total}
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.12em] text-muted">
                          Quotes
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full space-y-2.5 sm:max-w-[190px]">
                    {data.quoteMix.map((row) => {
                      const tone = statusTone(row.status);
                      return (
                        <div
                          key={row.status}
                          className="flex items-center justify-between gap-3 text-[11px]"
                        >
                          <span className="flex items-center gap-2 text-muted">
                            <span
                              className="h-2 w-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  donutColors[tone] ?? donutColors.neutral,
                              }}
                            />
                            {row.status}
                          </span>
                          <span className="font-semibold text-ink/90">
                            {row.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-line/70 p-4">
                  <div className="mb-1.5 flex justify-between text-[10px]">
                    <span className="text-muted">Approval rate</span>
                    <span className="font-semibold text-ink/90">
                      {data.kpis.quoteApprovalRate}%
                    </span>
                  </div>
                  <Meter
                    value={data.kpis.quoteApprovalRate}
                    tone="success"
                  />
                </div>
              </section>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <section className="mt-4 panel overflow-hidden">
              <div className="border-b border-line/80 px-4 py-3.5">
                <SectionTitle
                  title="Operational scorecard"
                  subtitle="Measures to baseline before scaling the business"
                  action={
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted">
                      <BarChart3 className="h-3 w-3" />
                      Baseline pending
                    </span>
                  }
                  className="mb-0"
                />
              </div>
              <div className="grid gap-px bg-line/70 sm:grid-cols-2 lg:grid-cols-3">
                {OPERATIONAL_MEASURES.map((measure, index) => (
                  <div key={measure.label} className="bg-panel p-4">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-panel2 text-[9px] font-bold text-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold text-ink">
                          {measure.label}
                        </p>
                        <p className="mt-1 text-[10px] leading-relaxed text-muted">
                          {measure.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.1em] text-[#5f6b79]">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                      Not yet instrumented
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        </>
      ) : null}
    </Page>
  );
}
