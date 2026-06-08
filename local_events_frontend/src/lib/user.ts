export type LocalUser = {
  id: string;
  displayName: string;
};

const USER_ID_KEY = "le_user_id";
const USER_NAME_KEY = "le_display_name";

function randomId() {
  return `u_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

// PUBLIC_INTERFACE
export function getOrCreateLocalUser(): LocalUser {
  if (typeof window === "undefined") {
    return { id: "server", displayName: "Server" };
  }

  const existingId = window.localStorage.getItem(USER_ID_KEY);
  const existingName = window.localStorage.getItem(USER_NAME_KEY);

  if (existingId && existingName) {
    return { id: existingId, displayName: existingName };
  }

  const created: LocalUser = { id: existingId ?? randomId(), displayName: existingName ?? "Guest" };
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
