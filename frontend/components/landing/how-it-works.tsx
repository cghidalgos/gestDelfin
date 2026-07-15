const steps = [
  {
    number: "01",
    title: "El profesor configura el examen",
    description: "Crea o selecciona al estudiante, elige los temas y la cantidad de preguntas.",
  },
  {
    number: "02",
    title: "El estudiante presenta",
    description: "Al ingresar, encuentra su examen generado con IA y responde cada pregunta.",
  },
  {
    number: "03",
    title: "Recibe feedback y recursos",
    description: "Si falla al menos una respuesta, obtiene retroalimentación y material para estudiar.",
  },
  {
    number: "04",
    title: "Reintenta hasta lograrlo",
    description: "Vuelve a presentar el examen hasta responder todo correctamente y aprobar.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Cómo funciona</h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Un ciclo de aprendizaje continuo en cuatro pasos.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-3">
              <span className="text-4xl font-bold text-primary/30">{step.number}</span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
