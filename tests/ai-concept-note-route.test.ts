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
  startTime: "2026-06-10T03:20:00+07:00",
  description: "River overflow has displaced low-lying communities.",
  lead: "Maya Chen",
  latestUpdate: "Potable water remains the largest gap.",
  masterBudgetAmount: 125000,
  budgetCurrency: "USD",
  subPrograms: [
    {
      budgetAllocated: 45000,
      id: "subprogram-water",
      name: "Water and Sanitation",
    },
  ],
  fundRequests: [
    {
      amount: 15000,
      currency: "USD",
      purpose: "Emergency water trucking.",
      requestedAt: "2026-06-11T07:35:00+07:00",
      requestedByTeam: "WASH Team",
      status: "approved",
      subProgramName: "Water and Sanitation",
    },
  ],
};

const baseData = {
  getIncident: vi.fn(async (id: string) =>
    id === incident.id ? incident : undefined,
  ),
  getIncidentNeeds: vi.fn(async () => [
    {
      id: "need-water-zone-c",
      incidentId: incident.id,
      category: "Water",
      urgency: "critical",
      quantity: 9000,
      unit: "liters",
      affectedPeople: 3200,
      status: "verified",
      locationName: "Zone C Evacuation Shelter",
      latitude: 13.762,
      longitude: 100.522,
      notes: "Less than six hours of potable water remaining.",
      reportedBy: "Anika Rao",
      createdAt: "2026-06-11T07:35:00+07:00",
    },
  ]),
  getIncidentTasks: vi.fn(async () => []),
  getIncidentResources: vi.fn(async () => []),
  getIncidentTeams: vi.fn(async () => []),
  getIncidentActivities: vi.fn(async () => []),
  getIncidentSitreps: vi.fn(async () => []),
};

function mockDataRepository(overrides: Partial<typeof baseData> = {}) {
  const data = { ...baseData, ...overrides };

  vi.doMock("@/app/lib/data", () => ({
    data,
    formatCurrency: (value: number, currency: string) => `${currency} ${value}`,
    formatDateTime: (value: string) => value,
    formatNumber: (value: number) => value.toLocaleString("en"),
  }));

  return data;
}

function mockOpenAI({
  hasKey,
  draft = "Generated concept note draft",
  error,
}: {
  hasKey: boolean;
  draft?: string;
  error?: Error;
}) {
  const create = error
    ? vi.fn().mockRejectedValue(error)
    : vi.fn().mockResolvedValue({ output_text: draft });
  const getOpenAIClient = vi.fn(() => ({
    responses: { create },
  }));

  vi.doMock("@/app/lib/ai/openai", () => ({
    getOpenAIClient,
    hasOpenAIKey: () => hasKey,
    openaiModel: "gpt-test",
    openaiRequestTimeoutMs: 30000,
  }));

  return { create, getOpenAIClient };
}

function mockAuth() {
  vi.doMock("@/app/lib/auth", () => ({
    isAuthResponse: (value: unknown) => value instanceof Response,
    requireRole: vi.fn(async () => ({
      user: {
        id: "user-coordinator",
        name: "Maya Chen",
        email: "maya.chen@example.org",
        role: "Coordinator",
        organization: "Mercy Malaysia",
      },
    })),
  }));
}

async function loadRoute() {
  return import("@/app/api/ai/incidents/[id]/concept-note/route");
}

describe("AI concept note route", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock("@/app/lib/data");
    vi.doUnmock("@/app/lib/ai/openai");
    vi.doUnmock("@/app/lib/auth");
  });

  it("returns 503 when OPENAI_API_KEY is not configured", async () => {
    const data = mockDataRepository();
    const { getOpenAIClient } = mockOpenAI({ hasKey: false });
    mockAuth();
    const { POST } = await loadRoute();

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ id: incident.id }),
    });
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toEqual({ error: "OPENAI_API_KEY is not configured." });
    expect(data.getIncident).not.toHaveBeenCalled();
    expect(getOpenAIClient).not.toHaveBeenCalled();
  });

  it("returns 404 when the incident does not exist", async () => {
    const data = mockDataRepository();
    const { getOpenAIClient } = mockOpenAI({ hasKey: true });
    mockAuth();
    const { POST } = await loadRoute();

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ id: "missing" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Incident not found" });
    expect(data.getIncident).toHaveBeenCalledWith("missing");
    expect(getOpenAIClient).not.toHaveBeenCalled();
  });

  it("returns a generated draft for a known incident", async () => {
    const data = mockDataRepository();
    const { create } = mockOpenAI({
      hasKey: true,
      draft: "## Project name\nRiverside Flood Response",
    });
    mockAuth();
    const { POST } = await loadRoute();

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ id: incident.id }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      data: {
        draft: "## Project name\nRiverside Flood Response",
        incidentId: incident.id,
        model: "gpt-test",
      },
    });
    expect(data.getIncidentNeeds).toHaveBeenCalledWith(incident.id);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.stringContaining("Water and Sanitation"),
        instructions: expect.stringContaining("humanitarian concept notes"),
        max_output_tokens: 1100,
        model: "gpt-test",
      }),
      expect.objectContaining({
        maxRetries: 0,
        timeout: 30000,
      }),
    );
  });

  it("returns 504 when the OpenAI request times out", async () => {
    mockDataRepository();
    mockOpenAI({
      hasKey: true,
      error: Object.assign(new Error("Connection error."), {
        cause: Object.assign(new Error("The operation was aborted."), {
          name: "AbortError",
        }),
        name: "APIConnectionError",
      }),
    });
    mockAuth();
    const { POST } = await loadRoute();

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ id: incident.id }),
    });
    const payload = await response.json();

    expect(response.status).toBe(504);
    expect(payload).toEqual({
      error: "OpenAI request timed out. Please try again.",
    });
  });

  it("returns 503 when OpenAI rejects the configured model", async () => {
    mockDataRepository();
    mockOpenAI({
      hasKey: true,
      error: Object.assign(new Error("The model does not exist."), {
        status: 404,
      }),
    });
    mockAuth();
    const { POST } = await loadRoute();

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ id: incident.id }),
    });
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toEqual({
      error: "OpenAI model configuration is not valid for concept note drafting.",
    });
  });

  it("returns 429 when OpenAI rate limits or quota blocks the request", async () => {
    mockDataRepository();
    mockOpenAI({
      hasKey: true,
      error: Object.assign(new Error("Rate limit reached."), {
        status: 429,
      }),
    });
    mockAuth();
    const { POST } = await loadRoute();

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ id: incident.id }),
    });
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload).toEqual({
      error: "OpenAI rate limit or quota exceeded. Please try again later.",
    });
  });
});
