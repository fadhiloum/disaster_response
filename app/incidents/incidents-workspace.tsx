"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  SectionHeader,
  SeverityBadge,
  StatusBadge,
} from "@/app/components/ui";
import type { Incident } from "@/app/lib/demo-data";
import { formatDateTime, formatNumber } from "@/app/lib/demo-data";

type FilterKey = "region" | "country" | "state";

export function IncidentsWorkspace({
  initialIncidents,
}: {
  initialIncidents: Incident[];
}) {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    region: "",
    country: "",
    state: "",
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const options = useMemo(
    () => ({
      region: uniqueValues(initialIncidents.map((incident) => incident.region)),
      country: uniqueValues(initialIncidents.map((incident) => incident.country)),
      state: uniqueValues(initialIncidents.map((incident) => incident.state)),
    }),
    [initialIncidents],
  );

  const visibleIncidents = incidents.filter((incident) =>
    (Object.keys(filters) as FilterKey[]).every((key) => {
      return !filters[key] || incident[key] === filters[key];
    }),
  );

  async function deleteIncident(incident: Incident) {
    const confirmed = window.confirm(
      `Delete "${incident.title}" from this incident list?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(incident.id);

    try {
      await fetch(`/api/incidents/${incident.id}`, { method: "DELETE" });
      setIncidents((current) =>
        current.filter((item) => item.id !== incident.id),
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <SectionHeader
          action={
            <button
              className="min-h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
              onClick={() => setFilters({ region: "", country: "", state: "" })}
              type="button"
            >
              Clear
            </button>
          }
          title="Filters"
        />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <FilterSelect
            label="Region"
            onChange={(value) => setFilters((current) => ({ ...current, region: value }))}
            options={options.region}
            value={filters.region}
          />
          <FilterSelect
            label="Country"
            onChange={(value) => setFilters((current) => ({ ...current, country: value }))}
            options={options.country}
            value={filters.country}
          />
          <FilterSelect
            label="State"
            onChange={(value) => setFilters((current) => ({ ...current, state: value }))}
            options={options.state}
            value={filters.state}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 p-4">
          <SectionHeader title="All incidents" />
          <p className="text-sm font-semibold text-zinc-500">
            {visibleIncidents.length} of {incidents.length} shown
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Incident</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Country / State</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Affected</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {visibleIncidents.map((incident) => (
                <tr className="align-top hover:bg-zinc-50" key={incident.id}>
                  <td className="px-4 py-4">
                    <Link
                      className="font-semibold text-zinc-950 hover:text-teal-700"
                      href={`/incidents/${incident.id}`}
                    >
                      {incident.title}
                    </Link>
                    <p className="mt-1 text-sm text-zinc-500">
                      {incident.locationName} - {incident.disasterType}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-semibold text-zinc-700">
                    {incident.region}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    <span className="font-semibold text-zinc-800">
                      {incident.country}
                    </span>
                    <span className="mt-1 block">{incident.state}</span>
                  </td>
                  <td className="px-4 py-4">
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={incident.status} />
                  </td>
                  <td className="px-4 py-4 font-semibold text-zinc-800">
                    {formatNumber(incident.affectedPeople)}
                  </td>
                  <td className="px-4 py-4 text-zinc-500">
                    {formatDateTime(incident.startTime)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <details className="relative inline-block text-left">
                      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50">
                        Manage
                      </summary>
                      <div className="absolute right-0 z-30 mt-2 w-36 rounded-md border border-zinc-200 bg-white p-1 shadow-lg">
                        <Link
                          className="block rounded px-3 py-2 text-left text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                          href={`/incidents/${incident.id}/edit`}
                        >
                          Edit
                        </Link>
                        <button
                          className="block w-full rounded px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                          disabled={deletingId === incident.id}
                          onClick={() => void deleteIncident(incident)}
                          type="button"
                        >
                          {deletingId === incident.id ? "Deleting" : "Delete"}
                        </button>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!visibleIncidents.length ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No incidents match the selected location filters.
          </div>
        ) : null}
      </section>
    </>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-zinc-700">{label}</span>
      <select
        className="input mt-2"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">All {label.toLowerCase()}s</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
