import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const organizations = [
  {
    id: "org-reoc",
    name: "Regional Emergency Operations Center",
    type: "Government coordination",
    contactEmail: "ops@example.org",
    phone: "+60 3 0000 1000",
    address: "Kuala Lumpur, Malaysia",
  },
  {
    id: "org-field-north",
    name: "Field Team North",
    type: "Responder unit",
    contactEmail: "north-team@example.org",
    phone: "+60 3 0000 1001",
    address: "Sabah, Malaysia",
  },
  {
    id: "org-medical",
    name: "Medical Response Unit",
    type: "Responder unit",
    contactEmail: "medical@example.org",
    phone: "+60 3 0000 1002",
    address: "Kuala Lumpur, Malaysia",
  },
  {
    id: "org-wateraid",
    name: "WaterAid Partner Cell",
    type: "NGO partner",
    contactEmail: "wateraid@example.org",
    phone: "+60 3 0000 1003",
    address: "Kota Kinabalu, Malaysia",
  },
  {
    id: "org-redcross",
    name: "National Red Cross",
    type: "NGO partner",
    contactEmail: "redcross@example.org",
    phone: "+60 3 0000 1004",
    address: "Davao, Philippines",
  },
  {
    id: "org-health-network",
    name: "Community Health Network",
    type: "Medical partner",
    contactEmail: "clinic-network@example.org",
    phone: "+60 3 0000 1005",
    address: "Chattogram, Bangladesh",
  },
  {
    id: "org-logistics",
    name: "Logistics Desk",
    type: "Responder unit",
    contactEmail: "logistics@example.org",
    phone: "+60 3 0000 1006",
    address: "Kuala Lumpur, Malaysia",
  },
];

const users = [
  {
    id: "usr-001",
    name: "Maya Chen",
    email: "maya.chen@example.org",
    role: "COORDINATOR",
    organizationId: "org-reoc",
  },
  {
    id: "usr-002",
    name: "Anika Rao",
    email: "anika.rao@example.org",
    role: "RESPONDER",
    organizationId: "org-field-north",
  },
  {
    id: "usr-003",
    name: "Jon Reyes",
    email: "jon.reyes@example.org",
    role: "RESPONDER",
    organizationId: "org-medical",
  },
  {
    id: "usr-004",
    name: "Samir Haddad",
    email: "samir.haddad@example.org",
    role: "PARTNER",
    organizationId: "org-wateraid",
  },
  {
    id: "usr-005",
    name: "Nadia Okafor",
    email: "nadia.okafor@example.org",
    role: "ADMIN",
    organizationId: "org-reoc",
  },
  {
    id: "usr-006",
    name: "Rafiq Amin",
    email: "rafiq.amin@example.org",
    role: "RESPONDER",
    organizationId: "org-logistics",
  },
];

