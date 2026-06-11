import Link from "next/link";
import { currentUser } from "@/app/lib/demo-data";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/incidents", label: "Incidents" },
  { href: "/deployment", label: "Deployment" },
  { href: "/map", label: "Map" },
  { href: "/sitreps", label: "SitReps" },
  { href: "/admin", label: "Admin" },
];

export function AppShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f1ec] text-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-zinc-200 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5">
          <div className="flex items-center justify-between gap-4 lg:block">
            <Link className="block" href="/">
              <p className="text-xs font-semibold uppercase text-teal-700">
                Response Platform
              </p>
              <h1 className="mt-1 text-xl font-semibold text-zinc-950">
                Operations Center
              </h1>
            </Link>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-right lg:mt-5 lg:text-left">
              <p className="text-sm font-semibold text-zinc-900">{currentUser.name}</p>
              <p className="text-xs text-zinc-500">{currentUser.role}</p>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-visible lg:pb-0">
            {navigation.map((item) => {
              const isActive = item.label === active;

              return (
                <Link
                  className={`flex min-h-10 shrink-0 items-center rounded-md px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 hidden rounded-lg border border-teal-200 bg-teal-50 p-4 lg:block">
            <p className="text-sm font-semibold text-teal-950">Current posture</p>
            <p className="mt-2 text-sm leading-6 text-teal-900">
              Coordinating active response across flood, landslide, and fire
              incidents with teams and FIFO inventory deployment.
            </p>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
