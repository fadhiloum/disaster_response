import { data } from "@/app/lib/data";

export async function GET() {
  return Response.json({ data: await data.getCurrentUser(), mode: data.backend });
}