const incidents = [
  {
    id: "flood-riverside",
    title: "Riverside Flood Response",
    disasterType: "FLOOD",
    severity: "CRITICAL",
    status: "ACTIVE",
    description:
      "River overflow has displaced low-lying communities and interrupted road access to three neighborhoods. Evacuation boats reached Zone C, while potable water remains the largest gap for shelters east of the river.",
    latitude: 6.351,
    longitude: 116.43,
    locationName: "Kota Belud District",
    startTime: "2026-06-10T03:20:00+07:00",
    budgetCurrency: "MYR",
    masterBudgetAmount: 750000,
    createdById: "usr-001",
    subPrograms: [
      { id: "sub-riverside-wash", name: "WASH", budgetAllocated: 210000 },
      {
        id: "sub-riverside-shelter",
        name: "Temporary Shelter",
        budgetAllocated: 180000,
      },
      { id: "sub-riverside-food", name: "Food Packs", budgetAllocated: 160000 },
      {
        id: "sub-riverside-dignity",
        name: "Dignity Packs",
        budgetAllocated: 95000,
      },
      { id: "sub-riverside-logistics", name: "Logistics", budgetAllocated: 105000 },
    ],
    fundRequests: [
      {
        id: "fund-riverside-wash-001",
        subProgramName: "WASH",
        requestedByTeam: "Field Team North",
        amount: 120000,
        currency: "MYR",
        purpose:
          "Water trucking, storage bladders, and hygiene stations for Zone C shelters.",
        status: "approved",
        requestedAt: "2026-06-10T09:30:00+07:00",
        approvedAt: "2026-06-10T13:15:00+07:00",
      },
      {
        id: "fund-riverside-shelter-001",
        subProgramName: "Temporary Shelter",
        requestedByTeam: "Shelter Coordination Cell",
        amount: 85000,
        currency: "MYR",
        purpose:
          "Temporary shelter kits and mat distribution for displaced households.",
        status: "requested",
        requestedAt: "2026-06-11T08:15:00+07:00",
      },
    ],
  },
  {
    id: "landslide-hill-ward",
    title: "Hill Ward Landslide",
    disasterType: "LANDSLIDE",
    severity: "HIGH",
    status: "STABILIZING",
    description:
      "Slope failure damaged housing blocks and cut off a feeder road used by medical supply vehicles. Engineering teams marked two unsafe structures and debris clearance is waiting on heavy equipment.",
    latitude: 7.19,
    longitude: 125.46,
    locationName: "Hill Ward Road 18",
    startTime: "2026-06-09T22:40:00+07:00",
    budgetCurrency: "MYR",
    masterBudgetAmount: 320000,
    createdById: "usr-005",
    subPrograms: [
      { id: "sub-hill-shelter", name: "Temporary Shelter", budgetAllocated: 120000 },
      { id: "sub-hill-wash", name: "WASH", budgetAllocated: 70000 },
      { id: "sub-hill-logistics", name: "Logistics", budgetAllocated: 130000 },
    ],
    fundRequests: [
      {
        id: "fund-hill-logistics-001",
        subProgramName: "Logistics",
        requestedByTeam: "Engineering Safety Cell",
        amount: 60000,
        currency: "MYR",
        purpose: "Loader rental, fuel, and debris clearance support.",
        status: "approved",
        requestedAt: "2026-06-10T11:40:00+07:00",
        approvedAt: "2026-06-10T14:20:00+07:00",
      },
    ],
  },
  {
    id: "warehouse-fire-eastport",
    title: "Eastport Warehouse Fire",
    disasterType: "FIRE",
    severity: "MODERATE",
    status: "MONITORING",
    description:
      "Contained industrial fire with smoke exposure concerns for nearby worker dormitories. Air quality monitoring is ongoing and clinic teams report increased respiratory complaints.",
    latitude: 22.356,
    longitude: 91.783,
    locationName: "Eastport Industrial Zone",
    startTime: "2026-06-11T01:05:00+07:00",
    budgetCurrency: "MYR",
    masterBudgetAmount: 180000,
    createdById: "usr-001",
    subPrograms: [
      { id: "sub-eastport-health", name: "Health", budgetAllocated: 90000 },
      { id: "sub-eastport-wash", name: "WASH", budgetAllocated: 45000 },
      { id: "sub-eastport-food", name: "Food Packs", budgetAllocated: 45000 },
    ],
    fundRequests: [
      {
        id: "fund-eastport-health-001",
        subProgramName: "Health",
        requestedByTeam: "Community Health Screeners",
        amount: 40000,
        currency: "MYR",
        purpose: "Respiratory screening supplies and clinic extension hours.",
        status: "released",
        requestedAt: "2026-06-11T07:45:00+07:00",
        approvedAt: "2026-06-11T08:30:00+07:00",
        releasedAt: "2026-06-11T09:15:00+07:00",
      },
    ],
  },
];

