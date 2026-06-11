import Link from "next/link";
import type {
  IncidentStatus,
  NeedStatus,
  Severity,
  TaskStatus,
} from "@/app/lib/data";

type Tone = "red" | "amber" | "green" | "blue" | "gray" | "violet";

const toneClasses: Record<Tone, string> = {
  red: "border-red-200 bg-red-50 text-red-800",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  gray: "border-zinc-200 bg-zinc-100 text-zinc-700",
  violet: "border-violet-200 bg-violet-50 text-violet-800",
};

export function Badge({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded border px-2.5 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const tone: Record<Severity, Tone> = {
    low: "green",
    moderate: "blue",
    high: "amber",
    critical: "red",
  };

  return <Badge tone={tone[severity]}>{severity}</Badge>;
}

export function StatusBadge({
  status,
}: {
  status: IncidentStatus | NeedStatus | TaskStatus | string;
}) {
  const tone = getStatusTone(status);

  return <Badge tone={tone}>{status}</Badge>;
}

export function PriorityBadge({
  priority,
}: {
  priority: "low" | "medium" | "high" | "critical";
}) {
  const tone: Record<typeof priority, Tone> = {
    low: "green",
    medium: "blue",
    high: "amber",
    critical: "red",
  };

  return <Badge tone={tone[priority]}>{priority}</Badge>;
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "gray",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: Tone;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-zinc-600">{label}</p>
        <span className={`h-3 w-3 rounded-full ${dotTone(tone)}`} />
      </div>
      <p className="mt-3 text-3xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{detail}</p>
    </article>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      {action}
    </div>
  );
}

export function CommandLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
      href={href}
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
      href={href}
    >
      {children}
    </Link>
  );
}

function getStatusTone(status: string): Tone {
  if (["critical", "active", "reported", "blocked"].includes(status)) {
    return "red";
  }

  if (["high", "verified", "assigned", "in progress", "stabilizing"].includes(status)) {
    return "amber";
  }

  if (["fulfilled", "closed", "done"].includes(status)) {
    return "green";
  }

  if (["monitoring", "todo", "planned"].includes(status)) {
    return "blue";
  }

  return "gray";
}

function dotTone(tone: Tone) {
  const classes: Record<Tone, string> = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    green: "bg-emerald-500",
    blue: "bg-sky-500",
    gray: "bg-zinc-400",
    violet: "bg-violet-500",
  };

  return classes[tone];
}
