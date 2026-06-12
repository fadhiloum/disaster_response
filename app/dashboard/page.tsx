import { DashboardHome } from "@/app/components/dashboard-home";
import { data } from "@/app/lib/data";
import { getDisasterNews } from "@/app/lib/disaster-news";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    dashboardSummary,
    disasterNews,
    incidents,
    needReports,
    tasks,
    resources,
    partnerActivities,
  ] = await Promise.all([
    data.getDashboardSummary(),
    getDisasterNews(),
    data.listIncidents(),
    data.listNeeds(),
    data.listTasks(),
    data.listResources(),
    data.listPartnerActivities(),
  ]);

  return (
    <DashboardHome
      dashboardSummary={dashboardSummary}
      disasterNews={disasterNews}
      incidents={incidents}
      needReports={needReports}
      partnerActivities={partnerActivities}
      resources={resources}
      tasks={tasks}
    />
  );
}
