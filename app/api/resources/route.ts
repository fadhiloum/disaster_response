import { data } from "@/app/lib/data";

export async function GET() {
  const resources = await data.listResources();

  return Response.json({ data: resources });
}

export async function POST(request: Request) {
  const payload = await request.json();

  return Response.json(
    {
      data: {
        id: crypto.randomUUID(),
        quantityCommitted: 0,
        ...payload,
      },
      mode: data.backend,
    },
    { status: 201 },
  );
}
