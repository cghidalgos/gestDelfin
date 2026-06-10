import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"

/** Returns the current authenticated profile or redirects to login. */
export async function getCurrentProfile(): Promise<Profile> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) redirect("/auth/login")

  return profile as Profile
}

/** Ensures the current user is a teacher, otherwise redirects. */
export async function requireTeacher(): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (profile.role !== "teacher") redirect("/estudiante")
  return profile
}

/** Ensures the current user is a student, otherwise redirects. */
export async function requireStudent(): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (profile.role !== "student") redirect("/profesor")
  return profile
}
