import type {
  ConceptNote as PrismaConceptNote,
  DisasterType,
  FundRequest as PrismaFundRequest,
  Incident as PrismaIncident,
  NeedReport as PrismaNeedReport,
  Organization,
  PartnerActivity as PrismaPartnerActivity,
  ProgramSubProgram as PrismaProgramSubProgram,
  Resource as PrismaResource,
  ResourceMovement as PrismaResourceMovement,
  Role as PrismaRole,
  Severity as PrismaSeverity,
  SituationReport as PrismaSituationReport,
  Task as PrismaTask,
  User as PrismaUser,
} from "@prisma/client";
import { prisma } from "./prisma-client";
import type {
  ConceptNote,
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
  CreateConceptNoteVersionInput,
  CreateIncidentInput,
  UpdateIncidentInput,
} from "./repository";

type UserWithOrg = PrismaUser & { organization: Organization | null };
type IncidentWithRelations = PrismaIncident & {
  createdBy: PrismaUser;
  needs: PrismaNeedReport[];
  tasks: PrismaTask[];
  subPrograms: PrismaProgramSubProgram[];
  fundRequests: PrismaFundRequest[];
};
type NeedWithReporter = PrismaNeedReport & { reportedBy: PrismaUser };
type TaskWithAssignee = PrismaTask & { assignee: PrismaUser | null };
type ResourceWithMovements = PrismaResource & {
  movements: PrismaResourceMovement[];
};
type ActivityWithOrg = PrismaPartnerActivity & { organization: Organization };
type SitrepWithCreator = PrismaSituationReport & { createdBy: PrismaUser };
type ConceptNoteWithCreator = PrismaConceptNote & { createdBy: PrismaUser };

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

const disasterValues: Record<string, DisasterType> = {
  flood: "FLOOD",
  earthquake: "EARTHQUAKE",
  landslide: "LANDSLIDE",
  fire: "FIRE",
  storm: "STORM",
  conflict: "CONFLICT",
  other: "OTHER",
};

const severityValues: Record<Severity, PrismaSeverity> = {
  low: "LOW",
  moderate: "MODERATE",
  high: "HIGH",
  critical: "CRITICAL",
};

const incidentStatusValues: Record<IncidentStatus, keyof typeof incidentStatusLabels> = {
  monitoring: "MONITORING",
  active: "ACTIVE",
  stabilizing: "STABILIZING",
  closed: "CLOSED",
};

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
  const assignedTeamIds = new Set(
    incident.tasks
      .map((task) => task.assigneeId)
      .filter((assigneeId): assigneeId is string => Boolean(assigneeId)),
  );

  return {
    id: incident.id,
    title: incident.title,
    disasterType: disasterLabels[incident.disasterType],
    severity: severityLabels[incident.severity],
    status: incidentStatusLabels[incident.status],
    region: incident.region,
    country: incident.country,
    state: incident.state,
    locationName: incident.locationName,
    latitude: toNumber(incident.latitude),
    longitude: toNumber(incident.longitude),
    affectedPeople,
    openNeeds: incident.needs.filter((need) => need.status !== "CLOSED").length,
    resourceGaps: incident.needs.filter(
      (need) =>
        need.status !== "CLOSED" &&
        (need.urgency === "HIGH" || need.urgency === "CRITICAL"),
    ).length,
    assignedTeams: assignedTeamIds.size,
    startTime: incident.startTime.toISOString(),
    description: incident.description,
    lead: incident.createdBy.name,
    latestUpdate: incident.latestUpdate || incident.description,
    budgetCurrency: incident.budgetCurrency,
    masterBudgetAmount: toNumber(incident.masterBudgetAmount),
    subPrograms: incident.subPrograms.map((subProgram) => ({
      id: subProgram.id,
      name: subProgram.name,
      budgetAllocated: toNumber(subProgram.budgetAllocated),
    })),
    fundRequests: incident.fundRequests.map((request) => ({
      id: request.id,
      subProgramName: request.subProgramName,
      requestedByTeam: request.requestedByTeam,
      amount: toNumber(request.amount),
      currency: request.currency,
      purpose: request.purpose,
      status: request.status as Incident["fundRequests"][number]["status"],
      requestedAt: request.requestedAt.toISOString(),
    })),
  };
}

