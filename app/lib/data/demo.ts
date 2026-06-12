import {
  currentUser,
  auditLogs,
  conceptNotes,
  dashboardSummary,
  deployedTeams,
  getIncident,
  getIncidentActivities,
  getIncidentNeeds,
  getIncidentResources,
  getIncidentSitreps,
  getIncidentTasks,
  getIncidentTeams,
  incidents,
  needReports,
  partnerActivities,
  resources,
  situationReports,
  tasks,
  users,
} from "@/app/lib/demo-data";
import type {
  CreateNeedInput,
  CreatePartnerActivityInput,
  CreateResourceInput,
  CreateTaskInput,
  CreateIncidentInput,
  DataRepository,
  UpdateNeedInput,
  UpdatePartnerActivityInput,
  UpdateResourceInput,
  UpdateTaskInput,
  UpdateIncidentInput,
  CreateAuditLogInput,
} from "./repository";

function mapIncidentInput(input: CreateIncidentInput) {
  return {
    title: input.title,
    disasterType: input.disasterType,
    severity: input.severity,
    status: input.status,
    region: input.region,
    country: input.country,
    state: input.state,
    locationName: input.locationName,
    latitude: input.latitude,
    longitude: input.longitude,
    affectedPeople: 0,
    openNeeds: 0,
    resourceGaps: 0,
    assignedTeams: 0,
    startTime: input.startTime,
    description: input.description,
    lead: input.lead ?? currentUser.name,
    latestUpdate: input.latestUpdate ?? input.description,
    budgetCurrency: input.budgetCurrency,
    masterBudgetAmount: input.masterBudgetAmount,
    subPrograms:
      input.subPrograms?.map((subProgram) => ({
        id: subProgram.id ?? crypto.randomUUID(),
        name: subProgram.name,
        budgetAllocated: subProgram.budgetAllocated,
      })) ?? [],
    fundRequests:
      input.fundRequests?.map((request) => ({
        id: request.id ?? crypto.randomUUID(),
        subProgramName: request.subProgramName,
        requestedByTeam: request.requestedByTeam,
        amount: request.amount,
        currency: request.currency ?? input.budgetCurrency,
        purpose: request.purpose,
        status: request.status ?? "draft",
        requestedAt: request.requestedAt ?? new Date().toISOString(),
      })) ?? [],
  };
}

function applyIncidentUpdate(
  incident: (typeof incidents)[number],
  input: UpdateIncidentInput,
) {
  if (input.title !== undefined) incident.title = input.title;
  if (input.disasterType !== undefined) incident.disasterType = input.disasterType;
  if (input.severity !== undefined) incident.severity = input.severity;
  if (input.status !== undefined) incident.status = input.status;
  if (input.region !== undefined) incident.region = input.region;
  if (input.country !== undefined) incident.country = input.country;
  if (input.state !== undefined) incident.state = input.state;
  if (input.locationName !== undefined) incident.locationName = input.locationName;
  if (input.latitude !== undefined) incident.latitude = input.latitude;
  if (input.longitude !== undefined) incident.longitude = input.longitude;
  if (input.startTime !== undefined) incident.startTime = input.startTime;
  if (input.description !== undefined) incident.description = input.description;
  if (input.lead !== undefined) incident.lead = input.lead;
  if (input.latestUpdate !== undefined) incident.latestUpdate = input.latestUpdate;
  if (input.budgetCurrency !== undefined) incident.budgetCurrency = input.budgetCurrency;
  if (input.masterBudgetAmount !== undefined) {
    incident.masterBudgetAmount = input.masterBudgetAmount;
  }
  if (input.subPrograms !== undefined) {
    incident.subPrograms = input.subPrograms.map((subProgram) => ({
      id: subProgram.id ?? crypto.randomUUID(),
      name: subProgram.name,
      budgetAllocated: subProgram.budgetAllocated,
    }));
  }
  if (input.fundRequests !== undefined) {
    incident.fundRequests = input.fundRequests.map((request) => ({
      id: request.id ?? crypto.randomUUID(),
      subProgramName: request.subProgramName,
      requestedByTeam: request.requestedByTeam,
      amount: request.amount,
      currency: request.currency ?? incident.budgetCurrency,
      purpose: request.purpose,
      status: request.status ?? "draft",
      requestedAt: request.requestedAt ?? new Date().toISOString(),
    }));
  }
}

function applyDefined<T extends object>(target: T, input: Partial<T>) {
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      Object.assign(target, { [key]: value });
    }
  }
}

function userName(id: string | undefined) {
  return users.find((user) => user.id === id)?.name;
}

function mapNeedInput(input: CreateNeedInput) {
  return {
    id: crypto.randomUUID(),
    incidentId: input.incidentId,
    category: input.category,
    urgency: input.urgency,
    quantity: input.quantity,
    unit: input.unit ?? "units",
    affectedPeople: input.affectedPeople,
    status: "reported" as const,
    locationName: input.locationName,
    latitude: input.latitude,
    longitude: input.longitude,
    notes: input.notes ?? "",
    reportedBy: userName(input.reportedById) ?? currentUser.name,
    createdAt: new Date().toISOString(),
  };
}

