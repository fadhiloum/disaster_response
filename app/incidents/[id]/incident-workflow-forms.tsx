"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  NeedStatus,
  Role,
  SituationReportStatus,
  TaskStatus,
} from "@/app/lib/data/types";

type WorkflowStatus = {
  tone: "success" | "error";
  message: string;
};

const emptyNeedForm = {
  category: "",
  urgency: "high",
  quantity: "1",
  unit: "households",
  affectedPeople: "1",
  locationName: "",
  latitude: "",
  longitude: "",
  notes: "",
  reportedBy: "",
};

const emptyTaskForm = {
  title: "",
  assignee: "",
  priority: "high",
  dueTime: "",
  locationName: "",
  description: "",
};

const emptySitrepForm = {
  reportingPeriod: "",
  summary: "",
  impact: "",
  priorityNeeds: "",
  responseActions: "",
  gaps: "",
  nextPriorities: "",
};

const needStatusOptions = [
  { value: "reported", label: "Reported" },
  { value: "verified", label: "Verified" },
  { value: "assigned", label: "Assigned" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "closed", label: "Closed" },
] satisfies Array<{ value: NeedStatus; label: string }>;

const taskStatusOptions = [
  { value: "todo", label: "To do" },
  { value: "in progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
] satisfies Array<{ value: TaskStatus; label: string }>;

const sitrepStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] satisfies Array<{ value: SituationReportStatus; label: string }>;