const needReports = [
  {
    id: "need-water-zone-c",
    incidentId: "flood-riverside",
    category: "WATER",
    urgency: "CRITICAL",
    quantity: 9000,
    affectedPeople: 3200,
    status: "VERIFIED",
    latitude: 6.356,
    longitude: 116.425,
    locationName: "Zone C Evacuation Shelter",
    notes: "Shelter has less than six hours of potable water remaining.",
    reportedById: "usr-002",
    verifiedById: "usr-001",
    createdAt: "2026-06-11T07:35:00+07:00",
  },
  {
    id: "need-medical-riverside",
    incidentId: "flood-riverside",
    category: "MEDICAL",
    urgency: "HIGH",
    quantity: 6,
    affectedPeople: 740,
    status: "ASSIGNED",
    latitude: 6.349,
    longitude: 116.438,
    locationName: "Riverside School Shelter",
    notes: "Minor wounds and chronic medication refills are increasing.",
    reportedById: "usr-003",
    verifiedById: "usr-001",
    createdAt: "2026-06-11T08:10:00+07:00",
  },
  {
    id: "need-shelter-hill",
    incidentId: "landslide-hill-ward",
    category: "SHELTER",
    urgency: "HIGH",
    quantity: 180,
    affectedPeople: 690,
    status: "REPORTED",
    latitude: 7.193,
    longitude: 125.462,
    locationName: "Hill Ward Community Hall",
    notes: "Families from two damaged blocks need overnight support.",
    reportedById: "usr-002",
    createdAt: "2026-06-11T06:50:00+07:00",
  },
  {
    id: "need-wash-eastport",
    incidentId: "warehouse-fire-eastport",
    category: "WASH",
    urgency: "MEDIUM",
    quantity: 12,
    affectedPeople: 450,
    status: "VERIFIED",
    latitude: 22.359,
    longitude: 91.79,
    locationName: "Eastport Dormitory Cluster",
    notes: "Temporary relocation area needs handwashing points.",
    reportedById: "usr-003",
    verifiedById: "usr-005",
    createdAt: "2026-06-11T05:45:00+07:00",
  },
];

const tasks = [
  {
    id: "task-water-dispatch",
    incidentId: "flood-riverside",
    title: "Dispatch water bladders to Zone C",
    description:
      "Move two 5,000 liter bladders from Central Warehouse and confirm delivery on arrival.",
    assigneeId: "usr-002",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    dueTime: "2026-06-11T12:30:00+07:00",
    latitude: 6.356,
    longitude: 116.425,
    createdById: "usr-001",
  },
  {
    id: "task-medical-roster",
    incidentId: "flood-riverside",
    title: "Extend clinic coverage",
    description:
      "Assign evening shift clinicians and confirm chronic medication stock.",
    assigneeId: "usr-003",
    priority: "HIGH",
    status: "TODO",
    dueTime: "2026-06-11T14:00:00+07:00",
    latitude: 6.349,
    longitude: 116.438,
    createdById: "usr-001",
  },
  {
    id: "task-debris-loader",
    incidentId: "landslide-hill-ward",
    title: "Confirm loader availability",
    description: "Find a loader and operator for debris clearance.",
    assigneeId: "usr-006",
    priority: "HIGH",
    status: "BLOCKED",
    dueTime: "2026-06-11T13:15:00+07:00",
    latitude: 7.19,
    longitude: 125.46,
    createdById: "usr-005",
  },
  {
    id: "task-air-monitoring",
    incidentId: "warehouse-fire-eastport",
    title: "Publish air monitoring update",
    description: "Share latest readings with clinic and dormitory managers.",
    assigneeId: "usr-001",
    priority: "MEDIUM",
    status: "TODO",
    dueTime: "2026-06-11T15:00:00+07:00",
    latitude: 22.356,
    longitude: 91.783,
    createdById: "usr-005",
  },
];

const resources = [
  {
    id: "res-water-bladder",
    name: "Water bladder",
    category: "Water",
    quantityAvailable: 5,
    quantityCommitted: 2,
    unit: "units",
    warehouseLocation: "Central Warehouse",
    expiryDate: null,
    movement: {
      incidentId: "flood-riverside",
      quantity: 2,
      note: "Committed to Zone C shelter water supply.",
    },
  },
  {
    id: "res-family-shelter-kit",
    name: "Family shelter kit",
    category: "Shelter",
    quantityAvailable: 420,
    quantityCommitted: 180,
    unit: "kits",
    warehouseLocation: "North Depot",
    expiryDate: null,
    movement: {
      incidentId: "landslide-hill-ward",
      quantity: 180,
      note: "Committed for Hill Ward displaced households.",
    },
  },
  {
    id: "res-clinic-kit",
    name: "Mobile clinic kit",
    category: "Medical",
    quantityAvailable: 14,
    quantityCommitted: 6,
    unit: "kits",
    warehouseLocation: "Medical Depot",
    expiryDate: "2027-02-15T00:00:00+07:00",
    movement: {
      incidentId: "flood-riverside",
      quantity: 6,
      note: "Committed for mobile clinic extension.",
    },
  },
  {
    id: "res-hygiene-station",
    name: "Hygiene station",
    category: "WASH",
    quantityAvailable: 30,
    quantityCommitted: 12,
    unit: "stations",
    warehouseLocation: "East Logistics Hub",
    expiryDate: null,
    movement: {
      incidentId: "warehouse-fire-eastport",
      quantity: 12,
      note: "Committed to Eastport dormitory relocation area.",
    },
  },
];

