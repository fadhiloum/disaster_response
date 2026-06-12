"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Role } from "@/app/lib/data/types";

type SitrepSections = {
  summary: string;
  impact: string;
  priorityNeeds: string;
  responseActions: string;
  gaps: string;
  nextPriorities: string;
};

type WebSource = {
  title: string;
  url: string;
};

const sectionHeadings: Array<{
  key: keyof SitrepSections;
  labels: readonly string[];
}> = [
  { key: "summary", labels: ["summary"] },
  { key: "impact", labels: ["current impact", "impact"] },
  { key: "priorityNeeds", labels: ["priority needs", "needs"] },
  {
    key: "responseActions",
    labels: ["response actions", "actions", "response"],
  },
  { key: "gaps", labels: ["gaps"] },
  {
    key: "nextPriorities",
    labels: [
      "next operational period priorities",
      "next operational period",
      "next priorities",
      "priorities",
    ],
  },
];

function headingKey(line: string): keyof SitrepSections | null {
  const normalized = line
    .replace(/^#+\s*/, "")
    .replace(/^\*\*/, "")
    .replace(/\*\*$/, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase();

  return (
    sectionHeadings.find((section) => section.labels.includes(normalized))
      ?.key ?? null
  );
}

function parseSitrepDraft(draft: string): SitrepSections {
  const sections: SitrepSections = {
    summary: "",
    impact: "",
    priorityNeeds: "",
    responseActions: "",
    gaps: "",
    nextPriorities: "",
  };
  let currentSection: keyof SitrepSections = "summary";

  for (const line of draft.split("\n")) {
    const key = headingKey(line);

    if (key) {
      currentSection = key;
      continue;
    }

    sections[currentSection] = `${sections[currentSection]}\n${line}`.trim();
  }

  if (!Object.values(sections).some(Boolean)) {
    sections.summary = draft.trim();
  }

  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [
      key,
      value.trim() || "To be confirmed.",
    ]),
  ) as SitrepSections;
}

function reportingPeriodLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZoneName: "short",
    year: "numeric",
  }).format(date);
}

const allowedDraftRoles: Role[] = ["Admin", "Coordinator"];

function authMessage(role: Role | null) {
  if (!role) {
    return "Sign in as a Coordinator or Admin to draft and save SitReps.";
  }

  if (!allowedDraftRoles.includes(role)) {
    return "Your current role cannot draft or save SitReps.";
  }

  return "";
}

export function AiSitrepDraft({
  currentUserRole,
  incidentId,
}: {
  currentUserRole: Role | null;
  incidentId: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [sources, setSources] = useState<WebSource[]>([]);
  const blockedMessage = authMessage(currentUserRole);

  async function generateDraft() {
    if (blockedMessage) {
      setError(blockedMessage);
      return;
    }

    setIsLoading(true);
    setError("");
    setSavedMessage("");
    setSources([]);

    try {
      const response = await fetch(
        `/api/ai/incidents/${incidentId}/situation-report`,
        { credentials: "same-origin", method: "POST" },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate SitRep draft.");
      }

      setDraft(payload.data.draft);
      setSources(payload.data.sources ?? []);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to generate SitRep draft.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function saveDraft() {
    if (blockedMessage) {
      setError(blockedMessage);
      return;
    }

    if (!draft.trim()) {
      setError("Generate or enter draft text before saving.");
      return;
    }

    const now = new Date();
    setIsSaving(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await fetch(`/api/incidents/${incidentId}/sitreps`, {
        body: JSON.stringify({
          ...parseSitrepDraft(draft),
          reportingPeriod: `${reportingPeriodLabel(now)} AI-reviewed draft`,
          reportingPeriodStart: now.toISOString(),
          reportingPeriodEnd: now.toISOString(),
        }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save SitRep.");
      }

      setSavedMessage("Saved as a reviewed SitRep.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save SitRep.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-[#d8e0f3] bg-[#f8faff] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-950">
            Generate SitRep
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Generate an editable draft from program data and latest web context
            from authorities, NGOs, and trusted response sources.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#244a9b] px-4 text-sm font-semibold text-white transition hover:bg-[#1d3c82] focus:outline-none focus:ring-2 focus:ring-[#244a9b] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={Boolean(blockedMessage) || isLoading || isSaving}
            onClick={generateDraft}
            type="button"
          >
            {isLoading ? "Searching and drafting..." : "Generate with AI"}
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#244a9b] bg-white px-4 text-sm font-semibold text-[#244a9b] transition hover:bg-[#eef3ff] focus:outline-none focus:ring-2 focus:ring-[#244a9b] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={Boolean(blockedMessage) || !draft.trim() || isLoading || isSaving}
            onClick={saveDraft}
            type="button"
          >
            {isSaving ? "Saving..." : "Save as SitRep"}
          </button>
        </div>
      </div>

      {blockedMessage ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {blockedMessage}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {savedMessage ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {savedMessage}
        </p>
      ) : null}

      {draft ? (
        <textarea
          className="mt-4 min-h-80 w-full resize-y rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 text-zinc-800 outline-none focus:border-[#244a9b] focus:ring-2 focus:ring-[#244a9b]/20"
          onChange={(event) => setDraft(event.target.value)}
          value={draft}
        />
      ) : null}

      {sources.length ? (
        <div className="mt-4 rounded-md border border-zinc-200 bg-white p-3">
          <p className="text-sm font-semibold text-zinc-700">
            Web sources used
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            {sources.map((source) => (
              <li key={source.url}>
                <a
                  className="font-semibold text-[#244a9b] underline-offset-2 hover:underline"
                  href={source.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
