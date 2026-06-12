import { recordAudit } from "@/app/api/audit";
import { isAuthResponse, requireRole } from "@/app/lib/auth";
import { data } from "@/app/lib/data";
import type { UpdateSituationReportInput } from "@/app/lib/data/repository";
import type { SituationReport } from "@/app/lib/data/types";

export const runtime = "nodejs";

const editableFields = [
  "reportingPeriod",
  "summary",
  "impact",
  "priorityNeeds",
  "responseActions",
  "gaps",
  "nextPriorities",
  "reviewComment",
] as const;
const sitrepStatuses = new Set<SituationReport["status"]>([
  "draft",
  "submitted",
  "approved",
  "rejected",
]);

function readOptionalStringField(payload: unknown, field: string) {
  if (typeof payload === "object" && payload !== null) {
    const value = (payload as Record<string, unknown>)[field];

    if (typeof value === "string") {
      return value.trim();
    }
  }

  return undefined;
}

function readStatus(payload: unknown) {
  const status = readOptionalStringField(payload, "status");

  if (status === undefined) {
    return undefined;
  }

  if (!sitrepStatuses.has(status as SituationReport["status"])) {
    return { error: "Invalid SitRep status" };
  }

  return status as SituationReport["status"];
}

function buildUpdateInput(payload: unknown, reviewerName: string) {
  const input: UpdateSituationReportInput = {};

  for (const field of editableFields) {
    const value = readOptionalStringField(payload, field);

    if (value !== undefined) {
      input[field] = value;
    }
  }

  const status = readStatus(payload);

  if (typeof status === "object") {
    return status;
  }

  if (status !== undefined) {
    input.status = status;

    if (status === "approved" || status === "rejected") {
      input.reviewedBy = reviewerName;
    }
  }

  return input;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const { id } = await params;
  const before = (await data.listSituationReports()).find(
    (report) => report.id === id,
  );

  if (!before) {
    return Response.json({ error: "Situation report not found" }, { status: 404 });
  }

  const payload = await request.json();
  const input = buildUpdateInput(payload, auth.user.name);

  if ("error" in input) {
    return Response.json({ error: input.error }, { status: 400 });
  }

  if (!Object.keys(input).length) {
    return Response.json({ error: "No SitRep updates provided" }, { status: 400 });
  }

  const report = await data.updateSituationReport(id, input);

  if (!report) {
    return Response.json({ error: "Situation report not found" }, { status: 404 });
  }

  const action = input.status && input.status !== before.status ? "status" : "update";
  const summary =
    action === "status"
      ? `Changed SitRep status from ${before.status} to ${report.status}`
      : `Updated SitRep revision ${report.revision}`;

  await recordAudit({
    action,
    actor: auth.user,
    after: report,
    before,
    entityId: report.id,
    entityType: "sitrep",
    summary,
  });

  return Response.json({ data: report, mode: data.backend });
}
