import { incidents } from "@/app/lib/demo-data";

export async function GET() {
  return Response.json({ data: incidents });
}

export async function POST(request: Request) {
  const payload = await request.json();

  return Response.json(
    {
      data: {
        id: crypto.randomUUID(),
        ...payload,
      },
      mode: "demo",
    },
    { status: 201 },
  );
}
