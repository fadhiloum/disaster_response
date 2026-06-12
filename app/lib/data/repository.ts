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
  listTasks(): Promise<ResponseTask[]>;
  getIncidentTasks(id: string): Promise<ResponseTask[]>;
  listResources(): Promise<Resource[]>;
  getIncidentResources(id: string): Promise<Resource[]>;
  listDeployedTeams(): Promise<DeployedTeam[]>;
  getIncidentTeams(id: string): Promise<DeployedTeam[]>;
  listPartnerActivities(): Promise<PartnerActivity[]>;
  getIncidentActivities(id: string): Promise<PartnerActivity[]>;
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
