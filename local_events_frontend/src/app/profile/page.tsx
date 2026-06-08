"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Field, TextInput } from "@/components/Form";
import { clearLocalUser, getOrCreateLocalUser, setLocalDisplayName } from "@/lib/user";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [currentId, setCurrentId] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getOrCreateLocalUser();
    setDisplayName(u.displayName);
    setCurrentId(u.id);
  }, []);

  return (
    <AppShell
      sidebar={
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-600">This MVP uses local-only identity (no passwords).</p>
          <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
            <div>
              <span className="text-gray-500">User ID:</span> <code>{currentId || "—"}</code>
            </div>
          </div>
        </div>
      }
    >
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Your profile</h1>
        <p className="mt-1 text-sm text-gray-600">Update how your name appears on comments/events.</p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setLocalDisplayName(displayName);
            const u = getOrCreateLocalUser();
            setCurrentId(u.id);
            setDisplayName(u.displayName);
            setSaved(true);
            setTimeout(() => setSaved(false), 1200);
          }}
        >
          <Field label="Display name" hint="Used for created-by fields and comments">
            <TextInput value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </Field>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                clearLocalUser();
                const u = getOrCreateLocalUser();
                setCurrentId(u.id);
                setDisplayName(u.displayName);
              }}
            >
              Reset local user
            </Button>
            <Button type="submit">Save</Button>
          </div>

          {saved ? <div className="text-sm text-green-700">Saved.</div> : null}
        </form>
      </div>
    </AppShell>
  );
}
