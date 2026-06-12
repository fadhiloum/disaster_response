import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!(await data.getIncident(id))) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  return Response.json({ data: await data.getIncidentActivities(id) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator", "Partner"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const { id } = await params;

  if (!(await data.getIncident(id))) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  const payload = await request.json();
  const activity = await data.createPartnerActivity({
    incidentId: id,
    organization: payload.organization ?? auth.user.organization,
    organizationId: payload.organizationId,
    sector: payload.sector ?? "General",
    activity: payload.activity ?? "Partner activity",
    locationName: payload.locationName ?? "Unspecified location",
    latitude: payload.latitude !== undefined ? Number(payload.latitude) : undefined,
    longitude:
      payload.longitude !== undefined ? Number(payload.longitude) : undefined,
    status: payload.status,
    contactName: payload.contactName ?? auth.user.name,
    contactPhone: payload.contactPhone,
    startDate: payload.startDate,
    endDate: payload.endDate,
  });

  return Response.json(
    {
      data: activity,
      mode: data.backend,
    },
    { status: 201 },
  );
}
