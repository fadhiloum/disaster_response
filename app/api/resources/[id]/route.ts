import { data } from "@/app/lib/data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const resource = (await data.listResources()).find((item) => item.id === id);

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
    mode: data.backend,
  });
}
