import Link from "next/link";
import React from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Form";

export default function NotFound() {
  return (
    <AppShell>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">404 — Page not found</h1>
        <p className="mt-2 text-sm text-gray-600">The page you’re looking for doesn’t exist.</p>
        <div className="mt-4">
          <Link href="/">
            <Button variant="secondary">Go back home</Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
