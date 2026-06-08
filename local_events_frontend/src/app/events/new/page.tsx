"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Field, Select, TextArea, TextInput } from "@/components/Form";
import { api, type EventCreateInput } from "@/lib/api";
import { fromDatetimeLocalValue } from "@/lib/format";
import { getOrCreateLocalUser } from "@/lib/user";

const CATEGORIES = ["General", "Music", "Sports", "Food", "Community", "Tech"];

export default function NewEventPage() {
  const router = useRouter();
  const user = useMemo(() => getOrCreateLocalUser(), []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [category, setCategory] = useState("General");
  const [startsAtLocal, setStartsAtLocal] = useState("");
  const [endsAtLocal, setEndsAtLocal] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!startsAtLocal) {
      setError("Start date/time is required.");
      return;
    }

    const payload: EventCreateInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      location_name: locationName.trim() || undefined,
      category: category || undefined,
      starts_at: fromDatetimeLocalValue(startsAtLocal),
      ends_at: endsAtLocal ? fromDatetimeLocalValue(endsAtLocal) : undefined,
    };

    setSubmitting(true);
    try {
      const created = await api.createEvent(payload);
      router.push(`/events/${encodeURIComponent(created.id)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create event.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const sidebar = (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">Create event</h2>
      <p className="text-sm text-gray-600">
        You’re creating as <span className="font-medium">{user.displayName}</span>.
      </p>
      <p className="text-xs text-gray-500">
        This MVP uses local identity; backend can enforce ownership later.
      </p>
    </div>
  );

  return (
    <AppShell sidebar={sidebar}>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">New event</h1>
        <p className="mt-1 text-sm text-gray-600">Fill in the details and publish.</p>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form className="mt-4 grid grid-cols-1 gap-4" onSubmit={onSubmit}>
          <Field label="Title" hint="Short and descriptive">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Saturday Farmers Market" />
          </Field>

          <Field label="Description" hint="What should people expect?">
            <TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Location name" hint="Venue or area">
              <TextInput value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g. Central Park" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Starts at">
              <TextInput type="datetime-local" value={startsAtLocal} onChange={(e) => setStartsAtLocal(e.target.value)} />
            </Field>
            <Field label="Ends at" hint="Optional">
              <TextInput type="datetime-local" value={endsAtLocal} onChange={(e) => setEndsAtLocal(e.target.value)} />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
