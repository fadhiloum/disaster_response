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

  return Response.json(
    {
      data: {
        id: crypto.randomUUID(),
        assignedIncidentId: null,
        quantityCommitted: 0,
        ...payload,
      },
      mode: data.backend,
    },
    { status: 201 },
  );
}
