import { generateText, Output } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import type { Question, Resource } from "../types"

function getModel() {
  return openai(process.env.OPENAI_MODEL || "gpt-4o-mini")
}

const questionsSchema = z.object({
  questions: z.array(
    z.object({
      topic: z.string().describe("El tema al que pertenece la pregunta"),
      prompt: z.string().describe("El enunciado de la pregunta"),
      options: z.array(z.string()).length(4).describe("Exactamente 4 opciones de respuesta"),
      correct: z.number().int().min(0).max(3).describe("Índice (0-3) de la opción correcta"),
      explanation: z.string().describe("Explicación breve de por qué la respuesta es correcta"),
    }),
  ),
})

export async function generateQuestions(topics: string[], numQuestions: number): Promise<Question[]> {
  const { experimental_output } = await generateText({
    model: getModel(),
    experimental_output: Output.object({ schema: questionsSchema }),
    prompt: `Eres un profesor experto. Genera exactamente ${numQuestions} preguntas de opción múltiple en español para un examen de práctica.
Los temas a cubrir son: ${topics.join(", ")}.
Distribuye las preguntas de forma equilibrada entre los temas.
Cada pregunta debe tener exactamente 4 opciones, una sola correcta, y una explicación clara y breve.
Las preguntas deben tener dificultad media y ser claras y sin ambigüedad.`,
  })

  return experimental_output.questions.map((q: { topic: string; prompt: string; options: string[]; correct: number; explanation: string }, i: number) => ({
    id: `q-${Date.now()}-${i}`,
    topic: q.topic,
    prompt: q.prompt,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
  }))
}

const resourcesSchema = z.object({
  resources: z.array(
    z.object({
      topic: z.string().describe("El tema a reforzar"),
      title: z.string().describe("Título corto del recurso de estudio"),
      description: z.string().describe("Descripción de qué estudiar y consejos concretos"),
    }),
  ),
})

export async function generateResources(weakTopics: string[]): Promise<Resource[]> {
  if (weakTopics.length === 0) return []

  const { experimental_output } = await generateText({
    model: getModel(),
    experimental_output: Output.object({ schema: resourcesSchema }),
    prompt: `Eres un tutor educativo. El estudiante falló preguntas de los siguientes temas: ${weakTopics.join(", ")}.
Genera un recurso de estudio por cada tema (uno por tema único) en español, con un título corto y una descripción práctica
que explique qué conceptos repasar y consejos concretos para mejorar. Sé motivador y claro.`,
  })

  return experimental_output.resources
}
