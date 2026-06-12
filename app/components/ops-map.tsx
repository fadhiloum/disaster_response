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
            World Program Map
          </h2>
          <p className="text-sm text-zinc-500">
            {focusIncident
              ? `${focusIncident.locationName}, ${focusIncident.country}`
              : "All programs by global location"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Program
          </span>
        </div>
      </div>

      <div className={`relative ${compact ? "h-[330px]" : "h-[560px]"} overflow-hidden bg-[#dbeafe]`}>
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
          <MapStat label="Programs" value={visibleIncidents.length.toString()} />
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
  const latitude = Math.max(Math.min(incident.latitude, 85.0511), -85.0511);
  const latitudeRadians = (latitude * Math.PI) / 180;
  const left = ((incident.longitude + 180) / 360) * 100;
  const top =
    ((1 -
      Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) /
        Math.PI) /
      2) *
    100;

  return {
    left: `${left}%`,
    top: `${top}%`,
  };
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
