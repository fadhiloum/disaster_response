import { resources } from "@/app/lib/demo-data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const resource = resources.find((item) => item.id === id);

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

  return Response.json({
    data: {
      ...resource,
      quantityCommitted: resource.quantityCommitted + quantity,
      assignedIncidentId: payload.incidentId ?? resource.assignedIncidentId,
    },
    mode: "demo",
  });
}