function applyNeedUpdate(
  need: (typeof needReports)[number],
  input: UpdateNeedInput,
) {
  applyDefined(need, {
    category: input.category,
    urgency: input.urgency,
    quantity: input.quantity,
    unit: input.unit,
    affectedPeople: input.affectedPeople,
    status: input.status,
    locationName: input.locationName,
    latitude: input.latitude,
    longitude: input.longitude,
    notes: input.notes,
  });
}

function mapTaskInput(input: CreateTaskInput) {
  return {
    id: crypto.randomUUID(),
    incidentId: input.incidentId,
    title: input.title,
    assignee: input.assignee ?? userName(input.assigneeId) ?? "Unassigned",
    priority: input.priority,
    status: input.status ?? "todo",
    dueTime: input.dueTime ?? new Date().toISOString(),
    locationName: input.locationName ?? "",
    description: input.description ?? "",
  };
}

function applyTaskUpdate(
  task: (typeof tasks)[number],
  input: UpdateTaskInput,
) {
  applyDefined(task, {
    title: input.title,
    description: input.description,
    assignee:
      input.assignee ??
      (input.assigneeId ? userName(input.assigneeId) : undefined),
    priority: input.priority,
    status: input.status,
    dueTime: input.dueTime,
    locationName: input.locationName,
  });
}

function mapResourceInput(input: CreateResourceInput) {
  return {
    id: crypto.randomUUID(),
    name: input.name,
    category: input.category,
    quantityAvailable: input.quantityAvailable,
    quantityCommitted: input.quantityCommitted ?? 0,
    unit: input.unit,
    warehouseLocation: input.warehouseLocation,
    receivedAt: input.receivedAt ?? new Date().toISOString(),
    expiryDate: input.expiryDate ?? null,
    assignedIncidentId: null,
  };
}

function applyResourceUpdate(
  resource: (typeof resources)[number],
  input: UpdateResourceInput,
) {
  applyDefined(resource, {
    name: input.name,
    category: input.category,
    quantityAvailable: input.quantityAvailable,
    quantityCommitted: input.quantityCommitted,
    unit: input.unit,
    warehouseLocation: input.warehouseLocation,
    receivedAt: input.receivedAt,
    expiryDate: input.expiryDate,
  });
}

function mapPartnerActivityInput(input: CreatePartnerActivityInput) {
  return {
    id: crypto.randomUUID(),
    organization: input.organization ?? currentUser.organization,
    incidentId: input.incidentId,
    sector: input.sector,
    activity: input.activity,
    locationName: input.locationName,
    status: input.status ?? "planned",
    contactName: input.contactName,
    contactPhone: input.contactPhone ?? "",
    startDate: input.startDate ?? new Date().toISOString(),
    endDate: input.endDate ?? null,
  };
}

function applyPartnerActivityUpdate(
  activity: (typeof partnerActivities)[number],
  input: UpdatePartnerActivityInput,
) {
  applyDefined(activity, {
    organization: input.organization,
    incidentId: input.incidentId,
    sector: input.sector,
    activity: input.activity,
    locationName: input.locationName,
    status: input.status,
    contactName: input.contactName,
    contactPhone: input.contactPhone,
    startDate: input.startDate,
    endDate: input.endDate,
  });
}

