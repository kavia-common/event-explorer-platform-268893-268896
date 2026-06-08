export type LocalUser = {
  id: string;
  displayName: string;
};

const USER_ID_KEY = "le_user_id";
const USER_NAME_KEY = "le_display_name";

function isUuid(value: string): boolean {
  // Accept RFC4122 UUIDs (v1-v5). Backend expects uuid.UUID(...) compatible values.
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function generateUuidV4(): string {
  // Prefer crypto.randomUUID when available (modern browsers).
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (crypto as any).randomUUID();
  }

  // Fallback: RFC4122 v4 UUID from getRandomValues.
  // This avoids adding dependencies and is sufficient for a local identity token.
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Extremely old environments: best-effort fallback (still produces UUID-shaped value).
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  // Per RFC4122: set version to 4 and variant to 10xx
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex
    .slice(8, 10)
    .join("")}-${hex.slice(10, 16).join("")}`;
}

// PUBLIC_INTERFACE
export function getOrCreateLocalUser(): LocalUser {
  if (typeof window === "undefined") {
    return { id: "server", displayName: "Server" };
  }

  const existingId = window.localStorage.getItem(USER_ID_KEY);
  const existingName = window.localStorage.getItem(USER_NAME_KEY);

  // Migration: older versions used non-UUID ids which the backend rejects.
  // If we detect a legacy id, replace it with a UUID and keep the display name.
  if (existingId && isUuid(existingId) && existingName) {
    return { id: existingId, displayName: existingName };
  }

  const created: LocalUser = {
    id: generateUuidV4(),
    displayName: existingName ?? "Guest",
  };
  window.localStorage.setItem(USER_ID_KEY, created.id);
  window.localStorage.setItem(USER_NAME_KEY, created.displayName);
  return created;
}

// PUBLIC_INTERFACE
export function setLocalDisplayName(displayName: string) {
  if (typeof window === "undefined") return;
  const name = displayName.trim().slice(0, 40) || "Guest";
  window.localStorage.setItem(USER_NAME_KEY, name);
}

// PUBLIC_INTERFACE
export function clearLocalUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_ID_KEY);
  window.localStorage.removeItem(USER_NAME_KEY);
}
