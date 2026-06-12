"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  DisasterNewsFeed,
  DisasterNewsSeverity,
} from "@/app/lib/disaster-news";

const rotationMs = 10_000;

export function NewDisasters({
  initialFeed,
}: {
  initialFeed: DisasterNewsFeed;
}) {
  const [feed, setFeed] = useState(initialFeed);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const items = feed.items;
  const activeItem = items[Math.min(activeIndex, Math.max(items.length - 1, 0))];
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayItems = useMemo(
    () => items.filter((item) => item.publishedAt.slice(0, 10) === todayKey),
    [items, todayKey],
  );
  const dialogItems = todayItems.length > 0 ? todayItems : items;
  const dialogTitle =
    todayItems.length > 0 ? "Other Disasters Today" : "Recent Disasters";

  useEffect(() => {
    if (items.length < 2) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, rotationMs);

    return () => window.clearInterval(interval);
  }, [items.length]);

  useEffect(() => {
    let cancelled = false;

    async function refreshFeed() {
      setIsRefreshing(true);

      try {
        const response = await fetch("/api/disaster-news", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { data?: DisasterNewsFeed };

        if (!cancelled && payload.data?.items) {
          setFeed(payload.data);
          setActiveIndex(0);
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    }

    const interval = window.setInterval(
      refreshFeed,
      feed.refreshIntervalSeconds * 1000,
    );
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshFeed();
      }
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [feed.refreshIntervalSeconds]);

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-zinc-200 p-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#244a9b]">New Disasters</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-950">
            {activeItem?.title ?? "Monitoring official disaster feeds"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Refreshed hourly from {feed.sources.join(" and ")}. Latest items
            stay at the front of the queue.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#d8e0f3] bg-white px-4 text-sm font-semibold text-[#244a9b] transition hover:border-[#244a9b] hover:bg-[#eef3ff] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={items.length === 0}
            onClick={() => setIsDialogOpen(true)}
            type="button"
          >
            {todayItems.length > 0
              ? `Other Disasters Today (${todayItems.length})`
              : "Recent Disasters"}
          </button>
          {activeItem ? (
            <a
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#244a9b] px-4 text-sm font-semibold text-white transition hover:bg-[#1d3c82] focus:outline-none focus:ring-2 focus:ring-[#244a9b] focus:ring-offset-2"
              href={activeItem.url}
              rel="noreferrer"
              target="_blank"
            >
              Open source
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        {activeItem ? (
          <article className="rounded-md bg-[#f8fafc] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityPill severity={activeItem.severity} />
              <span className="rounded border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700">
                {activeItem.source}
              </span>
              {activeItem.eventType ? (
                <span className="rounded border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700">
                  {activeItem.eventType}
                </span>
              ) : null}
            </div>

            <h3 className="mt-4 text-xl font-semibold leading-7 text-zinc-950">
              {activeItem.title}
            </h3>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-600">
              <span>{formatUtcDateTime(activeItem.publishedAt)}</span>
              {activeItem.location ? <span>{activeItem.location}</span> : null}
            </div>
            {activeItem.summary ? (
              <p className="mt-4 text-sm leading-6 text-zinc-700">
                {activeItem.summary}
              </p>
            ) : null}

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  aria-label="Previous disaster"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-lg font-semibold text-zinc-700 transition hover:border-[#244a9b] hover:text-[#244a9b] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={items.length < 2}
                  onClick={() =>
                    setActiveIndex((current) =>
                      current === 0 ? items.length - 1 : current - 1,
                    )
                  }
                  type="button"
                >
                  &lsaquo;
                </button>
                <button
                  aria-label="Next disaster"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-lg font-semibold text-zinc-700 transition hover:border-[#244a9b] hover:text-[#244a9b] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={items.length < 2}
                  onClick={() =>
                    setActiveIndex((current) => (current + 1) % items.length)
                  }
                  type="button"
                >
                  &rsaquo;
                </button>
              </div>
              <p className="text-xs font-semibold text-zinc-500">
                Last checked {formatUtcTime(feed.lastUpdatedAt)}
                {isRefreshing ? " | refreshing" : ""}
              </p>
            </div>
          </article>
        ) : (
          <div className="rounded-md bg-[#f8fafc] p-4">
            <p className="font-semibold text-zinc-950">
              No disaster feed items available yet.
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              The dashboard will keep checking the official feeds each hour.
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase text-zinc-500">
              Latest feed
            </h3>
            <span className="text-xs font-semibold text-zinc-500">
              {items.length} items
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {items.slice(0, 5).map((item, index) => (
              <button
                className={`w-full rounded-md border p-3 text-left transition ${
                  index === activeIndex
                    ? "border-[#244a9b] bg-[#eef3ff]"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                }`}
                key={item.id}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-zinc-100 text-xs font-semibold text-zinc-600">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-5 text-zinc-950">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      {formatUtcDateTime(item.publishedAt)}
                      {item.location ? ` | ${item.location}` : ""}
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {feed.errors.length > 0 ? (
        <p className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          Some sources are temporarily unavailable: {feed.errors.join("; ")}
        </p>
      ) : null}

      {isDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 p-4">
          <div
            aria-labelledby="disaster-news-dialog-title"
            aria-modal="true"
            className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-4">
              <div>
                <p className="text-sm font-semibold text-[#244a9b]">
                  Hourly feed snapshot
                </p>
                <h2
                  className="mt-1 text-xl font-semibold text-zinc-950"
                  id="disaster-news-dialog-title"
                >
                  {dialogTitle}
                </h2>
              </div>
              <button
                aria-label="Close disaster news"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-xl font-semibold text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50"
                onClick={() => setIsDialogOpen(false)}
                type="button"
              >
                &times;
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-4">
              {dialogItems.length > 0 ? (
                <div className="space-y-3">
                  {dialogItems.map((item) => (
                    <a
                      className="block rounded-md border border-zinc-200 p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
                      href={item.url}
                      key={item.id}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityPill severity={item.severity} />
                        <span className="text-xs font-semibold text-zinc-500">
                          {item.source}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {formatUtcDateTime(item.publishedAt)}
                        </span>
                      </div>
                      <p className="mt-2 font-semibold leading-6 text-zinc-950">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {[item.eventType, item.location]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="rounded-md bg-zinc-50 p-4 text-sm text-zinc-600">
                  No disasters have been loaded into the hourly feed yet.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SeverityPill({ severity }: { severity: DisasterNewsSeverity }) {
  const classes: Record<DisasterNewsSeverity, string> = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    orange: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-800",
    unknown: "border-zinc-200 bg-zinc-100 text-zinc-700",
  };

  return (
    <span
      className={`rounded border px-2.5 py-1 text-xs font-semibold ${classes[severity]}`}
    >
      {severity === "unknown" ? "Monitoring" : `${severity} alert`}
    </span>
  );
}

function formatUtcDateTime(value: string) {
  return formatDate(value, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function formatUtcTime(value: string) {
  return formatDate(value, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "time unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", options).format(date);
}
