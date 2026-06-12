import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";
import { recordAudit } from "../../../audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!(await data.getIncident(id))) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  return Response.json({ data: await data.getIncidentNeeds(id) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator", "Responder"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const { id } = await params;

  if (!(await data.getIncident(id))) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  const payload = await request.json();
  const need = await data.createNeed({
    incidentId: id,
    category: payload.category ?? "Other",
    urgency: payload.urgency ?? "medium",
    quantity: Number(payload.quantity ?? 0),
    unit: payload.unit,
    affectedPeople: Number(payload.affectedPeople ?? 0),
    locationName: payload.locationName ?? "Unspecified location",
    latitude: Number(payload.latitude ?? 0),
    longitude: Number(payload.longitude ?? 0),
    notes: payload.notes,
    reportedById: auth.user.id,
  });
  await recordAudit({
    action: "create",
    actor: auth.user,
    after: need,
    entityId: need.id,
    entityType: "need",
    summary: `Created need ${need.category}`,
  });

  return Response.json(
    {
      data: need,
      mode: data.backend,
    },
    { status: 201 },
  );
}
