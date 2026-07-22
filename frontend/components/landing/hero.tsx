import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 text-secondary-foreground">
            <Sparkles className="size-3.5" />
            Exámenes generados con IA
          </Badge>
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            NO ACOMPAÑA a cada estudiante hasta que domine cada tema de IA 
          </h1>
          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Delfín es la plataforma donde los profesores asignan exámenes personalizados y los estudiantes practican con
            retroalimentación y recursos hasta responder todo correctamente.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Comenzar como estudiante
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/login">Soy profesor</Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <Image
              src="/hero-delfin.png"
              alt="Estudiantes estudiando juntos en la plataforma Delfín"
              width={720}
              height={560}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
