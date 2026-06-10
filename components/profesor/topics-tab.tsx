"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Trash2 } from "lucide-react"
import { createTopic, deleteTopic } from "@/app/profesor/actions"
import type { Topic } from "@/lib/types"

export function TopicsTab({ topics }: { topics: Topic[] }) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
      <Card className="h-fit p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Plus className="size-4 text-primary" /> Nuevo tema
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-name">Nombre del tema</Label>
            <Input
              id="t-name"
              placeholder="Ej. Ecuaciones de segundo grado"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-desc">Descripción</Label>
            <Textarea
              id="t-desc"
              placeholder="Conceptos clave que cubre este tema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                if (!name.trim()) {
                  toast.error("Escribe un nombre para el tema")
                  return
                }
                const r = await createTopic(name.trim(), description.trim())
                if (r.success) {
                  toast.success("Tema creado")
                  setName("")
                  setDescription("")
                } else {
                  toast.error(r.error)
                }
              })
            }
          >
            {isPending ? "Guardando..." : "Crear tema"}
          </Button>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {topics.map((t) => (
          <Card key={t.id} className="flex items-start justify-between gap-4 p-4">
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="size-4" />
              </span>
              <div>
                <p className="font-medium">{t.name}</p>
                {t.description && <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (!confirm(`¿Eliminar el tema "${t.name}"?`)) return
                startTransition(async () => {
                  const r = await deleteTopic(t.id)
                  r.success ? toast.success("Tema eliminado") : toast.error(r.error)
                })
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </Card>
        ))}
        {topics.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay temas. Crea el primero con el formulario.
          </p>
        )}
      </div>
    </div>
  )
}
