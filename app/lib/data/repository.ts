import type {
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

export type DataRepository = {
  backend: DataBackend;
  getCurrentUser(): Promise<User>;
  listUsers(): Promise<User[]>;
  listIncidents(): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | undefined>;
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
  getDashboardSummary(): Promise<DashboardSummary>;
};
