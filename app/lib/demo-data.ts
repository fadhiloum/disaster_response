export type Role = "Admin" | "Coordinator" | "Responder" | "Partner" | "Viewer";

export type IncidentStatus = "monitoring" | "active" | "stabilizing" | "closed";

export type NeedStatus =
  | "reported"
  | "verified"
  | "assigned"
  | "fulfilled"
  | "closed";

export type TaskStatus = "todo" | "in progress" | "blocked" | "done";

export type Severity = "low" | "moderate" | "high" | "critical";

export type ProgramSubProgram = {
  id: string;
  name: string;
  budgetAllocated: number;
};

export type FundRequestStatus = "draft" | "requested" | "approved" | "released";

export type FundRequest = {
  id: string;
  subProgramName: string;
  requestedByTeam: string;
  amount: number;
  currency: string;
  purpose: string;
  status: FundRequestStatus;
  requestedAt: string;
};

export type Incident = {
  id: string;
  title: string;
  disasterType: string;
  severity: Severity;
  status: IncidentStatus;
  region: string;
  country: string;
  state: string;
  locationName: string;
  latitude: number;
  longitude: number;
  affectedPeople: number;
  openNeeds: number;
  resourceGaps: number;
  assignedTeams: number;
  startTime: string;
  description: string;
  lead: string;
  latestUpdate: string;
  budgetCurrency: string;
  masterBudgetAmount: number;
  subPrograms: ProgramSubProgram[];
  fundRequests: FundRequest[];
};

export type NeedReport = {
  id: string;
  incidentId: string;
  category: string;
  urgency: "low" | "medium" | "high" | "critical";
  quantity: number;
  unit: string;
  affectedPeople: number;
  status: NeedStatus;
  locationName: string;
  latitude: number;
  longitude: number;
  notes: string;
  reportedBy: string;
  createdAt: string;
};

export type ResponseTask = {
  id: string;
  incidentId: string;
  title: string;
  assignee: string;
  priority: "low" | "medium" | "high" | "critical";
  status: TaskStatus;
  dueTime: string;
  locationName: string;
  description: string;
};

export type Resource = {
  id: string;
  name: string;
  category: string;
  quantityAvailable: number;
  quantityCommitted: number;
  unit: string;
  warehouseLocation: string;
  receivedAt: string;
  expiryDate: string | null;
  assignedIncidentId: string | null;
};

export type DeployedTeam = {
  id: string;
  incidentId: string;
  name: string;
  role: string;
  members: string;
  deployedAt: string;
};

export type PartnerActivity = {
  id: string;
  organization: string;
  incidentId: string;
  sector: string;
  activity: string;
  locationName: string;
  status: "planned" | "active" | "paused" | "completed";
  contactName: string;
  contactPhone: string;
  startDate: string;
  endDate: string | null;
};

export type SituationReport = {
  id: string;
  incidentId: string;
  reportingPeriod: string;
  summary: string;
  impact: string;
  priorityNeeds: string;
  responseActions: string;
  gaps: string;
  nextPriorities: string;
  createdBy: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: string;
};

export const currentUser: User = {
  id: "usr-001",
  name: "Maya Chen",
  email: "maya.chen@example.org",
  role: "Coordinator",
  organization: "Regional Emergency Operations Center",
};

export const users: User[] = [
  currentUser,
  {
    id: "usr-002",
    name: "Anika Rao",
    email: "anika.rao@example.org",
    role: "Responder",
    organization: "Field Team North",
  },
  {
    id: "usr-003",
    name: "Jon Reyes",
    email: "jon.reyes@example.org",
    role: "Responder",
    organization: "Medical Response Unit",
  },
  {
    id: "usr-004",
    name: "Samir Haddad",
    email: "samir.haddad@example.org",
    role: "Partner",
    organization: "WaterAid Partner Cell",
  },
  {
    id: "usr-005",
    name: "Nadia Okafor",
    email: "nadia.okafor@example.org",
    role: "Admin",
    organization: "Regional Emergency Operations Center",
  },
];

