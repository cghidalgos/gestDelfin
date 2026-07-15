/**
 * Cliente HTTP para comunicarse con el backend Express desde el servidor de Next.js.
 * Lee el JWT de la cookie de sesión y lo adjunta en el header Authorization.
 */
import { cookies } from "next/headers"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001"

export const AUTH_COOKIE = "auth_token"

async function getAccessToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(AUTH_COOKIE)?.value ?? null
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken()

  const response = await fetch(`${BACKEND_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error ?? "Error en el servidor")
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),

  post: <T = { success: boolean }>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T = { success: boolean }>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  delete: <T = { success: boolean }>(path: string) =>
    apiFetch<T>(path, { method: "DELETE" }),
}
