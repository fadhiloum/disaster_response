import Link from "next/link";
import { AppShell } from "@/app/components/app-shell";
import { OpsMap } from "@/app/components/ops-map";
import {
  CommandLink,
  MetricCard,
  PriorityBadge,
  SectionHeader,
  SeverityBadge,
  StatusBadge,
} from "@/app/components/ui";
import {
  formatDateTime,
  formatNumber,
  type Incident,
  type NeedReport,
  type PartnerActivity,
  type Resource,
  type ResponseTask,
} from "@/app/lib/data";
import type { DashboardSummary } from "@/app/lib/data/repository";

export function DashboardHome({
  dashboardSummary,
  incidents,
  needReports,
  partnerActivities,
  resources,
  tasks,
}: {
  dashboardSummary: DashboardSummary;
  incidents: Incident[];
  needReports: NeedReport[];
  partnerActivities: PartnerActivity[];
  resources: Resource[];
  tasks: ResponseTask[];
}) {
  const urgentNeeds = needReports.filter(
    (need) => need.urgency === "high" || need.urgency === "critical",
  );
  const openTasks = tasks.filter((task) => task.status !== "done");

  return (
    <AppShell active="Dashboard">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#244a9b]">
              Common operating picture
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950 sm:text-4xl">
              Disaster Response Dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
              Live coordination view for incidents, needs, resources, partners,
              teams, and situation reporting.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CommandLink href="/incidents/new">Create incident</CommandLink>
            <CommandLink href="/map">Open map</CommandLink>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            detail="Currently monitored or active"
            label="Incidents"
            tone="red"
            value={dashboardSummary.activeIncidents.toString()}
          />
          <MetricCard
            detail="Estimated across open incidents"
            label="Affected people"
            tone="amber"
            value={formatNumber(dashboardSummary.affectedPeople)}
          />
          <MetricCard
            detail="High or critical field reports"
            label="Urgent needs"
            tone="violet"
            value={dashboardSummary.urgentNeeds.toString()}
          />
          <MetricCard
            detail="Assigned response work"
            label="Open tasks"
            tone="blue"
            value={dashboardSummary.openTasks.toString()}
          />
          <MetricCard
            detail="Known logistics shortfalls"
            label="Resource gaps"
            tone="green"
            value={dashboardSummary.resourceGaps.toString()}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <OpsMap compact incidents={incidents} />

          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <SectionHeader
              action={<Link className="text-sm font-semibold text-[#244a9b]" href="/incidents">View all</Link>}
              title="Active Incidents"
            />
            <div className="mt-4 space-y-3">
              {incidents.map((incident) => (
                <Link
                  className="block rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
                  href={`/incidents/${incident.id}`}
                  key={incident.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-950">{incident.title}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {incident.locationName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <SeverityBadge severity={incident.severity} />
                      <StatusBadge status={incident.status} />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <MiniStat label="Needs" value={incident.openNeeds.toString()} />
                    <MiniStat label="Teams" value={incident.assignedTeams.toString()} />
                    <MiniStat label="Gaps" value={incident.resourceGaps.toString()} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <Panel title="Urgent Needs" href="/incidents/flood-riverside">
            <div className="space-y-3">
              {urgentNeeds.map((need) => (
                <div className="rounded-lg border border-zinc-200 p-4" key={need.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-zinc-950">{need.category}</p>
                    <PriorityBadge priority={need.urgency} />
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{need.locationName}</p>
                  <p className="mt-3 text-sm text-zinc-500">
                    {formatNumber(need.quantity)} {need.unit} for{" "}
                    {formatNumber(need.affectedPeople)} people
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Open Tasks" href="/incidents/flood-riverside">
            <div className="space-y-3">
              {openTasks.map((task) => (
                <div className="rounded-lg border border-zinc-200 p-4" key={task.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-zinc-950">{task.title}</p>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{task.assignee}</p>
                  <p className="mt-3 text-sm text-zinc-500">
                    Due {formatDateTime(task.dueTime)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Deployment and Partners" href="/deployment">
            <div className="space-y-3">
              {resources.slice(0, 3).map((resource) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4"
                  key={resource.id}
                >
                  <div>
                    <p className="font-semibold text-zinc-950">{resource.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {resource.warehouseLocation}
                    </p>
                  </div>
                  <p className="text-right text-sm font-semibold text-zinc-800">
                    {resource.quantityAvailable - resource.quantityCommitted}{" "}
                    free
                  </p>
                </div>
              ))}
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="font-semibold text-zinc-950">
                  {partnerActivities.length} partner activities
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  WASH, shelter, and health coverage active
                </p>
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-zinc-100 px-3 py-2">
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <SectionHeader
        action={<Link className="text-sm font-semibold text-[#244a9b]" href={href}>Open</Link>}
        title={title}
      />
      <div className="mt-4">{children}</div>
    </section>
  );
}
