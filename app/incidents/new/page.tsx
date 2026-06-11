import { AppShell } from "@/app/components/app-shell";
import { CommandLink, SecondaryLink } from "@/app/components/ui";

const disasterTypes = [
  "flood",
  "earthquake",
  "landslide",
  "fire",
  "storm",
  "conflict",
  "other",
];

export default function NewIncidentPage() {
  return (
    <AppShell active="Incidents">
      <div className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-teal-700">
            Incident management
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            Create Incident
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
            Capture the initial operating picture and location for a new response.
          </p>
        </header>

        <form className="grid gap-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm lg:grid-cols-2">
          <Field label="Title">
            <input
              className="input"
              name="title"
              placeholder="Riverside Flood Response"
              type="text"
            />
          </Field>

          <Field label="Disaster type">
            <select className="input" name="disasterType">
              {disasterTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>

          <Field label="Location">
            <input
              className="input"
              name="location"
              placeholder="District, city, or operational area"
              type="text"
            />
          </Field>

          <Field label="Start date and time">
            <input className="input" name="startTime" type="datetime-local" />
          </Field>

          <Field label="Severity">
            <select className="input" name="severity">
              <option>low</option>
              <option>moderate</option>
              <option>high</option>
              <option>critical</option>
            </select>
          </Field>

          <Field label="Status">
            <select className="input" name="status">
              <option>monitoring</option>
              <option>active</option>
              <option>stabilizing</option>
              <option>closed</option>
            </select>
          </Field>

          <Field label="Latitude">
            <input className="input" name="latitude" placeholder="13.755" type="number" />
          </Field>

          <Field label="Longitude">
            <input className="input" name="longitude" placeholder="100.514" type="number" />
          </Field>

          <div className="lg:col-span-2">
            <Field label="Description">
              <textarea
                className="input min-h-32 resize-y"
                name="description"
                placeholder="Situation overview, known impact, immediate risks, and access constraints."
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <CommandLink href="/incidents/flood-riverside">Save draft</CommandLink>
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
