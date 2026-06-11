import { getIncident, situationReports } from "@/app/lib/demo-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const report = situationReports.find((item) => item.id === id);

  if (!report) {
    return new Response("Situation report not found", { status: 404 });
  }

  const incident = getIncident(report.incidentId);
  const body = [
    `Situation Report: ${incident?.title ?? report.incidentId}`,
    `Reporting period: ${report.reportingPeriod}`,
    "",
    "Summary",
    report.summary,
    "",
    "Current impact",
    report.impact,
    "",
    "Priority needs",
    report.priorityNeeds,
    "",
    "Response actions",
    report.responseActions,
    "",
    "Gaps",
    report.gaps,
    "",
    "Next operational period priorities",
    report.nextPriorities,
    "",
    `Created by: ${report.createdBy}`,
    `Created at: ${report.createdAt}`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-disposition": `attachment; filename="${report.id}.txt"`,
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
