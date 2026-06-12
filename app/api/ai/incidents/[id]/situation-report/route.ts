import { data, formatDateTime, formatNumber } from "@/app/lib/data";
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

  return (
    error.name.includes("Timeout") ||
    error.name === "AbortError" ||
    error.message.toLowerCase().includes("timeout")
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

  let response;

  try {
    response = await getOpenAIClient().responses.create(
      {
        model: openaiModel,
        instructions:
          "You draft concise humanitarian situation reports. Use only the supplied incident facts. If a value is unknown, say it is to be confirmed. Keep the tone operational, neutral, and suitable for responders.",
        input: [
          "Draft a situation report with these headings:",
          "Summary",
          "Current impact",
          "Priority needs",
          "Response actions",
          "Gaps",
          "Next operational period priorities",
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
          : 8000,
      },
    );
  } catch (error) {
    if (isTimeoutError(error)) {
      return Response.json(
        { error: "OpenAI request timed out. Please try again." },
        { status: 504 },
      );
    }

    return Response.json(
      { error: "Unable to generate SitRep draft." },
      { status: 502 },
    );
  }

  return Response.json({
    data: {
      draft: response.output_text,
      incidentId: incident.id,
      model: openaiModel,
    },
  });
}
