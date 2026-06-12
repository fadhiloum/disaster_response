import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  data,
  type NeedReport,
} from "@/app/lib/data";
import { isAuthResponse, requireRole } from "@/app/lib/auth";

const docxContentType =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const incident = await data.getIncident(id);
  const requestUrl = new URL(request.url);

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
  const requestedNoteId = requestUrl.searchParams.get("conceptNoteId");
  const requestedNote = requestedNoteId
    ? await data.getConceptNote(requestedNoteId)
    : undefined;
  const savedNote =
    requestedNote?.incidentId === incident.id
      ? requestedNote
      : await data.getIncidentConceptNote(incident.id);

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

  const baseReplacements: Record<string, string[]> = {
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
  const replacements = savedNote
    ? conceptNoteReplacements(savedNote.content, baseReplacements)
    : baseReplacements;

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(["Admin", "Coordinator"]);

  if (isAuthResponse(auth)) {
    return auth;
  }

  const { id } = await params;

  if (!(await data.getIncident(id))) {
    return Response.json({ error: "Incident not found" }, { status: 404 });
  }

  const payload = await request.json();
  const content =
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as Record<string, unknown>).content === "string"
      ? (payload as Record<string, string>).content.trim()
      : "";

  if (!content) {
    return Response.json(
      { error: "Concept note content is required." },
      { status: 400 },
    );
  }

  const note = await data.createIncidentConceptNoteVersion({
    incidentId: id,
    content,
    updatedBy: auth.user.name,
  });

  return Response.json({ data: note, mode: data.backend }, { status: 200 });
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

const conceptSectionLabels: Array<{
  key: string;
  labels: readonly string[];
  templateLabel: string;
}> = [
  {
    key: "projectName",
    labels: ["project name", "project title"],
    templateLabel: "Project Name",
  },
  { key: "background", labels: ["background"], templateLabel: "Background" },
  {
    key: "targetedCommunity",
    labels: ["targeted community", "target community"],
    templateLabel: "Targeted Community",
  },
  { key: "rationale", labels: ["rationale"], templateLabel: "Rationale" },
  { key: "objectives", labels: ["objectives"], templateLabel: "Objectives" },
  {
    key: "projectOutputs",
    labels: ["project outputs", "outputs"],
    templateLabel: "Project Outputs",
  },
  { key: "timeline", labels: ["timeline"], templateLabel: "Timeline" },
  {
    key: "constraints",
    labels: ["constraints and risks", "constraints", "risks"],
    templateLabel: "Constraints",
  },
  {
    key: "budget",
    labels: ["budget assumptions", "budget"],
    templateLabel: "Budget",
  },
  {
    key: "partners",
    labels: [
      "possible collaborating partners",
      "collaborating partners",
      "partners",
    ],
    templateLabel: "Possible Collaborating Partners",
  },
];

function conceptNoteReplacements(
  content: string,
  baseReplacements: Record<string, string[]>,
) {
  const replacements = { ...baseReplacements };
  const sections = parseConceptNoteSections(content);
  let matchedSection = false;

  for (const section of conceptSectionLabels) {
    const value = sections[section.key];

    if (value?.length) {
      replacements[section.templateLabel] = value;
      matchedSection = true;
    }
  }

  if (!matchedSection) {
    replacements.Background = splitParagraphs(content);
  }

  return replacements;
}

function parseConceptNoteSections(content: string) {
  const sections: Record<string, string[]> = {};
  let currentKey: string | null = null;

  for (const line of content.split("\n")) {
    const key = conceptHeadingKey(line);

    if (key) {
      currentKey = key;
      sections[currentKey] = [];
      continue;
    }

    if (currentKey && line.trim()) {
      sections[currentKey].push(line.trim().replace(/^[-*]\s+/, ""));
    }
  }

  return sections;
}

function conceptHeadingKey(line: string) {
  const normalized = line
    .replace(/^#+\s*/, "")
    .replace(/^\*\*/, "")
    .replace(/\*\*$/, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase();

  return (
    conceptSectionLabels.find((section) =>
      section.labels.includes(normalized),
    )?.key ?? null
  );
}

function splitParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
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
