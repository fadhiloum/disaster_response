import { resources } from "@/app/lib/demo-data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const resource = resources.find((item) => item.id === id);

  if (!resource) {
    return Response.json({ error: "Resource not found" }, { status: 404 });
  }

  const payload = await request.json();

  return Response.json({
    data: {
      ...resource,
      ...payload,
      id: resource.id,
    },
    mode: "demo",
  });
}
