import { afterEach, describe, expect, it, vi } from "vitest";
import { getDisasterNews } from "@/app/lib/disaster-news";

const reliefWebPayload = {
  data: [
    {
      fields: {
        date: {
          changed: "2026-06-12T01:30:00+00:00",
          created: "2026-06-12T02:00:00+00:00",
          event: "2026-06-12T00:20:00+00:00",
        },
        description: "A newly reported earthquake event.",
        name: "Philippines: Earthquake",
        primary_country: {
          name: "Philippines",
        },
        status: "current",
        type: [
          {
            name: "Earthquake",
          },
        ],
        url: "https://reliefweb.int/disaster/eq-2026-phl",
      },
      id: 123,
    },
  ],
};

const gdacsFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss>
  <channel>
    <item>
      <title><![CDATA[Flood alert in Myanmar]]></title>
      <link>https://www.gdacs.org/report.aspx?eventid=456</link>
      <guid>gdacs-flood-456</guid>
      <description><![CDATA[GDACS issued an orange flood alert.]]></description>
      <pubDate>Fri, 12 Jun 2026 05:00:00 GMT</pubDate>
      <gdacs:alertlevel>Orange</gdacs:alertlevel>
      <gdacs:eventtype>FL</gdacs:eventtype>
      <gdacs:country>Myanmar</gdacs:country>
    </item>
  </channel>
</rss>`;

describe("disaster news feed", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("merges official sources and sorts the latest disaster first", async () => {
    vi.stubGlobal("fetch", mockFeedFetch());

    const feed = await getDisasterNews();

    expect(feed.sources).toEqual(["ReliefWeb / UN OCHA", "GDACS"]);
    expect(feed.errors).toEqual([]);
    expect(feed.items).toHaveLength(2);
    expect(feed.items[0]).toMatchObject({
      eventType: "Flood",
      location: "Myanmar",
      severity: "orange",
      source: "GDACS",
      title: "Flood alert in Myanmar",
    });
    expect(feed.items[1]).toMatchObject({
      eventType: "Earthquake",
      location: "Philippines",
      severity: "green",
      source: "ReliefWeb / UN OCHA",
      title: "Philippines: Earthquake",
    });
  });

  it("keeps available items when one source fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("reliefweb")) {
          return new Response("unavailable", { status: 503 });
        }

        return new Response(gdacsFeed, {
          headers: { "Content-Type": "application/xml" },
        });
      }),
    );

    const feed = await getDisasterNews();

    expect(feed.items).toHaveLength(1);
    expect(feed.items[0].source).toBe("GDACS");
    expect(feed.errors[0]).toContain("ReliefWeb / UN OCHA");
    expect(feed.errors[0]).toContain("HTTP 503");
  });
});

function mockFeedFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes("reliefweb")) {
      return Response.json(reliefWebPayload);
    }

    if (url.includes("gdacs")) {
      return new Response(gdacsFeed, {
        headers: { "Content-Type": "application/xml" },
      });
    }

    return new Response("not found", { status: 404 });
  });
}
