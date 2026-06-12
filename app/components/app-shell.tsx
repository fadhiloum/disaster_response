import Link from "next/link";
import Image from "next/image";
import { Icon, type IconName } from "@/app/components/icons";
import { SessionControls } from "@/app/components/session-controls";
import { data } from "@/app/lib/data";
import { getSessionUser } from "@/app/lib/auth";

const navigation = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/incidents", icon: "incident", label: "Programs" },
  { href: "/deployment", icon: "deployment", label: "Deployment" },
  { href: "/map", icon: "map", label: "Map" },
  { href: "/sitreps", icon: "report", label: "SitReps" },
  { href: "/admin", icon: "admin", label: "Admin" },
] satisfies Array<{ href: string; icon: IconName; label: string }>;

export async function AppShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const [currentUser, users] = await Promise.all([
    getSessionUser(),
    data.listUsers(),
  ]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-zinc-200 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5">
          <div className="flex items-center justify-between gap-4 lg:block">
            <Link className="block" href="/">
              <Image
                alt="MERCY Malaysia"
                className="h-auto w-44"
                height={58}
                priority
                src="/mercy-malaysia-logo.png"
                width={212}
              />
              <p className="mt-3 text-xs font-semibold uppercase text-[#ef1c2f]">
                Response Platform
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[#244a9b]">
                Operations Center
              </h1>
            </Link>
            <SessionControls currentUser={currentUser} users={users} />
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-visible lg:pb-0">
            {navigation.map((item) => {
              const isActive = item.label === active;

              return (
                <Link
                  className={`flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#244a9b] text-white shadow-sm"
                      : "text-zinc-600 hover:bg-[#eef3ff] hover:text-[#244a9b]"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-4 w-4 shrink-0" name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 hidden rounded-lg border border-[#f8c7ce] bg-[#fff4f6] p-4 lg:block">
            <p className="text-sm font-semibold text-[#244a9b]">Current posture</p>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              Coordinating active response across flood, landslide, and fire
              programs with teams and FIFO inventory deployment.
            </p>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
