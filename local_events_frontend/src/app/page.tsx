"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Field, Select, TextInput } from "@/components/Form";
import { api, type EventListItem } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

const CATEGORIES = ["All", "Music", "Sports", "Food", "Community", "Tech"];

function EventCard({ e }: { e: EventListItem }) {
  return (
    <Link
      href={`/events/${encodeURIComponent(e.id)}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900">{e.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{e.description ?? "—"}</p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          {e.category ?? "General"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-1 text-sm text-gray-700 sm:grid-cols-2">
        <div>
          <span className="text-gray-500">When:</span> {formatDateTime(e.starts_at)}
        </div>
        <div className="truncate">
          <span className="text-gray-500">Where:</span> {e.location_name ?? "—"}
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        <span className="text-gray-400">Organizer:</span> {e.created_by ?? "—"}
      </div>
    </Link>
  );
}

export default function EventsHomePage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [upcoming, setUpcoming] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventListItem[]>([]);

  const effectiveCategory = category === "All" ? undefined : category;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .listEvents({ q: q.trim() || undefined, category: effectiveCategory, upcoming })
      .then((data) => {
        if (cancelled) return;
        setEvents(data ?? []);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load events.";
        setError(message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, effectiveCategory, upcoming]);

  const sidebar = useMemo(() => {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          <p className="mt-1 text-sm text-gray-600">Search and narrow down events.</p>
        </div>

        <Field label="Search" hint="Search by title/description">
          <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. yoga, meetup..." />
        </Field>

        <Field label="Category">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <div>
            <div className="text-sm font-medium text-gray-900">Upcoming only</div>
            <div className="text-xs text-gray-500">Hide past events</div>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 accent-blue-600"
            checked={upcoming}
            onChange={(e) => setUpcoming(e.target.checked)}
            aria-label="Upcoming only"
          />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <p className="mt-1 text-sm text-gray-600">
            Minimal placeholder. (Will be backed by backend later.)
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
            <li>No new notifications</li>
          </ul>
        </div>
      </div>
    );
  }, [q, category, upcoming]);

  return (
    <AppShell sidebar={sidebar}>
      <section className="space-y-4">
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Discover events</h1>
            <p className="text-sm text-gray-600">Browse local events and RSVP in a few clicks.</p>
          </div>
          <Link href="/events/new">
            <Button>Create event</Button>
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
            Loading events…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-sm">
            {error}{" "}
            <div className="mt-2 text-xs text-gray-600">
              Check <code>NEXT_PUBLIC_API_BASE_URL</code> and that the backend is running.
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
            No events found. Try adjusting filters, or{" "}
            <Link className="text-blue-700 underline" href="/events/new">
              create the first event
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {events.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
