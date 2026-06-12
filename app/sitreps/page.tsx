import Link from "next/link";
import { AppShell } from "@/app/components/app-shell";
import { CommandLink, SectionHeader } from "@/app/components/ui";
import { data } from "@/app/lib/data";

export default async function SitRepsPage() {
  const [incidents, situationReports] = await Promise.all([
    data.listIncidents(),
    data.listSituationReports(),
  ]);
  const incidentsById = new Map(
    incidents.map((incident) => [incident.id, incident]),
  );

  return (
    <AppShell active="SitReps">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#244a9b]">
              Situation reporting
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
              Situation Reports
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
              Draft operational updates from program data, response actions,
              gaps, and next priorities.
            </p>
          </div>
          <CommandLink href="/incidents/flood-riverside">Generate report</CommandLink>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(360px,1.15fr)]">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <SectionHeader title="Reports" />
            <div className="mt-4 space-y-3">
              {situationReports.map((report) => {
                const incident = incidentsById.get(report.incidentId);

                return (
                  <Link
                    className="block rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
                    href={`/api/sitreps/${report.id}/export`}
                    key={report.id}
                  >
                    <p className="font-semibold text-zinc-950">
                      {incident?.title ?? "Unknown program"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {report.reportingPeriod}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {report.summary}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <SectionHeader title="Latest Report Preview" />
            {situationReports.map((report) => {
              const incident = incidentsById.get(report.incidentId);

              return (
                <div className="mt-5 space-y-5" key={report.id}>
                  <div>
                    <p className="text-sm font-semibold text-[#244a9b]">
                      {report.reportingPeriod}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                      {incident?.title}
                    </h2>
                  </div>
                  <ReportBlock label="Summary" value={report.summary} />
                  <ReportBlock label="Current impact" value={report.impact} />
                  <ReportBlock label="Priority needs" value={report.priorityNeeds} />
                  <ReportBlock label="Response actions" value={report.responseActions} />
                  <ReportBlock label="Gaps" value={report.gaps} />
                  <ReportBlock
                    label="Next operational period"
                    value={report.nextPriorities}
                  />
                </div>
              );
            })}
          </article>
        </section>
      </div>
    </AppShell>
  );
}

function ReportBlock({ label, value }: { label: string; value: string }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-zinc-500">{label}</h3>
      <p className="mt-2 text-base leading-7 text-zinc-800">{value}</p>
    </section>
  );
}
