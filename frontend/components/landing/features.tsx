import { Card, CardContent } from "@/components/ui/card"
import { BrainCircuit, RefreshCw, MessageSquareText, ListChecks, BookOpen, Users } from "lucide-react"

const features = [
  {
    icon: BrainCircuit,
    title: "Preguntas con IA",
    description: "El profesor elige temas y cantidad; la IA genera el examen personalizado para cada estudiante.",
  },
  {
    icon: RefreshCw,
    title: "Práctica hasta dominar",
    description: "El estudiante repite el examen hasta responder todas las preguntas correctamente.",
  },
  {
    icon: BookOpen,
    title: "Recursos de estudio",
    description: "Tras cada intento fallido se entregan recursos enfocados en los temas a reforzar.",
  },
  {
    icon: ListChecks,
    title: "Retroalimentación inmediata",
    description: "Cada intento muestra qué se acertó y qué se debe repasar antes de volver a intentar.",
  },
  {
    icon: MessageSquareText,
    title: "Mensajería profesor-estudiante",
    description: "El profesor deja comentarios en los intentos y envía mensajes directos al estudiante.",
  },
  {
    icon: Users,
    title: "Gestión de estudiantes",
    description: "CRUD completo de estudiantes y asignación de exámenes desde el panel del profesor.",
  },
]

export function Features() {
  return (
    <section id="caracteristicas" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Todo lo necesario para el seguimiento académico
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Una experiencia pensada para que ningún estudiante se quede atrás.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/70 transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
