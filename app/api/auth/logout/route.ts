export async function POST() {
  return Response.json({
    data: {
      ok: true,
    },
    mode: process.env.DATA_BACKEND ?? "demo",
  });
}
