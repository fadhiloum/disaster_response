import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";
import { readUpdateIncidentPayload } from "../payload";
import { recordAudit } from "../../audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const incident = await data.getIncident(id);

  if (!incident) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  return Response.json({ data: incident });
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
  const incident = await data.getIncident(id);

  if (!incident) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);
  const result = readUpdateIncidentPayload(payload);

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  const updatedIncident = await data.updateIncident(id, result.input);
  await recordAudit({
    action: "update",
    actor: auth.user,
    after: updatedIncident ?? incident,
    before: incident,
    entityId: id,
    entityType: "program",
    summary: `Updated program ${incident.title}`,
  });

  return Response.json({
    data: updatedIncident ?? incident,
    mode: data.backend,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const { id } = await params;
  const incident = await data.getIncident(id);

  if (!incident) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  await data.deleteIncident(id);
  await recordAudit({
    action: "delete",
    actor: auth.user,
    before: incident,
    entityId: id,
    entityType: "program",
    summary: `Deleted program ${incident.title}`,
  });

  return Response.json({ data: { id }, mode: data.backend });
}
