import { partnerActivities } from "@/app/lib/demo-data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const activity = partnerActivities.find((item) => item.id === id);

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
    mode: "demo",
  });
}
