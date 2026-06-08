"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Form";

export default function AdminPage() {
  return (
    <AppShell
      sidebar={
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Admin</h2>
          <p className="text-sm text-gray-600">
            Minimal placeholder for moderation/notifications tooling.
          </p>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Not secured yet. Backend will own real authorization.
          </div>
        </div>
      }
    >
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Admin dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          This page is intentionally simple in the MVP. Add moderation queues and reports later.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold text-gray-900">Reports</h2>
            <p className="mt-1 text-sm text-gray-600">No reports.</p>
            <Button className="mt-3" variant="secondary" disabled>
              Review reports
            </Button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-semibold text-gray-900">Announcements</h2>
            <p className="mt-1 text-sm text-gray-600">No announcements.</p>
            <Button className="mt-3" variant="secondary" disabled>
              Create announcement
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
