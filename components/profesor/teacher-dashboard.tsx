"use client"

import { useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Users, BookOpen, ClipboardList, MessageSquare } from "lucide-react"
import { StudentsTab } from "./students-tab"
import { TopicsTab } from "./topics-tab"
import { ResultsTab } from "./results-tab"
import { MessagesTab } from "./messages-tab"
import type { Profile, Topic, Exam, Attempt, Message } from "@/lib/types"

export function TeacherDashboard({
  teacherId,
  students,
  topics,
  exams,
  examTopics,
  attempts,
  messages,
}: {
  teacherId: string
  students: Profile[]
  topics: Topic[]
  exams: Exam[]
  examTopics: { exam_id: string; topic_id: string }[]
  attempts: Attempt[]
  messages: Message[]
}) {
  const myStudents = useMemo(() => students.filter((s) => s.teacher_id === teacherId), [students, teacherId])
  const unclaimed = useMemo(() => students.filter((s) => !s.teacher_id), [students])

  const stats = [
    { label: "Estudiantes", value: myStudents.length, icon: Users },
    { label: "Temas", value: topics.length, icon: BookOpen },
    { label: "Exámenes activos", value: exams.filter((e) => e.status !== "passed").length, icon: ClipboardList },
    { label: "Aprobados", value: exams.filter((e) => e.status === "passed").length, icon: MessageSquare },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="students">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
          <TabsTrigger value="topics">Temas</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <StudentsTab
            students={myStudents}
            unclaimed={unclaimed}
            topics={topics}
            exams={exams}
            examTopics={examTopics}
          />
        </TabsContent>
        <TabsContent value="topics" className="mt-6">
          <TopicsTab topics={topics} />
        </TabsContent>
        <TabsContent value="results" className="mt-6">
          <ResultsTab students={myStudents} attempts={attempts} exams={exams} />
        </TabsContent>
        <TabsContent value="messages" className="mt-6">
          <MessagesTab teacherId={teacherId} students={myStudents} messages={messages} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
