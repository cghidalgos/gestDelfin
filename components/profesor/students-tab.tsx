"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, Pencil, Trash2, ClipboardList, Phone, Mail } from "lucide-react"
import {
  createStudent,
  updateStudent,
  deleteStudent,
  claimStudent,
  assignExam,
} from "@/app/profesor/actions"
import type { Profile, Topic, Exam } from "@/lib/types"

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-amber-100 text-amber-800" },
  in_progress: { label: "En progreso", className: "bg-blue-100 text-blue-800" },
  passed: { label: "Aprobado", className: "bg-emerald-100 text-emerald-800" },
}

export function StudentsTab({
  students,
  unclaimed,
  topics,
  exams,
  examTopics,
}: {
  students: Profile[]
  unclaimed: Profile[]
  topics: Topic[]
  exams: Exam[]
  examTopics: { exam_id: string; topic_id: string }[]
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {students.length} estudiante{students.length === 1 ? "" : "s"} a tu cargo
        </p>
        <CreateStudentDialog />
      </div>

      {unclaimed.length > 0 && (
        <Card className="p-4">
          <p className="mb-3 text-sm font-medium">Estudiantes sin profesor asignado</p>
          <div className="flex flex-col gap-2">
            {unclaimed.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-border p-2.5">
                <span className="text-sm">{s.full_name ?? s.email}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const r = await claimStudent(s.id)
                      r.success ? toast.success("Estudiante añadido") : toast.error(r.error)
                    })
                  }
                >
                  Añadir a mi clase
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {students.map((student) => {
          const exam = exams.find((e) => e.student_id === student.id)
          return (
            <Card key={student.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{student.full_name ?? "Sin nombre"}</p>
                  <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3" /> {student.email}
                    </span>
                    {student.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3" /> {student.phone}
                      </span>
                    )}
                  </div>
                </div>
                {exam ? (
                  <Badge className={statusLabels[exam.status]?.className}>{statusLabels[exam.status]?.label}</Badge>
                ) : (
                  <Badge variant="outline">Sin examen</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <AssignExamDialog student={student} topics={topics} />
                <EditStudentDialog student={student} />
                <DeleteStudentButton student={student} />
              </div>
            </Card>
          )
        })}
        {students.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            Aún no tienes estudiantes. Crea uno con el botón de arriba.
          </p>
        )}
      </div>
    </div>
  )
}

function CreateStudentDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4" /> Nuevo estudiante
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear cuenta de estudiante</DialogTitle>
          <DialogDescription>
            Se creará una cuenta con estas credenciales. Comparte la contraseña con el estudiante.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cs-name">Nombre completo</Label>
            <Input id="cs-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cs-email">Correo</Label>
            <Input
              id="cs-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cs-phone">Teléfono</Label>
            <Input id="cs-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cs-pass">Contraseña temporal</Label>
            <Input
              id="cs-pass"
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                if (!form.email || !form.password || !form.fullName) {
                  toast.error("Completa nombre, correo y contraseña")
                  return
                }
                const r = await createStudent(form)
                if (r.success) {
                  toast.success("Estudiante creado")
                  setForm({ fullName: "", email: "", phone: "", password: "" })
                  setOpen(false)
                } else {
                  toast.error(r.error)
                }
              })
            }
          >
            {isPending ? "Creando..." : "Crear estudiante"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditStudentDialog({ student }: { student: Profile }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ fullName: student.full_name ?? "", phone: student.phone ?? "" })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="size-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar estudiante</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="es-name">Nombre completo</Label>
            <Input id="es-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="es-phone">Teléfono</Label>
            <Input id="es-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const r = await updateStudent(student.id, form)
                if (r.success) {
                  toast.success("Estudiante actualizado")
                  setOpen(false)
                } else {
                  toast.error(r.error)
                }
              })
            }
          >
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteStudentButton({ student }: { student: Profile }) {
  const [isPending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-destructive hover:text-destructive"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`¿Eliminar a ${student.full_name ?? student.email}? Esta acción es permanente.`)) return
        startTransition(async () => {
          const r = await deleteStudent(student.id)
          r.success ? toast.success("Estudiante eliminado") : toast.error(r.error)
        })
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  )
}

function AssignExamDialog({ student, topics }: { student: Profile; topics: Topic[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [num, setNum] = useState(5)

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <ClipboardList className="size-4" /> Asignar examen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar examen a {student.full_name}</DialogTitle>
          <DialogDescription>
            Selecciona los temas. Las preguntas se generan con IA cuando el estudiante inicie el examen.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Temas</Label>
            {topics.length === 0 ? (
              <p className="text-sm text-muted-foreground">Primero crea temas en la pestaña Temas.</p>
            ) : (
              <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border border-border p-3">
                {topics.map((t) => (
                  <label key={t.id} className="flex items-start gap-2.5 text-sm">
                    <Checkbox checked={selected.includes(t.id)} onCheckedChange={() => toggle(t.id)} />
                    <span>
                      <span className="font-medium">{t.name}</span>
                      {t.description && <span className="block text-xs text-muted-foreground">{t.description}</span>}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="num-q">Número de preguntas</Label>
            <Input
              id="num-q"
              type="number"
              min={1}
              max={20}
              value={num}
              onChange={(e) => setNum(Number(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const r = await assignExam({ studentId: student.id, topicIds: selected, numQuestions: num })
                if (r.success) {
                  toast.success("Examen asignado")
                  setSelected([])
                  setOpen(false)
                } else {
                  toast.error(r.error)
                }
              })
            }
          >
            {isPending ? "Asignando..." : "Asignar examen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
