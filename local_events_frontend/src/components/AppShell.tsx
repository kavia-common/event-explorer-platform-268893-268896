"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={[
        "rounded-md px-3 py-2 text-sm transition",
        active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

// PUBLIC_INTERFACE
export function AppShell({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-base font-semibold tracking-tight text-gray-900">
              Local Events
            </Link>
            <span className="hidden text-xs text-gray-500 sm:inline">Simple discovery + RSVP</span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink href="/">Events</NavLink>
            <NavLink href="/events/new">Create</NavLink>
            <NavLink href="/profile">Profile</NavLink>
            <NavLink href="/admin">Admin</NavLink>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[280px_1fr]">
        <aside className="md:sticky md:top-[72px] md:h-[calc(100vh-88px)]">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {sidebar ?? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
                <p className="text-sm text-gray-600">
                  Use the search and category filters on the Events page.
                </p>
                <div className="border-t border-gray-100 pt-3">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Minimal placeholder for now.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-gray-500">
          <span>Built with Next.js + FastAPI</span>
          <span>
            API: <code className="rounded bg-gray-100 px-2 py-1">{process.env.NEXT_PUBLIC_API_BASE_URL ?? "localhost"}</code>
          </span>
        </div>
      </footer>
    </div>
  );
}
