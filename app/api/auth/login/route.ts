import { cookies } from "next/headers";
import { data } from "@/app/lib/data";
import { sessionCookieName } from "@/app/lib/auth";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    email?: string;
  };
  const users = await data.listUsers();
  const user =
    users.find((item) => item.email === payload.email) ??
    users.find((item) => item.role === "Coordinator") ??
    users[0];

  if (!user) {
    return Response.json({ error: "No users are available" }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, user.id, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return Response.json({
    data: user,
    mode: data.backend,
  });
}
