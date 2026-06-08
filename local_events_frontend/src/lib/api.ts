export type ApiErrorPayload = {
  detail?: string;
  message?: string;
};

export type ApiError = {
  status: number;
  message: string;
  payload?: ApiErrorPayload | unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getDetailMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const detail = payload["detail"];
  return typeof detail === "string" ? detail : null;
}

export type EventListItem = {
  id: string;
  title: string;
  description?: string | null;
  location_name?: string | null;
  starts_at: string; // ISO
  ends_at?: string | null; // ISO
  category?: string | null;
  created_by?: string | null;
};

export type EventDetail = EventListItem & {
  updated_at?: string | null;
};

export type EventCreateInput = {
  title: string;
  description?: string;
  location_name?: string;
  starts_at: string;
  ends_at?: string;
  category?: string;
};

export type EventUpdateInput = Partial<EventCreateInput>;

export type Comment = {
  id: string;
  event_id: string;
  body: string;
  created_by?: string | null;
  created_at: string; // ISO
};

export type CommentCreateInput = {
  body: string;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  userId?: string | null;
};

const DEFAULT_TIMEOUT_MS = 15000;

function getApiBaseUrl(): string {
  // Next.js requires NEXT_PUBLIC_ prefix for exposing env to the browser.
  // For static export, this must be baked at build time.
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  return (raw && raw.trim().length > 0 ? raw.trim() : "http://localhost:8000").replace(/\/+$/, "");
}

function getUserIdFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("le_user_id");
  } catch {
    return null;
  }
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const base = getApiBaseUrl();
  const url = new URL(base + path);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const userId = options.userId ?? getUserIdFromStorage();

  try {
    const res = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": options.body ? "application/json" : "application/json",
        ...(userId ? { "X-User-Id": userId } : {}),
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const payload = await parseJsonSafe(res);
      const message = getDetailMessage(payload) ?? `Request failed (${res.status})`;

      const err: ApiError = {
        status: res.status,
        message,
        payload,
      };
      throw err;
    }

    const data = (await parseJsonSafe(res)) as T;
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

// PUBLIC_INTERFACE
export const api = {
  /** Fetch list of events, optionally filtered by q/category/upcoming. */
  async listEvents(params?: { q?: string; category?: string; upcoming?: boolean }) {
    return requestJson<EventListItem[]>("/events", { query: params });
  },

  /** Fetch a single event by id. */
  async getEvent(eventId: string) {
    return requestJson<EventDetail>(`/events/${encodeURIComponent(eventId)}`);
  },

  /** Create a new event. */
  async createEvent(input: EventCreateInput) {
    return requestJson<EventDetail>("/events", { method: "POST", body: input });
  },

  /** Update an event by id. */
  async updateEvent(eventId: string, input: EventUpdateInput) {
    return requestJson<EventDetail>(`/events/${encodeURIComponent(eventId)}`, { method: "PATCH", body: input });
  },

  /** Delete an event by id. */
  async deleteEvent(eventId: string) {
    return requestJson<{ ok: true }>(`/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
  },

  /** RSVP to an event (simple yes/no). */
  async rsvp(eventId: string, status: "going" | "not_going") {
    return requestJson<{ ok: true; status: string }>(`/events/${encodeURIComponent(eventId)}/rsvp`, {
      method: "POST",
      body: { status },
    });
  },

  /** List comments for an event. */
  async listComments(eventId: string) {
    return requestJson<Comment[]>(`/events/${encodeURIComponent(eventId)}/comments`);
  },

  /** Add a comment to an event. */
  async addComment(eventId: string, input: CommentCreateInput) {
    return requestJson<Comment>(`/events/${encodeURIComponent(eventId)}/comments`, {
      method: "POST",
      body: input,
    });
  },
};
