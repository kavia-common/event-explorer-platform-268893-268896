"use client";

import React from "react";

function baseInputClassName() {
  return "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";
}

// PUBLIC_INTERFACE
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-red-600" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="block text-xs text-gray-500">{hint}</span>
      ) : null}
    </label>
  );
}

// PUBLIC_INTERFACE
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={[baseInputClassName(), props.className ?? ""].join(" ")} />;
}

// PUBLIC_INTERFACE
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={[baseInputClassName(), props.className ?? ""].join(" ")} />;
}

// PUBLIC_INTERFACE
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={[baseInputClassName(), props.className ?? ""].join(" ")} />;
}

// PUBLIC_INTERFACE
export function Button({
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const variantClass =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-700"
        : "bg-gray-100 text-gray-900 hover:bg-gray-200";

  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClass,
        props.className ?? "",
      ].join(" ")}
    />
  );
}
