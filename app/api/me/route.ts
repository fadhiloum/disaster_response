import { data } from "@/app/lib/data";
import { getSessionUser } from "@/app/lib/auth";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  return Response.json({ data: user, mode: data.backend });
}
