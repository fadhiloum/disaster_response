import { AppShell } from "@/app/components/app-shell";
import { SectionHeader } from "@/app/components/ui";
import { getIncident, resources } from "@/app/lib/demo-data";

export default function ResourcesPage() {
  return (
    <AppShell active="Resources">
      <div className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-teal-700">
            Resource and inventory tracking
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            Resources
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
            Monitor warehouse stock, committed quantities, expiry risk, and
            incident assignments.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <ResourceSummary label="Total items" value={resources.length.toString()} />
          <ResourceSummary
            label="Available units"
            value={resources
              .reduce((total, resource) => total + resource.quantityAvailable, 0)
              .toString()}
          />
          <ResourceSummary
            label="Committed units"
            value={resources
              .reduce((total, resource) => total + resource.quantityCommitted, 0)
              .toString()}
          />
          <ResourceSummary
            label="Warehouses"
            value={new Set(resources.map((resource) => resource.warehouseLocation)).size.toString()}
          />
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="p-4">
            <SectionHeader title="Inventory" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">Committed</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3">Assigned incident</th>
                  <th className="px-4 py-3">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {resources.map((resource) => {
                  const incident = resource.assignedIncidentId
                    ? getIncident(resource.assignedIncidentId)
                    : null;

                  return (
                    <tr key={resource.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-zinc-950">{resource.name}</p>
                        <p className="mt-1 text-zinc-500">{resource.category}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold text-zinc-800">
                        {resource.quantityAvailable} {resource.unit}
                      </td>
                      <td className="px-4 py-4 font-semibold text-zinc-800">
                        {resource.quantityCommitted} {resource.unit}
                      </td>
                      <td className="px-4 py-4 text-zinc-600">
                        {resource.warehouseLocation}
                      </td>
                      <td className="px-4 py-4 text-zinc-600">
                        {incident?.title ?? "Unassigned"}
                      </td>
                      <td className="px-4 py-4 text-zinc-600">
                        {resource.expiryDate ?? "Not applicable"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function ResourceSummary({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
    </article>
  );
}
