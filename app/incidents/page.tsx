import { AppShell } from "@/app/components/app-shell";
import { CommandLink } from "@/app/components/ui";
import { data } from "@/app/lib/data";
import { IncidentsWorkspace } from "./incidents-workspace";

export default async function IncidentsPage() {
  const incidents = await data.listIncidents();

  return (
    <AppShell active="Programs">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#244a9b]">
              Program management
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
              Programs
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
              Track active, stabilizing, monitoring, and closed response programs.
            </p>
          </div>
          <CommandLink href="/incidents/new">Create program</CommandLink>
        </header>

        <IncidentsWorkspace initialIncidents={incidents} />
      </div>
    </AppShell>
  );
}
