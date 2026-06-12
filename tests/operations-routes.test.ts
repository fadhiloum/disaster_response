import { afterEach, describe, expect, it, vi } from "vitest";

const incident = { id: "flood-riverside", title: "Riverside Flood Response" };
const need = {
  id: "need-water",
  incidentId: incident.id,
  category: "Water",
  quantity: 500,
  status: "reported",
  createdAt: "2026-06-12T04:00:00.000Z",
};
const task = {
  id: "task-assess",
  incidentId: incident.id,
  title: "Assess Zone C",
  status: "todo",
};
const resource = {
  id: "res-water",
  category: "Water",
  name: "Water packs",
  quantityAvailable: 1000,
  quantityCommitted: 120,
  assignedIncidentId: null,
  unit: "packs",
};
const activity = {
  id: "act-clinic",
  incidentId: incident.id,
  organization: "Mercy Malaysia",
  status: "planned",
};

function mockDataRepository(options: { incidentExists?: boolean } = {}) {
  const data = {
    backend: "demo",
    getIncident: vi.fn(async () =>
      options.incidentExists === false ? undefined : incident,
    ),
    getIncidentNeeds: vi.fn(async () => [need]),
    createNeed: vi.fn(async (input) => ({ ...need, ...input, status: "reported" })),
    updateNeed: vi.fn(async (id, input) => ({ ...need, ...input, id })),
    getIncidentTasks: vi.fn(async () => [task]),
    createTask: vi.fn(async (input) => ({ ...task, ...input, status: "todo" })),
    updateTask: vi.fn(async (id, input) => ({ ...task, ...input, id })),
    getIncidentActivities: vi.fn(async () => [activity]),
    createPartnerActivity: vi.fn(async (input) => ({
      ...activity,
      ...input,
      status: input.status ?? "planned",
    })),
    updatePartnerActivity: vi.fn(async (id, input) => ({ ...activity, ...input, id })),
    listResources: vi.fn(async () => [resource]),
    createResource: vi.fn(async (input) => ({
      ...resource,
      ...input,
      id: "res-new",
      assignedIncidentId: null,
      quantityCommitted: input.quantityCommitted ?? 0,
    })),
    updateResource: vi.fn(async (id, input) => ({ ...resource, ...input, id })),
    commitResource: vi.fn(async (id, input) => ({
      ...resource,
      id,
      quantityCommitted: resource.quantityCommitted + input.quantity,
      assignedIncidentId: input.incidentId,
    })),
    listPartnerActivities: vi.fn(async () => [activity]),
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
  const requireRole = vi.fn(async () => result);

  vi.doMock("@/app/lib/auth", () => ({
    isAuthResponse: (value: unknown) => value instanceof Response,
    requireRole,
  }));

  return requireRole;
}

describe("Operational routes", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock("@/app/lib/data");
    vi.doUnmock("@/app/lib/auth");
  });

  it("returns incident needs for an existing program", async () => {
    const data = mockDataRepository();
    const { GET } = await import("@/app/api/incidents/[id]/needs/route");

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: incident.id }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ data: [need] });
    expect(data.getIncidentNeeds).toHaveBeenCalledWith(incident.id);
  });

  it("returns 404 before listing tasks for a missing program", async () => {
    const data = mockDataRepository({ incidentExists: false });
    const { GET } = await import("@/app/api/incidents/[id]/tasks/route");

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "missing" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Incident not found" });
    expect(data.getIncidentTasks).not.toHaveBeenCalled();
  });

  it("allows responders to report needs and adds route defaults", async () => {
    const data = mockDataRepository();
    const requireRole = mockAuth();
    const { POST } = await import("@/app/api/incidents/[id]/needs/route");

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({ category: "Water", quantity: 500 }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: incident.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(requireRole).toHaveBeenCalledWith([
      "Admin",
      "Coordinator",
      "Responder",
    ]);
    expect(payload.data).toMatchObject({
      incidentId: incident.id,
      category: "Water",
      quantity: 500,
      status: "reported",
    });
    expect(data.createNeed).toHaveBeenCalledWith(
      expect.objectContaining({
        incidentId: incident.id,
        category: "Water",
        quantity: 500,
        reportedById: "user-coordinator",
      }),
    );
  });

  it("requires coordinator-level access to create tasks", async () => {
    const data = mockDataRepository();
    const requireRole = mockAuth();
    const { POST } = await import("@/app/api/incidents/[id]/tasks/route");

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({ title: "Assess Zone C" }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: incident.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(requireRole).toHaveBeenCalledWith(["Admin", "Coordinator"]);
    expect(payload.data).toMatchObject({
      incidentId: incident.id,
      status: "todo",
      title: "Assess Zone C",
    });
    expect(data.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        incidentId: incident.id,
        title: "Assess Zone C",
        createdById: "user-coordinator",
      }),
    );
  });

  it("requires partner-capable access to create activities", async () => {
    const data = mockDataRepository();
    const requireRole = mockAuth();
    const { POST } = await import("@/app/api/incidents/[id]/activities/route");

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({ organization: "Mercy Malaysia" }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: incident.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(requireRole).toHaveBeenCalledWith([
      "Admin",
      "Coordinator",
      "Partner",
    ]);
    expect(payload.data).toMatchObject({
      incidentId: incident.id,
      organization: "Mercy Malaysia",
      status: "planned",
    });
    expect(data.createPartnerActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        incidentId: incident.id,
        organization: "Mercy Malaysia",
        contactName: "Maya Chen",
      }),
    );
  });

  it("returns 401 before reading data when resource creation is unauthenticated", async () => {
    const data = mockDataRepository();
    mockAuth(Response.json({ error: "Authentication required" }, { status: 401 }));
    const { POST } = await import("@/app/api/resources/route");

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({ name: "Water packs" }),
        method: "POST",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ error: "Authentication required" });
    expect(data.listResources).not.toHaveBeenCalled();
  });

  it("validates resource commit quantities", async () => {
    const data = mockDataRepository();
    mockAuth();
    const { POST } = await import("@/app/api/resources/[id]/commit/route");

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({ incidentId: incident.id, quantity: 0 }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: resource.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Commit quantity must be greater than zero" });
    expect(data.listResources).toHaveBeenCalled();
  });

  it("updates committed resource quantity for valid commit requests", async () => {
    const data = mockDataRepository();
    mockAuth();
    const { POST } = await import("@/app/api/resources/[id]/commit/route");

    const response = await POST(
      new Request("http://localhost", {
        body: JSON.stringify({ incidentId: incident.id, quantity: 30 }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: resource.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toMatchObject({
      id: resource.id,
      quantityCommitted: 150,
      assignedIncidentId: incident.id,
    });
    expect(data.commitResource).toHaveBeenCalledWith(resource.id, {
      incidentId: incident.id,
      quantity: 30,
      note: undefined,
    });
  });

  it("requires partner-capable access to patch activities", async () => {
    const data = mockDataRepository();
    const requireRole = mockAuth();
    const { PATCH } = await import("@/app/api/activities/[id]/route");

    const response = await PATCH(
      new Request("http://localhost", {
        body: JSON.stringify({ status: "complete" }),
        method: "PATCH",
      }),
      { params: Promise.resolve({ id: activity.id }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(requireRole).toHaveBeenCalledWith([
      "Admin",
      "Coordinator",
      "Partner",
    ]);
    expect(payload.data).toMatchObject({ id: activity.id, status: "complete" });
    expect(data.updatePartnerActivity).toHaveBeenCalledWith(activity.id, {
      activity: undefined,
      contactName: undefined,
      contactPhone: undefined,
      endDate: undefined,
      incidentId: undefined,
      latitude: undefined,
      locationName: undefined,
      longitude: undefined,
      organization: undefined,
      organizationId: undefined,
      sector: undefined,
      startDate: undefined,
      status: "complete",
    });
  });
});
