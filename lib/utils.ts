import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return `RM ${new Intl.NumberFormat("en-MY", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0)}`;
}

export function compactMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "RM 0";
  if (Math.abs(amount) >= 1_000_000) {
    return `RM ${(amount / 1_000_000).toFixed(1)}m`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `RM ${(amount / 1_000).toFixed(1)}k`;
  }
  return money(amount);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "To confirm";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "To confirm";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function toDateInput(value: string | Date | null | undefined) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export type StatusTone = "green" | "blue" | "amber" | "red" | "neutral";

const STATUS_TONES: Record<string, StatusTone> = {
  Qualified: "green",
  Approved: "green",
  Completed: "green",
  "In stock": "green",
  Won: "green",
  "Ready for handover": "green",
  New: "blue",
  Sent: "blue",
  "Inspection booked": "blue",
  Processing: "blue",
  "In progress": "blue",
  Queued: "blue",
  Contacted: "blue",
  "Quote sent": "amber",
  Draft: "amber",
  "Parts sourcing": "amber",
  "Ready to ship": "amber",
  Inspection: "amber",
  "Quote approval": "amber",
  "Quality check": "amber",
  "Low stock": "red",
  Declined: "red",
  Cancelled: "red",
  Lost: "red",
  "Sent (demo)": "green",
};

export function statusTone(status: string): StatusTone {
  return STATUS_TONES[status] ?? "neutral";
}

export function classForTone(tone: StatusTone) {
  switch (tone) {
    case "green":
      return "bg-[#153b2e] text-[#8ce3ba]";
    case "blue":
      return "bg-[#1d344e] text-[#a6d0ff]";
    case "amber":
      return "bg-[#44351b] text-[#f9d17d]";
    case "red":
      return "bg-[#422321] text-[#ffaca4]";
    default:
      return "bg-[#29303a] text-[#cbd3dd]";
  }
}

export function toCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const escape = (value: unknown) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [
    keys.join(","),
    ...rows.map((row) => keys.map((key) => escape(row[key])).join(",")),
  ].join("\n");
}

export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (typeof window === "undefined" || !rows.length) return;
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}

export function nextInCycle<T extends string>(list: readonly T[], current: T): T {
  const index = list.indexOf(current);
  return list[(index + 1) % list.length] ?? list[0];
}
