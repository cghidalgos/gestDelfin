import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AUTH_COOKIE } from "@/lib/api"
import type { Profile } from "@/lib/types"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001"

/** Devuelve el perfil autenticado o redirige a login. */
export async function getCurrentProfile(): Promise<Profile> {
  const store = await cookies()
  const token = store.get(AUTH_COOKIE)?.value

  if (!token) redirect("/auth/login")

  const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!res.ok) redirect("/auth/login")

  const { profile } = (await res.json()) as { profile: Profile }
  return profile
}

/** Exige rol de profesor; si no, redirige. */
export async function requireTeacher(): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (profile.role !== "teacher") redirect("/estudiante")
  return profile
}

/** Exige rol de estudiante; si no, redirige. */
export async function requireStudent(): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (profile.role !== "student") redirect("/profesor")
  return profile
}
