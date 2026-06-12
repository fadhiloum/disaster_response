import type {
  DisasterType,
  Incident as PrismaIncident,
  NeedReport as PrismaNeedReport,
  Organization,
  PartnerActivity as PrismaPartnerActivity,
  Resource as PrismaResource,
  Role as PrismaRole,
  Severity as PrismaSeverity,
  SituationReport as PrismaSituationReport,
  Task as PrismaTask,
  User as PrismaUser,
} from "@prisma/client";
import { prisma } from "./prisma-client";
import type {
  Incident,
  IncidentStatus,
  NeedReport,
  NeedStatus,
  PartnerActivity,
  Resource,
  ResponseTask,
  Role,
  Severity,
  SituationReport,
  TaskStatus,
  User,
} from "./types";
import type {
  CreateSituationReportInput,
  DataRepository,
  DashboardSummary,
} from "./repository";

type UserWithOrg = PrismaUser & { organization: Organization | null };
type IncidentWithRelations = PrismaIncident & {
  createdBy: PrismaUser;
  needs: PrismaNeedReport[];
  tasks: PrismaTask[];
};
type IncidentBudgetFields = {
  budgetCurrency?: string | null;
  masterBudgetAmount?: { toNumber(): number } | number | null;
};
type NeedWithReporter = PrismaNeedReport & { reportedBy: PrismaUser };
type TaskWithAssignee = PrismaTask & { assignee: PrismaUser | null };
type ActivityWithOrg = PrismaPartnerActivity & { organization: Organization };
type SitrepWithCreator = PrismaSituationReport & { createdBy: PrismaUser };

const roleLabels: Record<PrismaRole, Role> = {
  ADMIN: "Admin",
  COORDINATOR: "Coordinator",
  RESPONDER: "Responder",
  PARTNER: "Partner",
  VIEWER: "Viewer",
};

const severityLabels: Record<PrismaSeverity, Severity> = {
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
  CRITICAL: "critical",
};

const disasterLabels: Record<DisasterType, string> = {
  FLOOD: "flood",
  EARTHQUAKE: "earthquake",
  LANDSLIDE: "landslide",
  FIRE: "fire",
  STORM: "storm",
  CONFLICT: "conflict",
  OTHER: "other",
};

const incidentStatusLabels = {
  MONITORING: "monitoring",
  ACTIVE: "active",
  STABILIZING: "stabilizing",
  CLOSED: "closed",
} as const satisfies Record<string, IncidentStatus>;

const needStatusLabels = {
  REPORTED: "reported",
  VERIFIED: "verified",
  ASSIGNED: "assigned",
  FULFILLED: "fulfilled",
  CLOSED: "closed",
} as const satisfies Record<string, NeedStatus>;

const taskStatusLabels = {
  TODO: "todo",
  IN_PROGRESS: "in progress",
  BLOCKED: "blocked",
  DONE: "done",
} as const satisfies Record<string, TaskStatus>;

const priorityLabels = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

const fallbackUser: User = {
  id: "system",
  name: "Operations User",
  email: "ops@example.org",
  role: "Coordinator",
  organization: "Unassigned",
};

function toNumber(value: { toNumber(): number } | number) {
  return typeof value === "number" ? value : value.toNumber();
}

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function mapUser(user: UserWithOrg | PrismaUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleLabels[user.role],
    organization: "organization" in user ? user.organization?.name ?? "" : "",
  };
}

