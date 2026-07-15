"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send } from "lucide-react"
import { sendMessage } from "@/app/profesor/actions"
import type { Profile, Message } from "@/lib/types"

export function MessagesTab({
  teacherId,
  students,
  messages,
}: {
  teacherId: string
  students: Profile[]
  messages: Message[]
}) {
  const [isPending, startTransition] = useTransition()
  const [studentId, setStudentId] = useState("")
  const [body, setBody] = useState("")

  const nameById = useMemo(
    () => new Map(students.map((s) => [s.id, s.full_name ?? "Sin nombre"])),
    [students],
  )

  const send = () => {
    if (!studentId || !body.trim()) {
      toast.error("Selecciona un estudiante y escribe un mensaje")
      return
    }
    startTransition(async () => {
      const res = await sendMessage(studentId, body.trim())
      if (res.success) {
        toast.success("Mensaje enviado")
        setBody("")
      } else {
        toast.error(res.error ?? "Error al enviar")
      }
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
      <Card className="h-fit p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Send className="size-4 text-primary" /> Nuevo mensaje
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Estudiante</Label>
            <Select value={studentId} onValueChange={(v) => setStudentId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estudiante" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name ?? s.email ?? "Sin nombre"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-body">Mensaje</Label>
            <Textarea
              id="m-body"
              placeholder="Escribe tu mensaje…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <Button onClick={send} disabled={isPending}>
            Enviar mensaje
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <MessageSquare className="size-4 text-primary" /> Historial
        </h2>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no has enviado mensajes.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((m) => (
              <li key={m.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{nameById.get(m.student_id) ?? "Estudiante"}</span>
                  <span>{new Date(m.created_at).toLocaleString("es")}</span>
                </div>
                <p className="mt-1 text-sm">{m.body}</p>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {m.sender_id === teacherId ? "Tú" : "Estudiante"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
