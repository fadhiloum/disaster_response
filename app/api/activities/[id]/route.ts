import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";
import { recordAudit } from "../../audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator", "Partner"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const { id } = await params;
  const activity = (await data.listPartnerActivities()).find(
    (item) => item.id === id,
  );

  if (!activity) {
    return Response.json({ error: "Activity not found" }, { status: 404 });
  }

  const payload = await request.json();
  const updatedActivity = await data.updatePartnerActivity(id, {
    organization: payload.organization,
    organizationId: payload.organizationId,
    incidentId: payload.incidentId,
    sector: payload.sector,
    activity: payload.activity,
    locationName: payload.locationName,
    latitude: payload.latitude !== undefined ? Number(payload.latitude) : undefined,
    longitude:
      payload.longitude !== undefined ? Number(payload.longitude) : undefined,
    status: payload.status,
    contactName: payload.contactName,
    contactPhone: payload.contactPhone,
    startDate: payload.startDate,
    endDate: payload.endDate,
  });
  await recordAudit({
    action: "update",
    actor: auth.user,
    after: updatedActivity ?? activity,
    before: activity,
    entityId: id,
    entityType: "partner_activity",
    summary: `Updated partner activity for ${activity.organization}`,
  });

  return Response.json({
    data: updatedActivity ?? activity,
    mode: data.backend,
  });
}
