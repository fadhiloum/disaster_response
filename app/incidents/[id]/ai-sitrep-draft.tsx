"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SitrepSections = {
  summary: string;
  impact: string;
  priorityNeeds: string;
  responseActions: string;
  gaps: string;
  nextPriorities: string;
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

export function AiSitrepDraft({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  async function generateDraft() {
    setIsLoading(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await fetch(
        `/api/ai/incidents/${incidentId}/situation-report`,
        { method: "POST" },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate SitRep draft.");
      }

      setDraft(payload.data.draft);
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
            AI SitRep Draft
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Generate an editable operational draft from the current incident
            data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#244a9b] px-4 text-sm font-semibold text-white transition hover:bg-[#1d3c82] focus:outline-none focus:ring-2 focus:ring-[#244a9b] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading || isSaving}
            onClick={generateDraft}
            type="button"
          >
            {isLoading ? "Drafting..." : "Draft with AI"}
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#244a9b] bg-white px-4 text-sm font-semibold text-[#244a9b] transition hover:bg-[#eef3ff] focus:outline-none focus:ring-2 focus:ring-[#244a9b] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!draft.trim() || isLoading || isSaving}
            onClick={saveDraft}
            type="button"
          >
            {isSaving ? "Saving..." : "Save as SitRep"}
          </button>
        </div>
      </div>

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
    </div>
  );
}