export function NeedSubmissionForm({
  currentUserName,
  currentUserRole,
  incidentId,
}: {
  currentUserName: string | null;
  currentUserRole: Role | null;
  incidentId: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...emptyNeedForm,
    reportedBy: currentUserName ?? "",
  });
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = hasAnyRole(currentUserRole, ["Admin", "Coordinator", "Responder"]);

  async function submitNeed(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setStatus({ tone: "error", message: "Your role cannot submit needs." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const quantity = Number(form.quantity);
    const affectedPeople = Number(form.affectedPeople);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (
      !isPositiveNumber(quantity) ||
      !isPositiveNumber(affectedPeople) ||
      !isCoordinate(latitude) ||
      !isCoordinate(longitude)
    ) {
      setIsSubmitting(false);
      setStatus({
        tone: "error",
        message: "Enter valid quantity, affected people, latitude, and longitude values.",
      });
      return;
    }

    const response = await fetch(`/api/incidents/${incidentId}/needs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        category: form.category.trim(),
        urgency: form.urgency,
        quantity,
        unit: form.unit.trim(),
        affectedPeople,
        locationName: form.locationName.trim(),
        latitude,
        longitude,
        notes: form.notes.trim(),
        reportedBy: form.reportedBy.trim() || currentUserName || "Field responder",
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus({
        tone: "error",
        message: payload?.error ?? "Could not submit the need.",
      });
      return;
    }

    setForm({ ...emptyNeedForm, reportedBy: currentUserName ?? "" });
    setStatus({ tone: "success", message: "Need submitted." });
    router.refresh();
  }

  return (
    <WorkflowPanel title="Submit Need">
      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submitNeed}>
        <Field label="Category">
          <input
            className="input"
            disabled={!canSubmit}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            placeholder="Shelter kits"
            required
            value={form.category}
          />
        </Field>
        <Field label="Urgency">
          <select
            className="input"
            disabled={!canSubmit}
            onChange={(event) => setForm((current) => ({ ...current, urgency: event.target.value }))}
            value={form.urgency}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </Field>
        <Field label="Quantity">
          <input
            className="input"
            disabled={!canSubmit}
            min="1"
            onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
            required
            type="number"
            value={form.quantity}
          />
        </Field>
        <Field label="Unit">
          <input
            className="input"
            disabled={!canSubmit}
            onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
            required
            value={form.unit}
          />
        </Field>
        <Field label="Affected people">
          <input
            className="input"
            disabled={!canSubmit}
            min="1"
            onChange={(event) =>
              setForm((current) => ({ ...current, affectedPeople: event.target.value }))
            }
            required
            type="number"
            value={form.affectedPeople}
          />
        </Field>
        <Field label="Location">
          <input
            className="input"
            disabled={!canSubmit}
            onChange={(event) =>
              setForm((current) => ({ ...current, locationName: event.target.value }))
            }
            placeholder="Zone C shelter cluster"
            required
            value={form.locationName}
          />
        </Field>
        <Field label="Latitude">
          <input
            className="input"
            disabled={!canSubmit}
            onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))}
            required
            step="any"
            type="number"
            value={form.latitude}
          />
        </Field>
        <Field label="Longitude">
          <input
            className="input"
            disabled={!canSubmit}
            onChange={(event) =>
              setForm((current) => ({ ...current, longitude: event.target.value }))
            }
            required
            step="any"
            type="number"
            value={form.longitude}
          />
        </Field>
        <Field className="md:col-span-2" label="Notes">
          <textarea
            className="input min-h-24 resize-y"
            disabled={!canSubmit}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            required
            value={form.notes}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <SubmitButton disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit need"}
          </SubmitButton>
          <StatusMessage status={status} />
        </div>
      </form>
    </WorkflowPanel>
  );
}

export function TaskAssignmentForm({
  currentUserRole,
  incidentId,
}: {
  currentUserRole: Role | null;
  incidentId: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(emptyTaskForm);
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = hasAnyRole(currentUserRole, ["Admin", "Coordinator"]);

  async function submitTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setStatus({ tone: "error", message: "Your role cannot assign tasks." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const dueTime = form.dueTime ? new Date(form.dueTime) : null;

    if (!dueTime || Number.isNaN(dueTime.getTime())) {
      setIsSubmitting(false);
      setStatus({ tone: "error", message: "Enter a valid due time." });
      return;
    }

    const response = await fetch(`/api/incidents/${incidentId}/tasks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        assignee: form.assignee.trim(),
        priority: form.priority,
        dueTime: dueTime.toISOString(),
        locationName: form.locationName.trim(),
        description: form.description.trim(),
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus({
        tone: "error",
        message: payload?.error ?? "Could not create the task.",
      });
      return;
    }

    setForm(emptyTaskForm);
    setStatus({ tone: "success", message: "Task assigned." });
    router.refresh();
  }

  return (
    <WorkflowPanel title="Create Task">
      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submitTask}>
        <Field label="Title">
          <input
            className="input"
            disabled={!canSubmit}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            required
            value={form.title}
          />
        </Field>
        <Field label="Assignee">
          <input
            className="input"
            disabled={!canSubmit}
            onChange={(event) =>
              setForm((current) => ({ ...current, assignee: event.target.value }))
            }
            placeholder="WASH Team Alpha"
            required
            value={form.assignee}
          />
        </Field>
        <Field label="Priority">
          <select
            className="input"
            disabled={!canSubmit}
            onChange={(event) =>
              setForm((current) => ({ ...current, priority: event.target.value }))
            }
            value={form.priority}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </Field>
        <Field label="Due time">
          <input
            className="input"
            disabled={!canSubmit}
            onChange={(event) => setForm((current) => ({ ...current, dueTime: event.target.value }))}
            required
            type="datetime-local"
            value={form.dueTime}
          />
        </Field>
        <Field label="Location">
          <input
            className="input"
            disabled={!canSubmit}
            onChange={(event) =>
              setForm((current) => ({ ...current, locationName: event.target.value }))
            }
            required
            value={form.locationName}
          />
        </Field>
        <Field className="md:col-span-2" label="Description">
          <textarea
            className="input min-h-24 resize-y"
            disabled={!canSubmit}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            required
            value={form.description}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <SubmitButton disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign task"}
          </SubmitButton>
          <StatusMessage status={status} />
        </div>
      </form>
    </WorkflowPanel>
  );
}

