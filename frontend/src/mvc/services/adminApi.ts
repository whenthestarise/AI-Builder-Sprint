const DEFAULT_API_BASE_URL = "http://localhost:8000";

type ApiEnvelope<T> = {
  data?: T;
  ok?: boolean;
  detail?: unknown;
  message?: string;
};

export function getBackendApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.API_BASE_URL?.trim() ||
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
}

export async function fetchBackendViewModel<T>(
  paths: string[],
): Promise<T | null> {
  for (const path of paths) {
    try {
      const response = await fetch(`${getBackendApiBaseUrl()}${path}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as T | ApiEnvelope<T>;

      if (
        payload &&
        typeof payload === "object" &&
        "data" in payload
      ) {
        return (payload as ApiEnvelope<T>).data ?? null;
      }

      return payload as T;
    } catch {
      continue;
    }
  }

  return null;
}

export async function postBackendJson<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(`${getBackendApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | TResponse
    | ApiEnvelope<TResponse>
    | null;

  if (!response.ok) {
    const detail =
      payload &&
      typeof payload === "object" &&
      "detail" in payload
        ? (payload as ApiEnvelope<TResponse>).detail
        : null;

    throw new Error(
      typeof detail === "string"
        ? detail
        : `Backend POST ${path} failed with ${response.status}.`,
    );
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<TResponse>).data as TResponse;
  }

  return payload as TResponse;
}