function incidentRelationInclude() {
  return {
    createdBy: true,
    fundRequests: { orderBy: { requestedAt: "desc" } },
    needs: true,
    subPrograms: { orderBy: { createdAt: "asc" } },
    tasks: true,
  } as const;
}

function toIncidentCreateData(input: CreateIncidentInput, createdById: string) {
  return {
    title: input.title,
    disasterType: disasterValues[input.disasterType] ?? "OTHER",
    severity: severityValues[input.severity],
    status: incidentStatusValues[input.status],
    region: input.region,
    country: input.country,
    state: input.state,
    description: input.description,
    latestUpdate: input.latestUpdate ?? input.description,
    latitude: input.latitude,
    longitude: input.longitude,
    locationName: input.locationName,
    startTime: new Date(input.startTime),
    budgetCurrency: input.budgetCurrency,
    masterBudgetAmount: input.masterBudgetAmount,
    createdById,
  };
}

function toIncidentUpdateData(input: UpdateIncidentInput) {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.disasterType !== undefined
      ? { disasterType: disasterValues[input.disasterType] ?? "OTHER" }
      : {}),
    ...(input.severity !== undefined ? { severity: severityValues[input.severity] } : {}),
    ...(input.status !== undefined
      ? { status: incidentStatusValues[input.status] }
      : {}),
    ...(input.region !== undefined ? { region: input.region } : {}),
    ...(input.country !== undefined ? { country: input.country } : {}),
    ...(input.state !== undefined ? { state: input.state } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.latestUpdate !== undefined ? { latestUpdate: input.latestUpdate } : {}),
    ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
    ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
    ...(input.locationName !== undefined ? { locationName: input.locationName } : {}),
    ...(input.startTime !== undefined ? { startTime: new Date(input.startTime) } : {}),
    ...(input.budgetCurrency !== undefined
      ? { budgetCurrency: input.budgetCurrency }
      : {}),
    ...(input.masterBudgetAmount !== undefined
      ? { masterBudgetAmount: input.masterBudgetAmount }
      : {}),
  };
}

function subProgramCreateManyData(
  incidentId: string,
  input: CreateIncidentInput | UpdateIncidentInput,
) {
  return (
    input.subPrograms?.map((subProgram) => ({
      ...(subProgram.id ? { id: subProgram.id } : {}),
      incidentId,
      name: subProgram.name,
      budgetAllocated: subProgram.budgetAllocated,
    })) ?? []
  );
}

