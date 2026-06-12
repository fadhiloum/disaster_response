import { data, formatCurrency, formatDateTime, formatNumber } from "@/app/lib/data";
import {
  getOpenAIClient,
  hasOpenAIKey,
  openaiModel,
  openaiRequestTimeoutMs,
} from "@/app/lib/ai/openai";
import { isAuthResponse, requireRole } from "@/app/lib/auth";

export const runtime = "nodejs";

type WebSource = {
  title: string;
  url: string;
};

type ResponseOutputTextLike = {
  annotations?: Array<{
    title?: string;
    type?: string;
    url?: string;
  }>;
  text?: string;
  type?: string;
};

type ResponseOutputMessageLike = {
  content?: ResponseOutputTextLike[];
  type?: string;
};

type ResponseWebSearchCallLike = {
  action?: {
    sources?: Array<{
      url?: string;
    }>;
  };
  type?: string;
};

type ResponseWithSources = {
  output?: Array<ResponseOutputMessageLike | ResponseWebSearchCallLike>;
  output_text: string;
};

const countryCodes: Record<string, string> = {
  Bangladesh: "BD",
  Malaysia: "MY",
  Philippines: "PH",
};

function countryCode(country: string) {
  return countryCodes[country];
}

function isTimeoutError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const cause = error.cause;
  const causeText =
    cause instanceof Error
      ? `${cause.name} ${cause.message}`
      : typeof cause === "string"
        ? cause
        : "";

  return (
    error.name.includes("Timeout") ||
    error.name === "AbortError" ||
    error.message.toLowerCase().includes("timeout") ||
    error.message.toLowerCase().includes("timed out") ||
    causeText.toLowerCase().includes("timeout") ||
    causeText.toLowerCase().includes("timed out") ||
    causeText.toLowerCase().includes("abort")
  );
}

function openAIErrorStatus(error: unknown) {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const { status } = error as { status?: unknown };

  return typeof status === "number" ? status : undefined;
}

function openAIErrorResponse(error: unknown) {
  const status = openAIErrorStatus(error);

  if (status === 401 || status === 403) {
    return Response.json(
      { error: "OpenAI credentials are not authorized for SitRep drafting." },
      { status: 503 },
    );
  }

  if (status === 400 || status === 404) {
    return Response.json(
      { error: "OpenAI model configuration is not valid for SitRep drafting." },
      { status: 503 },
    );
  }

  if (status === 429) {
    return Response.json(
      { error: "OpenAI rate limit or quota exceeded. Please try again later." },
      { status: 429 },
    );
  }

  if (status && status >= 500) {
    return Response.json(
      { error: "OpenAI service is unavailable. Please try again." },
      { status: 503 },
    );
  }

  return Response.json(
    { error: "Unable to generate SitRep draft. Please try again." },
    { status: 503 },
  );
}

function extractWebSources(response: ResponseWithSources): WebSource[] {
  const sources = new Map<string, WebSource>();

  for (const item of response.output ?? []) {
    if (item.type === "web_search_call") {
      for (const source of (item as ResponseWebSearchCallLike).action?.sources ??
        []) {
        if (source.url) {
          sources.set(source.url, { title: source.url, url: source.url });
        }
      }
    }

    if (item.type === "message") {
      for (const content of (item as ResponseOutputMessageLike).content ?? []) {
        for (const annotation of content.annotations ?? []) {
          if (annotation.type === "url_citation" && annotation.url) {
            sources.set(annotation.url, {
              title: annotation.title || annotation.url,
              url: annotation.url,
            });
          }
        }
      }
    }
  }

  return Array.from(sources.values());
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  if (!hasOpenAIKey()) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const { id } = await params;
  const incident = await data.getIncident(id);

  if (!incident) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  const [needs, tasks, resources, teams, activities, sitreps] =
    await Promise.all([
      data.getIncidentNeeds(incident.id),
      data.getIncidentTasks(incident.id),
      data.getIncidentResources(incident.id),
      data.getIncidentTeams(incident.id),
      data.getIncidentActivities(incident.id),
      data.getIncidentSitreps(incident.id),
    ]);
  const generatedAt = new Date().toISOString();

  let response: ResponseWithSources;

  try {
    response = await getOpenAIClient().responses.create(
      {
        include: ["web_search_call.action.sources"],
        model: openaiModel,
        instructions:
          "You draft concise humanitarian situation reports for emergency responders. Use supplied program facts as the internal operating picture. Use web search for recent external context from local disaster management authorities, government agencies, other NGOs, IFRC/Red Cross/Crescent, OCHA/ReliefWeb, UN agencies, or reputable local media. Do not invent values. Clearly flag unverified external context and cite web-sourced claims inline.",
        max_output_tokens: 1100,
        input: [
          "Draft a situation report with these headings:",
          "Summary",
          "Current impact",
          "Priority needs",
          "Response actions",
          "Gaps",
          "Next operational period priorities",
          "",
          "Before drafting, search the web for the latest relevant external updates about this disaster/program location and disaster type. Prioritize official local disaster management authorities, government sources, other NGOs, IFRC/Red Cross/Crescent, OCHA/ReliefWeb, UN agencies, and reputable local media. Use only recent external information that is directly relevant to this program. Cite external claims inline.",
          "",
          `Draft generated at: ${generatedAt}`,
          "",
          "Program context:",
          JSON.stringify(
            {
              incident: {
                title: incident.title,
                disasterType: incident.disasterType,
                severity: incident.severity,
                status: incident.status,
                location: {
                  name: incident.locationName,
                  state: incident.state,
                  country: incident.country,
                  latitude: incident.latitude,
                  longitude: incident.longitude,
                },
                affectedPeople: formatNumber(incident.affectedPeople),
                openNeeds: incident.openNeeds,
                resourceGaps: incident.resourceGaps,
                assignedTeams: incident.assignedTeams,
                masterBudget: formatCurrency(
                  incident.masterBudgetAmount,
                  incident.budgetCurrency,
                ),
                fundRequests: incident.fundRequests.map((fundRequest) => ({
                  subProgramName: fundRequest.subProgramName,
                  requestedByTeam: fundRequest.requestedByTeam,
                  amount: formatCurrency(
                    fundRequest.amount,
                    fundRequest.currency,
                  ),
                  status: fundRequest.status,
                  purpose: fundRequest.purpose,
                })),
                started: formatDateTime(incident.startTime),
                lead: incident.lead,
                description: incident.description,
                latestUpdate: incident.latestUpdate,
              },
              needs,
              tasks,
              resources,
              teams,
              activities,
              previousReports: sitreps.slice(0, 2),
            },
            null,
            2,
          ),
        ].join("\n"),
        tool_choice: "required",
        tools: [
          {
            search_context_size: "low",
            type: "web_search",
            user_location: {
              country: countryCode(incident.country),
              region: incident.state,
              type: "approximate",
            },
          },
        ],
      },
      {
        maxRetries: 0,
        timeout: Number.isFinite(openaiRequestTimeoutMs)
          ? openaiRequestTimeoutMs
          : 30000,
      },
    );
  } catch (error) {
    if (isTimeoutError(error)) {
      return Response.json(
        { error: "OpenAI request timed out. Please try again." },
        { status: 504 },
      );
    }

    return openAIErrorResponse(error);
  }

  return Response.json({
    data: {
      draft: response.output_text,
      incidentId: incident.id,
      model: openaiModel,
      sources: extractWebSources(response),
    },
  });
}
