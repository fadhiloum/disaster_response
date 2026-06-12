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
import type { DataRepository } from "./repository";

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
  async upsertIncidentConceptNote(input) {
    const now = new Date().toISOString();
    const existing = conceptNotes.find(
      (note) => note.incidentId === input.incidentId,
    );

    if (existing) {
      existing.content = input.content;
      existing.updatedAt = now;
      existing.updatedBy = input.updatedBy ?? currentUser.name;

      return existing;
    }

    const note = {
      id: crypto.randomUUID(),
      incidentId: input.incidentId,
      content: input.content,
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
