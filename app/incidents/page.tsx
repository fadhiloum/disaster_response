import { AppShell } from "@/app/components/app-shell";
import { CommandLink } from "@/app/components/ui";
import { incidents } from "@/app/lib/demo-data";
import { IncidentsWorkspace } from "./incidents-workspace";

export default function IncidentsPage() {
  return (
    <AppShell active="Incidents">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">
              Incident management
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
              Incidents
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
              Track active, stabilizing, monitoring, and closed response events.
            </p>
          </div>
          <CommandLink href="/incidents/new">Create incident</CommandLink>
        </header>

        <IncidentsWorkspace initialIncidents={incidents} />
      </div>
    </AppShell>
  );
}
