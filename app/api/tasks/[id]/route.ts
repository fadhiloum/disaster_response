import { data } from "@/app/lib/data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
