import { data } from "@/app/lib/data";

export async function GET() {
  const incidents = await data.listIncidents();

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
      mode: data.backend,
    },
    { status: 201 },
  );
}
