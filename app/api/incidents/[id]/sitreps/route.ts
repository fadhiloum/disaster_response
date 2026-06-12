import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";

const requiredFields = [
  "summary",
  "impact",
  "priorityNeeds",
  "responseActions",
  "gaps",
  "nextPriorities",
] as const;

function readStringField(payload: unknown, field: (typeof requiredFields)[number]) {
  if (typeof payload === "object" && payload !== null) {
    const value = (payload as Record<string, unknown>)[field];

    if (typeof value === "string") {
      return value.trim();
    }
  }

  return "";
}

function readOptionalStringField(payload: unknown, field: string) {
  if (typeof payload === "object" && payload !== null) {
    const value = (payload as Record<string, unknown>)[field];

    if (typeof value === "string") {
      return value.trim();
    }
  }

  return undefined;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!(await data.getIncident(id))) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  return Response.json({ data: await data.getIncidentSitreps(id) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const { id } = await params;

  if (!(await data.getIncident(id))) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  const payload = await request.json();
  const values = Object.fromEntries(
    requiredFields.map((field) => [field, readStringField(payload, field)]),
  ) as Record<(typeof requiredFields)[number], string>;
  const missingFields = requiredFields.filter((field) => !values[field]);

  if (missingFields.length) {
    return Response.json(
      { error: `Missing required fields: ${missingFields.join(", ")}` },
      { status: 400 },
    );
  }

  const report = await data.createSituationReport({
    incidentId: id,
    reportingPeriod: readOptionalStringField(payload, "reportingPeriod"),
    reportingPeriodStart: readOptionalStringField(
      payload,
      "reportingPeriodStart",
    ),
    reportingPeriodEnd: readOptionalStringField(payload, "reportingPeriodEnd"),
    summary: values.summary,
    impact: values.impact,
    priorityNeeds: values.priorityNeeds,
    responseActions: values.responseActions,
    gaps: values.gaps,
    nextPriorities: values.nextPriorities,
  });

  return Response.json(
    {
      data: report,
      mode: data.backend,
    },
    { status: 201 },
  );
}
