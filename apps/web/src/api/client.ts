import type {
  MapPayload,
  SessionUser,
  UpsertRatingInput,
  WashroomDetail,
} from "@ubc-access-map/shared";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "UBCAccessMap",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(response.status, body.error ?? `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export function fetchMap(search: string) {
  return api<MapPayload>(`/api/map${search}`);
}

export function searchCampus(q: string) {
  return api<MapPayload>(`/api/search?q=${encodeURIComponent(q)}`);
}

export function fetchWashroom(id: string) {
  return api<WashroomDetail>(`/api/washrooms/${id}`);
}

export function fetchMe() {
  return api<{ user: SessionUser | null }>("/api/auth/me");
}

export function requestMagicLink(email: string) {
  return api<{ ok: true; message: string }>("/api/auth/request-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyMagicLink(token: string) {
  return api<{ user: SessionUser }>("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function logout() {
  return api<{ ok: true }>("/api/auth/logout", { method: "POST" });
}

export function upsertRating(washroomId: string, input: UpsertRatingInput) {
  return api<WashroomDetail>(`/api/washrooms/${washroomId}/rating`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function createReport(washroomId: string, type: string, message: string) {
  return api<{ id: string; status: string }>(`/api/washrooms/${washroomId}/reports`, {
    method: "POST",
    body: JSON.stringify({ type, message }),
  });
}

export function fetchReports() {
  return api<{
    reports: Array<{
      id: string;
      washroomId: string;
      washroomName: string;
      buildingName: string;
      type: string;
      message: string;
      status: "open" | "reviewed" | "dismissed";
      createdAt: string;
      reviewerNote: string | null;
    }>;
  }>("/api/admin/reports");
}

export function updateReport(id: string, status: "reviewed" | "dismissed", reviewerNote?: string) {
  return api<{ id: string; status: string }>(`/api/admin/reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, reviewerNote }),
  });
}

export function fetchDevMagicLink(email: string) {
  return api<{ url: string | null }>(`/api/dev/magic-link?email=${encodeURIComponent(email)}`);
}