export const demoRepository: DataRepository = {
  backend: "demo",
  async getCurrentUser() {
    return currentUser;
  },
  async listUsers() {
    return users;
  },
  async listIncidents() {
    return incidents;
  },
  async getIncident(id) {
    return getIncident(id);
  },
  async createIncident(input) {
    const incident = {
      id: crypto.randomUUID(),
      ...mapIncidentInput(input),
    };

    incidents.unshift(incident);

    return incident;
  },
  async updateIncident(id, input) {
    const incident = getIncident(id);

    if (!incident) {
      return undefined;
    }

    applyIncidentUpdate(incident, input);

    return incident;
  },
  async deleteIncident(id) {
    const index = incidents.findIndex((incident) => incident.id === id);

    if (index === -1) {
      return false;
    }

    incidents.splice(index, 1);

    return true;
  },
  async listNeeds() {
    return needReports;
  },
  async getIncidentNeeds(id) {
    return getIncidentNeeds(id);
  },
  async createNeed(input) {
    const need = mapNeedInput(input);

    needReports.unshift(need);

    return need;
  },
  async updateNeed(id, input) {
    const need = needReports.find((item) => item.id === id);

    if (!need) {
      return undefined;
    }

    applyNeedUpdate(need, input);

    return need;
  },
  async listTasks() {
    return tasks;
  },
  async getIncidentTasks(id) {
    return getIncidentTasks(id);
  },
  async createTask(input) {
    const task = mapTaskInput(input);

    tasks.unshift(task);

    return task;
  },
  async updateTask(id, input) {
    const task = tasks.find((item) => item.id === id);

    if (!task) {
      return undefined;
    }

    applyTaskUpdate(task, input);

    return task;
  },
  async listResources() {
    return resources;
  },
  async getIncidentResources(id) {
    return getIncidentResources(id);
  },
  async createResource(input) {
    const resource = mapResourceInput(input);

    resources.unshift(resource);

    return resource;
  },
  async updateResource(id, input) {
    const resource = resources.find((item) => item.id === id);

    if (!resource) {
      return undefined;
    }

    applyResourceUpdate(resource, input);

    return resource;
  },
  async commitResource(id, input) {
    const resource = resources.find((item) => item.id === id);

    if (!resource) {
      return undefined;
    }

    resource.quantityCommitted += input.quantity;
    resource.assignedIncidentId = input.incidentId ?? resource.assignedIncidentId;

    return resource;
  },
  async listDeployedTeams() {
    return deployedTeams;
  },
  async getIncidentTeams(id) {
    return getIncidentTeams(id);
  },
  async listPartnerActivities() {
    return partnerActivities;
  },
  async getIncidentActivities(id) {
    return getIncidentActivities(id);
  },
  async createPartnerActivity(input) {
    const activity = mapPartnerActivityInput(input);

    partnerActivities.unshift(activity);

    return activity;
  },
  async updatePartnerActivity(id, input) {
    const activity = partnerActivities.find((item) => item.id === id);

    if (!activity) {
      return undefined;
    }

    applyPartnerActivityUpdate(activity, input);

    return activity;
  },
  async listSituationReports() {
    return situationReports;
  },
  async getIncidentSitreps(id) {
    return getIncidentSitreps(id);
  },
  async createSituationReport(input) {
    const now = new Date().toISOString();
    const report = {
      id: crypto.randomUUID(),
      incidentId: input.incidentId,
      reportingPeriod:
        input.reportingPeriod ??
        `${new Date().toLocaleString("en-GB", {
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          month: "short",
          year: "numeric",
        })} draft`,
      summary: input.summary,
      impact: input.impact,
      priorityNeeds: input.priorityNeeds,
      responseActions: input.responseActions,
      gaps: input.gaps,
      nextPriorities: input.nextPriorities,
      createdBy: currentUser.name,
      createdAt: now,
      updatedAt: now,
      status: input.status ?? "draft",
      revision: 1,
      submittedAt: input.status === "submitted" ? now : null,
      reviewedAt: null,
      reviewedBy: null,
      reviewComment: null,
    };

    situationReports.unshift(report);

    return report;
  },
  async updateSituationReport(id, input) {
    const report = situationReports.find((item) => item.id === id);

    if (!report) {
      return undefined;
    }

    const now = new Date().toISOString();
    const contentFields = [
      "reportingPeriod",
      "summary",
      "impact",
      "priorityNeeds",
      "responseActions",
      "gaps",
      "nextPriorities",
    ] as const;
    const hasContentChanges = contentFields.some(
      (field) => input[field] !== undefined && input[field] !== report[field],
    );

    contentFields.forEach((field) => {
      if (input[field] !== undefined) {
        report[field] = input[field];
      }
    });

    if (hasContentChanges) {
      report.revision += 1;
    }

    if (input.status !== undefined) {
      report.status = input.status;

      if (input.status === "submitted") {
        report.submittedAt = report.submittedAt ?? now;
      }

      if (input.status === "approved" || input.status === "rejected") {
        report.reviewedAt = now;
        report.reviewedBy = input.reviewedBy ?? currentUser.name;
      }
    }

    if (input.reviewComment !== undefined) {
      report.reviewComment = input.reviewComment;
    }

    report.updatedAt = now;

    return report;
  },
  async listAuditLogs(entity) {
    return auditLogs.filter((log) => {
      if (entity?.entityType && log.entityType !== entity.entityType) {
        return false;
      }

      if (entity?.entityId && log.entityId !== entity.entityId) {
        return false;
      }

      return true;
    });
  },
  async createAuditLog(input: CreateAuditLogInput) {
    const log = {
      id: crypto.randomUUID(),
      actorId: input.actorId ?? null,
      actorName: input.actorName,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      before: input.before === undefined ? null : JSON.stringify(input.before),
      after: input.after === undefined ? null : JSON.stringify(input.after),
      createdAt: new Date().toISOString(),
    };

    auditLogs.unshift(log);

    return log;
  },
  async getIncidentConceptNote(id) {
    return conceptNotes.find((note) => note.incidentId === id);
  },
  async getIncidentConceptNotes(id) {
    return conceptNotes.filter((note) => note.incidentId === id);
  },
  async getConceptNote(id) {
    return conceptNotes.find((note) => note.id === id);
  },
  async createIncidentConceptNoteVersion(input) {
    const now = new Date().toISOString();
    const version =
      Math.max(
        0,
        ...conceptNotes
          .filter((note) => note.incidentId === input.incidentId)
          .map((note) => note.version),
      ) + 1;

    const note = {
      id: crypto.randomUUID(),
      incidentId: input.incidentId,
      version,
      content: input.content,
      status: input.status ?? "draft",
      updatedBy: input.updatedBy ?? currentUser.name,
      createdAt: now,
      updatedAt: now,
    };

    conceptNotes.unshift(note);

    return note;
  },
  async getDashboardSummary() {
    return dashboardSummary;
  },
};
