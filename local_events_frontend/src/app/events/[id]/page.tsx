"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Field, TextArea } from "@/components/Form";
import { Modal } from "@/components/Modal";
import { api, type Comment, type EventDetail } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { getOrCreateLocalUser } from "@/lib/user";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);

  const [commentsLoading, setCommentsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const user = useMemo(() => getOrCreateLocalUser(), []);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    api
      .getEvent(eventId)
      .then((data) => {
        if (cancelled) return;
        setEvent(data);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load event.";
        setError(message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const loadComments = React.useCallback(() => {
    if (!eventId) return;
    setCommentsLoading(true);
    api
      .listComments(eventId)
      .then((data) => setComments(data ?? []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [eventId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const sidebar = useMemo(() => {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Quick actions</h2>
        <div className="space-y-2">
          <Link href="/">
            <Button className="w-full" variant="secondary">
              Back to list
            </Button>
          </Link>
          <Link href={`/events/${encodeURIComponent(eventId ?? "")}/edit`}>
            <Button className="w-full" variant="secondary" disabled={!eventId}>
              Edit event
            </Button>
          </Link>
          <Button className="w-full" variant="danger" disabled={!eventId} onClick={() => setDeleteOpen(true)}>
            Delete event
          </Button>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <h3 className="text-sm font-semibold text-gray-900">You</h3>
          <p className="text-sm text-gray-600">
            Signed in as <span className="font-medium">{user.displayName}</span>
          </p>
          <p className="text-xs text-gray-500">This is a lightweight local identity for the MVP.</p>
        </div>
      </div>
    );
  }, [eventId, user.displayName]);

  async function onRsvp(status: "going" | "not_going") {
    if (!eventId) return;
    setMutationError(null);
    try {
      await api.rsvp(eventId, status);
      // Keep UI simple: no stateful RSVP display yet; backend can return current RSVP later.
      loadComments(); // small activity signal (and keeps UI from feeling stale)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "RSVP failed.";
      setMutationError(message);
    }
  }

  async function onAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!eventId) return;
    const body = commentBody.trim();
    if (!body) return;

    setMutationError(null);
    try {
      await api.addComment(eventId, { body });
      setCommentBody("");
      loadComments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add comment.";
      setMutationError(message);
    }
  }

  async function onDelete() {
    if (!eventId) return;
    setMutationError(null);
    try {
      await api.deleteEvent(eventId);
      router.push("/");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Delete failed.";
      setMutationError(message);
    } finally {
      setDeleteOpen(false);
    }
  }

  return (
    <AppShell sidebar={sidebar}>
      <section className="space-y-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
            Loading event…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : !event ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
            Event not found.
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold text-gray-900">{event.title}</h1>
                  <p className="mt-1 text-sm text-gray-600">{event.description ?? "—"}</p>
                </div>
                <span className="self-start rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {event.category ?? "General"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
                <div>
                  <span className="text-gray-500">When:</span> {formatDateTime(event.starts_at)}
                </div>
                <div className="truncate">
                  <span className="text-gray-500">Where:</span> {event.location_name ?? "—"}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => onRsvp("going")}>RSVP: Going</Button>
                <Button variant="secondary" onClick={() => onRsvp("not_going")}>
                  RSVP: Not going
                </Button>
              </div>

              {mutationError ? (
                <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {mutationError}
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Comments</h2>
              <p className="mt-1 text-sm text-gray-600">Ask a question or leave a note.</p>

              <form className="mt-4 space-y-3" onSubmit={onAddComment}>
                <Field label="Add comment">
                  <TextArea
                    rows={3}
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Write something…"
                  />
                </Field>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500">Posting as {user.displayName}</span>
                  <Button type="submit" disabled={!commentBody.trim()}>
                    Post
                  </Button>
                </div>
              </form>

              <div className="mt-5 space-y-3">
                {commentsLoading ? (
                  <div className="text-sm text-gray-600">Loading comments…</div>
                ) : comments.length === 0 ? (
                  <div className="text-sm text-gray-600">No comments yet.</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{c.created_by ?? "Someone"}</span>
                        <span>{formatDateTime(c.created_at)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{c.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <Modal
        title="Delete event?"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-700">
          This will permanently delete the event. This action cannot be undone.
        </p>
      </Modal>
    </AppShell>
  );
}