function fundRequestCreateManyData(
  incidentId: string,
  input: CreateIncidentInput | UpdateIncidentInput,
  fallbackCurrency: string,
) {
  return (
    input.fundRequests?.map((request) => ({
      ...(request.id ? { id: request.id } : {}),
      incidentId,
      subProgramName: request.subProgramName,
      requestedByTeam: request.requestedByTeam,
      amount: request.amount,
      currency: request.currency ?? input.budgetCurrency ?? fallbackCurrency,
      purpose: request.purpose,
      status: request.status ?? "draft",
      requestedAt: request.requestedAt ? new Date(request.requestedAt) : new Date(),
    })) ?? []
  );
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

function mapResource(resource: ResourceWithMovements): Resource {
  const latestMovement = resource.movements[0];

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
    assignedIncidentId: latestMovement?.incidentId ?? null,
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

function mapConceptNote(note: ConceptNoteWithCreator): ConceptNote {
  return {
    id: note.id,
    incidentId: note.incidentId,
    version: note.version,
    content: note.content,
    status: note.status as ConceptNote["status"],
    updatedBy: note.createdBy.name,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
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
      include: incidentRelationInclude(),
      orderBy: { startTime: "desc" },
    });

    return incidents.map(mapIncident);
  },
  async getIncident(id) {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: incidentRelationInclude(),
    });

    return incident ? mapIncident(incident) : undefined;
  },
  async createIncident(input) {
    const currentUser = await prisma.user.findUnique({
      where: { id: input.createdById ?? "" },
    }) ?? await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!currentUser) {
      throw new Error("Cannot create a program without a user.");
    }

    const incident = await prisma.$transaction(async (tx) => {
      const created = await tx.incident.create({
        data: toIncidentCreateData(input, currentUser.id),
      });
      const subPrograms = subProgramCreateManyData(created.id, input);
      const fundRequests = fundRequestCreateManyData(
        created.id,
        input,
        input.budgetCurrency,
      );

      if (subPrograms.length) {
        await tx.programSubProgram.createMany({ data: subPrograms });
      }
      if (fundRequests.length) {
        await tx.fundRequest.createMany({ data: fundRequests });
      }

      return tx.incident.findUniqueOrThrow({
        where: { id: created.id },
        include: incidentRelationInclude(),
      });
    });

    return mapIncident(incident);
  },
  async updateIncident(id, input) {
    const current = await prisma.incident.findUnique({ where: { id } });

    if (!current) {
      return undefined;
    }

    const incident = await prisma.$transaction(async (tx) => {
      await tx.incident.update({
        where: { id },
        data: toIncidentUpdateData(input),
      });

      if (input.subPrograms !== undefined) {
        await tx.programSubProgram.deleteMany({ where: { incidentId: id } });
        const subPrograms = subProgramCreateManyData(id, input);

        if (subPrograms.length) {
          await tx.programSubProgram.createMany({ data: subPrograms });
        }
      }

      if (input.fundRequests !== undefined) {
        await tx.fundRequest.deleteMany({ where: { incidentId: id } });
        const fundRequests = fundRequestCreateManyData(
          id,
          input,
          input.budgetCurrency ?? current.budgetCurrency,
        );

        if (fundRequests.length) {
          await tx.fundRequest.createMany({ data: fundRequests });
        }
      }

      return tx.incident.findUniqueOrThrow({
        where: { id },
        include: incidentRelationInclude(),
      });
    });

    return mapIncident(incident);
  },
  async deleteIncident(id) {
    const existing = await prisma.incident.findUnique({ where: { id } });

    if (!existing) {
      return false;
    }

    await prisma.incident.delete({ where: { id } });

    return true;
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
      include: {
        movements: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    return resources.map(mapResource);
  },
  async getIncidentResources(id) {
    const resources = await prisma.resource.findMany({
      include: {
        movements: {
          orderBy: { createdAt: "desc" },
          where: { incidentId: id },
        },
      },
      orderBy: { createdAt: "desc" },
      where: {
        movements: {
          some: { incidentId: id },
        },
      },
    });

    return resources.map(mapResource);
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
  async getIncidentConceptNote(id) {
    const note = await prisma.conceptNote.findFirst({
      where: { incidentId: id },
      include: { createdBy: true },
      orderBy: { version: "desc" },
    });

    return note ? mapConceptNote(note) : undefined;
  },
  async getIncidentConceptNotes(id) {
    const notes = await prisma.conceptNote.findMany({
      where: { incidentId: id },
      include: { createdBy: true },
      orderBy: { version: "desc" },
    });

    return notes.map(mapConceptNote);
  },
  async getConceptNote(id) {
    const note = await prisma.conceptNote.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    return note ? mapConceptNote(note) : undefined;
  },
  async createIncidentConceptNoteVersion(input: CreateConceptNoteVersionInput) {
    const currentUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!currentUser) {
      throw new Error("Cannot save a concept note without a user.");
    }

    const latest = await prisma.conceptNote.findFirst({
      where: { incidentId: input.incidentId },
      orderBy: { version: "desc" },
    });
    const note = await prisma.conceptNote.create({
      data: {
        incidentId: input.incidentId,
        version: (latest?.version ?? 0) + 1,
        content: input.content,
        status: input.status ?? "draft",
        createdById: currentUser.id,
      },
      include: { createdBy: true },
    });

    return {
      ...mapConceptNote(note),
      updatedBy: input.updatedBy ?? note.createdBy.name,
    };
  },
  async getDashboardSummary() {
    return calculateDashboardSummary();
  },
};
