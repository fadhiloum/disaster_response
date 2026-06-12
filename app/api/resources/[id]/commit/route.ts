import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";
import { recordAudit } from "../../../audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const { id } = await params;
  const resource = (await data.listResources()).find((item) => item.id === id);

  if (!resource) {
    return Response.json({ error: "Resource not found" }, { status: 404 });
  }

  const payload = await request.json();
  const quantity = Number(payload.quantity ?? 0);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return Response.json(
      { error: "Commit quantity must be greater than zero" },
      { status: 400 },
    );
  }

  const freeQuantity = resource.quantityAvailable - resource.quantityCommitted;

  if (quantity > freeQuantity) {
    return Response.json(
      { error: "Commit quantity exceeds available stock" },
      { status: 409 },
    );
  }

  const updatedResource = await data.commitResource(id, {
    incidentId: payload.incidentId,
    quantity,
    note: payload.note,
  });
  await recordAudit({
    action: "commit",
    actor: auth.user,
    after: updatedResource ?? resource,
    before: resource,
    entityId: id,
    entityType: "resource_commitment",
    summary: `Committed ${quantity} ${resource.unit} from ${resource.name}`,
  });

  return Response.json({
    data: updatedResource ?? resource,
    mode: data.backend,
  });
}