function mapIncident(incident: IncidentWithRelations): Incident {
  const affectedPeople = incident.needs.reduce(
    (total, need) => total + need.affectedPeople,
    0,
  );
  const budgetFields = incident as IncidentWithRelations & IncidentBudgetFields;

  return {
    id: incident.id,
    title: incident.title,
    disasterType: disasterLabels[incident.disasterType],
    severity: severityLabels[incident.severity],
    status: incidentStatusLabels[incident.status],
    region: "",
    country: "",
    state: "",
    locationName: incident.locationName,
    latitude: toNumber(incident.latitude),
    longitude: toNumber(incident.longitude),
    affectedPeople,
    openNeeds: incident.needs.filter((need) => need.status !== "CLOSED").length,
    resourceGaps: 0,
    assignedTeams: 0,
    startTime: incident.startTime.toISOString(),
    description: incident.description,
    lead: incident.createdBy.name,
    latestUpdate: incident.description,
    budgetCurrency: budgetFields.budgetCurrency ?? "MYR",
    masterBudgetAmount: toNumber(budgetFields.masterBudgetAmount ?? 0),
    subPrograms: [],
    fundRequests: [],
  };
}

function mapNeed(need: NeedWithReporter): NeedReport {
  return {
    id: need.id,
    incidentId: need.incidentId,
    category: need.category
      .split("_")
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(" "),
    urgency: priorityLabels[need.urgency],
    quantity: need.quantity,
    unit: "units",
    affectedPeople: need.affectedPeople,
    status: needStatusLabels[need.status],
    locationName: need.locationName,
    latitude: toNumber(need.latitude),
    longitude: toNumber(need.longitude),
    notes: need.notes ?? "",
    reportedBy: need.reportedBy.name,
    createdAt: need.createdAt.toISOString(),
  };
}

function mapTask(task: TaskWithAssignee): ResponseTask {
  return {
    id: task.id,
    incidentId: task.incidentId,
    title: task.title,
    assignee: task.assignee?.name ?? "Unassigned",
    priority: priorityLabels[task.priority],
    status: taskStatusLabels[task.status],
    dueTime: toIso(task.dueTime) ?? new Date().toISOString(),
    locationName: "",
    description: task.description ?? "",
  };
}

function mapResource(resource: PrismaResource): Resource {
  return {
    id: resource.id,
    name: resource.name,
    category: resource.category,
    quantityAvailable: resource.quantityAvailable,
    quantityCommitted: resource.quantityCommitted,
    unit: resource.unit,
    warehouseLocation: resource.warehouseLocation,
    receivedAt: resource.createdAt.toISOString(),
    expiryDate: toIso(resource.expiryDate),
    assignedIncidentId: null,
  };
}

function mapActivity(activity: ActivityWithOrg): PartnerActivity {
  return {
    id: activity.id,
    organization: activity.organization.name,
    incidentId: activity.incidentId,
    sector: activity.sector,
    activity: activity.activity,
    locationName: activity.locationName,
    status: activity.status.toLowerCase() as PartnerActivity["status"],
    contactName: activity.contactName,
    contactPhone: activity.contactPhone ?? "",
    startDate: activity.startDate.toISOString(),
    endDate: toIso(activity.endDate),
  };
}

function mapSitrep(sitrep: SitrepWithCreator): SituationReport {
  return {
    id: sitrep.id,
    incidentId: sitrep.incidentId,
    reportingPeriod: `${sitrep.reportingPeriodStart.toISOString()} - ${sitrep.reportingPeriodEnd.toISOString()}`,
    summary: sitrep.summary,
    impact: sitrep.impact,
    priorityNeeds: sitrep.priorityNeeds,
    responseActions: sitrep.responseActions,
    gaps: sitrep.gaps,
    nextPriorities: sitrep.nextPriorities,
    createdBy: sitrep.createdBy.name,
    createdAt: sitrep.createdAt.toISOString(),
  };
}

