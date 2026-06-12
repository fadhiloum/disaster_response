import { afterEach, describe, expect, it, vi } from "vitest";
import type { CreateIncidentInput } from "@/app/lib/data/repository";

const user = {
  id: "user-coordinator",
  name: "Maya Chen",
  email: "maya.chen@example.org",
  role: "COORDINATOR",
  organizationId: null,
  createdAt: new Date("2026-06-10T00:00:00.000Z"),
};

const incidentRecord = {
  id: "incident-new",
  title: "New Flood Response",
  disasterType: "FLOOD",
  severity: "HIGH",
  status: "ACTIVE",
  region: "Asia Pacific",
  country: "Malaysia",
  state: "Sabah",
  description: "Initial response setup.",
  latestUpdate: "Assessment teams deployed.",
  latitude: 6.351,
  longitude: 116.43,
  locationName: "Kota Belud",
  startTime: new Date("2026-06-12T03:00:00.000Z"),
  budgetCurrency: "MYR",
  masterBudgetAmount: 120000,
  createdById: user.id,
  createdAt: new Date("2026-06-12T03:00:00.000Z"),
  updatedAt: new Date("2026-06-12T03:00:00.000Z"),
  createdBy: user,
  needs: [],
  tasks: [],
  subPrograms: [{ id: "sub-wash", name: "WASH", budgetAllocated: 50000 }],
  fundRequests: [
    {
      id: "fund-wash",
      incidentId: "incident-new",
      subProgramName: "WASH",
      requestedByTeam: "Field Team North",
      amount: 25000,
      currency: "MYR",
      purpose: "Water trucking",
      status: "requested",
      requestedAt: new Date("2026-06-12T04:00:00.000Z"),
      approvedAt: null,
      releasedAt: null,
    },
  ],
};

const sitrepRecord = {
  id: "sitrep-new",
  incidentId: incidentRecord.id,
  reportingPeriodStart: new Date("2026-06-12T03:00:00.000Z"),
  reportingPeriodEnd: new Date("2026-06-12T03:00:00.000Z"),
  summary: "Initial operational summary.",
  impact: "18,400 people affected.",
  priorityNeeds: "Water and shelter kits.",
  responseActions: "Teams deployed.",
  gaps: "Access constraints remain.",
  nextPriorities: "Stabilize Zone C.",
  status: "draft",
  revision: 1,
  createdById: user.id,
  createdBy: user,
  createdAt: new Date("2026-06-12T04:00:00.000Z"),
  updatedAt: new Date("2026-06-12T04:00:00.000Z"),
  submittedAt: null,
  reviewedAt: null,
  reviewedBy: null,
  reviewComment: null,
};

const auditLogRecord = {
  id: "audit-1",
  actorId: user.id,
  actorName: user.name,
  action: "status",
  entityType: "sitrep",
  entityId: sitrepRecord.id,
  summary: "Changed SitRep status from draft to approved",
  before: "{\"status\":\"draft\"}",
  after: "{\"status\":\"approved\"}",
  createdAt: new Date("2026-06-12T05:00:00.000Z"),
};

