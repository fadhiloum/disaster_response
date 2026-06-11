import Link from "next/link";
import {
  incidents,
  needReports,
  partnerActivities,
  resources,
  type Incident,
} from "@/app/lib/demo-data";
import { SeverityBadge, StatusBadge } from "@/app/components/ui";

const markerPositions: Record<string, { left: string; top: string }> = {
  "flood-riverside": { left: "42%", top: "39%" },
  "landslide-hill-ward": { left: "57%", top: "31%" },
  "warehouse-fire-eastport": { left: "72%", top: "58%" },
  "need-water-zone-c": { left: "46%", top: "48%" },
  "need-medical-riverside": { left: "35%", top: "52%" },
  "need-shelter-hill": { left: "62%", top: "24%" },
  "need-wash-eastport": { left: "79%", top: "65%" },
};

export function OpsMap({
  focusIncident,
  compact = false,
}: {
  focusIncident?: Incident;
  compact?: boolean;
}) {
  const visibleIncidents = focusIncident ? [focusIncident] : incidents;
  const visibleNeeds = focusIncident
    ? needReports.filter((need) => need.incidentId === focusIncident.id)
    : needReports;

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">
            Operational Map
          </h2>
          <p className="text-sm text-zinc-500">
            {focusIncident ? focusIncident.locationName : "All active incidents"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Incident
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Need
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
            Resource
          </span>
        </div>
      </div>

      <div className={`relative ${compact ? "h-[330px]" : "h-[520px]"} overflow-hidden bg-[#d9e6dc]`}>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.32)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.32)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute left-[-8%] top-[54%] h-24 w-[120%] -rotate-6 rounded-full bg-[#9cc5d1]" />
        <div className="absolute left-[6%] top-[18%] h-5 w-[90%] rotate-12 rounded-full bg-[#efe7d6]" />
        <div className="absolute left-[18%] top-[72%] h-4 w-[70%] -rotate-12 rounded-full bg-[#efe7d6]" />
        <div className="absolute left-[58%] top-[-12%] h-[128%] w-5 rotate-[18deg] rounded-full bg-[#efe7d6]" />
        <div className="absolute left-[18%] top-[12%] h-28 w-40 rounded-full bg-emerald-200/50" />
        <div className="absolute bottom-[10%] right-[7%] h-40 w-48 rounded-full bg-amber-100/80" />
        <div className="absolute left-[9%] top-[67%] h-16 w-32 rounded-full border border-red-300 bg-red-100/70" />

        <MapLabel left="12%" top="23%" label="North Depot" />
        <MapLabel left="30%" top="61%" label="Central Warehouse" />
        <MapLabel left="68%" top="73%" label="East Logistics Hub" />

        {visibleIncidents.map((incident) => {
          const position = markerPositions[incident.id];

          return (
            <Link
              aria-label={incident.title}
              className="group absolute z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-red-600 shadow-lg outline-none transition hover:scale-110 focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
              href={`/incidents/${incident.id}`}
              key={incident.id}
              style={position}
            >
              <span className="h-3 w-3 rounded-full bg-white" />
              <span className="pointer-events-none absolute left-10 top-0 hidden w-56 rounded-md border border-zinc-200 bg-white p-3 text-left shadow-xl group-hover:block group-focus:block">
                <span className="block text-sm font-semibold text-zinc-950">
                  {incident.title}
                </span>
                <span className="mt-2 flex gap-2">
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                </span>
              </span>
            </Link>
          );
        })}

        {visibleNeeds.map((need) => {
          const position = markerPositions[need.id];

          return (
            <div
              className="absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-amber-500 shadow"
              key={need.id}
              style={position}
              title={`${need.category}: ${need.locationName}`}
            />
          );
        })}

        <ResourceMarker left="31%" top="58%" count={resources[0].quantityAvailable} />
        <ResourceMarker left="16%" top="28%" count={resources[1].quantityAvailable} />
        <ResourceMarker left="72%" top="74%" count={resources[3].quantityAvailable} />

        <div className="absolute bottom-4 left-4 right-4 z-30 grid gap-2 sm:grid-cols-3">
          {visibleIncidents.map((incident) => (
            <div
              className="rounded-md border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur"
              key={incident.id}
            >
              <p className="text-sm font-semibold text-zinc-950">{incident.title}</p>
              <p className="mt-1 text-xs text-zinc-600">
                {incident.assignedTeams} teams assigned, {incident.openNeeds} open needs
              </p>
            </div>
          ))}
        </div>
      </div>

      {!compact ? (
        <div className="grid border-t border-zinc-200 md:grid-cols-3">
          <MapStat label="Incidents" value={visibleIncidents.length.toString()} />
          <MapStat label="Needs" value={visibleNeeds.length.toString()} />
          <MapStat
            label="Partner activities"
            value={partnerActivities.length.toString()}
          />
        </div>
      ) : null}
    </section>
  );
}

function MapLabel({
  left,
  top,
  label,
}: {
  left: string;
  top: string;
  label: string;
}) {
  return (
    <div
      className="absolute z-10 rounded bg-white/80 px-2 py-1 text-xs font-semibold text-zinc-700 shadow-sm"
      style={{ left, top }}
    >
      {label}
    </div>
  );
}

function ResourceMarker({
  left,
  top,
  count,
}: {
  left: string;
  top: string;
  count: number;
}) {
  return (
    <div
      className="absolute z-20 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border-2 border-white bg-teal-600 text-xs font-bold text-white shadow"
      style={{ left, top }}
      title={`${count} units available`}
    >
      {count}
    </div>
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
