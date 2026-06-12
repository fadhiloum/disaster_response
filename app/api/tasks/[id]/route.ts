import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";

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

  return Response.json({
    data: {
      ...task,
      ...payload,
      id: task.id,
    },
    mode: data.backend,
  });
}
