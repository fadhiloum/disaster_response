import { AppShell } from "@/app/components/app-shell";
import { OpsMap } from "@/app/components/ops-map";
import { SectionHeader, StatusBadge } from "@/app/components/ui";
import { incidents, needReports } from "@/app/lib/demo-data";

export default function MapPage() {
  return (
    <AppShell active="Map">
      <div className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-teal-700">Map view</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            Operational Map
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
            Incident points, need reports, resource hubs, teams, and hazards in
            one shared view.
          </p>
        </header>

        <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <SectionHeader title="Layers" />
            <div className="mt-4 space-y-3">
              {["Incidents", "Needs", "Warehouses", "Assigned teams", "Road hazards"].map(
                (layer) => (
                  <label
                    className="flex min-h-10 items-center justify-between gap-3 rounded-md border border-zinc-200 px-3"
                    key={layer}
                  >
                    <span className="text-sm font-semibold text-zinc-700">{layer}</span>
                    <input defaultChecked className="h-4 w-4 accent-teal-700" type="checkbox" />
                  </label>
                ),
              )}
            </div>

            <div className="mt-6">
              <SectionHeader title="Incident status" />
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
              <SectionHeader title="Open needs" />
              <p className="mt-3 text-3xl font-semibold text-zinc-950">
                {needReports.length}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Field reports currently visible on the map.
              </p>
            </div>
          </aside>

          <OpsMap />
        </section>
      </div>
    </AppShell>
  );
}
