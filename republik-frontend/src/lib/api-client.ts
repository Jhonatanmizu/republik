import { FRONTEND_ENV } from "@/config/env.config";

const API_BASE_URL = FRONTEND_ENV.API_URL;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

export async function ensureCsrfToken(): Promise<string | null> {
  const existing = readCookie(FRONTEND_ENV.CSRF_COOKIE_NAME);
  if (existing) {
    return existing;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/auth/csrf`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "csrfToken" in data &&
      typeof data.csrfToken === "string"
    ) {
      return data.csrfToken;
    }
    return readCookie(FRONTEND_ENV.CSRF_COOKIE_NAME);
  } catch {
    return null;
  }
}

export interface ApiRequestOptions {
  readonly method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  readonly body?: unknown;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (method !== "GET") {
    const csrf = await ensureCsrfToken();
    if (csrf) {
      headers[FRONTEND_ENV.CSRF_HEADER_NAME] = csrf;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `Erro ${response.status} na comunicação com a Republik API.`;
    try {
      const errBody: unknown = await response.json();
      if (
        typeof errBody === "object" &&
        errBody !== null &&
        "message" in errBody &&
        typeof errBody.message === "string"
      ) {
        errorMessage = errBody.message;
      }
    } catch {
      // Keep default error message
    }
    throw new Error(errorMessage);
  }

  const json: unknown = await response.json();
  return json as T;
}

export { API_BASE_URL };
