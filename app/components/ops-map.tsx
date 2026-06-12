"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  type DeployedTeam,
  formatNumber,
  type Incident,
  type NeedReport,
  type PartnerActivity,
  type Resource,
} from "@/app/lib/data/types";
import { SeverityBadge, StatusBadge } from "@/app/components/ui";

export function OpsMap({
  incidents,
  needs = [],
  resources = [],
  teams = [],
  activities = [],
  focusIncident,
  compact = false,
}: {
  incidents: Incident[];
  needs?: NeedReport[];
  resources?: Resource[];
  teams?: DeployedTeam[];
  activities?: PartnerActivity[];
  focusIncident?: Incident;
  compact?: boolean;
}) {
  const scopedIncidents = useMemo(
    () => (focusIncident ? [focusIncident] : incidents),
    [focusIncident, incidents],
  );
  const incidentById = useMemo(
    () => new Map(incidents.map((incident) => [incident.id, incident])),
    [incidents],
  );
  const [programFilter, setProgramFilter] = useState(
    focusIncident?.id ?? "all",
  );
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [enabledLayers, setEnabledLayers] = useState<Record<EntityType, boolean>>({
    program: true,
    need: true,
    resource: true,
    team: true,
    partner: true,
  });
  const selectedIncidentIds = useMemo(() => {
    if (focusIncident) {
      return new Set([focusIncident.id]);
    }

    if (programFilter !== "all") {
      return new Set([programFilter]);
    }

    return new Set(scopedIncidents.map((incident) => incident.id));
  }, [focusIncident, programFilter, scopedIncidents]);
  const allMapItems = useMemo(
    () =>
      buildMapItems({
        activities,
        incidentById,
        incidents: scopedIncidents,
        needs,
        resources,
        selectedIncidentIds,
        teams,
      }),
    [
      activities,
      incidentById,
      needs,
      resources,
      scopedIncidents,
      selectedIncidentIds,
      teams,
    ],
  );
  const mapItems = useMemo(
    () =>
      allMapItems.filter((item) => {
        if (!enabledLayers[item.type]) return false;
        if (urgencyFilter !== "all" && item.urgency !== urgencyFilter) return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (
          organizationFilter !== "all" &&
          item.organization !== organizationFilter
        ) {
          return false;
        }

        return true;
      }),
    [
      allMapItems,
      enabledLayers,
      organizationFilter,
      statusFilter,
      urgencyFilter,
    ],
  );
  const visibleIncidents = scopedIncidents.filter((incident) =>
    selectedIncidentIds.has(incident.id),
  );
  const countries = new Set(visibleIncidents.map((incident) => incident.country));
  const affectedPeople = visibleIncidents.reduce(
    (total, incident) => total + incident.affectedPeople,
    0,
  );
  const urgencyOptions = uniqueValues(allMapItems.map((item) => item.urgency));
  const statusOptions = uniqueValues(allMapItems.map((item) => item.status));
  const organizationOptions = uniqueValues(
    allMapItems.map((item) => item.organization),
  );

  function toggleLayer(type: EntityType) {
    setEnabledLayers((current) => ({
      ...current,
      [type]: !current[type],
    }));
  }

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">
            World Program Map
          </h2>
          <p className="text-sm text-zinc-500">
            {focusIncident
              ? `${focusIncident.locationName}, ${focusIncident.country}`
              : "All programs by global location"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {entityTypes.map((type) => (
            <span className="flex items-center gap-1.5 text-zinc-600" key={type}>
              <span className={`h-2.5 w-2.5 rounded-full ${entityStyles[type].dot}`} />
              {entityStyles[type].label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {!focusIncident ? (
            <FilterField label="Program">
              <select
                className="input"
                onChange={(event) => setProgramFilter(event.target.value)}
                value={programFilter}
              >
                <option value="all">All programs</option>
                {scopedIncidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    {incident.title}
                  </option>
                ))}
              </select>
            </FilterField>
          ) : null}
          <FilterField label="Urgency">
            <select
              className="input"
              onChange={(event) => setUrgencyFilter(event.target.value)}
              value={urgencyFilter}
            >
              <option value="all">All urgency</option>
              {urgencyOptions.map((urgency) => (
                <option key={urgency} value={urgency}>
                  {toTitleCase(urgency)}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Status">
            <select
              className="input"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="all">All status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {toTitleCase(status)}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Organization">
            <select
              className="input"
              onChange={(event) => setOrganizationFilter(event.target.value)}
              value={organizationFilter}
            >
              <option value="all">All organizations</option>
              {organizationOptions.map((organization) => (
                <option key={organization} value={organization}>
                  {organization}
                </option>
              ))}
            </select>
          </FilterField>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {entityTypes.map((type) => (
            <label
              className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${
                enabledLayers[type]
                  ? "border-[#244a9b] bg-[#eef3ff] text-[#244a9b]"
                  : "border-zinc-200 bg-white text-zinc-500"
              }`}
              key={type}
            >
              <input
                checked={enabledLayers[type]}
                className="h-4 w-4 accent-[#244a9b]"
                onChange={() => toggleLayer(type)}
                type="checkbox"
              />
              {entityStyles[type].label}
            </label>
          ))}
        </div>
      </div>

      <div className={`relative ${compact ? "h-[330px]" : "h-[560px]"} overflow-hidden bg-[#dbeafe]`}>
        <WorldMapBackdrop />

        {mapItems.map((item) => (
          <MapMarker item={item} key={item.key} />
        ))}

        {mapItems.length ? (
          <div className="absolute bottom-4 left-4 right-4 z-30 grid max-h-44 gap-2 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
            {mapItems.slice(0, 6).map((item) => (
              <div
                className="rounded-md border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur"
                key={item.key}
              >
                <p className="text-sm font-semibold text-zinc-950">{item.title}</p>
                <p className="mt-1 text-xs text-zinc-600">
                  {entityStyles[item.type].label} - {item.locationName}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-x-4 bottom-4 z-30 rounded-md border border-white/80 bg-white/95 p-4 text-sm font-semibold text-zinc-600 shadow-sm backdrop-blur">
            No map items match the current filters.
          </div>
        )}
      </div>

      {!compact ? (
        <div className="grid border-t border-zinc-200 md:grid-cols-3">
          <MapStat label="Visible items" value={mapItems.length.toString()} />
          <MapStat label="Countries" value={countries.size.toString()} />
          <MapStat label="Affected people" value={formatNumber(affectedPeople)} />
        </div>
      ) : null}
    </section>
  );
}

type EntityType = "program" | "need" | "resource" | "team" | "partner";

type MapItem = {
  key: string;
  type: EntityType;
  title: string;
  locationName: string;
  incidentId: string;
  latitude: number;
  longitude: number;
  status: string;
  urgency: string;
  organization: string;
  href?: string;
  description: string;
  severity?: Incident["severity"];
};

const entityTypes = [
  "program",
  "need",
  "resource",
  "team",
  "partner",
] as const satisfies EntityType[];

const entityStyles: Record<EntityType, { dot: string; label: string; marker: string }> = {
  program: { dot: "bg-red-500", label: "Programs", marker: "bg-red-600" },
  need: { dot: "bg-amber-500", label: "Needs", marker: "bg-amber-500" },
  resource: { dot: "bg-emerald-500", label: "Resources", marker: "bg-emerald-600" },
  team: { dot: "bg-blue-500", label: "Teams", marker: "bg-blue-600" },
  partner: { dot: "bg-fuchsia-500", label: "Partners", marker: "bg-fuchsia-600" },
};

function buildMapItems({
  activities,
  incidentById,
  incidents,
  needs,
  resources,
  selectedIncidentIds,
  teams,
}: {
  activities: PartnerActivity[];
  incidentById: Map<string, Incident>;
  incidents: Incident[];
  needs: NeedReport[];
  resources: Resource[];
  selectedIncidentIds: Set<string>;
  teams: DeployedTeam[];
}) {
  const items: MapItem[] = [];

  incidents
    .filter((incident) => selectedIncidentIds.has(incident.id))
    .forEach((incident) => {
      items.push({
        key: `program:${incident.id}`,
        type: "program",
        title: incident.title,
        locationName: incident.locationName,
        incidentId: incident.id,
        latitude: incident.latitude,
        longitude: incident.longitude,
        status: incident.status,
        urgency: incident.severity,
        organization: incident.lead,
        href: `/incidents/${incident.id}`,
        description: `${incident.assignedTeams} teams, ${incident.openNeeds} open needs`,
        severity: incident.severity,
      });
    });

  needs
    .filter((need) => selectedIncidentIds.has(need.incidentId))
    .forEach((need) => {
      items.push({
        key: `need:${need.id}`,
        type: "need",
        title: need.category,
        locationName: need.locationName,
        incidentId: need.incidentId,
        latitude: need.latitude,
        longitude: need.longitude,
        status: need.status,
        urgency: need.urgency,
        organization: need.reportedBy,
        description: `${formatNumber(need.quantity)} ${need.unit} for ${formatNumber(need.affectedPeople)} people`,
      });
    });

  resources
    .filter(
      (resource) =>
        resource.assignedIncidentId &&
        selectedIncidentIds.has(resource.assignedIncidentId),
    )
    .forEach((resource) => {
      const incident = incidentById.get(resource.assignedIncidentId ?? "");

      if (!incident) return;

      items.push({
        key: `resource:${resource.id}`,
        type: "resource",
        title: resource.name,
        locationName: incident.locationName,
        incidentId: incident.id,
        ...offsetPosition(incident, resource.id, 1),
        status: resource.quantityCommitted > 0 ? "committed" : "available",
        urgency: "normal",
        organization: resource.warehouseLocation,
        description: `${formatNumber(resource.quantityCommitted)} ${resource.unit} committed`,
      });
    });

  teams
    .filter((team) => selectedIncidentIds.has(team.incidentId))
    .forEach((team) => {
      const incident = incidentById.get(team.incidentId);

      if (!incident) return;

      items.push({
        key: `team:${team.id}`,
        type: "team",
        title: team.name,
        locationName: incident.locationName,
        incidentId: team.incidentId,
        ...offsetPosition(incident, team.id, 2),
        status: "deployed",
        urgency: "normal",
        organization: team.role,
        description: team.members,
      });
    });

  activities
    .filter((activity) => selectedIncidentIds.has(activity.incidentId))
    .forEach((activity) => {
      const incident = incidentById.get(activity.incidentId);

      if (!incident) return;

      items.push({
        key: `partner:${activity.id}`,
        type: "partner",
        title: activity.organization,
        locationName: activity.locationName,
        incidentId: activity.incidentId,
        ...offsetPosition(incident, activity.id, 3),
        status: activity.status,
        urgency: "normal",
        organization: activity.organization,
        description: `${activity.sector}: ${activity.activity}`,
      });
    });

  return items;
}

function MapMarker({ item }: { item: MapItem }) {
  const marker = (
    <>
      <span className="h-3 w-3 rounded-full bg-white" />
      <span className="pointer-events-none absolute left-10 top-0 hidden w-64 rounded-md border border-zinc-200 bg-white p-3 text-left shadow-xl group-hover:block group-focus:block">
        <span className="block text-sm font-semibold text-zinc-950">
          {item.title}
        </span>
        <span className="mt-1 block text-xs text-zinc-500">
          {item.locationName}
        </span>
        <span className="mt-2 block text-xs leading-5 text-zinc-600">
          {item.description}
        </span>
        <span className="mt-2 flex flex-wrap gap-2">
          {item.severity ? <SeverityBadge severity={item.severity} /> : null}
          <StatusBadge status={item.status} />
        </span>
      </span>
    </>
  );
  const className = `group absolute z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white ${entityStyles[item.type].marker} shadow-lg outline-none transition hover:scale-110 focus:ring-2 focus:ring-[#244a9b] focus:ring-offset-2`;
  const style = projectPosition(item.latitude, item.longitude);

  if (item.href) {
    return (
      <Link
        aria-label={item.title}
        className={className}
        href={item.href}
        style={style}
      >
        {marker}
      </Link>
    );
  }

  return (
    <button aria-label={item.title} className={className} style={style} type="button">
      {marker}
    </button>
  );
}

function FilterField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-zinc-500">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function MapStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-zinc-200 px-4 py-3 md:border-r last:border-r-0">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function projectPosition(latitude: number, longitude: number): CSSProperties {
  const boundedLatitude = clamp(latitude, -85.0511, 85.0511);
  const latitudeRadians = (boundedLatitude * Math.PI) / 180;
  const left = ((longitude + 180) / 360) * 100;
  const top =
    ((1 -
      Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) /
        Math.PI) /
      2) *
    100;

  return {
    left: `${clamp(left, 3, 97)}%`,
    top: `${clamp(top, 5, 95)}%`,
  };
}

function offsetPosition(incident: Incident, id: string, ring: number) {
  const offset = hashId(id) % 9;
  const angle = (offset / 9) * Math.PI * 2;
  const distance = 0.3 + ring * 0.18;

  return {
    latitude: incident.latitude + Math.sin(angle) * distance,
    longitude: incident.longitude + Math.cos(angle) * distance,
  };
}

function hashId(id: string) {
  return id.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b),
  );
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function WorldMapBackdrop() {
  return (
    <>
      <iframe
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-85.0511%2C180%2C85.0511&layer=mapnik"
        title="OpenStreetMap world map"
      />
      <div className="pointer-events-none absolute inset-0 bg-white/10" />
      <a
        className="absolute bottom-2 right-2 z-30 rounded bg-white/90 px-2 py-1 text-[11px] font-semibold text-zinc-600 shadow-sm"
        href="https://www.openstreetmap.org/copyright"
        rel="noreferrer"
        target="_blank"
      >
        &copy; OpenStreetMap contributors
      </a>
    </>
  );
}
