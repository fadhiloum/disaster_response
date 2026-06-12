import { afterEach, describe, expect, it, vi } from "vitest";

const incident = {
  id: "flood-riverside",
  title: "Riverside Flood Response",
  disasterType: "flood",
  severity: "critical",
  status: "active",
  region: "Asia Pacific",
  country: "Malaysia",
  state: "Sabah",
  locationName: "Kota Belud District",
  latitude: 6.351,
  longitude: 116.43,
  affectedPeople: 18400,
  openNeeds: 12,
  resourceGaps: 5,
  assignedTeams: 8,
  startTime: "2026-06-10T03:20:00.000Z",
  description: "River overflow has displaced low-lying communities.",
  lead: "Maya Chen",
  latestUpdate: "Water remains the largest gap.",
  budgetCurrency: "MYR",
  masterBudgetAmount: 750000,
  subPrograms: [{ id: "sub-wash", name: "WASH", budgetAllocated: 210000 }],
  fundRequests: [],
} as const;

const createPayload = {
  title: "New Flood Response",
  disasterType: "flood",
  severity: "high",
  status: "active",
  region: "Asia Pacific",
  country: "Malaysia",
  state: "Sabah",
  locationName: "Kota Belud",
  latitude: 6.351,
  longitude: 116.43,
  startTime: "2026-06-12T03:00:00.000Z",
  description: "Initial response setup.",
  latestUpdate: "Assessment teams deployed.",
  budgetCurrency: "MYR",
  masterBudgetAmount: 120000,
  subPrograms: [{ name: "WASH", budgetAllocated: 50000 }],
  fundRequests: [
    {
      subProgramName: "WASH",
      requestedByTeam: "Field Team North",
      amount: 25000,
      currency: "MYR",
      purpose: "Water trucking",
      status: "requested",
      requestedAt: "2026-06-12T04:00:00.000Z",
    },
  ],
};

function mockDataRepository(
  options: { existingIncident?: typeof incident } = { existingIncident: incident },
) {
  const data = {
    backend: "demo",
    createAuditLog: vi.fn(async (input) => ({
      ...input,
      id: "audit-incident",
      before: null,
      after: null,
      createdAt: "2026-06-12T05:00:00.000Z",
    })),
    listIncidents: vi.fn(async () => [incident]),
    getIncident: vi.fn(async () => options.existingIncident),
    createIncident: vi.fn(async () => ({
      ...incident,
      ...createPayload,
      id: "new-incident",
      affectedPeople: 0,
      openNeeds: 0,
      resourceGaps: 0,
      assignedTeams: 0,
      lead: "Maya Chen",
    })),
    updateIncident: vi.fn(async () => ({
      ...incident,
      title: "Updated Flood Response",
    })),
    deleteIncident: vi.fn(async () => true),
  };

  vi.doMock("@/app/lib/data", () => ({ data }));

  return data;
}

function mockAuth(
  result: unknown = {
    user: {
      id: "user-coordinator",
      name: "Maya Chen",
      email: "maya.chen@example.org",
      role: "Coordinator",
      organization: "Mercy Malaysia",
    },
  },
) {
  vi.doMock("@/app/lib/auth", () => ({
    isAuthResponse: (value: unknown) => value instanceof Response,
    requireRole: vi.fn(async () => result),
  }));
}

describe("Incident routes", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock("@/app/lib/data");
    vi.doUnmock("@/app/lib/auth");
  });

  it("creates a program through the data repository", async () => {
    const data = mockDataRepository();
    mockAuth();
    const { POST } = await import("@/app/api/incidents/route");

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify(createPayload),
        method: "POST",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.id).toBe("new-incident");
    expect(data.createIncident).toHaveBeenCalledWith({
      ...createPayload,
      createdById: "user-coordinator",
    });
  });

  it("rejects invalid create payloads", async () => {
    const data = mockDataRepository();
    mockAuth();
    const { POST } = await import("@/app/api/incidents/route");

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({ title: "Only title" }),
        method: "POST",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("disasterType");
    expect(data.createIncident).not.toHaveBeenCalled();
  });

  it("updates a program through the data repository", async () => {
    const data = mockDataRepository();
    mockAuth();
    const { PATCH } = await import("@/app/api/incidents/[id]/route");

    const response = await PATCH(
      new Request("http://localhost", {
        body: JSON.stringify({
          title: "Updated Flood Response",
          severity: "moderate",
        }),
        method: "PATCH",
      }),
      { params: Promise.resolve({ id: incident.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.title).toBe("Updated Flood Response");
    expect(data.updateIncident).toHaveBeenCalledWith(incident.id, {
      title: "Updated Flood Response",
      severity: "moderate",
    });
  });

  it("returns 404 before updating a missing program", async () => {
    const data = mockDataRepository({ existingIncident: undefined });
    mockAuth();
    const { PATCH } = await import("@/app/api/incidents/[id]/route");

    const response = await PATCH(
      new Request("http://localhost", {
        body: JSON.stringify({ title: "Updated Flood Response" }),
        method: "PATCH",
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(response.status).toBe(404);
    expect(data.updateIncident).not.toHaveBeenCalled();
  });

  it("deletes a program through the data repository", async () => {
    const data = mockDataRepository();
    mockAuth();
    const { DELETE } = await import("@/app/api/incidents/[id]/route");

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: incident.id }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ data: { id: incident.id }, mode: "demo" });
    expect(data.deleteIncident).toHaveBeenCalledWith(incident.id);
  });
});
