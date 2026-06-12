import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  data,
  type NeedReport,
} from "@/app/lib/data";

const docxContentType =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const incident = await data.getIncident(id);

  if (!incident) {
    return new Response("Incident not found", { status: 404 });
  }

  const templateResponse = await fetch(
    new URL("/templates/concept-note-template.docx", request.url),
  );

  if (!templateResponse.ok) {
    return new Response("Concept note template not found", { status: 500 });
  }

  const templateBytes = new Uint8Array(await templateResponse.arrayBuffer());
  const files = unzipSync(templateBytes);
  const documentXml = strFromU8(files["word/document.xml"]);
  const needs = await data.getIncidentNeeds(incident.id);
  const activities = await data.getIncidentActivities(incident.id);
  const assignedResources = await data.getIncidentResources(incident.id);
  const teams = await data.getIncidentTeams(incident.id);

  const location = [
    incident.locationName,
    incident.state,
    incident.country,
  ].join(", ");
  const priorityNeeds = needs.length
    ? needs
        .map(
          (need) =>
            `${need.category}: ${formatNumber(need.quantity)} ${need.unit} at ${need.locationName}`,
        )
        .join("; ")
    : "No verified priority needs recorded.";
  const deployedItems = assignedResources.length
    ? assignedResources
        .map(
          (resource) =>
            `${resource.quantityCommitted} ${resource.unit} ${resource.name} from ${resource.warehouseLocation}`,
        )
        .join("; ")
    : "No deployed items recorded.";
  const deployedTeamText = teams.length
    ? teams
        .map((team) => `${team.name} (${team.role}) - ${team.members}`)
        .join("; ")
    : "No deployed teams recorded.";
  const partnerText = activities.length
    ? activities
        .map((activity) => `${activity.organization}: ${activity.activity}`)
        .join("; ")
    : "To be confirmed.";
  const totalFundRequested = incident.fundRequests.reduce(
    (total, fundRequest) => total + fundRequest.amount,
    0,
  );
  const remainingBudget = Math.max(
    incident.masterBudgetAmount - totalFundRequested,
    0,
  );
  const fundRequestText = incident.fundRequests.length
    ? incident.fundRequests
        .map(
          (fundRequest) =>
            `${fundRequest.subProgramName}: ${formatCurrency(
              fundRequest.amount,
              fundRequest.currency,
            )} requested by ${fundRequest.requestedByTeam} (${fundRequest.status})`,
        )
        .join("; ")
    : "No fund requests recorded.";

  const replacements: Record<string, string[]> = {
    "Document Reference": [
      `CN-${incident.id.toUpperCase()}-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}`,
    ],
    Author: [incident.lead],
    "Project Name": [incident.title],
    Location: [location],
    Sector: [sectorSummary(incident.disasterType, needs)],
    Background: [incident.description, incident.latestUpdate],
    "Targeted Community": [
      `${formatNumber(incident.affectedPeople)} people affected in ${location}.`,
    ],
    Rationale: [
      `The response has ${incident.openNeeds} open needs and ${incident.resourceGaps} known resource gaps. Priority needs: ${priorityNeeds}`,
    ],
    Objectives: [
      "Stabilize immediate life-saving support for affected communities.",
      "Coordinate deployed teams and items against verified needs.",
      "Maintain a shared operating picture for partners and decision makers.",
    ],
    "Project Outputs": [
      `Deployed teams: ${deployedTeamText}`,
      `Deployed items: ${deployedItems}`,
      `Situation reporting maintained by ${incident.lead}.`,
    ],
    Timeline: [
      `Initial program start: ${formatDateTime(incident.startTime)}.`,
      "Operational period: immediate response and stabilization over the next 14 days.",
    ],
    Constraints: [
      `Access, stock availability, and assessment coverage remain constraints. Current note: ${incident.latestUpdate}`,
    ],
    Budget: [
      `Master budget: ${formatCurrency(
        incident.masterBudgetAmount,
        incident.budgetCurrency,
      )}.`,
      `Fund requests: ${fundRequestText}`,
      `Remaining control balance: ${formatCurrency(
        remainingBudget,
        incident.budgetCurrency,
      )}.`,
      `Current committed items: ${deployedItems}`,
    ],
    "Possible Collaborating Partners": [partnerText],
  };

  const updatedDocumentXml = Object.entries(replacements).reduce(
    (xml, [label, value]) => replaceValueCell(xml, label, value),
    documentXml,
  );

  files["word/document.xml"] = strToU8(updatedDocumentXml);

  const body = zipSync(files, { level: 6 });
  const responseBody = new ArrayBuffer(body.byteLength);
  new Uint8Array(responseBody).set(body);
  const filename = `${incident.id}-concept-note.docx`;

  return new Response(responseBody, {
    headers: {
      "content-disposition": `attachment; filename="${filename}"`,
      "content-type": docxContentType,
    },
  });
}

function sectorSummary(
  disasterType: string,
  needs: NeedReport[],
) {
  const categories = Array.from(new Set(needs.map((need) => need.category)));

  return categories.length
    ? `${disasterType}; ${categories.join(", ")}`
    : disasterType;
}

function replaceValueCell(xml: string, label: string, paragraphs: string[]) {
  return xml.replace(/<w:tr(?:\s|>)[\s\S]*?<\/w:tr>/g, (row) => {
    const cells = row.match(/<w:tc(?:\s|>)[\s\S]*?<\/w:tc>/g);

    if (!cells || cells.length < 2 || cellText(cells[0]) !== label) {
      return row;
    }

    const replacementCell = replaceCellContent(
      cells[1],
      paragraphs.map(paragraphXml).join(""),
    );

    return row.replace(cells[1], replacementCell);
  });
}

function replaceCellContent(cell: string, content: string) {
  const open = cell.match(/^<w:tc(?:\s[^>]*)?>/)?.[0] ?? "<w:tc>";
  const properties = cell.match(/<w:tcPr[\s\S]*?<\/w:tcPr>/)?.[0] ?? "";

  return `${open}${properties}${content}</w:tc>`;
}

function cellText(cell: string) {
  return Array.from(cell.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g))
    .map((match) => match[1])
    .join("")
    .trim();
}

function paragraphXml(value: string) {
  return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(value)}</w:t></w:r></w:p>`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
