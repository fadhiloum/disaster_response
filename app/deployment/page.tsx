import { AppShell } from "@/app/components/app-shell";
import { data } from "@/app/lib/data";
import { DeploymentWorkspace } from "./deployment-workspace";

export const dynamic = "force-dynamic";

export default async function DeploymentPage() {
  const [deployedTeams, incidents, resources] = await Promise.all([
    data.listDeployedTeams(),
    data.listIncidents(),
    data.listResources(),
  ]);

  return (
    <AppShell active="Deployment">
      <div className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-[#244a9b]">
            Deployment management
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            Deployment
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
            Assign teams and deploy inventory items to programs. Item deployment
            is ordered by FIFO so older stock stays at the top of each queue.
          </p>
        </header>

        <DeploymentWorkspace
          initialResources={resources}
          initialTeams={deployedTeams}
          incidents={incidents}
        />
      </div>
    </AppShell>
  );
}
