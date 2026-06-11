"use client";

import { useState } from "react";

export function AiSitrepDraft({ incidentId }: { incidentId: string }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function generateDraft() {
    setIsLoading(true);
    setError("");

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
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#244a9b] px-4 text-sm font-semibold text-white transition hover:bg-[#1d3c82] focus:outline-none focus:ring-2 focus:ring-[#244a9b] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          onClick={generateDraft}
          type="button"
        >
          {isLoading ? "Drafting..." : "Draft with AI"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
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

