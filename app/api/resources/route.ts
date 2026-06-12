import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";

export async function GET() {
  const resources = await data.listResources();

  return Response.json({ data: resources });
}

export async function POST(request: Request) {
  const auth = await requireRole(["Admin", "Coordinator"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const payload = await request.json();
  const resource = await data.createResource({
    name: payload.name,
    category: payload.category,
    quantityAvailable: Number(payload.quantityAvailable ?? 0),
    quantityCommitted:
      payload.quantityCommitted !== undefined
        ? Number(payload.quantityCommitted)
        : undefined,
    unit: payload.unit,
    warehouseLocation: payload.warehouseLocation,
    receivedAt: payload.receivedAt,
    expiryDate: payload.expiryDate,
  });

  return Response.json(
    {
      data: resource,
      mode: data.backend,
    },
    { status: 201 },
  );
}
