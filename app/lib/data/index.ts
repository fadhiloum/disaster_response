import { demoRepository } from "./demo";
import { drizzleRepository } from "./drizzle";
import { prismaRepository } from "./prisma";
import type { DataBackend, DataRepository } from "./repository";

function selectedBackend(): DataBackend {
  const backend = process.env.DATA_BACKEND;

  if (backend === "prisma" || backend === "drizzle" || backend === "demo") {
    return backend;
  }

  return "demo";
}

export const data: DataRepository =
  selectedBackend() === "prisma"
    ? prismaRepository
    : selectedBackend() === "drizzle"
      ? drizzleRepository
      : demoRepository;

export type { DataBackend, DataRepository } from "./repository";
export type {
  DeployedTeam,
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
export { formatDateTime, formatNumber } from "./types";

