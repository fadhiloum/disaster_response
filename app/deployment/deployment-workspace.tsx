"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, SectionHeader, StatusBadge } from "@/app/components/ui";
import type { DeployedTeam, Incident, Resource } from "@/app/lib/demo-data";
import { formatDateTime, formatNumber } from "@/app/lib/demo-data";

type Tab = "items" | "teams";

type DeploymentLogEntry = {
  id: string;
  incidentId: string;
  resourceName: string;
  quantity: number;
  unit: string;
  deployedAt: string;
};

export function DeploymentWorkspace({
  incidents,
  initialResources,
  initialTeams,
}: {
  incidents: Incident[];
  initialResources: Resource[];
  initialTeams: DeployedTeam[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("items");
  const [resources, setResources] = useState(initialResources);
  const [teams, setTeams] = useState(initialTeams);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [incidentByResource, setIncidentByResource] = useState<Record<string, string>>(
    {},
  );
  const [quantityByResource, setQuantityByResource] = useState<Record<string, number>>(
    {},
  );
  const [deploymentLog, setDeploymentLog] = useState<DeploymentLogEntry[]>([]);
  const [teamForm, setTeamForm] = useState({
    incidentId: incidents[0]?.id ?? "",
    name: "",
    role: "",
    members: "",
  });

  const fifoResources = useMemo(
    () =>
      [...resources].sort((a, b) => {
        const expiryA = a.expiryDate ?? "9999-12-31";
        const expiryB = b.expiryDate ?? "9999-12-31";

        return (
          a.category.localeCompare(b.category) ||
          expiryA.localeCompare(expiryB) ||
          a.receivedAt.localeCompare(b.receivedAt)
        );
      }),
    [resources],
  );

  const firstFreeByCategory = useMemo(() => {
    const map = new Map<string, string>();

    fifoResources.forEach((resource) => {
      if (!map.has(resource.category) && freeQuantity(resource) > 0) {
        map.set(resource.category, resource.id);
      }
    });

    return map;
  }, [fifoResources]);

  function confirmItemDeployment() {
    const chosenResources = fifoResources.filter((resource) => selected[resource.id]);

    if (!chosenResources.length) {
      window.alert("Select at least one item to deploy.");
      return;
    }

    const invalid = chosenResources.find((resource) => {
      const quantity = quantityByResource[resource.id] ?? 1;
      return (
        !incidentByResource[resource.id] ||
        quantity <= 0 ||
        quantity > freeQuantity(resource)
      );
    });

    if (invalid) {
      window.alert("Choose an incident and a valid quantity for each selected item.");
      return;
    }

    const deployedAt = new Date().toISOString();
    const nextLog: DeploymentLogEntry[] = chosenResources.map((resource) => ({
      id: `${resource.id}-${deployedAt}`,
      incidentId: incidentByResource[resource.id],
      quantity: quantityByResource[resource.id] ?? 1,
      resourceName: resource.name,
      unit: resource.unit,
      deployedAt,
    }));

    setResources((current) =>
      current.map((resource) => {
        const logEntry = nextLog.find((entry) =>
          entry.id.startsWith(`${resource.id}-`),
        );

        if (!logEntry) {
          return resource;
        }

        return {
          ...resource,
          assignedIncidentId: logEntry.incidentId,
          quantityCommitted: resource.quantityCommitted + logEntry.quantity,
        };
      }),
    );
    setDeploymentLog((current) => [...nextLog, ...current]);
    setSelected({});
  }

  function confirmTeamDeployment() {
    if (!teamForm.incidentId || !teamForm.name.trim()) {
      window.alert("Add a team name and select an incident.");
      return;
    }

    setTeams((current) => [
      {
        id: `team-${Date.now()}`,
        incidentId: teamForm.incidentId,
        members: teamForm.members.trim() || teamForm.name.trim(),
        name: teamForm.name.trim(),
        role: teamForm.role.trim() || "Field deployment",
        deployedAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setTeamForm({
      incidentId: teamForm.incidentId,
      members: "",
      name: "",
      role: "",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
        <TabButton active={activeTab === "items"} onClick={() => setActiveTab("items")}>
          Items
        </TabButton>
        <TabButton active={activeTab === "teams"} onClick={() => setActiveTab("teams")}>
          Teams
        </TabButton>
      </div>

      {activeTab === "items" ? (
        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 p-4">
            <SectionHeader title="FIFO Item Deployment" />
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
              onClick={confirmItemDeployment}
              type="button"
            >
              Confirm deployment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Select</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">FIFO</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Incident</th>
                  <th className="px-4 py-3">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {fifoResources.map((resource, index) => {
                  const free = freeQuantity(resource);
                  const currentIncident = incidents.find(
                    (incident) => incident.id === resource.assignedIncidentId,
                  );

                  return (
                    <tr className="align-top hover:bg-zinc-50" key={resource.id}>
                      <td className="px-4 py-4">
                        <input
                          checked={Boolean(selected[resource.id])}
                          className="h-4 w-4 accent-teal-700"
                          disabled={free <= 0}
                          onChange={(event) =>
                            setSelected((current) => ({
                              ...current,
                              [resource.id]: event.target.checked,
                            }))
                          }
                          type="checkbox"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-zinc-950">{resource.name}</p>
                        <p className="mt-1 text-zinc-500">
                          {resource.category} - {resource.warehouseLocation}
                        </p>
                        {firstFreeByCategory.get(resource.category) === resource.id ? (
                          <span className="mt-2 inline-flex">
                            <Badge tone="green">Next FIFO pick</Badge>
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-zinc-600">
                        <p className="font-semibold text-zinc-800">Queue #{index + 1}</p>
                        <p className="mt-1">Received {resource.receivedAt}</p>
                        <p className="mt-1">Expiry {resource.expiryDate ?? "N/A"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-zinc-800">
                          {formatNumber(free)} {resource.unit} free
                        </p>
                        <p className="mt-1 text-zinc-500">
                          {formatNumber(resource.quantityCommitted)} committed
                        </p>
                        <p className="mt-1 text-zinc-500">
                          Current: {currentIncident?.title ?? "Unassigned"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          className="input min-w-56"
                          onChange={(event) =>
                            setIncidentByResource((current) => ({
                              ...current,
                              [resource.id]: event.target.value,
                            }))
                          }
                          value={incidentByResource[resource.id] ?? ""}
                        >
                          <option value="">Select incident</option>
                          {incidents.map((incident) => (
                            <option key={incident.id} value={incident.id}>
                              {incident.title}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          className="input w-28"
                          max={Math.max(free, 1)}
                          min={1}
                          onChange={(event) =>
                            setQuantityByResource((current) => ({
                              ...current,
                              [resource.id]: Number(event.target.value),
                            }))
                          }
                          type="number"
                          value={quantityByResource[resource.id] ?? 1}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-zinc-200 p-4">
            <SectionHeader title="Recent item deployments" />
            <div className="mt-4 space-y-3">
              {deploymentLog.length ? (
                deploymentLog.map((entry) => {
                  const incident = incidents.find((item) => item.id === entry.incidentId);

                  return (
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4"
                      key={entry.id}
                    >
                      <div>
                        <p className="font-semibold text-zinc-950">
                          {entry.quantity} {entry.unit} {entry.resourceName}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {incident?.title ?? entry.incidentId}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-zinc-600">
                        {formatDateTime(entry.deployedAt)}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-500">
                  Confirm a deployment to add an item movement here.
                </p>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(360px,1.2fr)]">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <SectionHeader title="Deploy Team" />
            <div className="mt-5 space-y-4">
              <Field label="Incident">
                <select
                  className="input"
                  onChange={(event) =>
                    setTeamForm((current) => ({
                      ...current,
                      incidentId: event.target.value,
                    }))
                  }
                  value={teamForm.incidentId}
                >
                  {incidents.map((incident) => (
                    <option key={incident.id} value={incident.id}>
                      {incident.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Team name">
                <input
                  className="input"
                  onChange={(event) =>
                    setTeamForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Medical Response Unit"
                  type="text"
                  value={teamForm.name}
                />
              </Field>
              <Field label="Role">
                <input
                  className="input"
                  onChange={(event) =>
                    setTeamForm((current) => ({ ...current, role: event.target.value }))
                  }
                  placeholder="Mobile clinic support"
                  type="text"
                  value={teamForm.role}
                />
              </Field>
              <Field label="Names">
                <textarea
                  className="input min-h-28 resize-y"
                  onChange={(event) =>
                    setTeamForm((current) => ({
                      ...current,
                      members: event.target.value,
                    }))
                  }
                  placeholder="Enter team member names manually"
                  value={teamForm.members}
                />
              </Field>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
                onClick={confirmTeamDeployment}
                type="button"
              >
                Confirm team deployment
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <SectionHeader title="Deployed Teams" />
            <div className="mt-4 space-y-3">
              {teams.map((team) => {
                const incident = incidents.find((item) => item.id === team.incidentId);

                return (
                  <article className="rounded-lg border border-zinc-200 p-4" key={team.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-950">{team.name}</p>
                        <p className="mt-1 text-sm text-zinc-500">{team.role}</p>
                      </div>
                      <StatusBadge status="active" />
                    </div>
                    <p className="mt-3 text-sm text-zinc-600">{team.members}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                      <Link
                        className="font-semibold text-teal-700"
                        href={`/incidents/${team.incidentId}`}
                      >
                        {incident?.title ?? team.incidentId}
                      </Link>
                      <span className="font-semibold text-zinc-500">
                        {formatDateTime(team.deployedAt)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`min-h-9 rounded-md px-4 text-sm font-semibold transition ${
        active
          ? "bg-zinc-950 text-white"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-zinc-700">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function freeQuantity(resource: Resource) {
  return Math.max(resource.quantityAvailable - resource.quantityCommitted, 0);
}
