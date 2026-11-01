export const CREATOR = "Furqan Khan";
export const APP_NAME = "AutoForge";

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Inspection booked",
  "Quote sent",
  "Won",
  "Lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  "Website form",
  "Phone",
  "WhatsApp",
  "Instagram",
  "Facebook",
  "Referral",
  "Walk-in",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const PROJECT_SCOPES = [
  "Full BICEP",
  "Body",
  "Interior",
  "Chassis",
  "Electrical architecture",
  "Powertrain & auxiliary",
  "Body + Interior",
  "Powertrain",
] as const;
export type ProjectScope = (typeof PROJECT_SCOPES)[number];

export const PROJECT_STAGES = [
  "Inspection",
  "Quote approval",
  "Parts sourcing",
  "In progress",
  "Quality check",
  "Ready for handover",
] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const STAGE_PROGRESS: Record<ProjectStage, number> = {
  Inspection: 15,
  "Quote approval": 25,
  "Parts sourcing": 40,
  "In progress": 65,
  "Quality check": 90,
  "Ready for handover": 100,
};

export const QUOTE_STATUSES = ["Draft", "Sent", "Approved", "Declined"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const ORDER_STATUSES = [
  "Processing",
  "Ready to ship",
  "Completed",
  "Cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const UPDATE_CHANNELS = [
  "Email (planned)",
  "WhatsApp (planned)",
  "Phone task",
  "SMS (planned)",
] as const;
export type UpdateChannel = (typeof UPDATE_CHANNELS)[number];

export const UPDATE_STATUSES = ["Draft", "Queued", "Sent"] as const;
export type UpdateStatus = (typeof UPDATE_STATUSES)[number];

export const PART_CATEGORIES = [
  "Accessories",
  "Audio",
  "Interior",
  "Powertrain",
  "Body",
  "Electrical",
  "Chassis",
  "Consumables",
] as const;
export type PartCategory = (typeof PART_CATEGORIES)[number];

export const ADMIN_ROLES = ["admin", "manager"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const BICEP = [
  { letter: "B", title: "BODY", detail: "Rust, panels, paint" },
  { letter: "I", title: "INTERIOR", detail: "Trim, seats, cabin" },
  { letter: "C", title: "CHASSIS", detail: "Suspension, bushings" },
  { letter: "E", title: "ELECTRICAL", detail: "Wiring, ICE, safety" },
  { letter: "P", title: "POWERTRAIN", detail: "Engine, gearbox" },
] as const;

export const READINESS_ITEMS = [
  {
    key: "workflow",
    label: "Confirm workflow and staff roles",
    description: "Owner, sales advisor, service advisor, technician, parts, finance",
  },
  {
    key: "commerce",
    label: "Confirm source of truth for products and orders",
    description: "Existing website shop vs new commerce system",
  },
  {
    key: "consent",
    label: "Configure customer consent and privacy notices",
    description: "Contact permissions, retention, access controls",
  },
  {
    key: "integrations",
    label: "Connect email, WhatsApp, payments and accounting",
    description: "Requires approved providers and credentials",
  },
  {
    key: "backup",
    label: "Test backups, permissions and audit trail",
    description: "Before real business use",
  },
] as const;

export const OPERATIONAL_MEASURES = [
  {
    label: "Speed to first response",
    description: "Median minutes from enquiry to first human response",
  },
  {
    label: "Inspection conversion",
    description: "Inspections booked ÷ qualified enquiries",
  },
  {
    label: "Quote approval rate",
    description: "Approved quotes ÷ quotes sent",
  },
  {
    label: "Estimate variance",
    description: "Final invoiced cost vs approved estimate",
  },
  {
    label: "On-time handover",
    description: "Jobs handed over by agreed target date",
  },
  {
    label: "Parts availability",
    description: "Jobs delayed due to missing parts",
  },
] as const;

export const CUSTOMER_UPDATE_PILLARS = [
  {
    title: "Lead response",
    description: "Acknowledge enquiry quickly and assign an owner.",
  },
  {
    title: "Work progress",
    description: "Share milestone updates and approved variations.",
  },
  {
    title: "Aftercare",
    description: "Handover checklist, maintenance advice, review request.",
  },
] as const;
