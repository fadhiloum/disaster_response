import { data } from "@/app/lib/data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const activity = (await data.listPartnerActivities()).find(
    (item) => item.id === id,
  );

  if (!activity) {
    return Response.json({ error: "Activity not found" }, { status: 404 });
  }

  const payload = await request.json();

  return Response.json({
    data: {
      ...activity,
      ...payload,
      id: activity.id,
    },
    mode: data.backend,
  });
}
