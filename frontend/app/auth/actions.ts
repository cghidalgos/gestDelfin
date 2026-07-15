"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_COOKIE } from "@/lib/api"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001"

type AuthResult = { error?: string }

async function setSession(token: string) {
  const store = await cookies()
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  })
}

/** Inicia sesión contra el backend y guarda el JWT en una cookie httpOnly. */
export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) return { error: data.error ?? "No se pudo iniciar sesión" }

  await setSession(data.token)
  return {}
}

/** Registra un estudiante nuevo y deja la sesión iniciada. */
export async function register(input: {
  fullName: string
  email: string
  phone: string
  password: string
}): Promise<AuthResult> {
  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const data = await res.json()
  if (!res.ok) return { error: data.error ?? "No se pudo crear la cuenta" }

  await setSession(data.token)
  return {}
}

/** Cierra sesión borrando la cookie. */
export async function signOut() {
  const store = await cookies()
  store.delete(AUTH_COOKIE)
  redirect("/auth/login")
}
