import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";
import { recordAudit } from "../../audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const { id } = await params;
  const need = (await data.listNeeds()).find((item) => item.id === id);

  if (!need) {
    return Response.json({ error: "Need report not found" }, { status: 404 });
  }

  const payload = await request.json();
  const updatedNeed = await data.updateNeed(id, {
    category: payload.category,
    urgency: payload.urgency,
    quantity:
      payload.quantity !== undefined ? Number(payload.quantity) : undefined,
    unit: payload.unit,
    affectedPeople:
      payload.affectedPeople !== undefined
        ? Number(payload.affectedPeople)
        : undefined,
    status: payload.status,
    locationName: payload.locationName,
    latitude: payload.latitude !== undefined ? Number(payload.latitude) : undefined,
    longitude:
      payload.longitude !== undefined ? Number(payload.longitude) : undefined,
    notes: payload.notes,
    verifiedById:
      payload.status === "verified" || payload.status === "assigned"
        ? auth.user.id
        : payload.verifiedById,
  });
  await recordAudit({
    action: "update",
    actor: auth.user,
    after: updatedNeed ?? need,
    before: need,
    entityId: id,
    entityType: "need",
    summary: `Updated need ${need.category}`,
  });

  return Response.json({
    data: updatedNeed ?? need,
    mode: data.backend,
  });
}
