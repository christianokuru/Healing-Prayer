import { API_BASE } from "../config";
import { ApiError } from "../errors";
import type { ErrorBody } from "./types";

type Query = Record<string, string | number | undefined>;

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
};

/** Where and how to send requests. The browser uses the defaults; the server passes its own. */
export type Transport = {
  /** Origin to prefix, e.g. "http://127.0.0.1:8000". Empty in the browser (same origin). */
  origin?: string;
  /** Cookie header to forward when calling from the server. */
  cookie?: string;
};

export type Send = <T>(path: string, options?: RequestOptions) => Promise<T>;

function buildUrl(origin: string, path: string, query?: Query): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return `${origin}${API_BASE}${path}${qs ? `?${qs}` : ""}`;
}

function isErrorBody(value: unknown): value is ErrorBody {
  if (typeof value !== "object" || value === null || !("error" in value)) return false;
  const error = (value as { error: unknown }).error;
  return typeof error === "object" && error !== null && "code" in error;
}

/** Creates the one function that talks to the API (ENGINEERING.md section 4). */
export function createSend({ origin = "", cookie }: Transport = {}): Send {
  return async function send<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, query, signal } = options;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (cookie) headers.Cookie = cookie;

    let response: Response;
    try {
      response = await fetch(buildUrl(origin, path, query), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: "include",
        cache: "no-store",
        signal,
      });
    } catch (cause) {
      if (signal?.aborted) throw cause;
      throw new ApiError("NETWORK_ERROR", "Network request failed", 0);
    }

    if (response.status === 204) return undefined as T;

    const data: unknown = await response.json().catch(() => null);
    if (response.ok) return data as T;

    if (isErrorBody(data)) {
      const { code, message, fields } = data.error;
      throw new ApiError(code, message, response.status, fields);
    }
    throw new ApiError("UNKNOWN", `Unexpected response (${response.status})`, response.status);
  };
}
