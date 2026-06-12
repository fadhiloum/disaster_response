export const DISASTER_NEWS_REFRESH_SECONDS = 60 * 60;

const DISASTER_NEWS_LIMIT = 24;
const SOURCE_TIMEOUT_MS = 8_000;
const RELIEFWEB_SOURCE = "ReliefWeb / UN OCHA";
const GDACS_SOURCE = "GDACS";

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export type DisasterNewsSeverity = "green" | "orange" | "red" | "unknown";

export type DisasterNewsItem = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  url: string;
  publishedAt: string;
  location?: string;
  eventType?: string;
  severity: DisasterNewsSeverity;
  summary?: string;
};

export type DisasterNewsFeed = {
  items: DisasterNewsItem[];
  lastUpdatedAt: string;
  refreshIntervalSeconds: number;
  sources: string[];
  errors: string[];
};

type ReliefWebApiResponse = {
  data?: ReliefWebApiItem[];
};

type ReliefWebApiItem = {
  id?: number | string;
  fields?: {
    name?: unknown;
    title?: unknown;
    date?: unknown;
    description?: unknown;
    status?: unknown;
    primary_country?: unknown;
    country?: unknown;
    primary_type?: unknown;
    type?: unknown;
    url?: unknown;
    url_alias?: unknown;
  };
};

export async function getDisasterNews(): Promise<DisasterNewsFeed> {
  const sourceResults = await Promise.allSettled([
    fetchReliefWebDisasters(),
    fetchGdacsDisasters(),
  ]);

  const errors: string[] = [];
  const items = sourceResults.flatMap((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    errors.push(
      `${index === 0 ? RELIEFWEB_SOURCE : GDACS_SOURCE}: ${result.reason instanceof Error ? result.reason.message : "Source unavailable"}`,
    );

    return [];
  });

  return {
    errors,
    items: dedupeDisasterNews(items)
      .sort(
        (first, second) =>
          Date.parse(second.publishedAt) - Date.parse(first.publishedAt),
      )
      .slice(0, DISASTER_NEWS_LIMIT),
    lastUpdatedAt: new Date().toISOString(),
    refreshIntervalSeconds: DISASTER_NEWS_REFRESH_SECONDS,
    sources: [RELIEFWEB_SOURCE, GDACS_SOURCE],
  };
}

async function fetchReliefWebDisasters(): Promise<DisasterNewsItem[]> {
  const params = new URLSearchParams({
    appname:
      process.env.RELIEFWEB_APP_NAME?.trim() || "disaster-response-platform",
    limit: "18",
    profile: "list",
  });

  params.append("sort[]", "date.created:desc");
  [
    "name",
    "date.created",
    "date.event",
    "date.changed",
    "description",
    "status",
    "primary_country.name",
    "country.name",
    "primary_type.name",
    "type.name",
    "url",
    "url_alias",
  ].forEach((field) => params.append("fields[include][]", field));

  const payload = await fetchJson<ReliefWebApiResponse>(
    `https://api.reliefweb.int/v2/disasters?${params.toString()}`,
  );

  return (payload.data ?? [])
    .map((item) => reliefWebItemToNews(item))
    .filter((item): item is DisasterNewsItem => Boolean(item));
}

async function fetchGdacsDisasters(): Promise<DisasterNewsItem[]> {
  const xml = await fetchText("https://www.gdacs.org/xml/rss_7d.xml");
  const itemMatches = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  return itemMatches
    .map((itemXml, index) => gdacsItemToNews(itemXml, index))
    .filter((item): item is DisasterNewsItem => Boolean(item));
}

function reliefWebItemToNews(
  item: ReliefWebApiItem,
): DisasterNewsItem | undefined {
  const fields = item.fields;
  const title = normalizeText(asString(fields?.name) ?? asString(fields?.title));
  const date = asObject(fields?.date);
  const publishedAt = parseDate(
    asString(date?.created) ?? asString(date?.changed) ?? asString(date?.event),
  );

  if (!title || !publishedAt) {
    return undefined;
  }

  const url =
    absoluteUrl(asString(fields?.url), "https://reliefweb.int") ??
    absoluteUrl(asString(fields?.url_alias), "https://reliefweb.int") ??
    "https://reliefweb.int/disasters";

  return {
    eventType: namesFrom(fields?.primary_type) ?? namesFrom(fields?.type),
    id: `reliefweb-${item.id ?? slugify(`${title}-${publishedAt}`)}`,
    location: namesFrom(fields?.primary_country) ?? namesFrom(fields?.country),
    publishedAt,
    severity: reliefWebStatusToSeverity(asString(fields?.status)),
    source: RELIEFWEB_SOURCE,
    sourceUrl: "https://reliefweb.int/disasters",
    summary: trimSummary(asString(fields?.description)),
    title,
    url,
  };
}

