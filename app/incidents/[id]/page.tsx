import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { Icon, type IconName } from "@/app/components/icons";
import { OpsMap } from "@/app/components/ops-map";
import {
  CommandLink,
  PriorityBadge,
  SectionHeader,
  SeverityBadge,
  StatusBadge,
} from "@/app/components/ui";
import {
  formatDateTime,
  formatNumber,
  getIncident,
  getIncidentActivities,
  getIncidentNeeds,
  getIncidentResources,
  getIncidentSitreps,
  getIncidentTeams,
  getIncidentTasks,
  incidents,
} from "@/app/lib/demo-data";

const incidentTabs = [
  { icon: "overview", id: "overview", label: "Overview" },
  { icon: "map", id: "map", label: "Map" },
  { icon: "needs", id: "needs", label: "Needs" },
  { icon: "tasks", id: "tasks", label: "Tasks" },
  { icon: "deployment", id: "deployment", label: "Deployment" },
  { icon: "partners", id: "partners", label: "Partners" },
  { icon: "report", id: "sitreps", label: "SitReps" },
] satisfies Array<{ icon: IconName; id: string; label: string }>;

export function generateStaticParams() {
  return incidents.map((incident) => ({ id: incident.id }));
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = getIncident(id);

  if (!incident) {
    notFound();
  }

  const needs = getIncidentNeeds(incident.id);
  const incidentTasks = getIncidentTasks(incident.id);
  const activities = getIncidentActivities(incident.id);
  const sitreps = getIncidentSitreps(incident.id);
  const assignedResources = getIncidentResources(incident.id);
  const deployedTeams = getIncidentTeams(incident.id);

  return (
    <AppShell active="Incidents">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Link className="text-sm font-semibold text-[#244a9b]" href="/incidents">
              Back to incidents
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
              {incident.title}
            </h1>
            <p className="mt-3 max-w-4xl text-base leading-7 text-zinc-600">
              {incident.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
              <StatusBadge status={incident.disasterType} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <CommandLink href={`/api/incidents/${incident.id}/concept-note`}>
              Export Concept Note
            </CommandLink>
            <CommandLink href="/deployment">Manage Deployment</CommandLink>
            <CommandLink href="/sitreps">Generate SitRep</CommandLink>
            <CommandLink href="/map">Open map</CommandLink>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
          {incidentTabs.map(
            (tab) => (
              <a
                className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-[#eef3ff] hover:text-[#244a9b]"
                href={`#${tab.id}`}
                key={tab.id}
              >
                <Icon className="h-4 w-4" name={tab.icon} />
                {tab.label}
              </a>
            ),
          )}
        </nav>

        <section className="grid gap-4 md:grid-cols-4" id="overview">
          <OverviewStat label="Affected people" value={formatNumber(incident.affectedPeople)} />
          <OverviewStat label="Open needs" value={incident.openNeeds.toString()} />
          <OverviewStat label="Assigned teams" value={incident.assignedTeams.toString()} />
          <OverviewStat label="Resource gaps" value={incident.resourceGaps.toString()} />
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionHeader title="Latest Situation Update" />
          <p className="mt-3 max-w-4xl text-base leading-7 text-zinc-700">
            {incident.latestUpdate}
          </p>
          <dl className="mt-5 grid gap-4 text-sm md:grid-cols-3">
            <Info label="Location" value={incident.locationName} />
            <Info label="Country / state" value={`${incident.country} / ${incident.state}`} />
            <Info label="Started" value={formatDateTime(incident.startTime)} />
            <Info label="Incident lead" value={incident.lead} />
          </dl>
        </section>

        <div id="map">
          <OpsMap focusIncident={incident} />
        </div>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" id="needs">
          <SectionHeader title="Needs" />
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {needs.map((need) => (
              <article className="rounded-lg border border-zinc-200 p-4" key={need.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-950">{need.category}</p>
                    <p className="mt-1 text-sm text-zinc-500">{need.locationName}</p>
                  </div>
                  <div className="flex gap-2">
                    <PriorityBadge priority={need.urgency} />
                    <StatusBadge status={need.status} />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{need.notes}</p>
                <p className="mt-3 text-sm font-semibold text-zinc-800">
                  {formatNumber(need.quantity)} {need.unit} for{" "}
                  {formatNumber(need.affectedPeople)} people
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" id="tasks">
          <SectionHeader title="Tasks" />
          <div className="mt-4 divide-y divide-zinc-200">
            {incidentTasks.map((task) => (
              <article className="grid gap-3 py-4 lg:grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr] lg:items-center" key={task.id}>
                <div>
                  <p className="font-semibold text-zinc-950">{task.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{task.description}</p>
                </div>
                <p className="text-sm font-semibold text-zinc-700">{task.assignee}</p>
                <StatusBadge status={task.status} />
                <p className="text-sm text-zinc-500">{formatDateTime(task.dueTime)}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          id="deployment"
        >
          <SectionHeader
            action={
              <Link className="text-sm font-semibold text-[#244a9b]" href="/deployment">
                Manage
              </Link>
            }
            title="Deployment"
          />
          <div className="mt-4 grid gap-6 xl:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase text-zinc-500">
                Deployed items
              </h3>
            <div className="mt-4 space-y-3">
                {assignedResources.length ? (
                  assignedResources.map((resource) => (
                    <div className="rounded-lg border border-zinc-200 p-4" key={resource.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-zinc-950">{resource.name}</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {resource.category} - {resource.warehouseLocation}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-zinc-500">
                            FIFO received {resource.receivedAt}
                          </p>
                        </div>
                        <p className="text-right text-sm font-semibold text-zinc-800">
                          {resource.quantityCommitted} {resource.unit} committed
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-500">
                    No items have been deployed to this incident.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase text-zinc-500">
                Deployed teams
              </h3>
              <div className="mt-4 space-y-3">
                {deployedTeams.length ? (
                  deployedTeams.map((team) => (
                    <div className="rounded-lg border border-zinc-200 p-4" key={team.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-zinc-950">{team.name}</p>
                          <p className="mt-1 text-sm text-zinc-500">{team.role}</p>
                        </div>
                        <p className="text-sm font-semibold text-zinc-700">
                          {formatDateTime(team.deployedAt)}
                        </p>
                      </div>
                      <p className="mt-3 text-sm text-zinc-600">{team.members}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-500">
                    No teams have been deployed to this incident.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" id="partners">
            <SectionHeader title="Partner 3W" />
            <div className="mt-4 space-y-3">
              {activities.map((activity) => (
                <div className="rounded-lg border border-zinc-200 p-4" key={activity.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-950">
                        {activity.organization}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {activity.activity} - {activity.locationName}
                      </p>
                    </div>
                    <StatusBadge status={activity.status} />
                  </div>
                  <p className="mt-3 text-sm text-zinc-600">
                    {activity.sector} contact: {activity.contactName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" id="sitreps">
          <SectionHeader title="Situation Reports" />
          <div className="mt-4 space-y-3">
            {sitreps.length ? (
              sitreps.map((sitrep) => (
                <article className="rounded-lg border border-zinc-200 p-4" key={sitrep.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-950">
                        {sitrep.reportingPeriod}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        {sitrep.summary}
                      </p>
                    </div>
                    <Link
                      className="text-sm font-semibold text-[#244a9b]"
                      href={`/api/sitreps/${sitrep.id}/export`}
                    >
                      Export
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-zinc-500">
                No situation reports have been generated for this incident.
              </p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-zinc-500">{label}</dt>
      <dd className="mt-1 font-semibold text-zinc-950">{value}</dd>
    </div>
  );
}
