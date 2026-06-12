import { demoRepository } from "./demo";
import type { DataBackend, DataRepository } from "./repository";

let repository: DataRepository | null = null;
let warnedPrismaWorkerFallback = false;

function isWorkerRuntime() {
  const globalScope = globalThis as {
    WebSocketPair?: unknown;
    navigator?: { userAgent?: string };
  };
  const userAgent = globalScope.navigator?.userAgent ?? "";

  return (
    typeof globalScope.WebSocketPair !== "undefined" ||
    userAgent.includes("Cloudflare-Workers") ||
    userAgent.includes("Miniflare")
  );
}

function selectedBackend(): DataBackend {
  const backend = process.env.DATA_BACKEND;

  if (backend === "prisma" || backend === "drizzle" || backend === "demo") {
    if (backend === "prisma" && isWorkerRuntime()) {
      if (!warnedPrismaWorkerFallback) {
        console.warn(
          "DATA_BACKEND=prisma is not supported in the Cloudflare worker runtime with the pg driver. Falling back to demo data.",
        );
        warnedPrismaWorkerFallback = true;
      }

      return "demo";
    }

    return backend;
  }

  return "demo";
}

async function getRepository() {
  if (repository) {
    return repository;
  }

  const backend = selectedBackend();

  if (backend === "prisma") {
    repository = (await import("./prisma")).prismaRepository;
  } else if (backend === "drizzle") {
    repository = (await import("./drizzle")).drizzleRepository;
  } else {
    repository = demoRepository;
  }

  return repository;
}

export const data: DataRepository = {
  get backend() {
    return selectedBackend();
  },
  async getCurrentUser() {
    return (await getRepository()).getCurrentUser();
  },
  async listUsers() {
    return (await getRepository()).listUsers();
  },
  async listIncidents() {
    return (await getRepository()).listIncidents();
  },
  async getIncident(id) {
    return (await getRepository()).getIncident(id);
  },
  async createIncident(input) {
    return (await getRepository()).createIncident(input);
  },
  async updateIncident(id, input) {
    return (await getRepository()).updateIncident(id, input);
  },
  async deleteIncident(id) {
    return (await getRepository()).deleteIncident(id);
  },
  async listNeeds() {
    return (await getRepository()).listNeeds();
  },
  async getIncidentNeeds(id) {
    return (await getRepository()).getIncidentNeeds(id);
  },
  async createNeed(input) {
    return (await getRepository()).createNeed(input);
  },
  async updateNeed(id, input) {
    return (await getRepository()).updateNeed(id, input);
  },
  async listTasks() {
    return (await getRepository()).listTasks();
  },
  async getIncidentTasks(id) {
    return (await getRepository()).getIncidentTasks(id);
  },
  async createTask(input) {
    return (await getRepository()).createTask(input);
  },
  async updateTask(id, input) {
    return (await getRepository()).updateTask(id, input);
  },
  async listResources() {
    return (await getRepository()).listResources();
  },
  async getIncidentResources(id) {
    return (await getRepository()).getIncidentResources(id);
  },
  async createResource(input) {
    return (await getRepository()).createResource(input);
  },
  async updateResource(id, input) {
    return (await getRepository()).updateResource(id, input);
  },
  async commitResource(id, input) {
    return (await getRepository()).commitResource(id, input);
  },
  async listDeployedTeams() {
    return (await getRepository()).listDeployedTeams();
  },
  async getIncidentTeams(id) {
    return (await getRepository()).getIncidentTeams(id);
  },
  async listPartnerActivities() {
    return (await getRepository()).listPartnerActivities();
  },
  async getIncidentActivities(id) {
    return (await getRepository()).getIncidentActivities(id);
  },
  async createPartnerActivity(input) {
    return (await getRepository()).createPartnerActivity(input);
  },
  async updatePartnerActivity(id, input) {
    return (await getRepository()).updatePartnerActivity(id, input);
  },
  async listSituationReports() {
    return (await getRepository()).listSituationReports();
  },
  async getIncidentSitreps(id) {
    return (await getRepository()).getIncidentSitreps(id);
  },
  async createSituationReport(input) {
    return (await getRepository()).createSituationReport(input);
  },
  async getIncidentConceptNote(id) {
    return (await getRepository()).getIncidentConceptNote(id);
  },
  async getIncidentConceptNotes(id) {
    return (await getRepository()).getIncidentConceptNotes(id);
  },
  async getConceptNote(id) {
    return (await getRepository()).getConceptNote(id);
  },
  async createIncidentConceptNoteVersion(input) {
    return (await getRepository()).createIncidentConceptNoteVersion(input);
  },
  async getDashboardSummary() {
    return (await getRepository()).getDashboardSummary();
  },
};

export type { DataBackend, DataRepository } from "./repository";
export type {
  ConceptNote,
  DeployedTeam,
  FundRequest,
  FundRequestStatus,
  Incident,
  IncidentStatus,
  NeedReport,
  NeedStatus,
  PartnerActivity,
  ProgramSubProgram,
  Resource,
  ResponseTask,
  Role,
  Severity,
  SituationReport,
  TaskStatus,
  User,
} from "./types";
export { formatCurrency, formatDateTime, formatNumber } from "./types";
