import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";
import type { CreateIncidentInput } from "@/app/lib/data/repository";
import { readCreateIncidentPayload } from "./payload";

export async function GET() {
  const incidents = await data.listIncidents();

  return Response.json({ data: incidents });
}

export async function POST(request: Request) {
  const auth = await requireRole(["Admin", "Coordinator"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const payload = await request.json().catch(() => null);
  const result = readCreateIncidentPayload(payload);

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  const incident = await data.createIncident({
    ...(result.input as CreateIncidentInput),
    createdById: auth.user.id,
  });

  return Response.json(
    {
      data: incident,
      mode: data.backend,
    },
    { status: 201 },
  );
}
