import type {
  CreateIncidentInput,
  IncidentFundRequestInput,
  IncidentSubProgramInput,
  UpdateIncidentInput,
} from "@/app/lib/data/repository";
import type { Incident, FundRequestStatus } from "@/app/lib/data/types";

const disasterTypes = new Set([
  "flood",
  "earthquake",
  "landslide",
  "fire",
  "storm",
  "conflict",
  "other",
]);
const severities = new Set<Incident["severity"]>([
  "low",
  "moderate",
  "high",
  "critical",
]);
const statuses = new Set<Incident["status"]>([
  "monitoring",
  "active",
  "stabilizing",
  "closed",
]);
const fundRequestStatuses = new Set<FundRequestStatus>([
  "draft",
  "requested",
  "approved",
  "released",
]);

const createRequiredFields = [
  "title",
  "disasterType",
  "severity",
  "status",
  "region",
  "country",
  "state",
  "locationName",
  "latitude",
  "longitude",
  "startTime",
  "description",
  "budgetCurrency",
  "masterBudgetAmount",
] as const;

export type IncidentPayloadResult =
  | { input: CreateIncidentInput | UpdateIncidentInput }
  | { error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(payload: Record<string, unknown>, field: string) {
  const value = payload[field];

  return typeof value === "string" ? value.trim() : undefined;
}

function readNumber(payload: Record<string, unknown>, field: string) {
  const value = payload[field];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function readDateString(payload: Record<string, unknown>, field: string) {
  const value = readString(payload, field);

  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function readSubPrograms(value: unknown): IncidentSubProgramInput[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .filter(isRecord)
    .map((item) => ({
      id: readString(item, "id"),
      name: readString(item, "name") ?? "",
      budgetAllocated: readNumber(item, "budgetAllocated") ?? 0,
    }))
    .filter((item) => item.name);
}

function readFundRequests(value: unknown): IncidentFundRequestInput[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .filter(isRecord)
    .map((item) => {
      const status = readString(item, "status");

      return {
        id: readString(item, "id"),
        subProgramName: readString(item, "subProgramName") ?? "",
        requestedByTeam: readString(item, "requestedByTeam") ?? "",
        amount: readNumber(item, "amount") ?? 0,
        currency: readString(item, "currency"),
        purpose: readString(item, "purpose") ?? "",
        status:
          status && fundRequestStatuses.has(status as FundRequestStatus)
            ? (status as FundRequestStatus)
            : undefined,
        requestedAt: readDateString(item, "requestedAt"),
      };
    })
    .filter(
      (item) =>
        item.subProgramName && item.requestedByTeam && item.purpose && item.amount >= 0,
    );
}

function buildIncidentInput(
  payload: Record<string, unknown>,
  requireAllFields: boolean,
): IncidentPayloadResult {
  const missingFields = requireAllFields
    ? createRequiredFields.filter((field) => {
        if (field === "latitude" || field === "longitude" || field === "masterBudgetAmount") {
          return readNumber(payload, field) === undefined;
        }

        if (field === "startTime") {
          return readDateString(payload, field) === undefined;
        }

        return !readString(payload, field);
      })
    : [];

  if (missingFields.length) {
    return { error: `Missing required fields: ${missingFields.join(", ")}` };
  }

  const disasterType = readString(payload, "disasterType");
  const severity = readString(payload, "severity");
  const status = readString(payload, "status");

  if (disasterType !== undefined && !disasterTypes.has(disasterType)) {
    return { error: "Invalid disasterType" };
  }
  if (severity !== undefined && !severities.has(severity as Incident["severity"])) {
    return { error: "Invalid severity" };
  }
  if (status !== undefined && !statuses.has(status as Incident["status"])) {
    return { error: "Invalid status" };
  }

  const input: UpdateIncidentInput = {};
  const stringFields = [
    "title",
    "region",
    "country",
    "state",
    "locationName",
    "description",
    "lead",
    "latestUpdate",
    "budgetCurrency",
  ] as const;

  for (const field of stringFields) {
    const value = readString(payload, field);

    if (value !== undefined) {
      input[field] = value;
    }
  }

  if (disasterType !== undefined) input.disasterType = disasterType;
  if (severity !== undefined) input.severity = severity as Incident["severity"];
  if (status !== undefined) input.status = status as Incident["status"];

  const latitude = readNumber(payload, "latitude");
  const longitude = readNumber(payload, "longitude");
  const masterBudgetAmount = readNumber(payload, "masterBudgetAmount");
  const startTime = readDateString(payload, "startTime");

  if (latitude !== undefined) input.latitude = latitude;
  if (longitude !== undefined) input.longitude = longitude;
  if (masterBudgetAmount !== undefined) input.masterBudgetAmount = masterBudgetAmount;
  if (startTime !== undefined) input.startTime = startTime;

  if ("subPrograms" in payload) {
    input.subPrograms = readSubPrograms(payload.subPrograms) ?? [];
  }
  if ("fundRequests" in payload) {
    input.fundRequests = readFundRequests(payload.fundRequests) ?? [];
  }

  return { input };
}

export function readCreateIncidentPayload(payload: unknown): IncidentPayloadResult {
  if (!isRecord(payload)) {
    return { error: "Request body must be an object" };
  }

  return buildIncidentInput(payload, true);
}

export function readUpdateIncidentPayload(payload: unknown): IncidentPayloadResult {
  if (!isRecord(payload)) {
    return { error: "Request body must be an object" };
  }

  return buildIncidentInput(payload, false);
}
