import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Presentation, Check } from "lucide-react"

const teacherPoints = [
  "Gestiona (crea, edita y elimina) estudiantes",
  "Asigna temas y define la cantidad de preguntas",
  "Revisa los resultados de cada intento",
  "Deja feedback y envía mensajes directos",
]

const studentPoints = [
  "Regístrate con nombre, correo, celular y contraseña",
  "Presenta tu examen personalizado al ingresar",
  "Recibe recursos cuando falles alguna respuesta",
  "Reintenta hasta aprobar con todo correcto",
]

export function Roles() {
  return (
    <section id="roles" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Diseñado para dos roles</h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Cada quien tiene su espacio y herramientas.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card className="border-border/70">
            <CardContent className="flex flex-col gap-5 p-8">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Presentation className="size-6" />
              </span>
              <div>
                <h3 className="text-xl font-semibold">Profesor</h3>
                <p className="mt-1 text-sm text-muted-foreground">Lleva el control de los estudiantes Delfín.</p>
              </div>
              <ul className="flex flex-col gap-3">
                {teacherPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="flex flex-col gap-5 p-8">
              <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <GraduationCap className="size-6" />
              </span>
              <div>
                <h3 className="text-xl font-semibold">Estudiante</h3>
                <p className="mt-1 text-sm text-muted-foreground">Aprende a tu ritmo hasta dominar cada tema.</p>
              </div>
              <ul className="flex flex-col gap-3">
                {studentPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-2 w-fit">
                <Link href="/auth/sign-up">Crear mi cuenta</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
