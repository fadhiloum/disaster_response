import {
  currentUser,
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
  CreateIncidentInput,
  DataRepository,
  UpdateIncidentInput,
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
  async listTasks() {
    return tasks;
  },
  async getIncidentTasks(id) {
    return getIncidentTasks(id);
  },
  async listResources() {
    return resources;
  },
  async getIncidentResources(id) {
    return getIncidentResources(id);
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
  async listSituationReports() {
    return situationReports;
  },
  async getIncidentSitreps(id) {
    return getIncidentSitreps(id);
  },
  async createSituationReport(input) {
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
      createdAt: new Date().toISOString(),
    };

    situationReports.unshift(report);

    return report;
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
