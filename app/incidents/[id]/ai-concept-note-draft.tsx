"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/app/lib/data/types";

const allowedDraftRoles: Role[] = ["Admin", "Coordinator"];

function authMessage(role: Role | null) {
  if (!role) {
    return "Sign in as a Coordinator or Admin to draft concept notes.";
  }

  if (!allowedDraftRoles.includes(role)) {
    return "Your current role cannot draft concept notes.";
  }

  return "";
}

export function AiConceptNoteDraft({
  currentUserRole,
  incidentId,
  initialDraft,
  savedAt,
}: {
  currentUserRole: Role | null;
  incidentId: string;
  initialDraft?: string;
  savedAt?: string | null;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft ?? "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(
    savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}.` : "",
  );
  const blockedMessage = authMessage(currentUserRole);

  async function generateDraft() {
    if (blockedMessage) {
      setError(blockedMessage);
      return;
    }

    setIsLoading(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await fetch(
        `/api/ai/incidents/${incidentId}/concept-note`,
        { credentials: "same-origin", method: "POST" },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate concept note draft.");
      }

      setDraft(payload.data.draft);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to generate concept note draft.",
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
      setError("Generate or enter concept note text before saving.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await fetch(`/api/incidents/${incidentId}/concept-note`, {
        body: JSON.stringify({ content: draft }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save concept note.");
      }

      setDraft(payload.data.content);
      setSavedMessage("Concept note saved.");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to save concept note.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-[#d8e0f3] bg-[#f8faff] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-950">
            AI Concept Note Draft
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Generate an editable donor-ready outline from current program data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#244a9b] px-4 text-sm font-semibold text-white transition hover:bg-[#1d3c82] focus:outline-none focus:ring-2 focus:ring-[#244a9b] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={Boolean(blockedMessage) || isLoading || isSaving}
            onClick={generateDraft}
            type="button"
          >
            {isLoading ? "Drafting..." : "Draft with AI"}
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#244a9b] bg-white px-4 text-sm font-semibold text-[#244a9b] transition hover:bg-[#eef3ff] focus:outline-none focus:ring-2 focus:ring-[#244a9b] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={Boolean(blockedMessage) || !draft.trim() || isLoading || isSaving}
            onClick={saveDraft}
            type="button"
          >
            {isSaving ? "Saving..." : "Save concept note"}
          </button>
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#244a9b] bg-white px-4 text-sm font-semibold text-[#244a9b] transition hover:bg-[#eef3ff] focus:outline-none focus:ring-2 focus:ring-[#244a9b] focus:ring-offset-2"
            href={`/api/incidents/${incidentId}/concept-note`}
          >
            Export DOCX
          </a>
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
          className="mt-4 min-h-96 w-full resize-y rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 text-zinc-800 outline-none focus:border-[#244a9b] focus:ring-2 focus:ring-[#244a9b]/20"
          onChange={(event) => setDraft(event.target.value)}
          value={draft}
        />
      ) : null}
    </div>
  );
}
