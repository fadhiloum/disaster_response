import { cookies } from "next/headers";
import { data } from "@/app/lib/data";
import type { Role, User } from "@/app/lib/data";

export const sessionCookieName = "dr_session_user";

export type AuthResult =
  | {
      user: User;
    }
  | Response;

export function isAuthResponse(result: AuthResult): result is Response {
  return result instanceof Response;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(sessionCookieName)?.value;

  if (!userId) {
    return null;
  }

  return (await data.listUsers()).find((user) => user.id === userId) ?? null;
}

export async function requireUser(): Promise<AuthResult> {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  return { user };
}

export async function requireRole(allowedRoles: Role[]): Promise<AuthResult> {
  const result = await requireUser();

  if (isAuthResponse(result)) {
    return result;
  }

  if (!allowedRoles.includes(result.user.role)) {
    return Response.json({ error: "Insufficient role" }, { status: 403 });
  }

  return result;
}