const partnerActivities = [
  {
    id: "act-wateraid-zone-c",
    organizationId: "org-wateraid",
    incidentId: "flood-riverside",
    sector: "WASH",
    activity: "Emergency water distribution",
    locationName: "Zone C Evacuation Shelter",
    latitude: 6.356,
    longitude: 116.425,
    status: "active",
    contactName: "Samir Haddad",
    contactPhone: "+60 12 000 2201",
    startDate: "2026-06-11T00:00:00+07:00",
    endDate: null,
  },
  {
    id: "act-redcross-hill",
    organizationId: "org-redcross",
    incidentId: "landslide-hill-ward",
    sector: "Shelter",
    activity: "Family kit registration",
    locationName: "Hill Ward Community Hall",
    latitude: 7.193,
    longitude: 125.462,
    status: "planned",
    contactName: "Lina Moradi",
    contactPhone: "+60 12 000 2214",
    startDate: "2026-06-11T00:00:00+07:00",
    endDate: "2026-06-13T00:00:00+07:00",
  },
  {
    id: "act-clinic-eastport",
    organizationId: "org-health-network",
    incidentId: "warehouse-fire-eastport",
    sector: "Health",
    activity: "Respiratory symptom screening",
    locationName: "Eastport Dormitory Cluster",
    latitude: 22.359,
    longitude: 91.79,
    status: "active",
    contactName: "Dr. Arun Patel",
    contactPhone: "+60 12 000 2277",
    startDate: "2026-06-11T00:00:00+07:00",
    endDate: null,
  },
];

const situationReports = [
  {
    id: "sitrep-riverside-001",
    incidentId: "flood-riverside",
    reportingPeriodStart: "2026-06-11T06:00:00+07:00",
    reportingPeriodEnd: "2026-06-11T12:00:00+07:00",
    summary:
      "Flood response remains active across Riverside District with shelter demand increasing in Zone C.",
    impact:
      "An estimated 18,400 people are affected. Road access is limited in three riverside neighborhoods.",
    priorityNeeds:
      "Potable water, mobile clinic coverage, shelter support, and boat access for isolated households.",
    responseActions:
      "Eight teams are assigned. Two water bladders are in transit and clinic coverage is being extended.",
    gaps:
      "Water trucking capacity and verified household-level damage data remain limited.",
    nextPriorities:
      "Stabilize Zone C shelter supply, expand rapid assessment coverage, and update public guidance.",
    createdById: "usr-001",
    createdAt: "2026-06-11T09:20:00+07:00",
  },
];

const conceptNotes = [
  {
    id: "concept-riverside-v1",
    incidentId: "flood-riverside",
    version: 1,
    status: "draft",
    content:
      "Project goal: Stabilize priority WASH, shelter, and health conditions for flood-affected households in Kota Belud District.\n\nTarget population: Displaced and access-constrained households in Zone C and adjacent riverside neighborhoods.\n\nProposed activities: Emergency water trucking, temporary shelter kit distribution, mobile clinic extension, and rapid household-level damage assessment.\n\nBudget note: Initial funding request aligns with approved WASH support and pending shelter allocation.",
    createdById: "usr-001",
    createdAt: "2026-06-11T10:00:00+07:00",
  },
];

function asDate(value) {
  return value ? new Date(value) : null;
}

