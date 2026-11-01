import type { ApiEnvelope } from "./types";

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

function isAuthEndpoint(url: string) {
  return url.startsWith("/api/auth/");
}

async function parseResponse<T>(response: Response, url: string): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { error?: string; details?: unknown }
    | null;

  if (!response.ok) {
    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      !isAuthEndpoint(url) &&
      window.location.pathname !== "/login"
    ) {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/login?from=${encodeURIComponent(next)}`);
    }
    const message =
      body && "error" in body && body.error
        ? body.error
        : "Request failed. Please try again.";
    const details =
      body && "details" in body ? body.details : undefined;
    throw new ApiClientError(message, response.status, details);
  }

  if (!body || !("data" in body)) {
    throw new ApiClientError("Unexpected server response.", response.status);
  }

  return body.data;
}

export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  return parseResponse<T>(response, url);
}

export async function apiMutate<T>(
  url: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown
): Promise<T> {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(response, url);
}
