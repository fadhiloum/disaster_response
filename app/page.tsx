import { DashboardHome } from "@/app/components/dashboard-home";
import { data } from "@/app/lib/data";

export default async function Home() {
  const [
    dashboardSummary,
    incidents,
    needReports,
    tasks,
    resources,
    partnerActivities,
  ] = await Promise.all([
    data.getDashboardSummary(),
    data.listIncidents(),
    data.listNeeds(),
    data.listTasks(),
    data.listResources(),
    data.listPartnerActivities(),
  ]);

  return (
    <DashboardHome
      dashboardSummary={dashboardSummary}
      incidents={incidents}
      needReports={needReports}
      partnerActivities={partnerActivities}
      resources={resources}
      tasks={tasks}
    />
  );
}