function toDate(value: string | undefined, fallback: Date) {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

async function calculateDashboardSummary(): Promise<DashboardSummary> {
  const [incidents, needs, tasks] = await Promise.all([
    prisma.incident.findMany({ include: { createdBy: true, needs: true, tasks: true } }),
    prisma.needReport.findMany(),
    prisma.task.findMany(),
  ]);

  return {
    activeIncidents: incidents.filter((incident) => incident.status !== "CLOSED")
      .length,
    affectedPeople: needs.reduce(
      (total, need) => total + need.affectedPeople,
      0,
    ),
    urgentNeeds: needs.filter(
      (need) => need.urgency === "HIGH" || need.urgency === "CRITICAL",
    ).length,
    openTasks: tasks.filter((task) => task.status !== "DONE").length,
    resourceGaps: 0,
  };
}

export const prismaRepository: DataRepository = {
  backend: "prisma",
  async getCurrentUser() {
    const user = await prisma.user.findFirst({ include: { organization: true } });

    return user ? mapUser(user) : fallbackUser;
  },
  async listUsers() {
    const users = await prisma.user.findMany({
      include: { organization: true },
      orderBy: { createdAt: "asc" },
    });

    return users.map(mapUser);
  },
  async listIncidents() {
    const incidents = await prisma.incident.findMany({
      include: { createdBy: true, needs: true, tasks: true },
      orderBy: { startTime: "desc" },
    });

    return incidents.map(mapIncident);
  },
  async getIncident(id) {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: { createdBy: true, needs: true, tasks: true },
    });

    return incident ? mapIncident(incident) : undefined;
  },
  async listNeeds() {
    const needs = await prisma.needReport.findMany({
      include: { reportedBy: true },
      orderBy: { createdAt: "desc" },
    });

    return needs.map(mapNeed);
  },
  async getIncidentNeeds(id) {
    const needs = await prisma.needReport.findMany({
      where: { incidentId: id },
      include: { reportedBy: true },
      orderBy: { createdAt: "desc" },
    });

    return needs.map(mapNeed);
  },
  async listTasks() {
    const tasks = await prisma.task.findMany({
      include: { assignee: true },
      orderBy: { createdAt: "desc" },
    });

    return tasks.map(mapTask);
  },
  async getIncidentTasks(id) {
    const tasks = await prisma.task.findMany({
      where: { incidentId: id },
      include: { assignee: true },
      orderBy: { createdAt: "desc" },
    });

    return tasks.map(mapTask);
  },
  async listResources() {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    });

    return resources.map(mapResource);
  },
  async getIncidentResources() {
    return [];
  },
  async listDeployedTeams() {
    return [];
  },
  async getIncidentTeams() {
    return [];
  },
  async listPartnerActivities() {
    const activities = await prisma.partnerActivity.findMany({
      include: { organization: true },
      orderBy: { startDate: "desc" },
    });

    return activities.map(mapActivity);
  },
  async getIncidentActivities(id) {
    const activities = await prisma.partnerActivity.findMany({
      where: { incidentId: id },
      include: { organization: true },
      orderBy: { startDate: "desc" },
    });

    return activities.map(mapActivity);
  },
  async listSituationReports() {
    const reports = await prisma.situationReport.findMany({
      include: { createdBy: true },
      orderBy: { createdAt: "desc" },
    });

    return reports.map(mapSitrep);
  },
  async getIncidentSitreps(id) {
    const reports = await prisma.situationReport.findMany({
      where: { incidentId: id },
      include: { createdBy: true },
      orderBy: { createdAt: "desc" },
    });

    return reports.map(mapSitrep);
  },
  async createSituationReport(input: CreateSituationReportInput) {
    const now = new Date();
    const periodStart = toDate(input.reportingPeriodStart, now);
    const periodEnd = toDate(input.reportingPeriodEnd, now);
    const currentUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!currentUser) {
      throw new Error("Cannot create a SitRep without a user.");
    }

    const report = await prisma.situationReport.create({
      data: {
        incidentId: input.incidentId,
        reportingPeriodStart: periodStart,
        reportingPeriodEnd: periodEnd,
        summary: input.summary,
        impact: input.impact,
        priorityNeeds: input.priorityNeeds,
        responseActions: input.responseActions,
        gaps: input.gaps,
        nextPriorities: input.nextPriorities,
        createdById: currentUser.id,
      },
      include: { createdBy: true },
    });

    return mapSitrep(report);
  },
  async getDashboardSummary() {
    return calculateDashboardSummary();
  },
};
