import { afterEach, describe, expect, it, vi } from "vitest";

const incident = {
  id: "flood-riverside",
  title: "Riverside Flood Response",
};

const createPayload = {
  summary: "Shelter demand remains elevated.",
  impact: "18,400 people are affected.",
  priorityNeeds: "Water and mobile clinic coverage.",
  responseActions: "Teams are extending shelter supply.",
  gaps: "Water trucking is constrained.",
  nextPriorities: "Stabilize Zone C shelter support.",
};

const savedReport = {
  id: "sitrep-new",
  incidentId: incident.id,
  reportingPeriod: "12 Jun 2026 AI-reviewed draft",
  ...createPayload,
  createdBy: "Maya Chen",
  createdAt: "2026-06-12T10:00:00.000Z",
};

function mockDataRepository(
  options: { existingIncident?: typeof incident } = {
    existingIncident: incident,
  },
) {
  const data = {
    backend: "demo",
    getIncident: vi.fn(async () => options.existingIncident),
    getIncidentSitreps: vi.fn(async () => [savedReport]),
    createSituationReport: vi.fn(async () => savedReport),
  };

  vi.doMock("@/app/lib/data", () => ({ data }));

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
  return import("@/app/api/incidents/[id]/sitreps/route");
}

async function loadExportRoute() {
  return import("@/app/api/sitreps/[id]/export/route");
}

describe("SitRep route", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock("@/app/lib/data");
    vi.doUnmock("@/app/lib/auth");
  });

  it("returns 404 when the incident does not exist", async () => {
    const data = mockDataRepository({ existingIncident: undefined });
    mockAuth();
    const { POST } = await loadRoute();

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify(createPayload),
        method: "POST",
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Incident not found" });
    expect(data.createSituationReport).not.toHaveBeenCalled();
  });

  it("returns 400 when required SitRep fields are missing", async () => {
    const data = mockDataRepository();
    mockAuth();
    const { POST } = await loadRoute();

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({ summary: "Only summary" }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: incident.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("impact");
    expect(payload.error).toContain("nextPriorities");
    expect(data.createSituationReport).not.toHaveBeenCalled();
  });

  it("persists a valid reviewed SitRep draft", async () => {
    const data = mockDataRepository();
    mockAuth();
    const { POST } = await loadRoute();

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({
          ...createPayload,
          reportingPeriod: "12 Jun 2026 AI-reviewed draft",
          reportingPeriodStart: "2026-06-12T03:00:00.000Z",
          reportingPeriodEnd: "2026-06-12T03:00:00.000Z",
        }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: incident.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({ data: savedReport, mode: "demo" });
    expect(data.createSituationReport).toHaveBeenCalledWith({
      incidentId: incident.id,
      reportingPeriod: "12 Jun 2026 AI-reviewed draft",
      reportingPeriodStart: "2026-06-12T03:00:00.000Z",
      reportingPeriodEnd: "2026-06-12T03:00:00.000Z",
      ...createPayload,
    });
  });

  it("requires a coordinator or admin to persist a SitRep", async () => {
    const data = mockDataRepository();
    mockAuth(Response.json({ error: "Authentication required" }, { status: 401 }));
    const { POST } = await loadRoute();

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify(createPayload),
        method: "POST",
      }),
      { params: Promise.resolve({ id: incident.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ error: "Authentication required" });
    expect(data.getIncident).not.toHaveBeenCalled();
    expect(data.createSituationReport).not.toHaveBeenCalled();
  });

  it("exports a SitRep as PDF when requested", async () => {
    vi.doMock("@/app/lib/data", () => ({
      data: {
        getIncident: vi.fn(async () => incident),
        listSituationReports: vi.fn(async () => [savedReport]),
      },
    }));
    const { GET } = await loadExportRoute();

    const response = await GET(
      new Request("http://localhost/api/sitreps/sitrep-new/export?format=pdf"),
      { params: Promise.resolve({ id: savedReport.id }) },
    );
    const body = new TextDecoder().decode(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain("sitrep-new.pdf");
    expect(body).toContain("%PDF-1.4");
    expect(body).toContain("Riverside Flood Response");
  });

  it("keeps long SitRep PDF exports across multiple pages", async () => {
    const longReport = {
      ...savedReport,
      summary: Array.from({ length: 240 }, (_value, index) => `summary line ${index + 1}`)
        .join(" "),
      nextPriorities: "final marker after pagination",
    };
    vi.doMock("@/app/lib/data", () => ({
      data: {
        getIncident: vi.fn(async () => incident),
        listSituationReports: vi.fn(async () => [longReport]),
      },
    }));
    const { GET } = await loadExportRoute();

    const response = await GET(
      new Request("http://localhost/api/sitreps/sitrep-new/export?format=pdf"),
      { params: Promise.resolve({ id: savedReport.id }) },
    );
    const body = new TextDecoder().decode(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(body).toMatch(/\/Count [2-9]/);
    expect(body).toContain("final marker after pagination");
  });
});
