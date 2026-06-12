import Link from "next/link";
import {
  formatNumber,
  type Incident,
} from "@/app/lib/data/types";
import { SeverityBadge, StatusBadge } from "@/app/components/ui";

export function OpsMap({
  incidents,
  focusIncident,
  compact = false,
}: {
  incidents: Incident[];
  focusIncident?: Incident;
  compact?: boolean;
}) {
  const visibleIncidents = focusIncident ? [focusIncident] : incidents;
  const countries = new Set(visibleIncidents.map((incident) => incident.country));
  const affectedPeople = visibleIncidents.reduce(
    (total, incident) => total + incident.affectedPeople,
    0,
  );

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">
            World Incident Map
          </h2>
          <p className="text-sm text-zinc-500">
            {focusIncident
              ? `${focusIncident.locationName}, ${focusIncident.country}`
              : "All incidents by global location"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Incident
          </span>
        </div>
      </div>

      <div className={`relative ${compact ? "h-[330px]" : "h-[560px]"} overflow-hidden bg-[#cfe2ea]`}>
        <WorldMapBackdrop />

        {visibleIncidents.map((incident) => {
          const position = projectIncident(incident);

          return (
            <Link
              aria-label={incident.title}
              className="group absolute z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-red-600 shadow-lg outline-none transition hover:scale-110 focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
              href={`/incidents/${incident.id}`}
              key={incident.id}
              style={position}
            >
              <span className="h-3 w-3 rounded-full bg-white" />
              <span className="pointer-events-none absolute left-10 top-0 hidden w-64 rounded-md border border-zinc-200 bg-white p-3 text-left shadow-xl group-hover:block group-focus:block">
                <span className="block text-sm font-semibold text-zinc-950">
                  {incident.title}
                </span>
                <span className="mt-1 block text-xs text-zinc-500">
                  {incident.locationName}, {incident.country}
                </span>
                <span className="mt-2 flex gap-2">
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                </span>
              </span>
            </Link>
          );
        })}

        <div className="absolute bottom-4 left-4 right-4 z-30 grid gap-2 sm:grid-cols-3">
          {visibleIncidents.map((incident) => (
            <div
              className="rounded-md border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur"
              key={incident.id}
            >
              <p className="text-sm font-semibold text-zinc-950">{incident.title}</p>
              <p className="mt-1 text-xs text-zinc-600">
                {incident.country} - {incident.assignedTeams} teams,{" "}
                {incident.openNeeds} open needs
              </p>
            </div>
          ))}
        </div>
      </div>

      {!compact ? (
        <div className="grid border-t border-zinc-200 md:grid-cols-3">
          <MapStat label="Incidents" value={visibleIncidents.length.toString()} />
          <MapStat label="Countries" value={countries.size.toString()} />
          <MapStat label="Affected people" value={formatNumber(affectedPeople)} />
        </div>
      ) : null}
    </section>
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

function projectIncident(incident: Incident): React.CSSProperties {
  const left = ((incident.longitude + 180) / 360) * 100;
  const top = ((90 - incident.latitude) / 180) * 100;

  return {
    left: `${left}%`,
    top: `${top}%`,
  };
}

function WorldMapBackdrop() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 1000 500"
    >
      <defs>
        <pattern height="50" id="grid" patternUnits="userSpaceOnUse" width="50">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ffffff" strokeOpacity="0.32" strokeWidth="1" />
        </pattern>
      </defs>
      <rect fill="#cfe2ea" height="500" width="1000" />
      <rect fill="url(#grid)" height="500" width="1000" />
      <g fill="none" opacity="0.28" stroke="#6b8c9b" strokeWidth="1">
        <path d="M0 250 H1000" />
        <path d="M500 0 V500" />
        <path d="M250 0 V500" />
        <path d="M750 0 V500" />
      </g>
      <g fill="#d9d2ba" stroke="#a8a089" strokeWidth="2">
        <path d="M96 122 L154 84 L238 82 L298 118 L330 176 L294 230 L228 232 L202 282 L142 278 L106 230 L62 204 L58 154 Z" />
        <path d="M280 255 L330 286 L344 356 L312 438 L262 470 L232 410 L246 334 Z" />
        <path d="M462 128 L518 112 L570 134 L564 178 L514 192 L454 174 Z" />
        <path d="M496 204 L568 190 L632 236 L628 310 L590 404 L522 374 L478 304 Z" />
        <path d="M586 126 L678 90 L806 118 L916 174 L902 244 L814 236 L760 282 L672 258 L610 214 Z" />
        <path d="M774 318 L860 330 L902 384 L860 430 L778 408 L746 356 Z" />
        <path d="M406 70 L470 40 L534 60 L506 98 L440 106 Z" />
      </g>
      <g fill="#bfcf98" opacity="0.72">
        <path d="M620 170 L706 146 L770 164 L746 210 L660 216 Z" />
        <path d="M520 238 L584 226 L604 292 L560 354 L514 322 Z" />
        <path d="M120 152 L210 112 L286 146 L252 204 L150 212 Z" />
      </g>
    </svg>
  );
}
