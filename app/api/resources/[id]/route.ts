import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";

export async function PATCH(
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
  const updatedResource = await data.updateResource(id, {
    name: payload.name,
    category: payload.category,
    quantityAvailable:
      payload.quantityAvailable !== undefined
        ? Number(payload.quantityAvailable)
        : undefined,
    quantityCommitted:
      payload.quantityCommitted !== undefined
        ? Number(payload.quantityCommitted)
        : undefined,
    unit: payload.unit,
    warehouseLocation: payload.warehouseLocation,
    receivedAt: payload.receivedAt,
    expiryDate: payload.expiryDate,
  });

  return Response.json({
    data: updatedResource ?? resource,
    mode: data.backend,
  });
}
