import type { DataRepository } from "./repository";

function unavailable(): never {
  throw new Error(
    "The Drizzle backend is selected, but this app does not have Drizzle tables mapped for the disaster response data model yet.",
  );
}

export const drizzleRepository: DataRepository = {
  backend: "drizzle",
  async getCurrentUser() {
    return unavailable();
  },
  async listUsers() {
    return unavailable();
  },
  async listIncidents() {
    return unavailable();
  },
  async getIncident() {
    return unavailable();
  },
  async createIncident() {
    return unavailable();
  },
  async updateIncident() {
    return unavailable();
  },
  async deleteIncident() {
    return unavailable();
  },
  async listNeeds() {
    return unavailable();
  },
  async getIncidentNeeds() {
    return unavailable();
  },
  async createNeed() {
    return unavailable();
  },
  async updateNeed() {
    return unavailable();
  },
  async listTasks() {
    return unavailable();
  },
  async getIncidentTasks() {
    return unavailable();
  },
  async createTask() {
    return unavailable();
  },
  async updateTask() {
    return unavailable();
  },
  async listResources() {
    return unavailable();
  },
  async getIncidentResources() {
    return unavailable();
  },
  async createResource() {
    return unavailable();
  },
  async updateResource() {
    return unavailable();
  },
  async commitResource() {
    return unavailable();
  },
  async listDeployedTeams() {
    return unavailable();
  },
  async getIncidentTeams() {
    return unavailable();
  },
  async listPartnerActivities() {
    return unavailable();
  },
  async getIncidentActivities() {
    return unavailable();
  },
  async createPartnerActivity() {
    return unavailable();
  },
  async updatePartnerActivity() {
    return unavailable();
  },
  async listSituationReports() {
    return unavailable();
  },
  async getIncidentSitreps() {
    return unavailable();
  },
  async createSituationReport() {
    return unavailable();
  },
  async updateSituationReport() {
    return unavailable();
  },
  async listAuditLogs() {
    return unavailable();
  },
  async createAuditLog() {
    return unavailable();
  },
  async getIncidentConceptNote() {
    return unavailable();
  },
  async getIncidentConceptNotes() {
    return unavailable();
  },
  async getConceptNote() {
    return unavailable();
  },
  async createIncidentConceptNoteVersion() {
    return unavailable();
  },
  async getDashboardSummary() {
    return unavailable();
  },
};