function gdacsItemToNews(
  itemXml: string,
  index: number,
): DisasterNewsItem | undefined {
  const title = normalizeText(readXmlTag(itemXml, "title"));
  const publishedAt = parseDate(
    readXmlTag(itemXml, "pubDate") ??
      readXmlTag(itemXml, "gdacs:fromdate") ??
      readXmlTag(itemXml, "fromdate"),
  );

  if (!title || !publishedAt) {
    return undefined;
  }

  const link =
    absoluteUrl(readXmlTag(itemXml, "link"), "https://www.gdacs.org") ??
    "https://www.gdacs.org/";
  const alertLevel =
    readXmlTag(itemXml, "gdacs:alertlevel") ??
    readXmlTag(itemXml, "alertlevel");
  const eventTypeCode =
    readXmlTag(itemXml, "gdacs:eventtype") ?? readXmlTag(itemXml, "eventtype");

  return {
    eventType: gdacsEventTypeName(eventTypeCode) ?? inferGdacsEventType(title),
    id: `gdacs-${slugify(readXmlTag(itemXml, "guid") ?? link)}-${index}`,
    location:
      normalizeText(
        readXmlTag(itemXml, "gdacs:country") ?? readXmlTag(itemXml, "country"),
      ) || undefined,
    publishedAt,
    severity: gdacsAlertToSeverity(alertLevel),
    source: GDACS_SOURCE,
    sourceUrl: "https://www.gdacs.org/",
    summary: trimSummary(readXmlTag(itemXml, "description")),
    title,
    url: link,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, cachedFetchInit("application/json"));

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, cachedFetchInit("application/xml,text/xml"));

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function cachedFetchInit(accept: string): NextFetchInit {
  return {
    headers: {
      Accept: accept,
      "User-Agent": "disaster-response-platform/0.1",
    },
    next: {
      revalidate: DISASTER_NEWS_REFRESH_SECONDS,
    },
    signal: timeoutSignal(),
  };
}

function timeoutSignal(): AbortSignal | undefined {
  const timeout = (
    AbortSignal as typeof AbortSignal & {
      timeout?: (milliseconds: number) => AbortSignal;
    }
  ).timeout;

  return timeout?.(SOURCE_TIMEOUT_MS);
}

function dedupeDisasterNews(items: DisasterNewsItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.source}:${item.url || item.title}:${item.publishedAt.slice(0, 10)}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function reliefWebStatusToSeverity(status?: string): DisasterNewsSeverity {
  if (status === "alert") {
    return "orange";
  }

  if (status === "current") {
    return "green";
  }

  return "unknown";
}

function gdacsAlertToSeverity(alertLevel?: string): DisasterNewsSeverity {
  const normalized = alertLevel?.trim().toLowerCase();

  if (normalized === "red") {
    return "red";
  }

  if (normalized === "orange") {
    return "orange";
  }

  if (normalized === "green") {
    return "green";
  }

  return "unknown";
}

function gdacsEventTypeName(code?: string) {
  const names: Record<string, string> = {
    DR: "Drought",
    EQ: "Earthquake",
    FL: "Flood",
    TC: "Tropical cyclone",
    VO: "Volcano",
    WF: "Wildfire",
  };

  return code ? names[code.trim().toUpperCase()] : undefined;
}

function inferGdacsEventType(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("earthquake")) {
    return "Earthquake";
  }

  if (normalized.includes("flood")) {
    return "Flood";
  }

  if (normalized.includes("cyclone") || normalized.includes("storm")) {
    return "Tropical cyclone";
  }

  if (normalized.includes("volcano")) {
    return "Volcano";
  }

  if (normalized.includes("drought")) {
    return "Drought";
  }

  if (normalized.includes("fire")) {
    return "Wildfire";
  }

  return undefined;
}

function readXmlTag(xml: string, tagName: string) {
  const escapedTag = tagName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const match = xml.match(
    new RegExp(`<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`, "i"),
  );

  if (!match?.[1]) {
    return undefined;
  }

  return decodeXmlEntities(
    match[1]
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]*>/g, " ")
      .trim(),
  );
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function trimSummary(value?: string) {
  const summary = normalizeText(value?.replace(/<[^>]*>/g, " "));

  if (!summary) {
    return undefined;
  }

  return summary.length > 220 ? `${summary.slice(0, 217).trim()}...` : summary;
}

function namesFrom(value: unknown) {
  const values = Array.isArray(value) ? value : [value];
  const names = values
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }

      if (isRecord(entry)) {
        return asString(entry.name);
      }

      return undefined;
    })
    .filter((entry): entry is string => Boolean(entry))
    .map(normalizeText);

  return names.length > 0 ? names.slice(0, 3).join(", ") : undefined;
}

function parseDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toISOString();
}

function absoluteUrl(value: string | undefined, base: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, base).toString();
  } catch {
    return undefined;
  }
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asObject(value: unknown) {
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeText(value?: string) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
