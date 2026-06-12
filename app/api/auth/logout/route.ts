import { cookies } from "next/headers";
import { sessionCookieName } from "@/app/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);

  return Response.json({
    data: {
      ok: true,
    },
    mode: process.env.DATA_BACKEND ?? "demo",
  });
}
