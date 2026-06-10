import { requireTeacher } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TeacherDashboard } from "@/components/profesor/teacher-dashboard"
import type { Profile, Topic, Exam, Attempt, Message } from "@/lib/types"

export default async function ProfesorPage() {
  const teacher = await requireTeacher()
  const supabase = await createClient()

  const [{ data: students }, { data: topics }, { data: exams }, { data: examTopics }, { data: attempts }, { data: messages }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("role", "student").order("created_at", { ascending: false }),
      supabase.from("topics").select("*").order("name"),
      supabase.from("exams").select("*"),
      supabase.from("exam_topics").select("*"),
      supabase.from("attempts").select("*").order("created_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: true }),
    ])

  return (
    <DashboardShell title="Panel del profesor" roleLabel="Profesor" userName={teacher.full_name}>
      <TeacherDashboard
        teacherId={teacher.id}
        students={(students as Profile[]) ?? []}
        topics={(topics as Topic[]) ?? []}
        exams={(exams as Exam[]) ?? []}
        examTopics={(examTopics as { exam_id: string; topic_id: string }[]) ?? []}
        attempts={(attempts as Attempt[]) ?? []}
        messages={(messages as Message[]) ?? []}
      />
    </DashboardShell>
  )
}
