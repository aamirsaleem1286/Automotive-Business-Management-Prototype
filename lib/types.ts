import type {
  AdminRole,
  LeadSource,
  LeadStatus,
  OrderStatus,
  PartCategory,
  ProjectScope,
  ProjectStage,
  QuoteStatus,
  UpdateChannel,
  UpdateStatus,
} from "./constants";

export interface Timestamped {
  createdAt: string;
  updatedAt?: string;
}

export interface Lead extends Timestamped {
  id: string;
  name: string;
  vehicle: string;
  interest: string;
  source: LeadSource;
  status: LeadStatus;
  owner: string;
  value: number;
  nextAction: string;
  notes?: string;
}

export interface Project extends Timestamped {
  id: string;
  ref: string;
  customer: string;
  vehicle: string;
  scope: ProjectScope;
  stage: ProjectStage;
  progress: number;
  dueDate: string;
  owner: string;
}

export interface Quote extends Timestamped {
  id: string;
  ref: string;
  customer: string;
  project: string;
  amount: number;
  status: QuoteStatus;
  issuedAt: string;
}

export interface Part extends Timestamped {
  id: string;
  sku: string;
  name: string;
  category: PartCategory;
  stock: number;
  minStock: number;
  price: number;
}

export interface Order extends Timestamped {
  id: string;
  ref: string;
  customer: string;
  item: string;
  total: number;
  status: OrderStatus;
  orderedAt: string;
}

export interface CustomerUpdate extends Timestamped {
  id: string;
  customer: string;
  channel: UpdateChannel;
  subject: string;
  message?: string;
  status: UpdateStatus;
  sentAt?: string | null;
}

export interface WorkshopTask extends Timestamped {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  order: number;
}

export interface ReadinessItem {
  key: string;
  label: string;
  description: string;
  completed: boolean;
}

export interface BusinessSettings {
  id: string;
  businessName: string;
  framework: string;
  workshopAddress: string;
  contactEmail: string;
  contactPhone: string;
  readiness: ReadinessItem[];
  updatedAt?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface DashboardData {
  kpis: {
    openLeads: number;
    activeProjects: number;
    pipelineValue: number;
    partsToReorder: number;
  };
  leads: Lead[];
  projects: Project[];
  pipeline: Array<{ stage: string; count: number; value: number }>;
  bicepJobs: Record<string, number>;
}

export interface ReportData {
  kpis: {
    leadCount: number;
    quoteApprovalRate: number;
    openJobValue: number;
    lowStockSkus: number;
  };
  leadMix: Array<{ status: string; count: number }>;
  quoteMix: Array<{ status: string; count: number }>;
}

export interface ApiEnvelope<T> {
  data: T;
}

export interface ApiErrorEnvelope {
  error: string;
  details?: unknown;
}
