import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";
import { recordAudit } from "../../../audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!(await data.getIncident(id))) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  return Response.json({ data: await data.getIncidentTasks(id) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const { id } = await params;

  if (!(await data.getIncident(id))) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  const payload = await request.json();
  const task = await data.createTask({
    incidentId: id,
    title: payload.title ?? "Untitled task",
    description: payload.description,
    assignee: payload.assignee,
    assigneeId: payload.assigneeId,
    priority: payload.priority ?? "medium",
    status: payload.status,
    dueTime: payload.dueTime,
    locationName: payload.locationName,
    latitude: payload.latitude !== undefined ? Number(payload.latitude) : undefined,
    longitude:
      payload.longitude !== undefined ? Number(payload.longitude) : undefined,
    createdById: auth.user.id,
  });
  await recordAudit({
    action: "create",
    actor: auth.user,
    after: task,
    entityId: task.id,
    entityType: "task",
    summary: `Created task ${task.title}`,
  });

  return Response.json(
    {
      data: task,
      mode: data.backend,
    },
    { status: 201 },
  );
}