export const incidents: Incident[] = [
  {
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
    description:
      "River overflow has displaced low-lying communities and interrupted road access to three neighborhoods.",
    lead: "Maya Chen",
    latestUpdate:
      "Evacuation boats reached Zone C. Potable water remains the largest gap for shelters east of the river.",
    budgetCurrency: "MYR",
    masterBudgetAmount: 750000,
    subPrograms: [
      { id: "sub-riverside-wash", name: "WASH", budgetAllocated: 210000 },
      {
        id: "sub-riverside-shelter",
        name: "Temporary Shelter",
        budgetAllocated: 180000,
      },
      {
        id: "sub-riverside-food",
        name: "Food Packs",
        budgetAllocated: 160000,
      },
      {
        id: "sub-riverside-dignity",
        name: "Dignity Packs",
        budgetAllocated: 95000,
      },
      {
        id: "sub-riverside-logistics",
        name: "Logistics",
        budgetAllocated: 105000,
      },
    ],
    fundRequests: [
      {
        id: "fund-riverside-wash-001",
        subProgramName: "WASH",
        requestedByTeam: "Field Team North",
        amount: 120000,
        currency: "MYR",
        purpose: "Water trucking, storage bladders, and hygiene stations for Zone C shelters.",
        status: "approved",
        requestedAt: "2026-06-10T09:30:00+07:00",
      },
      {
        id: "fund-riverside-shelter-001",
        subProgramName: "Temporary Shelter",
        requestedByTeam: "Shelter Coordination Cell",
        amount: 85000,
        currency: "MYR",
        purpose: "Temporary shelter kits and mat distribution for displaced households.",
        status: "requested",
        requestedAt: "2026-06-11T08:15:00+07:00",
      },
    ],
  },
  {
    id: "landslide-hill-ward",
    title: "Hill Ward Landslide",
    disasterType: "landslide",
    severity: "high",
    status: "stabilizing",
    region: "Asia Pacific",
    country: "Philippines",
    state: "Davao del Sur",
    locationName: "Hill Ward Road 18",
    latitude: 7.19,
    longitude: 125.46,
    affectedPeople: 4200,
    openNeeds: 6,
    resourceGaps: 2,
    assignedTeams: 4,
    startTime: "2026-06-09T22:40:00+07:00",
    description:
      "Slope failure damaged housing blocks and cut off a feeder road used by medical supply vehicles.",
    lead: "Nadia Okafor",
    latestUpdate:
      "Engineering team marked two unsafe structures. Debris clearance is waiting on heavy equipment.",
    budgetCurrency: "MYR",
    masterBudgetAmount: 320000,
    subPrograms: [
      {
        id: "sub-hill-shelter",
        name: "Temporary Shelter",
        budgetAllocated: 120000,
      },
      { id: "sub-hill-wash", name: "WASH", budgetAllocated: 70000 },
      {
        id: "sub-hill-logistics",
        name: "Logistics",
        budgetAllocated: 130000,
      },
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
      },
    ],
  },
  {
    id: "warehouse-fire-eastport",
    title: "Eastport Warehouse Fire",
    disasterType: "fire",
    severity: "moderate",
    status: "monitoring",
    region: "South Asia",
    country: "Bangladesh",
    state: "Chattogram",
    locationName: "Eastport Industrial Zone",
    latitude: 22.356,
    longitude: 91.783,
    affectedPeople: 900,
    openNeeds: 3,
    resourceGaps: 1,
    assignedTeams: 3,
    startTime: "2026-06-11T01:05:00+07:00",
    description:
      "Contained industrial fire with smoke exposure concerns for nearby worker dormitories.",
    lead: "Maya Chen",
    latestUpdate:
      "Air quality monitoring is ongoing. Clinic team reports increased respiratory complaints.",
    budgetCurrency: "MYR",
    masterBudgetAmount: 180000,
    subPrograms: [
      { id: "sub-eastport-health", name: "Health", budgetAllocated: 90000 },
      { id: "sub-eastport-wash", name: "WASH", budgetAllocated: 45000 },
      {
        id: "sub-eastport-food",
        name: "Food Packs",
        budgetAllocated: 45000,
      },
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
      },
    ],
  },
];

