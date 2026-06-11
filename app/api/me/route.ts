import { currentUser } from "@/app/lib/demo-data";

export async function GET() {
  return Response.json({ data: currentUser, mode: "demo" });
}
