import { READINESS_ITEMS } from "./constants";

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

export const sampleLeads = [
  {
    name: "Amir Hakim",
    vehicle: "Proton Satria Neo",
    interest: "Full BICEP restoration",
    source: "Website form",
    status: "Qualified",
    owner: "Suriya",
    value: 18000,
    nextAction: "Book inspection",
    notes: "",
  },
  {
    name: "Melissa Tan",
    vehicle: "Proton Putra",
    interest: "Body & roof restoration",
    source: "Instagram",
    status: "New",
    owner: "Sales",
    value: 9500,
    nextAction: "Call customer",
    notes: "",
  },
  {
    name: "Rizal Osman",
    vehicle: "Proton Satria",
    interest: "Powertrain rebuild",
    source: "Referral",
    status: "Quote sent",
    owner: "Suriya",
    value: 7200,
    nextAction: "Follow up quote",
    notes: "",
  },
  {
    name: "Daniel Wong",
    vehicle: "Proton C99",
    interest: "Electrical architecture",
    source: "Phone",
    status: "Inspection booked",
    owner: "Sales",
    value: 3600,
    nextAction: "Confirm appointment",
    notes: "",
  },
] as const;

export const sampleProjects = [
  {
    ref: "AF-2601",
    customer: "Amir Hakim",
    vehicle: "Satria Neo · 2008",
    scope: "Full BICEP",
    stage: "Inspection",
    progress: 15,
    dueDate: date("2026-11-12"),
    owner: "Workshop Lead",
  },
  {
    ref: "AF-2602",
    customer: "Rizal Osman",
    vehicle: "Proton Satria · 2001",
    scope: "Powertrain",
    stage: "Parts sourcing",
    progress: 40,
    dueDate: date("2026-11-06"),
    owner: "Technician A",
  },
  {
    ref: "AF-2603",
    customer: "Melissa Tan",
    vehicle: "Proton Putra · 1997",
    scope: "Body + Interior",
    stage: "Quote approval",
    progress: 10,
    dueDate: date("2026-11-20"),
    owner: "Workshop Lead",
  },
] as const;

export const sampleQuotes = [
  {
    ref: "QT-1041",
    customer: "Amir Hakim",
    project: "AF-2601 · Full BICEP",
    amount: 18000,
    status: "Draft",
    issuedAt: date("2026-10-29"),
  },
  {
    ref: "QT-1038",
    customer: "Rizal Osman",
    project: "AF-2602 · Powertrain",
    amount: 7200,
    status: "Sent",
    issuedAt: date("2026-10-27"),
  },
  {
    ref: "QT-1035",
    customer: "Daniel Wong",
    project: "Electrical architecture",
    amount: 3600,
    status: "Approved",
    issuedAt: date("2026-10-25"),
  },
] as const;

export const sampleParts = [
  {
    sku: "AF-ACC-014",
    name: "Aluminium Sports Pedal Set",
    category: "Accessories",
    stock: 12,
    minStock: 5,
    price: 228,
  },
  {
    sku: "AF-ACC-021",
    name: "Delrin Gear Shift Knob",
    category: "Accessories",
    stock: 7,
    minStock: 4,
    price: 152,
  },
  {
    sku: "AUD-INF-002",
    name: "Infinity Basslink DC",
    category: "Audio",
    stock: 2,
    minStock: 3,
    price: 2788,
  },
  {
    sku: "AF-TRM-006",
    name: "Carpet Mat Set",
    category: "Interior",
    stock: 9,
    minStock: 4,
    price: 285,
  },
  {
    sku: "ENG-CNS-011",
    name: "Engine Consumables Kit",
    category: "Powertrain",
    stock: 3,
    minStock: 5,
    price: 640,
  },
] as const;

export const sampleOrders = [
  {
    ref: "ORD-2048",
    customer: "Haziq Rahman",
    item: "Carpet Mat Set",
    total: 285,
    status: "Processing",
    orderedAt: date("2026-10-29"),
  },
  {
    ref: "ORD-2047",
    customer: "Lee Jun",
    item: "Sports Pedal Set",
    total: 228,
    status: "Ready to ship",
    orderedAt: date("2026-10-28"),
  },
  {
    ref: "ORD-2046",
    customer: "S. Kumar",
    item: "Gear Shift Knob",
    total: 152,
    status: "Completed",
    orderedAt: date("2026-10-27"),
  },
] as const;

export const sampleCustomerUpdates = [
  {
    customer: "Amir Hakim",
    channel: "WhatsApp (planned)",
    subject: "Inspection received",
    message: "",
    status: "Draft",
    sentAt: null,
  },
  {
    customer: "Rizal Osman",
    channel: "Email (planned)",
    subject: "Quote QT-1038 follow-up",
    message: "",
    status: "Queued",
    sentAt: null,
  },
] as const;

export const sampleWorkshopTasks = [
  {
    title: "Confirm inspection appointments",
    category: "Customer / sales workflow",
    completed: false,
    order: 0,
  },
  {
    title: "Review quotes awaiting customer approval",
    category: "Customer / sales workflow",
    completed: false,
    order: 1,
  },
  {
    title: "Check critical parts and supplier ETAs",
    category: "Workshop delivery",
    completed: true,
    order: 2,
  },
  {
    title: "Assign technicians and confirm job priorities",
    category: "Workshop delivery",
    completed: false,
    order: 3,
  },
  {
    title: "Complete quality-control and roadworthiness checks",
    category: "Workshop delivery",
    completed: false,
    order: 4,
  },
] as const;

export const sampleSettings = {
  key: "global",
  businessName: "AutoForge",
  framework: "BICEP: Body · Interior · Chassis · Electrical · Powertrain",
  workshopAddress: "Enter business address during implementation",
  contactEmail: "",
  contactPhone: "",
  readiness: READINESS_ITEMS.map((item) => ({
    key: item.key,
    label: item.label,
    description: item.description,
    completed: false,
  })),
};
