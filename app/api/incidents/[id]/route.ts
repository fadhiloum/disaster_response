import { getIncident } from "@/app/lib/demo-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const incident = getIncident(id);

  if (!incident) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  return Response.json({ data: incident });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const incident = getIncident(id);

  if (!incident) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  const payload = await request.json();

  return Response.json({
    data: {
      ...incident,
      ...payload,
      id: incident.id,
    },
    mode: "demo",
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const incident = getIncident(id);

  if (!incident) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  return Response.json({ data: { id }, mode: "demo" });
}