export const needReports: NeedReport[] = [
  {
    id: "need-water-zone-c",
    incidentId: "flood-riverside",
    category: "Water",
    urgency: "critical",
    quantity: 9000,
    unit: "liters",
    affectedPeople: 3200,
    status: "verified",
    locationName: "Zone C Evacuation Shelter",
    latitude: 13.762,
    longitude: 100.522,
    notes: "Shelter has less than six hours of potable water remaining.",
    reportedBy: "Anika Rao",
    createdAt: "2026-06-11T07:35:00+07:00",
  },
  {
    id: "need-medical-riverside",
    incidentId: "flood-riverside",
    category: "Medical",
    urgency: "high",
    quantity: 6,
    unit: "mobile clinic kits",
    affectedPeople: 740,
    status: "assigned",
    locationName: "Riverside School Shelter",
    latitude: 13.751,
    longitude: 100.505,
    notes: "Minor wounds and chronic medication refills are increasing.",
    reportedBy: "Jon Reyes",
    createdAt: "2026-06-11T08:10:00+07:00",
  },
  {
    id: "need-shelter-hill",
    incidentId: "landslide-hill-ward",
    category: "Shelter",
    urgency: "high",
    quantity: 180,
    unit: "family kits",
    affectedPeople: 690,
    status: "reported",
    locationName: "Hill Ward Community Hall",
    latitude: 13.737,
    longitude: 100.551,
    notes: "Families from two damaged blocks need overnight support.",
    reportedBy: "Anika Rao",
    createdAt: "2026-06-11T06:50:00+07:00",
  },
  {
    id: "need-wash-eastport",
    incidentId: "warehouse-fire-eastport",
    category: "WASH",
    urgency: "medium",
    quantity: 12,
    unit: "hygiene stations",
    affectedPeople: 450,
    status: "verified",
    locationName: "Eastport Dormitory Cluster",
    latitude: 13.726,
    longitude: 100.611,
    notes: "Temporary relocation area needs handwashing points.",
    reportedBy: "Jon Reyes",
    createdAt: "2026-06-11T05:45:00+07:00",
  },
];

export const tasks: ResponseTask[] = [
  {
    id: "task-water-dispatch",
    incidentId: "flood-riverside",
    title: "Dispatch water bladders to Zone C",
    assignee: "Field Team North",
    priority: "critical",
    status: "in progress",
    dueTime: "2026-06-11T12:30:00+07:00",
    locationName: "Zone C Evacuation Shelter",
    description:
      "Move two 5,000 liter bladders from Central Warehouse and confirm delivery on arrival.",
  },
  {
    id: "task-medical-roster",
    incidentId: "flood-riverside",
    title: "Extend clinic coverage",
    assignee: "Medical Response Unit",
    priority: "high",
    status: "todo",
    dueTime: "2026-06-11T14:00:00+07:00",
    locationName: "Riverside School Shelter",
    description:
      "Assign evening shift clinicians and confirm chronic medication stock.",
  },
  {
    id: "task-debris-loader",
    incidentId: "landslide-hill-ward",
    title: "Confirm loader availability",
    assignee: "Logistics Desk",
    priority: "high",
    status: "blocked",
    dueTime: "2026-06-11T13:15:00+07:00",
    locationName: "Hill Ward Road 18",
    description: "Find a loader and operator for debris clearance.",
  },
  {
    id: "task-air-monitoring",
    incidentId: "warehouse-fire-eastport",
    title: "Publish air monitoring update",
    assignee: "Public Information Officer",
    priority: "medium",
    status: "todo",
    dueTime: "2026-06-11T15:00:00+07:00",
    locationName: "Eastport Industrial Zone",
    description: "Share latest readings with clinic and dormitory managers.",
  },
];

export const resources: Resource[] = [
  {
    id: "res-water-bladder",
    name: "Water bladder",
    category: "Water",
    quantityAvailable: 5,
    quantityCommitted: 2,
    unit: "units",
    warehouseLocation: "Central Warehouse",
    receivedAt: "2026-05-19",
    expiryDate: null,
    assignedIncidentId: "flood-riverside",
  },
  {
    id: "res-family-shelter-kit",
    name: "Family shelter kit",
    category: "Shelter",
    quantityAvailable: 420,
    quantityCommitted: 180,
    unit: "kits",
    warehouseLocation: "North Depot",
    receivedAt: "2026-04-28",
    expiryDate: null,
    assignedIncidentId: "landslide-hill-ward",
  },
  {
    id: "res-clinic-kit",
    name: "Mobile clinic kit",
    category: "Medical",
    quantityAvailable: 14,
    quantityCommitted: 6,
    unit: "kits",
    warehouseLocation: "Medical Depot",
    receivedAt: "2026-05-02",
    expiryDate: "2027-02-15",
    assignedIncidentId: "flood-riverside",
  },
  {
    id: "res-hygiene-station",
    name: "Hygiene station",
    category: "WASH",
    quantityAvailable: 30,
    quantityCommitted: 12,
    unit: "stations",
    warehouseLocation: "East Logistics Hub",
    receivedAt: "2026-05-25",
    expiryDate: null,
    assignedIncidentId: "warehouse-fire-eastport",
  },
];

