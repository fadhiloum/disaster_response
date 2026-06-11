export type IconName =
  | "admin"
  | "dashboard"
  | "deployment"
  | "incident"
  | "items"
  | "map"
  | "needs"
  | "overview"
  | "partners"
  | "report"
  | "tasks"
  | "teams";

export function Icon({
  className = "h-4 w-4",
  name,
}: {
  className?: string;
  name: IconName;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

const paths: Record<IconName, React.ReactNode> = {
  admin: (
    <>
      <path d="M12 3.5 19 7v5.2c0 4.1-2.8 7.2-7 8.3-4.2-1.1-7-4.2-7-8.3V7l7-3.5Z" />
      <path d="M9.2 12.1 11.1 14l3.8-4.1" />
    </>
  ),
  dashboard: (
    <>
      <path d="M4 13.5a8 8 0 1 1 16 0" />
      <path d="M12 13.5 16 8" />
      <path d="M5.5 18.5h13" />
    </>
  ),
  deployment: (
    <>
      <path d="M4 7h10v10H4z" />
      <path d="M14 10h3.2L20 13v4h-6z" />
      <path d="M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </>
  ),
  incident: (
    <>
      <path d="M12 3 3.8 18h16.4L12 3Z" />
      <path d="M12 8v4.2" />
      <path d="M12 16h.01" />
    </>
  ),
  items: (
    <>
      <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
      <path d="M4 8.5v7L12 20l8-4.5v-7" />
      <path d="M12 13v7" />
    </>
  ),
  map: (
    <>
      <path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </>
  ),
  needs: (
    <>
      <path d="M12 20s7-4.5 7-10a4 4 0 0 0-7-2.6A4 4 0 0 0 5 10c0 5.5 7 10 7 10Z" />
      <path d="M12 8.5v5" />
      <path d="M9.5 11h5" />
    </>
  ),
  overview: (
    <>
      <path d="M4 5h16" />
      <path d="M4 12h10" />
      <path d="M4 19h7" />
      <path d="M17 15.5h3V19h-3z" />
    </>
  ),
  partners: (
    <>
      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M16 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M3.5 19a4.5 4.5 0 0 1 9 0" />
      <path d="M13.5 18a3.5 3.5 0 0 1 7 0" />
    </>
  ),
  report: (
    <>
      <path d="M6 3.5h8l4 4V20H6z" />
      <path d="M14 3.5V8h4" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </>
  ),
  tasks: (
    <>
      <path d="M7 7h13" />
      <path d="M7 12h13" />
      <path d="M7 17h13" />
      <path d="m3.5 7 .8.8L6 6" />
      <path d="m3.5 12 .8.8L6 11" />
      <path d="m3.5 17 .8.8L6 16" />
    </>
  ),
  teams: (
    <>
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M17 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M4 20a5 5 0 0 1 10 0" />
      <path d="M14.5 19a4 4 0 0 1 6 0" />
    </>
  ),
};
