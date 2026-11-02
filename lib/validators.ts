import { z } from "zod";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  ORDER_STATUSES,
  PART_CATEGORIES,
  PROJECT_SCOPES,
  PROJECT_STAGES,
  QUOTE_STATUSES,
  UPDATE_CHANNELS,
  UPDATE_STATUSES,
} from "./constants";

const requiredText = (label: string, max = 160) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`);

const optionalText = (max = 2000) =>
  z.string().trim().max(max, "Value is too long").optional().default("");

const money = z
  .number({ invalid_type_error: "Enter a valid amount" })
  .min(0, "Amount cannot be negative")
  .max(1_000_000_000, "Amount is too large");

const wholeNumber = z
  .number({ invalid_type_error: "Enter a valid number" })
  .int("Use a whole number")
  .min(0, "Value cannot be negative")
  .max(1_000_000, "Value is too large");

const dateString = z
  .string({ required_error: "Date is required" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date");

export const idSchema = z.string().trim().min(1, "Invalid record id").max(64);

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(200),
  password: z.string().min(1, "Password is required").max(200),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, "Current password is required")
      .max(200),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, "New password must be at least 8 characters")
      .max(200, "New password is too long"),
    confirmPassword: z
      .string({ required_error: "Confirm your new password" })
      .min(1, "Confirm your new password")
      .max(200),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export const leadSchema = z.object({
  name: requiredText("Customer name", 120),
  vehicle: requiredText("Vehicle", 120),
  interest: requiredText("Requirement", 200),
  source: z.enum(LEAD_SOURCES),
  status: z.enum(LEAD_STATUSES).default("New"),
  owner: requiredText("Owner", 80),
  value: money.default(0),
  nextAction: optionalText(200).default("First response"),
  notes: optionalText(2000),
});

export const leadUpdateSchema = leadSchema.partial();

export const projectSchema = z.object({
  customer: requiredText("Customer", 120),
  vehicle: requiredText("Vehicle", 120),
  scope: z.enum(PROJECT_SCOPES),
  stage: z.enum(PROJECT_STAGES).default("Inspection"),
  dueDate: dateString,
  owner: requiredText("Job owner", 80),
});

export const projectUpdateSchema = projectSchema.partial();

export const quoteSchema = z.object({
  customer: requiredText("Customer", 120),
  project: requiredText("Scope or project", 200),
  amount: money,
  status: z.enum(QUOTE_STATUSES).default("Draft"),
});

export const quoteUpdateSchema = quoteSchema.partial();

export const partSchema = z.object({
  sku: z
    .string({ required_error: "SKU is required" })
    .trim()
    .min(2, "SKU is required")
    .max(40, "SKU is too long")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes only")
    .transform((value) => value.toUpperCase()),
  name: requiredText("Part name", 160),
  category: z.enum(PART_CATEGORIES),
  stock: wholeNumber,
  minStock: wholeNumber,
  price: money,
});

export const partUpdateSchema = partSchema.partial();

export const orderSchema = z.object({
  customer: requiredText("Customer", 120),
  item: requiredText("Item", 160),
  total: money,
  status: z.enum(ORDER_STATUSES).default("Processing"),
});

export const orderUpdateSchema = orderSchema.partial();

export const customerUpdateSchema = z.object({
  customer: requiredText("Customer", 120),
  channel: z.enum(UPDATE_CHANNELS),
  subject: requiredText("Message purpose", 200),
  message: optionalText(2000),
  status: z.enum(UPDATE_STATUSES).default("Draft"),
});

export const customerUpdateUpdateSchema = customerUpdateSchema.partial();

export const workshopTaskSchema = z.object({
  title: requiredText("Checklist item", 200),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(80, "Category is too long")
    .default("Workshop delivery"),
});

export const workshopTaskUpdateSchema = z.object({
  completed: z.boolean(),
});

export const readinessSchema = z.object({
  key: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(200),
  description: z.string().trim().max(300).default(""),
  completed: z.boolean(),
});

export const settingsUpdateSchema = z
  .object({
    businessName: requiredText("Business name", 120),
    framework: requiredText("Core restoration framework", 240),
    workshopAddress: z.string().trim().max(300).default(""),
    contactEmail: z
      .union([z.literal(""), z.string().trim().email("Enter a valid email")])
      .default(""),
    contactPhone: z.string().trim().max(60).default(""),
    readiness: z.array(readinessSchema).max(30),
  })
  .partial();

export type LeadInput = z.infer<typeof leadSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type PartInput = z.infer<typeof partSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type WorkshopTaskInput = z.infer<typeof workshopTaskSchema>;
export type SettingsInput = z.infer<typeof settingsUpdateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
