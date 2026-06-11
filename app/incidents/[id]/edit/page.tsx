import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { CommandLink, SecondaryLink } from "@/app/components/ui";
import { getIncident, incidents } from "@/app/lib/demo-data";

const disasterTypes = [
  "flood",
  "earthquake",
  "landslide",
  "fire",
  "storm",
  "conflict",
  "other",
];

export function generateStaticParams() {
  return incidents.map((incident) => ({ id: incident.id }));
}

export default async function EditIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = getIncident(id);

  if (!incident) {
    notFound();
  }

  return (
    <AppShell active="Incidents">
      <div className="space-y-6">
        <header>
          <Link className="text-sm font-semibold text-teal-700" href="/incidents">
            Back to incidents
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
            Edit Incident
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
            Update the operating picture, geography, and response status for this
            incident.
          </p>
        </header>

        <form className="grid gap-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm lg:grid-cols-2">
          <Field label="Title">
            <input className="input" defaultValue={incident.title} name="title" type="text" />
          </Field>

          <Field label="Disaster type">
            <select className="input" defaultValue={incident.disasterType} name="disasterType">
              {disasterTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>

          <Field label="Region">
            <input className="input" defaultValue={incident.region} name="region" type="text" />
          </Field>

          <Field label="Country">
            <input className="input" defaultValue={incident.country} name="country" type="text" />
          </Field>

          <Field label="State">
            <input className="input" defaultValue={incident.state} name="state" type="text" />
          </Field>

          <Field label="Location">
            <input
              className="input"
              defaultValue={incident.locationName}
              name="location"
              type="text"
            />
          </Field>

          <Field label="Start date and time">
            <input
              className="input"
              defaultValue={incident.startTime.slice(0, 16)}
              name="startTime"
              type="datetime-local"
            />
          </Field>

          <Field label="Incident lead">
            <input className="input" defaultValue={incident.lead} name="lead" type="text" />
          </Field>

          <Field label="Severity">
            <select className="input" defaultValue={incident.severity} name="severity">
              <option>low</option>
              <option>moderate</option>
              <option>high</option>
              <option>critical</option>
            </select>
          </Field>

          <Field label="Status">
            <select className="input" defaultValue={incident.status} name="status">
              <option>monitoring</option>
              <option>active</option>
              <option>stabilizing</option>
              <option>closed</option>
            </select>
          </Field>

          <Field label="Latitude">
            <input className="input" defaultValue={incident.latitude} name="latitude" type="number" />
          </Field>

          <Field label="Longitude">
            <input className="input" defaultValue={incident.longitude} name="longitude" type="number" />
          </Field>

          <div className="lg:col-span-2">
            <Field label="Description">
              <textarea
                className="input min-h-32 resize-y"
                defaultValue={incident.description}
                name="description"
              />
            </Field>
          </div>

          <div className="lg:col-span-2">
            <Field label="Latest update">
              <textarea
                className="input min-h-28 resize-y"
                defaultValue={incident.latestUpdate}
                name="latestUpdate"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <CommandLink href={`/incidents/${incident.id}`}>Save changes</CommandLink>
            <SecondaryLink href="/incidents">Cancel</SecondaryLink>
          </div>
        </form>
      </div>
    </AppShell>
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