export const deployedTeams: DeployedTeam[] = [
  {
    id: "team-field-north",
    incidentId: "flood-riverside",
    name: "Field Team North",
    role: "Rapid assessment and shelter coordination",
    members: "Anika Rao, Rafiq Amin, Lina Tan",
    deployedAt: "2026-06-10T08:00:00+07:00",
  },
  {
    id: "team-medical-riverside",
    incidentId: "flood-riverside",
    name: "Medical Response Unit",
    role: "Mobile clinic support",
    members: "Jon Reyes, Dr. Mei Lim",
    deployedAt: "2026-06-10T10:30:00+07:00",
  },
  {
    id: "team-engineering-hill",
    incidentId: "landslide-hill-ward",
    name: "Engineering Safety Cell",
    role: "Slope and structure safety checks",
    members: "Nadia Okafor, Bilal Khan",
    deployedAt: "2026-06-10T06:45:00+07:00",
  },
  {
    id: "team-clinic-eastport",
    incidentId: "warehouse-fire-eastport",
    name: "Community Health Screeners",
    role: "Respiratory symptom screening",
    members: "Dr. Arun Patel, Sara Wong",
    deployedAt: "2026-06-11T07:15:00+07:00",
  },
];

export const partnerActivities: PartnerActivity[] = [
  {
    id: "act-wateraid-zone-c",
    organization: "WaterAid Partner Cell",
    incidentId: "flood-riverside",
    sector: "WASH",
    activity: "Emergency water distribution",
    locationName: "Zone C Evacuation Shelter",
    status: "active",
    contactName: "Samir Haddad",
    contactPhone: "+66 81 000 2201",
    startDate: "2026-06-11",
    endDate: null,
  },
  {
    id: "act-redcross-hill",
    organization: "National Red Cross",
    incidentId: "landslide-hill-ward",
    sector: "Shelter",
    activity: "Family kit registration",
    locationName: "Hill Ward Community Hall",
    status: "planned",
    contactName: "Lina Moradi",
    contactPhone: "+66 81 000 2214",
    startDate: "2026-06-11",
    endDate: "2026-06-13",
  },
  {
    id: "act-clinic-eastport",
    organization: "Community Health Network",
    incidentId: "warehouse-fire-eastport",
    sector: "Health",
    activity: "Respiratory symptom screening",
    locationName: "Eastport Dormitory Cluster",
    status: "active",
    contactName: "Dr. Arun Patel",
    contactPhone: "+66 81 000 2277",
    startDate: "2026-06-11",
    endDate: null,
  },
];

export const situationReports: SituationReport[] = [
  {
    id: "sitrep-riverside-001",
    incidentId: "flood-riverside",
    reportingPeriod: "11 Jun 2026, 06:00-12:00 ICT",
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
    createdBy: "Maya Chen",
    createdAt: "2026-06-11T09:20:00+07:00",
  },
];

export function getIncident(id: string) {
  return incidents.find((incident) => incident.id === id);
}

export function getIncidentNeeds(id: string) {
  return needReports.filter((need) => need.incidentId === id);
}

export function getIncidentTasks(id: string) {
  return tasks.filter((task) => task.incidentId === id);
}

export function getIncidentActivities(id: string) {
  return partnerActivities.filter((activity) => activity.incidentId === id);
}

export function getIncidentSitreps(id: string) {
  return situationReports.filter((sitrep) => sitrep.incidentId === id);
}

export function getIncidentResources(id: string) {
  return resources.filter((resource) => resource.assignedIncidentId === id);
}

export function getIncidentTeams(id: string) {
  return deployedTeams.filter((team) => team.incidentId === id);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

export function formatCurrency(value: number, currency = "MYR") {
  return new Intl.NumberFormat("en", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export const dashboardSummary = {
  activeIncidents: incidents.filter((incident) => incident.status !== "closed")
    .length,
  affectedPeople: incidents.reduce(
    (total, incident) => total + incident.affectedPeople,
    0,
  ),
  urgentNeeds: needReports.filter(
    (need) => need.urgency === "high" || need.urgency === "critical",
  ).length,
  openTasks: tasks.filter((task) => task.status !== "done").length,
  resourceGaps: incidents.reduce(
    (total, incident) => total + incident.resourceGaps,
    0,
  ),
};
