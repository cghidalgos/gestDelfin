import { requireTeacher } from "@/lib/auth"
import { api } from "@/lib/api"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TeacherDashboard } from "@/components/profesor/teacher-dashboard"
import { ChatBot } from "@/components/profesor/chat-bot"
import type { Profile, Topic, Exam, Attempt, Message } from "@/lib/types"

type Overview = {
  students: Profile[]
  topics: Topic[]
  exams: Exam[]
  examTopics: { exam_id: string; topic_id: string }[]
  attempts: Attempt[]
  messages: Message[]
}

export default async function ProfesorPage() {
  const teacher = await requireTeacher()
  const data = await api.get<Overview>("/api/overview")

  return (
    <DashboardShell title="Panel del profesor" roleLabel="Profesor" userName={teacher.full_name}>
      <TeacherDashboard
        teacherId={teacher.id}
        students={data.students}
        topics={data.topics}
        exams={data.exams}
        examTopics={data.examTopics}
        attempts={data.attempts}
        messages={data.messages}
      />
      <ChatBot />
    </DashboardShell>
  )
}
