import { needReports } from "@/app/lib/demo-data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const need = needReports.find((item) => item.id === id);

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
    mode: "demo",
  });
}
