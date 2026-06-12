import { AppShell } from "@/app/components/app-shell";
import { OpsMap } from "@/app/components/ops-map";
import { SectionHeader, StatusBadge } from "@/app/components/ui";
import { data, formatNumber } from "@/app/lib/data";

export default async function MapPage() {
  const incidents = await data.listIncidents();

  return (
    <AppShell active="Map">
      <div className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-[#244a9b]">Map view</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            Operational Map
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
            World map view of program locations for quick global awareness.
          </p>
        </header>

        <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <SectionHeader title="Map scope" />
            <div className="mt-4 grid gap-3">
              <MapSummary label="Programs" value={incidents.length.toString()} />
              <MapSummary
                label="Countries"
                value={new Set(incidents.map((incident) => incident.country)).size.toString()}
              />
              <MapSummary
                label="Affected people"
                value={formatNumber(
                  incidents.reduce(
                    (total, incident) => total + incident.affectedPeople,
                    0,
                  ),
                )}
              />
            </div>

            <div className="mt-6">
              <SectionHeader title="Program status" />
              <div className="mt-4 space-y-2">
                {incidents.map((incident) => (
                  <div className="rounded-md border border-zinc-200 p-3" key={incident.id}>
                    <p className="text-sm font-semibold text-zinc-950">
                      {incident.title}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={incident.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <SectionHeader title="Countries" />
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from(new Set(incidents.map((incident) => incident.country))).map(
                  (country) => (
                    <span
                      className="rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700"
                      key={country}
                    >
                      {country}
                    </span>
                  ),
                )}
              </div>
            </div>
          </aside>

          <OpsMap incidents={incidents} />
        </section>
      </div>
    </AppShell>
  );
}

function MapSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
