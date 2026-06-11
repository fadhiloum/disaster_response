import { AppShell } from "@/app/components/app-shell";
import { SectionHeader, StatusBadge } from "@/app/components/ui";
import { data } from "@/app/lib/data";

const organizations = [
  {
    name: "Regional Emergency Operations Center",
    type: "Government coordination",
    contact: "ops@example.org",
  },
  {
    name: "Field Team North",
    type: "Responder unit",
    contact: "north-team@example.org",
  },
  {
    name: "WaterAid Partner Cell",
    type: "NGO partner",
    contact: "wateraid@example.org",
  },
  {
    name: "Community Health Network",
    type: "Medical partner",
    contact: "clinic-network@example.org",
  },
];

export default async function AdminPage() {
  const users = await data.listUsers();

  return (
    <AppShell active="Admin">
      <div className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-teal-700">Administration</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            Users and Organizations
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
            Manage access, response roles, partner organizations, and operating
            units.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <SectionHeader title="Users" />
            <div className="mt-4 divide-y divide-zinc-200">
              {users.map((user) => (
                <div
                  className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center"
                  key={user.id}
                >
                  <div>
                    <p className="font-semibold text-zinc-950">{user.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {user.organization}
                    </p>
                  </div>
                  <StatusBadge status={user.role} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <SectionHeader title="Organizations" />
            <div className="mt-4 divide-y divide-zinc-200">
              {organizations.map((organization) => (
                <div className="py-4" key={organization.name}>
                  <p className="font-semibold text-zinc-950">{organization.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">{organization.type}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {organization.contact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionHeader title="Role Permissions" />
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <Permission title="Admin" value="Full platform access" />
            <Permission title="Coordinator" value="Incidents, tasks, resources, reports" />
            <Permission title="Responder" value="Needs, updates, task status" />
            <Permission title="Partner" value="Own 3W activities" />
            <Permission title="Viewer" value="Read-only dashboard" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Permission({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-lg border border-zinc-200 p-4">
      <p className="font-semibold text-zinc-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{value}</p>
    </article>
  );
}
