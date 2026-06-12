import type {
  ConceptNote,
  DeployedTeam,
  Incident,
  NeedReport,
  PartnerActivity,
  Resource,
  ResponseTask,
  SituationReport,
  User,
} from "./types";

export type DashboardSummary = {
  activeIncidents: number;
  affectedPeople: number;
  urgentNeeds: number;
  openTasks: number;
  resourceGaps: number;
};

export type DataBackend = "demo" | "prisma" | "drizzle";

export type CreateSituationReportInput = {
  incidentId: string;
  reportingPeriod?: string;
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
  summary: string;
  impact: string;
  priorityNeeds: string;
  responseActions: string;
  gaps: string;
  nextPriorities: string;
};

export type CreateConceptNoteVersionInput = {
  incidentId: string;
  content: string;
  status?: ConceptNote["status"];
  updatedBy?: string;
};

export type IncidentSubProgramInput = {
  id?: string;
  name: string;
  budgetAllocated: number;
};

export type IncidentFundRequestInput = {
  id?: string;
  subProgramName: string;
  requestedByTeam: string;
  amount: number;
  currency?: string;
  purpose: string;
  status?: Incident["fundRequests"][number]["status"];
  requestedAt?: string;
};

export type CreateIncidentInput = {
  title: string;
  disasterType: string;
  severity: Incident["severity"];
  status: Incident["status"];
  region: string;
  country: string;
  state: string;
  locationName: string;
  latitude: number;
  longitude: number;
  startTime: string;
  description: string;
  lead?: string;
  latestUpdate?: string;
  budgetCurrency: string;
  masterBudgetAmount: number;
  createdById?: string;
  subPrograms?: IncidentSubProgramInput[];
  fundRequests?: IncidentFundRequestInput[];
};

export type UpdateIncidentInput = Partial<
  Omit<CreateIncidentInput, "createdById">
>;

export type CreateNeedInput = {
  incidentId: string;
  category: string;
  urgency: NeedReport["urgency"];
  quantity: number;
  unit?: string;
  affectedPeople: number;
  locationName: string;
  latitude: number;
  longitude: number;
  notes?: string;
  reportedById?: string;
};

export type UpdateNeedInput = Partial<
  Pick<
    NeedReport,
    | "category"
    | "urgency"
    | "quantity"
    | "affectedPeople"
    | "status"
    | "locationName"
    | "latitude"
    | "longitude"
    | "notes"
  >
> & {
  unit?: string;
  verifiedById?: string;
};

export type CreateTaskInput = {
  incidentId: string;
  title: string;
  description?: string;
  assignee?: string;
  assigneeId?: string;
  priority: ResponseTask["priority"];
  status?: ResponseTask["status"];
  dueTime?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  createdById?: string;
};

export type UpdateTaskInput = Partial<
  Pick<
    ResponseTask,
    "title" | "description" | "assignee" | "priority" | "status" | "dueTime" | "locationName"
  >
> & {
  assigneeId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type CreateResourceInput = {
  name: string;
  category: string;
  quantityAvailable: number;
  quantityCommitted?: number;
  unit: string;
  warehouseLocation: string;
  receivedAt?: string;
  expiryDate?: string | null;
};

export type UpdateResourceInput = Partial<CreateResourceInput>;

export type CommitResourceInput = {
  incidentId?: string | null;
  quantity: number;
  note?: string;
};

export type CreatePartnerActivityInput = {
  incidentId: string;
  organization?: string;
  organizationId?: string;
  sector: string;
  activity: string;
  locationName: string;
  latitude?: number | null;
  longitude?: number | null;
  status?: PartnerActivity["status"];
  contactName: string;
  contactPhone?: string;
  startDate?: string;
  endDate?: string | null;
};

export type UpdatePartnerActivityInput = Partial<
  Omit<CreatePartnerActivityInput, "incidentId">
> & {
  incidentId?: string;
};

export type DataRepository = {
  backend: DataBackend;
  getCurrentUser(): Promise<User>;
  listUsers(): Promise<User[]>;
  listIncidents(): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | undefined>;
  createIncident(input: CreateIncidentInput): Promise<Incident>;
  updateIncident(id: string, input: UpdateIncidentInput): Promise<Incident | undefined>;
  deleteIncident(id: string): Promise<boolean>;
  listNeeds(): Promise<NeedReport[]>;
  getIncidentNeeds(id: string): Promise<NeedReport[]>;
  createNeed(input: CreateNeedInput): Promise<NeedReport>;
  updateNeed(id: string, input: UpdateNeedInput): Promise<NeedReport | undefined>;
  listTasks(): Promise<ResponseTask[]>;
  getIncidentTasks(id: string): Promise<ResponseTask[]>;
  createTask(input: CreateTaskInput): Promise<ResponseTask>;
  updateTask(id: string, input: UpdateTaskInput): Promise<ResponseTask | undefined>;
  listResources(): Promise<Resource[]>;
  getIncidentResources(id: string): Promise<Resource[]>;
  createResource(input: CreateResourceInput): Promise<Resource>;
  updateResource(
    id: string,
    input: UpdateResourceInput,
  ): Promise<Resource | undefined>;
  commitResource(
    id: string,
    input: CommitResourceInput,
  ): Promise<Resource | undefined>;
  listDeployedTeams(): Promise<DeployedTeam[]>;
  getIncidentTeams(id: string): Promise<DeployedTeam[]>;
  listPartnerActivities(): Promise<PartnerActivity[]>;
  getIncidentActivities(id: string): Promise<PartnerActivity[]>;
  createPartnerActivity(
    input: CreatePartnerActivityInput,
  ): Promise<PartnerActivity>;
  updatePartnerActivity(
    id: string,
    input: UpdatePartnerActivityInput,
  ): Promise<PartnerActivity | undefined>;
  listSituationReports(): Promise<SituationReport[]>;
  getIncidentSitreps(id: string): Promise<SituationReport[]>;
  createSituationReport(
    input: CreateSituationReportInput,
  ): Promise<SituationReport>;
  getIncidentConceptNote(id: string): Promise<ConceptNote | undefined>;
  getIncidentConceptNotes(id: string): Promise<ConceptNote[]>;
  getConceptNote(id: string): Promise<ConceptNote | undefined>;
  createIncidentConceptNoteVersion(
    input: CreateConceptNoteVersionInput,
  ): Promise<ConceptNote>;
  getDashboardSummary(): Promise<DashboardSummary>;
};
