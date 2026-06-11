import { resources } from "@/app/lib/demo-data";

export async function GET() {
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
      mode: "demo",
    },
    { status: 201 },
  );
}
