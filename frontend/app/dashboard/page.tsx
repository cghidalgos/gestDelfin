import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/auth"

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  if (profile.role === "teacher") {
    redirect("/profesor")
  }

  redirect("/estudiante")
}
