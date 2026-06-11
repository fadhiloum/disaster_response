import { currentUser } from "@/app/lib/demo-data";

export async function POST() {
  return Response.json({
    data: currentUser,
    mode: "demo",
  });
}
