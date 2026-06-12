import { data } from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

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
