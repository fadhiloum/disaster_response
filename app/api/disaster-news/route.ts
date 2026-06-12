import {
  DISASTER_NEWS_REFRESH_SECONDS,
  getDisasterNews,
} from "@/app/lib/disaster-news";

export const dynamic = "force-dynamic";

export async function GET() {
  const feed = await getDisasterNews();

  return Response.json(
    { data: feed },
    {
      headers: {
        "Cache-Control": `s-maxage=${DISASTER_NEWS_REFRESH_SECONDS}, stale-while-revalidate=300`,
      },
    },
  );
}
