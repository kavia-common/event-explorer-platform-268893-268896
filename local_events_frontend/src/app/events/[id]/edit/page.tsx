"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Field, Select, TextArea, TextInput } from "@/components/Form";
import { api, type EventDetail, type EventUpdateInput } from "@/lib/api";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/format";
import { getOrCreateLocalUser } from "@/lib/user";

const CATEGORIES = ["General", "Music", "Sports", "Food", "Community", "Tech"];

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params?.id;

  const user = useMemo(() => getOrCreateLocalUser(), []);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [category, setCategory] = useState("General");
  const [startsAtLocal, setStartsAtLocal] = useState("");
  const [endsAtLocal, setEndsAtLocal] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    api
      .getEvent(eventId)
      .then((e: EventDetail) => {
        if (cancelled) return;
        setTitle(e.title ?? "");
        setDescription(e.description ?? "");
        setLocationName(e.location_name ?? "");
        setCategory((e.category as string) ?? "General");
        setStartsAtLocal(toDatetimeLocalValue(e.starts_at));
        setEndsAtLocal(toDatetimeLocalValue(e.ends_at ?? null));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load event.";
        setLoadError(message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eventId) return;
    setSubmitError(null);

    if (!title.trim()) {
      setSubmitError("Title is required.");
      return;
    }
    if (!startsAtLocal) {
      setSubmitError("Start date/time is required.");
      return;
    }

    const payload: EventUpdateInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      location_name: locationName.trim() || undefined,
      category: category || undefined,
      starts_at: fromDatetimeLocalValue(startsAtLocal),
      ends_at: endsAtLocal ? fromDatetimeLocalValue(endsAtLocal) : undefined,
    };

    setSubmitting(true);
    try {
      const updated = await api.updateEvent(eventId, payload);
      router.push(`/events/${encodeURIComponent(updated.id)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update event.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const sidebar = (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">Edit event</h2>
      <p className="text-sm text-gray-600">
        Editing as <span className="font-medium">{user.displayName}</span>.
      </p>
      <p className="text-xs text-gray-500">Ownership enforcement is backend-defined for the MVP.</p>
    </div>
  );

  return (
    <AppShell sidebar={sidebar}>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Edit event</h1>
        <p className="mt-1 text-sm text-gray-600">Update details and save.</p>

        {loading ? (
          <div className="mt-4 text-sm text-gray-600">Loading…</div>
        ) : loadError ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadError}
          </div>
        ) : (
          <>
            {submitError ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            <form className="mt-4 grid grid-cols-1 gap-4" onSubmit={onSubmit}>
              <Field label="Title">
                <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>

              <Field label="Description">
                <TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
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

                <Field label="Location name">
                  <TextInput value={locationName} onChange={(e) => setLocationName(e.target.value)} />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Starts at">
                  <TextInput type="datetime-local" value={startsAtLocal} onChange={(e) => setStartsAtLocal(e.target.value)} />
                </Field>
                <Field label="Ends at">
                  <TextInput type="datetime-local" value={endsAtLocal} onChange={(e) => setEndsAtLocal(e.target.value)} />
                </Field>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => router.push(`/events/${encodeURIComponent(eventId ?? "")}`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </AppShell>
  );
}