export function ManualSitrepForm({
  currentUserRole,
  incidentId,
}: {
  currentUserRole: Role | null;
  incidentId: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(emptySitrepForm);
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = hasAnyRole(currentUserRole, ["Admin", "Coordinator"]);

  async function submitSitrep(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setStatus({ tone: "error", message: "Your role cannot create SitReps." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const payload = {
      reportingPeriod: form.reportingPeriod.trim(),
      summary: form.summary.trim(),
      impact: form.impact.trim(),
      priorityNeeds: form.priorityNeeds.trim(),
      responseActions: form.responseActions.trim(),
      gaps: form.gaps.trim(),
      nextPriorities: form.nextPriorities.trim(),
    };

    const response = await fetch(`/api/incidents/${incidentId}/sitreps`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus({
        tone: "error",
        message: payload?.error ?? "Could not save the SitRep.",
      });
      return;
    }

    setForm(emptySitrepForm);
    setStatus({ tone: "success", message: "SitRep saved." });
    router.refresh();
  }

  return (
    <WorkflowPanel title="Manual SitRep">
      <form className="mt-4 space-y-4" onSubmit={submitSitrep}>
        <Field label="Reporting period">
          <input
            className="input"
            disabled={!canSubmit}
            onChange={(event) =>
              setForm((current) => ({ ...current, reportingPeriod: event.target.value }))
            }
            placeholder="12 Jun 2026, 0800-1800"
            value={form.reportingPeriod}
          />
        </Field>
        {sitrepFields.map((field) => (
          <Field key={field.key} label={field.label}>
            <textarea
              className="input min-h-24 resize-y"
              disabled={!canSubmit}
              onChange={(event) =>
                setForm((current) => ({ ...current, [field.key]: event.target.value }))
              }
              required
              value={form[field.key]}
            />
          </Field>
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save SitRep"}
          </SubmitButton>
          <StatusMessage status={status} />
        </div>
      </form>
    </WorkflowPanel>
  );
}

export function NeedVerificationControl({
  currentStatus,
  currentUserRole,
  needId,
}: {
  currentStatus: NeedStatus;
  currentUserRole: Role | null;
  needId: string;
}) {
  const router = useRouter();
  const [statusValue, setStatusValue] = useState<NeedStatus>(currentStatus);
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canVerify = hasAnyRole(currentUserRole, ["Admin", "Coordinator"]);

  if (!canVerify) {
    return null;
  }

  async function updateNeedStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const response = await fetch(`/api/needs/${needId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: statusValue }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus({
        tone: "error",
        message: payload?.error ?? "Could not update need status.",
      });
      return;
    }

    setStatus({ tone: "success", message: "Need status updated." });
    router.refresh();
  }

  return (
    <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={updateNeedStatus}>
      <label className="min-w-40 flex-1">
        <span className="text-xs font-semibold uppercase text-zinc-500">
          Verification
        </span>
        <select
          className="input mt-2"
          disabled={isSubmitting}
          onChange={(event) => setStatusValue(event.target.value as NeedStatus)}
          value={statusValue}
        >
          {needStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update"}
      </SubmitButton>
      <StatusMessage status={status} />
    </form>
  );
}

export function TaskStatusControl({
  currentStatus,
  currentUserRole,
  taskId,
}: {
  currentStatus: TaskStatus;
  currentUserRole: Role | null;
  taskId: string;
}) {
  const router = useRouter();
  const [statusValue, setStatusValue] = useState<TaskStatus>(currentStatus);
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canUpdate = hasAnyRole(currentUserRole, [
    "Admin",
    "Coordinator",
    "Responder",
  ]);

  if (!canUpdate) {
    return null;
  }

  async function updateTaskStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: statusValue }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus({
        tone: "error",
        message: payload?.error ?? "Could not update task status.",
      });
      return;
    }

    setStatus({ tone: "success", message: "Task status updated." });
    router.refresh();
  }

  return (
    <form className="flex flex-wrap items-end gap-3" onSubmit={updateTaskStatus}>
      <label className="min-w-36 flex-1">
        <span className="text-xs font-semibold uppercase text-zinc-500">
          Status
        </span>
        <select
          className="input mt-2"
          disabled={isSubmitting}
          onChange={(event) => setStatusValue(event.target.value as TaskStatus)}
          value={statusValue}
        >
          {taskStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update"}
      </SubmitButton>
      <StatusMessage status={status} />
    </form>
  );
}

export function SitrepStatusControl({
  currentStatus,
  currentUserRole,
  reviewComment,
  sitrepId,
}: {
  currentStatus: SituationReportStatus;
  currentUserRole: Role | null;
  reviewComment: string | null;
  sitrepId: string;
}) {
  const router = useRouter();
  const [statusValue, setStatusValue] =
    useState<SituationReportStatus>(currentStatus);
  const [comment, setComment] = useState(reviewComment ?? "");
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canReview = hasAnyRole(currentUserRole, ["Admin", "Coordinator"]);

  if (!canReview) {
    return null;
  }

  async function updateSitrepStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const response = await fetch(`/api/sitreps/${sitrepId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: statusValue,
        reviewComment: comment.trim(),
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus({
        tone: "error",
        message: payload?.error ?? "Could not update SitRep status.",
      });
      return;
    }

    setStatus({ tone: "success", message: "SitRep status updated." });
    router.refresh();
  }

  return (
    <form className="mt-4 grid gap-3" onSubmit={updateSitrepStatus}>
      <div className="grid gap-3 md:grid-cols-[minmax(160px,0.35fr)_minmax(0,1fr)_auto] md:items-end">
        <label>
          <span className="text-xs font-semibold uppercase text-zinc-500">
            Review status
          </span>
          <select
            className="input mt-2"
            disabled={isSubmitting}
            onChange={(event) =>
              setStatusValue(event.target.value as SituationReportStatus)
            }
            value={statusValue}
          >
            {sitrepStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-zinc-500">
            Review comment
          </span>
          <input
            className="input mt-2"
            disabled={isSubmitting}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Optional reviewer note"
            value={comment}
          />
        </label>
        <SubmitButton disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update"}
        </SubmitButton>
      </div>
      <StatusMessage status={status} />
    </form>
  );
}

const sitrepFields = [
  { key: "summary", label: "Summary" },
  { key: "impact", label: "Current impact" },
  { key: "priorityNeeds", label: "Priority needs" },
  { key: "responseActions", label: "Response actions" },
  { key: "gaps", label: "Gaps" },
  { key: "nextPriorities", label: "Next operational period priorities" },
] satisfies Array<{ key: keyof typeof emptySitrepForm; label: string }>;

function WorkflowPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <h3 className="text-sm font-semibold uppercase text-zinc-500">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-zinc-700">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function SubmitButton({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled: boolean;
}) {
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#244a9b] px-4 text-sm font-semibold text-white transition hover:bg-[#1d3c82] disabled:cursor-not-allowed disabled:bg-zinc-300"
      disabled={disabled}
      type="submit"
    >
      {children}
    </button>
  );
}

function StatusMessage({ status }: { status: WorkflowStatus | null }) {
  if (!status) {
    return null;
  }

  return (
    <p
      className={`text-sm font-semibold ${
        status.tone === "success" ? "text-emerald-700" : "text-red-700"
      }`}
    >
      {status.message}
    </p>
  );
}

function hasAnyRole(role: Role | null, allowedRoles: Role[]) {
  return Boolean(role && allowedRoles.includes(role));
}

function isPositiveNumber(value: number) {
  return Number.isFinite(value) && value > 0;
}

function isCoordinate(value: number) {
  return Number.isFinite(value);
}
