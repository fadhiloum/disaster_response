import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { afterEach, describe, expect, it, vi } from "vitest";

const incident = {
  id: "flood-riverside",
  title: "Riverside Flood Response",
  disasterType: "flood",
  country: "Malaysia",
  state: "Sabah",
  locationName: "Kota Belud District",
  affectedPeople: 18400,
  openNeeds: 12,
  resourceGaps: 5,
  startTime: "2026-06-10T03:20:00+07:00",
  description: "River overflow has displaced low-lying communities.",
  lead: "Maya Chen",
  latestUpdate: "Potable water remains the largest gap.",
  masterBudgetAmount: 125000,
  budgetCurrency: "USD",
  fundRequests: [],
};

const savedConceptNote = {
  id: "concept-note-001",
  incidentId: incident.id,
  version: 2,
  content: "## Background\nSaved AI background\n\n## Objectives\nSaved objective",
  status: "draft",
  updatedBy: "Maya Chen",
  createdAt: "2026-06-12T04:00:00.000Z",
  updatedAt: "2026-06-12T04:05:00.000Z",
};

function mockDataRepository(
  overrides: {
    existingIncident?: typeof incident;
    conceptNote?: typeof savedConceptNote;
    selectedConceptNote?: typeof savedConceptNote;
  } = {
    existingIncident: incident,
    conceptNote: undefined,
    selectedConceptNote: undefined,
  },
) {
  const data = {
    backend: "demo",
    createAuditLog: vi.fn(async (input) => ({
      ...input,
      id: "audit-concept-note",
      before: null,
      after: null,
      createdAt: "2026-06-12T10:01:00.000Z",
    })),
    getIncident: vi.fn(async () => overrides.existingIncident),
    getIncidentNeeds: vi.fn(async () => []),
    getIncidentActivities: vi.fn(async () => []),
    getIncidentResources: vi.fn(async () => []),
    getIncidentTeams: vi.fn(async () => []),
    getIncidentConceptNote: vi.fn(async () => overrides.conceptNote),
    getIncidentConceptNotes: vi.fn(async () =>
      overrides.conceptNote ? [overrides.conceptNote] : [],
    ),
    getConceptNote: vi.fn(async () => overrides.selectedConceptNote),
    createIncidentConceptNoteVersion: vi.fn(async () => savedConceptNote),
  };

  vi.doMock("@/app/lib/data", () => ({
    data,
    formatCurrency: (value: number, currency: string) => `${currency} ${value}`,
    formatDateTime: (value: string) => value,
    formatNumber: (value: number) => value.toLocaleString("en"),
  }));

  return data;
}

function mockAuth(result: unknown = {
  user: {
    id: "user-coordinator",
    name: "Maya Chen",
    email: "maya.chen@example.org",
    role: "Coordinator",
    organization: "Mercy Malaysia",
  },
}) {
  vi.doMock("@/app/lib/auth", () => ({
    isAuthResponse: (value: unknown) => value instanceof Response,
    requireRole: vi.fn(async () => result),
  }));
}

async function loadRoute() {
  return import("@/app/api/incidents/[id]/concept-note/route");
}

function templateDocx() {
  const documentXml = [
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>',
    rowXml("Background", "Generated background"),
    rowXml("Objectives", "Generated objectives"),
    "</w:body></w:document>",
  ].join("");
  const zipped = zipSync({ "word/document.xml": strToU8(documentXml) });
  const body = new ArrayBuffer(zipped.byteLength);

  new Uint8Array(body).set(zipped);

  return body;
}

function rowXml(label: string, value: string) {
  return `<w:tr><w:tc><w:p><w:r><w:t>${label}</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>${value}</w:t></w:r></w:p></w:tc></w:tr>`;
}

describe("concept note route", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.doUnmock("@/app/lib/data");
    vi.doUnmock("@/app/lib/auth");
  });

  it("persists a reviewed concept note draft", async () => {
    const data = mockDataRepository();
    mockAuth();
    const { POST } = await loadRoute();

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({ content: savedConceptNote.content }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: incident.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ data: savedConceptNote, mode: "demo" });
    expect(data.createIncidentConceptNoteVersion).toHaveBeenCalledWith({
      incidentId: incident.id,
      content: savedConceptNote.content,
      updatedBy: "Maya Chen",
    });
  });

  it("returns 400 when concept note content is missing", async () => {
    const data = mockDataRepository();
    mockAuth();
    const { POST } = await loadRoute();

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({ content: "   " }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: incident.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Concept note content is required." });
    expect(data.createIncidentConceptNoteVersion).not.toHaveBeenCalled();
  });

  it("requires a coordinator or admin to save a concept note", async () => {
    const data = mockDataRepository();
    mockAuth(Response.json({ error: "Authentication required" }, { status: 401 }));
    const { POST } = await loadRoute();

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({ content: savedConceptNote.content }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: incident.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ error: "Authentication required" });
    expect(data.getIncident).not.toHaveBeenCalled();
    expect(data.createIncidentConceptNoteVersion).not.toHaveBeenCalled();
  });

  it("exports saved concept note content when available", async () => {
    mockDataRepository({ existingIncident: incident, conceptNote: savedConceptNote });
    mockAuth();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(templateDocx(), { status: 200 })),
    );
    const { GET } = await loadRoute();

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: incident.id }),
    });
    const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
    const documentXml = strFromU8(files["word/document.xml"]);

    expect(response.status).toBe(200);
    expect(documentXml).toContain("Saved AI background");
    expect(documentXml).toContain("Saved objective");
    expect(documentXml).not.toContain("Generated background");
  });

  it("exports a selected concept note version", async () => {
    const selectedConceptNote = {
      ...savedConceptNote,
      id: "concept-note-older",
      version: 1,
      content: "## Background\nOlder saved background",
    };
    const data = mockDataRepository({
      existingIncident: incident,
      conceptNote: savedConceptNote,
      selectedConceptNote,
    });
    mockAuth();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(templateDocx(), { status: 200 })),
    );
    const { GET } = await loadRoute();

    const response = await GET(
      new Request(
        "http://localhost/api/incidents/flood-riverside/concept-note?conceptNoteId=concept-note-older",
      ),
      { params: Promise.resolve({ id: incident.id }) },
    );
    const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
    const documentXml = strFromU8(files["word/document.xml"]);

    expect(response.status).toBe(200);
    expect(data.getConceptNote).toHaveBeenCalledWith("concept-note-older");
    expect(documentXml).toContain("Older saved background");
    expect(documentXml).not.toContain("Saved AI background");
  });
});