async function seed() {
  for (const organization of organizations) {
    await prisma.organization.upsert({
      where: { id: organization.id },
      create: organization,
      update: organization,
    });
  }

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: user,
      update: user,
    });
  }

  for (const incident of incidents) {
    const { subPrograms, fundRequests, ...incidentData } = incident;
    await prisma.incident.upsert({
      where: { id: incident.id },
      create: {
        ...incidentData,
        startTime: asDate(incident.startTime),
      },
      update: {
        ...incidentData,
        startTime: asDate(incident.startTime),
      },
    });

    for (const subProgram of subPrograms) {
      await prisma.programSubProgram.upsert({
        where: { id: subProgram.id },
        create: {
          ...subProgram,
          incidentId: incident.id,
        },
        update: {
          name: subProgram.name,
          budgetAllocated: subProgram.budgetAllocated,
        },
      });
    }

    for (const request of fundRequests) {
      await prisma.fundRequest.upsert({
        where: { id: request.id },
        create: {
          ...request,
          incidentId: incident.id,
          requestedAt: asDate(request.requestedAt),
          approvedAt: asDate(request.approvedAt),
          releasedAt: asDate(request.releasedAt),
        },
        update: {
          subProgramName: request.subProgramName,
          requestedByTeam: request.requestedByTeam,
          amount: request.amount,
          currency: request.currency,
          purpose: request.purpose,
          status: request.status,
          requestedAt: asDate(request.requestedAt),
          approvedAt: asDate(request.approvedAt),
          releasedAt: asDate(request.releasedAt),
        },
      });
    }
  }

  for (const need of needReports) {
    await prisma.needReport.upsert({
      where: { id: need.id },
      create: {
        ...need,
        createdAt: asDate(need.createdAt),
      },
      update: {
        category: need.category,
        urgency: need.urgency,
        quantity: need.quantity,
        affectedPeople: need.affectedPeople,
        status: need.status,
        latitude: need.latitude,
        longitude: need.longitude,
        locationName: need.locationName,
        notes: need.notes,
        reportedById: need.reportedById,
        verifiedById: need.verifiedById,
        createdAt: asDate(need.createdAt),
      },
    });
  }

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      create: {
        ...task,
        dueTime: asDate(task.dueTime),
      },
      update: {
        title: task.title,
        description: task.description,
        assigneeId: task.assigneeId,
        priority: task.priority,
        status: task.status,
        dueTime: asDate(task.dueTime),
        latitude: task.latitude,
        longitude: task.longitude,
        createdById: task.createdById,
      },
    });
  }

  for (const resource of resources) {
    const { movement, ...resourceData } = resource;
    await prisma.resource.upsert({
      where: { id: resource.id },
      create: {
        ...resourceData,
        expiryDate: asDate(resource.expiryDate),
      },
      update: {
        name: resource.name,
        category: resource.category,
        quantityAvailable: resource.quantityAvailable,
        quantityCommitted: resource.quantityCommitted,
        unit: resource.unit,
        warehouseLocation: resource.warehouseLocation,
        expiryDate: asDate(resource.expiryDate),
      },
    });

    await prisma.resourceMovement.deleteMany({
      where: {
        resourceId: resource.id,
        note: movement.note,
      },
    });
    await prisma.resourceMovement.create({
      data: {
        resourceId: resource.id,
        incidentId: movement.incidentId,
        quantity: movement.quantity,
        note: movement.note,
      },
    });
  }

  for (const activity of partnerActivities) {
    await prisma.partnerActivity.upsert({
      where: { id: activity.id },
      create: {
        ...activity,
        startDate: asDate(activity.startDate),
        endDate: asDate(activity.endDate),
      },
      update: {
        organizationId: activity.organizationId,
        sector: activity.sector,
        activity: activity.activity,
        locationName: activity.locationName,
        latitude: activity.latitude,
        longitude: activity.longitude,
        status: activity.status,
        contactName: activity.contactName,
        contactPhone: activity.contactPhone,
        startDate: asDate(activity.startDate),
        endDate: asDate(activity.endDate),
      },
    });
  }

  for (const report of situationReports) {
    await prisma.situationReport.upsert({
      where: { id: report.id },
      create: {
        ...report,
        reportingPeriodStart: asDate(report.reportingPeriodStart),
        reportingPeriodEnd: asDate(report.reportingPeriodEnd),
        createdAt: asDate(report.createdAt),
      },
      update: {
        reportingPeriodStart: asDate(report.reportingPeriodStart),
        reportingPeriodEnd: asDate(report.reportingPeriodEnd),
        summary: report.summary,
        impact: report.impact,
        priorityNeeds: report.priorityNeeds,
        responseActions: report.responseActions,
        gaps: report.gaps,
        nextPriorities: report.nextPriorities,
        createdById: report.createdById,
        createdAt: asDate(report.createdAt),
      },
    });
  }

  for (const note of conceptNotes) {
    await prisma.conceptNote.upsert({
      where: { id: note.id },
      create: {
        ...note,
        createdAt: asDate(note.createdAt),
      },
      update: {
        content: note.content,
        status: note.status,
        createdById: note.createdById,
      },
    });
  }
}

seed()
  .then(async () => {
    console.log("Seeded Prisma disaster response demo data.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