const createInput: CreateIncidentInput = {
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
  createdById: user.id,
  subPrograms: [{ id: "sub-wash", name: "WASH", budgetAllocated: 50000 }],
  fundRequests: [
    {
      id: "fund-wash",
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

function createPrismaMock() {
  const tx = {
    incident: {
      create: vi.fn(async () => ({ id: incidentRecord.id })),
      update: vi.fn(async () => ({ id: incidentRecord.id })),
      findUniqueOrThrow: vi.fn(async () => incidentRecord),
    },
    programSubProgram: {
      createMany: vi.fn(async () => ({ count: 1 })),
      deleteMany: vi.fn(async () => ({ count: 1 })),
    },
    fundRequest: {
      createMany: vi.fn(async () => ({ count: 1 })),
      deleteMany: vi.fn(async () => ({ count: 1 })),
    },
  };
  const prisma = {
    user: {
      findUnique: vi.fn(async () => user),
      findFirst: vi.fn(async () => user),
    },
    incident: {
      findUnique: vi.fn<() => Promise<typeof incidentRecord | null>>(
        async () => incidentRecord,
      ),
      delete: vi.fn(async () => incidentRecord),
    },
    situationReport: {
      findUnique: vi.fn(async () => sitrepRecord),
      update: vi.fn(async ({ data }) => ({
        ...sitrepRecord,
        ...data,
        revision:
          typeof data.revision === "object" && "increment" in data.revision
            ? sitrepRecord.revision + data.revision.increment
            : sitrepRecord.revision,
        updatedAt: new Date("2026-06-12T05:00:00.000Z"),
      })),
    },
    auditLog: {
      create: vi.fn(async ({ data }) => ({
        ...auditLogRecord,
        ...data,
        id: auditLogRecord.id,
        createdAt: auditLogRecord.createdAt,
      })),
      findMany: vi.fn(async () => [auditLogRecord]),
    },
    $transaction: vi.fn(async (callback: (transaction: typeof tx) => unknown) =>
      callback(tx),
    ),
  };

  vi.doMock("@/app/lib/data/prisma-client", () => ({ prisma }));

  return { prisma, tx };
}

async function loadRepository() {
  return (await import("@/app/lib/data/prisma")).prismaRepository;
}

describe("Prisma repository writes", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock("@/app/lib/data/prisma-client");
  });

  it("creates incidents with nested sub-program and fund request rows", async () => {
    const { prisma, tx } = createPrismaMock();
    const repository = await loadRepository();

    const incident = await repository.createIncident(createInput);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: user.id },
    });
    expect(tx.incident.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: createInput.title,
        disasterType: "FLOOD",
        severity: "HIGH",
        status: "ACTIVE",
        createdById: user.id,
      }),
    });
    expect(tx.programSubProgram.createMany).toHaveBeenCalledWith({
      data: [
        {
          id: "sub-wash",
          incidentId: incidentRecord.id,
          name: "WASH",
          budgetAllocated: 50000,
        },
      ],
    });
    expect(tx.fundRequest.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          id: "fund-wash",
          incidentId: incidentRecord.id,
          subProgramName: "WASH",
          requestedByTeam: "Field Team North",
          amount: 25000,
          currency: "MYR",
          status: "requested",
        }),
      ],
    });
    expect(incident).toMatchObject({
      id: incidentRecord.id,
      title: incidentRecord.title,
      disasterType: "flood",
      severity: "high",
      status: "active",
    });
  });

  it("updates incidents and replaces nested budget rows when provided", async () => {
    const { tx } = createPrismaMock();
    const repository = await loadRepository();

    const incident = await repository.updateIncident(incidentRecord.id, {
      title: "Updated Flood Response",
      severity: "critical",
      subPrograms: [{ name: "Shelter", budgetAllocated: 30000 }],
      fundRequests: [
        {
          subProgramName: "Shelter",
          requestedByTeam: "Shelter Cell",
          amount: 15000,
          purpose: "Shelter kits",
        },
      ],
    });

    expect(tx.incident.update).toHaveBeenCalledWith({
      where: { id: incidentRecord.id },
      data: {
        title: "Updated Flood Response",
        severity: "CRITICAL",
      },
    });
    expect(tx.programSubProgram.deleteMany).toHaveBeenCalledWith({
      where: { incidentId: incidentRecord.id },
    });
    expect(tx.fundRequest.deleteMany).toHaveBeenCalledWith({
      where: { incidentId: incidentRecord.id },
    });
    expect(tx.programSubProgram.createMany).toHaveBeenCalledWith({
      data: [
        {
          incidentId: incidentRecord.id,
          name: "Shelter",
          budgetAllocated: 30000,
        },
      ],
    });
    expect(tx.fundRequest.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          incidentId: incidentRecord.id,
          subProgramName: "Shelter",
          requestedByTeam: "Shelter Cell",
          amount: 15000,
          currency: "MYR",
          purpose: "Shelter kits",
          status: "draft",
        }),
      ],
    });
    expect(incident?.id).toBe(incidentRecord.id);
  });

  it("returns undefined when updating a missing incident", async () => {
    const { prisma, tx } = createPrismaMock();
    prisma.incident.findUnique.mockResolvedValueOnce(null);
    const repository = await loadRepository();

    const incident = await repository.updateIncident("missing", {
      title: "Missing",
    });

    expect(incident).toBeUndefined();
    expect(tx.incident.update).not.toHaveBeenCalled();
  });

  it("deletes incidents when they exist", async () => {
    const { prisma } = createPrismaMock();
    const repository = await loadRepository();

    const deleted = await repository.deleteIncident(incidentRecord.id);

    expect(deleted).toBe(true);
    expect(prisma.incident.delete).toHaveBeenCalledWith({
      where: { id: incidentRecord.id },
    });
  });

  it("returns false when deleting a missing incident", async () => {
    const { prisma } = createPrismaMock();
    prisma.incident.findUnique.mockResolvedValueOnce(null);
    const repository = await loadRepository();

    const deleted = await repository.deleteIncident("missing");

    expect(deleted).toBe(false);
    expect(prisma.incident.delete).not.toHaveBeenCalled();
  });

  it("updates SitRep lifecycle fields and increments revision on content change", async () => {
    const { prisma } = createPrismaMock();
    const repository = await loadRepository();

    const sitrep = await repository.updateSituationReport(sitrepRecord.id, {
      summary: "Updated operational summary.",
      status: "approved",
      reviewComment: "Approved for partner circulation.",
      reviewedBy: "Maya Chen",
    });

    expect(prisma.situationReport.update).toHaveBeenCalledWith({
      where: { id: sitrepRecord.id },
      data: expect.objectContaining({
        summary: "Updated operational summary.",
        status: "approved",
        revision: { increment: 1 },
        reviewComment: "Approved for partner circulation.",
        reviewedBy: "Maya Chen",
      }),
      include: { createdBy: true },
    });
    expect(sitrep).toMatchObject({
      id: sitrepRecord.id,
      summary: "Updated operational summary.",
      status: "approved",
      revision: 2,
      reviewComment: "Approved for partner circulation.",
    });
  });

  it("creates and lists audit logs with serialized before and after values", async () => {
    const { prisma } = createPrismaMock();
    const repository = await loadRepository();

    const audit = await repository.createAuditLog({
      action: "status",
      actorId: user.id,
      actorName: user.name,
      entityType: "sitrep",
      entityId: sitrepRecord.id,
      summary: "Changed SitRep status from draft to approved",
      before: { status: "draft" },
      after: { status: "approved" },
    });
    const audits = await repository.listAuditLogs({
      entityType: "sitrep",
      entityId: sitrepRecord.id,
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        before: "{\"status\":\"draft\"}",
        after: "{\"status\":\"approved\"}",
      }),
    });
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: { entityType: "sitrep", entityId: sitrepRecord.id },
      orderBy: { createdAt: "desc" },
    });
    expect(audit).toMatchObject({ id: auditLogRecord.id, entityType: "sitrep" });
    expect(audits).toHaveLength(1);
  });
});
