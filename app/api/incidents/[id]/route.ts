import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";
import { readUpdateIncidentPayload } from "../payload";

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

  return Response.json({ data: { id }, mode: data.backend });
}
