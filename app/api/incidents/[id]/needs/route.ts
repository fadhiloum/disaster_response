import { getIncident, getIncidentNeeds } from "@/app/lib/demo-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!getIncident(id)) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  return Response.json({ data: getIncidentNeeds(id) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!getIncident(id)) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  const payload = await request.json();

  return Response.json(
    {
      data: {
        id: crypto.randomUUID(),
        incidentId: id,
        status: "reported",
        createdAt: new Date().toISOString(),
        ...payload,
      },
      mode: "demo",
    },
    { status: 201 },
  );
}
