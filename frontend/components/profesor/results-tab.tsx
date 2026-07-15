"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ClipboardList } from "lucide-react"
import { addAttemptFeedback } from "@/app/profesor/actions"
import type { Profile, Attempt, Exam } from "@/lib/types"

export function ResultsTab({
  students,
  attempts,
}: {
  students: Profile[]
  attempts: Attempt[]
  exams: Exam[]
}) {
  const [isPending, startTransition] = useTransition()
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const nameById = useMemo(
    () => new Map(students.map((s) => [s.id, s.full_name ?? "Sin nombre"])),
    [students],
  )

  if (attempts.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
        <ClipboardList className="size-8" />
        <p>Aún no hay intentos de exámenes registrados.</p>
      </Card>
    )
  }

  const saveFeedback = (attemptId: string) => {
    const feedback = (drafts[attemptId] ?? "").trim()
    if (!feedback) return
    startTransition(async () => {
      const res = await addAttemptFeedback(attemptId, feedback)
      if (res.success) toast.success("Feedback guardado")
      else toast.error(res.error ?? "Error al guardar")
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {attempts.map((a) => (
        <Card key={a.id} className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{nameById.get(a.student_id) ?? "Estudiante"}</p>
              <p className="text-xs text-muted-foreground">
                Intento #{a.attempt_number} · {new Date(a.created_at).toLocaleString("es")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {a.score}/{a.total}
              </span>
              <Badge variant={a.passed ? "default" : "secondary"}>
                {a.passed ? "Aprobado" : "Reprobado"}
              </Badge>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Textarea
              placeholder="Escribe feedback para el estudiante…"
              defaultValue={a.teacher_feedback ?? ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
            />
            <div className="flex justify-end">
              <Button size="sm" disabled={isPending} onClick={() => saveFeedback(a.id)}>
                Guardar feedback
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
