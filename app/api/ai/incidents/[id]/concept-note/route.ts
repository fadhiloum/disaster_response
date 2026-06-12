import {
  data,
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "@/app/lib/data";
import {
  getOpenAIClient,
  hasOpenAIKey,
  openaiModel,
  openaiRequestTimeoutMs,
} from "@/app/lib/ai/openai";
import { isAuthResponse, requireRole } from "@/app/lib/auth";

export const runtime = "nodejs";

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
      { error: "OpenAI credentials are not authorized for concept note drafting." },
      { status: 503 },
    );
  }

  if (status === 400 || status === 404) {
    return Response.json(
      { error: "OpenAI model configuration is not valid for concept note drafting." },
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
    { error: "Unable to generate concept note draft. Please try again." },
    { status: 503 },
  );
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
  const totalFundRequested = incident.fundRequests.reduce(
    (total, fundRequest) => total + fundRequest.amount,
    0,
  );
  const remainingBudget = Math.max(
    incident.masterBudgetAmount - totalFundRequested,
    0,
  );

  try {
    const response = await getOpenAIClient().responses.create(
      {
        model: openaiModel,
        instructions:
          "You draft concise humanitarian concept notes for response coordinators. Use only the supplied incident facts. If a value is unknown, say it is to be confirmed. Keep the tone operational, neutral, and suitable for donor or partner review.",
        max_output_tokens: 1100,
        input: [
          "Draft a concept note with these headings:",
          "Project name",
          "Background",
          "Targeted community",
          "Rationale",
          "Objectives",
          "Project outputs",
          "Timeline",
          "Constraints and risks",
          "Budget assumptions",
          "Possible collaborating partners",
          "Next steps",
          "",
          "Incident context:",
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
                started: formatDateTime(incident.startTime),
                lead: incident.lead,
                description: incident.description,
                latestUpdate: incident.latestUpdate,
                masterBudget: formatCurrency(
                  incident.masterBudgetAmount,
                  incident.budgetCurrency,
                ),
                fundRequested: formatCurrency(
                  totalFundRequested,
                  incident.budgetCurrency,
                ),
                remainingControlBalance: formatCurrency(
                  remainingBudget,
                  incident.budgetCurrency,
                ),
                subPrograms: incident.subPrograms,
                fundRequests: incident.fundRequests,
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
      },
      {
        maxRetries: 0,
        timeout: Number.isFinite(openaiRequestTimeoutMs)
          ? openaiRequestTimeoutMs
          : 30000,
      },
    );

    return Response.json({
      data: {
        draft: response.output_text,
        incidentId: incident.id,
        model: openaiModel,
      },
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      return Response.json(
        { error: "OpenAI request timed out. Please try again." },
        { status: 504 },
      );
    }

    return openAIErrorResponse(error);
  }
}
