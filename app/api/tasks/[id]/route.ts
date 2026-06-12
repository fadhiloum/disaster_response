import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";
import { recordAudit } from "../../audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator", "Responder"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const { id } = await params;
  const task = (await data.listTasks()).find((item) => item.id === id);

  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const payload = await request.json();
  const updatedTask = await data.updateTask(id, {
    title: payload.title,
    description: payload.description,
    assignee: payload.assignee,
    assigneeId: payload.assigneeId,
    priority: payload.priority,
    status: payload.status,
    dueTime: payload.dueTime,
    locationName: payload.locationName,
    latitude: payload.latitude !== undefined ? Number(payload.latitude) : undefined,
    longitude:
      payload.longitude !== undefined ? Number(payload.longitude) : undefined,
  });
  await recordAudit({
    action: "update",
    actor: auth.user,
    after: updatedTask ?? task,
    before: task,
    entityId: id,
    entityType: "task",
    summary: `Updated task ${task.title}`,
  });

  return Response.json({
    data: updatedTask ?? task,
    mode: data.backend,
  });
}
