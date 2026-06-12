import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { CommandLink, SecondaryLink } from "@/app/components/ui";
import { data } from "@/app/lib/data";

const disasterTypes = [
  "flood",
  "earthquake",
  "landslide",
  "fire",
  "storm",
  "conflict",
  "other",
];

export const dynamic = "force-dynamic";

export default async function EditIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = await data.getIncident(id);

  if (!incident) {
    notFound();
  }

  return (
    <AppShell active="Programs">
      <div className="space-y-6">
        <header>
          <Link className="text-sm font-semibold text-[#244a9b]" href="/incidents">
            Back to programs
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
            Edit Program
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
            Update the operating picture, geography, and response status for this
            program.
          </p>
        </header>

        <form className="grid gap-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm lg:grid-cols-2">
          <Field label="Program title">
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

          <Field label="Program lead">
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

          <fieldset className="grid gap-5 border-t border-zinc-200 pt-6 lg:col-span-2 lg:grid-cols-2">
            <legend className="text-lg font-semibold text-zinc-950">
              Master Budget
            </legend>

            <Field label="Budget currency">
              <select
                className="input"
                defaultValue={incident.budgetCurrency}
                name="budgetCurrency"
              >
                <option>MYR</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </Field>

            <Field label="Master budget amount">
              <input
                className="input"
                defaultValue={incident.masterBudgetAmount}
                min={0}
                name="masterBudgetAmount"
                type="number"
              />
            </Field>

            <div className="lg:col-span-2">
              <p className="text-sm font-semibold text-zinc-700">
                Sub-program allocations
              </p>
              <div className="mt-3 grid gap-3">
                {incident.subPrograms.map((subProgram) => (
                  <div
                    className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]"
                    key={subProgram.id}
                  >
                    <input
                      className="input"
                      defaultValue={subProgram.name}
                      name={`subProgramName-${subProgram.id}`}
                      type="text"
                    />
                    <input
                      className="input"
                      defaultValue={subProgram.budgetAllocated}
                      min={0}
                      name={`subProgramAllocation-${subProgram.id}`}
                      type="number"
                    />
                  </div>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="grid gap-5 border-t border-zinc-200 pt-6 lg:col-span-2 lg:grid-cols-2">
            <legend className="text-lg font-semibold text-zinc-950">
              Fund Requests
            </legend>

            {incident.fundRequests.map((request) => (
              <div className="grid gap-3 lg:col-span-2 lg:grid-cols-4" key={request.id}>
                <Field label="Sub-program">
                  <input
                    className="input"
                    defaultValue={request.subProgramName}
                    name={`fundRequestSubProgram-${request.id}`}
                    type="text"
                  />
                </Field>
                <Field label="Deployment team">
                  <input
                    className="input"
                    defaultValue={request.requestedByTeam}
                    name={`fundRequestTeam-${request.id}`}
                    type="text"
                  />
                </Field>
                <Field label="Amount">
                  <input
                    className="input"
                    defaultValue={request.amount}
                    max={incident.masterBudgetAmount}
                    min={0}
                    name={`fundRequestAmount-${request.id}`}
                    type="number"
                  />
                </Field>
                <Field label="Status">
                  <select
                    className="input"
                    defaultValue={request.status}
                    name={`fundRequestStatus-${request.id}`}
                  >
                    <option>draft</option>
                    <option>requested</option>
                    <option>approved</option>
                    <option>released</option>
                  </select>
                </Field>
              </div>
            ))}
          </fieldset>

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
