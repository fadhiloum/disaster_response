import Link from "next/link";
import { AppShell } from "@/app/components/app-shell";
import { CommandLink, SectionHeader, SeverityBadge, StatusBadge } from "@/app/components/ui";
import { formatDateTime, formatNumber, incidents } from "@/app/lib/demo-data";

export default function IncidentsPage() {
  return (
    <AppShell active="Incidents">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">
              Incident management
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
              Incidents
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
              Track active, stabilizing, monitoring, and closed response events.
            </p>
          </div>
          <CommandLink href="/incidents/new">Create incident</CommandLink>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <SectionHeader title="Filters" />
          <div className="mt-4 flex flex-wrap gap-2">
            {["All", "Active", "Monitoring", "Stabilizing", "Critical", "High"].map(
              (filter) => (
                <button
                  className="min-h-9 rounded-md border border-zinc-300 px-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
                  key={filter}
                  type="button"
                >
                  {filter}
                </button>
              ),
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="grid border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase text-zinc-500 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr]">
            <span>Incident</span>
            <span className="hidden md:block">Severity</span>
            <span className="hidden md:block">Status</span>
            <span className="hidden md:block">Affected</span>
            <span className="hidden md:block">Started</span>
          </div>
          <div className="divide-y divide-zinc-200">
            {incidents.map((incident) => (
              <Link
                className="grid gap-3 px-4 py-4 transition hover:bg-zinc-50 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr] md:items-center"
                href={`/incidents/${incident.id}`}
                key={incident.id}
              >
                <div>
                  <p className="font-semibold text-zinc-950">{incident.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {incident.locationName} - {incident.disasterType}
                  </p>
                </div>
                <div>
                  <SeverityBadge severity={incident.severity} />
                </div>
                <div>
                  <StatusBadge status={incident.status} />
                </div>
                <p className="text-sm font-semibold text-zinc-800">
                  {formatNumber(incident.affectedPeople)}
                </p>
                <p className="text-sm text-zinc-500">
                  {formatDateTime(incident.startTime)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
