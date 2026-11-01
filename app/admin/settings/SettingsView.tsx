"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Page, Reveal } from "@/components/ui/Page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { Field } from "@/components/ui/FormField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QueryError, Skeleton } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/components/providers/SessionProvider";
import { apiMutate } from "@/lib/api-client";
import type { BusinessSettings, ReadinessItem } from "@/lib/types";
import { cn, errorMessage } from "@/lib/utils";

interface SettingsForm {
  businessName: string;
  framework: string;
  workshopAddress: string;
  contactEmail: string;
  contactPhone: string;
}

const emptyForm: SettingsForm = {
  businessName: "",
  framework: "",
  workshopAddress: "",
  contactEmail: "",
  contactPhone: "",
};

export function SettingsView() {
  const { data, error, isLoading, mutate } = useSWR<BusinessSettings>(
    "/api/settings"
  );
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [readiness, setReadiness] = useState<ReadinessItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const { toast } = useToast();
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!data) return;
    setForm({
      businessName: data.businessName ?? "",
      framework: data.framework ?? "",
      workshopAddress: data.workshopAddress ?? "",
      contactEmail: data.contactEmail ?? "",
      contactPhone: data.contactPhone ?? "",
    });
    setReadiness(data.readiness ?? []);
  }, [data]);

  const readinessStats = useMemo(() => {
    const done = readiness.filter((item) => item.completed).length;
    return {
      done,
      total: readiness.length,
      rate: readiness.length
        ? Math.round((done / readiness.length) * 100)
        : 0,
    };
  }, [readiness]);

  function updateField<K extends keyof SettingsForm>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleReadiness(key: string) {
    setReadiness((current) =>
      current.map((item) =>
        item.key === key ? { ...item, completed: !item.completed } : item
      )
    );
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiMutate<BusinessSettings>("/api/settings", "PATCH", {
        ...form,
        readiness,
      });
      toast("System setup saved.");
      await mutate();
      router.refresh();
    } catch (caught) {
      toast(errorMessage(caught), "error");
    } finally {
      setSaving(false);
    }
  }

  async function resetDemoData() {
    setResetPending(true);
    try {
      await apiMutate<{ reset: boolean; inserted: number }>(
        "/api/settings/reset",
        "POST",
        { confirm: "RESET" }
      );
      toast("Demo data reset to the seeded baseline.");
      setResetOpen(false);
      await mutate();
      router.refresh();
    } catch (caught) {
      toast(errorMessage(caught), "error");
    } finally {
      setResetPending(false);
    }
  }

  return (
    <Page>
      <PageHeader
        eyebrow="System setup"
        title="Operating configuration"
        subtitle="Define the business identity, contact channels and the readiness gates that must be cleared before live use."
        actions={
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="settings-form"
            loading={saving}
            disabled={!data}
          >
            <Save className="h-3.5 w-3.5" />
            Save changes
          </Button>
        }
      />

      {isLoading && !data ? (
        <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <div className="panel space-y-4 p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-4">
            <div className="panel p-5">
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="panel p-5">
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      ) : null}

      {error && !data ? (
        <QueryError message={errorMessage(error)} onRetry={() => mutate()} />
      ) : null}

      {data ? (
        <div className="grid items-start gap-4 xl:grid-cols-[1.35fr_1fr]">
          <form
            id="settings-form"
            onSubmit={save}
            className="min-w-0 space-y-4"
            noValidate
          >
            <Reveal>
              <section className="panel overflow-hidden">
                <div className="flex items-center gap-2 border-b border-line/80 px-4 py-3.5">
                  <Building2 className="h-4 w-4 text-accent" />
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      Business identity
                    </h2>
                    <p className="mt-0.5 text-[10px] text-muted">
                      Used across the command centre and customer-facing flows.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 p-4">
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field label="Business name" htmlFor="settings-name" required>
                      <input
                        id="settings-name"
                        className="input"
                        value={form.businessName}
                        onChange={(event) =>
                          updateField("businessName", event.target.value)
                        }
                        placeholder="AutoForge"
                        required
                      />
                    </Field>
                    <Field label="Contact email" htmlFor="settings-email">
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5f6b79]" />
                        <input
                          id="settings-email"
                          type="email"
                          className="input pl-9"
                          value={form.contactEmail}
                          onChange={(event) =>
                            updateField("contactEmail", event.target.value)
                          }
                          placeholder="workshop@example.com"
                        />
                      </div>
                    </Field>
                  </div>

                  <Field
                    label="Core restoration framework"
                    htmlFor="settings-framework"
                    required
                    hint="Shown as the operating standard for every build."
                  >
                    <input
                      id="settings-framework"
                      className="input"
                      value={form.framework}
                      onChange={(event) =>
                        updateField("framework", event.target.value)
                      }
                      placeholder="BICEP: Body · Interior · Chassis · Electrical · Powertrain"
                      required
                    />
                  </Field>

                  <Field label="Workshop address" htmlFor="settings-address">
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-[#5f6b79]" />
                      <textarea
                        id="settings-address"
                        className="input min-h-[74px] resize-y pl-9"
                        value={form.workshopAddress}
                        onChange={(event) =>
                          updateField("workshopAddress", event.target.value)
                        }
                        placeholder="Workshop address"
                      />
                    </div>
                  </Field>

                  <Field label="Contact phone" htmlFor="settings-phone">
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5f6b79]" />
                      <input
                        id="settings-phone"
                        className="input pl-9"
                        value={form.contactPhone}
                        onChange={(event) =>
                          updateField("contactPhone", event.target.value)
                        }
                        placeholder="+60 3-0000 0000"
                      />
                    </div>
                  </Field>
                </div>
              </section>
            </Reveal>

            <Reveal delay={0.05}>
              <section className="panel overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-line/80 px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-accent" />
                    <div>
                      <h2 className="text-sm font-semibold text-ink">
                        Readiness gates
                      </h2>
                      <p className="mt-0.5 text-[10px] text-muted">
                        Clear every gate before real business use.
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-muted">
                    {readinessStats.done}/{readinessStats.total}
                  </span>
                </div>
                <div className="divide-y divide-line/70">
                  {readiness.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleReadiness(item.key)}
                      aria-pressed={item.completed}
                      className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-panel2/40"
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded border transition-colors",
                          item.completed
                            ? "border-success bg-success text-[#062117]"
                            : "border-[#46515f] bg-[#0e1217] text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "block text-[11px] font-semibold leading-relaxed",
                            item.completed ? "text-muted" : "text-ink"
                          )}
                        >
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-relaxed text-muted">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  ))}
                  {!readiness.length ? (
                    <p className="px-4 py-8 text-center text-xs text-muted">
                      No readiness gates configured.
                    </p>
                  ) : null}
                </div>
              </section>
            </Reveal>
          </form>

          <div className="min-w-0 space-y-4">
            <Reveal delay={0.03}>
              <section className="panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      Readiness score
                    </h2>
                    <p className="mt-0.5 text-[10px] text-muted">
                      Implementation gate completion
                    </p>
                  </div>
                  <div className="text-2xl font-bold tracking-[-0.04em] text-ink">
                    {readinessStats.rate}
                    <span className="text-sm text-muted">%</span>
                  </div>
                </div>
                <Meter
                  value={readinessStats.rate}
                  tone={readinessStats.rate === 100 ? "success" : "accent"}
                  className="mt-3"
                />
                <p className="mt-3 text-[10px] leading-relaxed text-muted">
                  {readinessStats.rate === 100
                    ? "All readiness gates are complete. Confirm backups and permissions before real business use."
                    : `${readinessStats.total - readinessStats.done} gate${
                        readinessStats.total - readinessStats.done === 1
                          ? " remains"
                          : "s remain"
                      } before the system is ready for live operations.`}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line/70 pt-3">
                  <div>
                    <div className="text-base font-bold text-success">
                      {readinessStats.done}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.1em] text-muted">
                      Complete
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-amber">
                      {readinessStats.total - readinessStats.done}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.1em] text-muted">
                      Outstanding
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>

            <Reveal delay={0.07}>
              <section className="panel p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <h2 className="text-sm font-semibold text-ink">
                    Data & security
                  </h2>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {[
                    `Signed in as ${session.email}`,
                    `${session.role === "admin" ? "Administrator" : "Manager"} role · destructive actions ${
                      session.role === "admin" ? "enabled" : "restricted"
                    }`,
                    "HttpOnly, SameSite session cookie with 8-hour expiry",
                    "All admin API routes require a verified session",
                    "Secrets and database credentials stay server-side",
                  ].map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-[10px] leading-relaxed text-muted"
                    >
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-success" />
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            {session.role === "admin" ? (
              <Reveal delay={0.11}>
                <section className="rounded-[13px] border border-[#5c2b29]/70 bg-[#1f1514] p-4">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-[#ff9d95]" />
                    <h2 className="text-sm font-semibold text-[#ffd0cc]">
                      Reset demo data
                    </h2>
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-[#c79a96]">
                    Replaces leads, jobs, quotes, parts, orders, updates,
                    workshop tasks and settings with the seeded baseline. The
                    admin account and password are preserved.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    className="mt-3"
                    onClick={() => setResetOpen(true)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset to baseline
                  </Button>
                </section>
              </Reveal>
            ) : (
              <Reveal delay={0.11}>
                <section className="panel p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted" />
                    <h2 className="text-sm font-semibold text-ink">
                      Administrator only
                    </h2>
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-muted">
                    Resetting demo data and deleting records require an
                    administrator account. Ask an administrator if you need this
                    action.
                  </p>
                </section>
              </Reveal>
            )}
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={resetDemoData}
        title="Reset demo data"
        description="All operational records will be replaced with the seeded baseline."
        confirmLabel="Reset data"
        tone="danger"
        requireText="RESET"
        loading={resetPending}
      >
        <p className="text-xs leading-relaxed text-muted">
          This deletes current leads, jobs, quotes, parts, orders, customer
          updates, workshop tasks and settings, then reseeds the demo content.
          The admin account is preserved. This cannot be undone.
        </p>
      </ConfirmDialog>
    </Page>
  );
}
