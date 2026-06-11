import { data } from "@/app/lib/data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const need = (await data.listNeeds()).find((item) => item.id === id);

  if (!need) {
    return Response.json({ error: "Need report not found" }, { status: 404 });
  }

  const payload = await request.json();

  return Response.json({
    data: {
      ...need,
      ...payload,
      id: need.id,
    },
    mode: data.backend,
  });
}
