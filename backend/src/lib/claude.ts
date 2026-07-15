import Anthropic from "@anthropic-ai/sdk"
import { db } from "./db"
import type { Profile, Topic } from "../types"

/** Cliente de Anthropic. La API key se lee de ANTHROPIC_API_KEY en el .env */
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("Falta ANTHROPIC_API_KEY en las variables de entorno")
  }
  return new Anthropic({ apiKey })
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

/**
 * Construye un resumen compacto del estado del sistema para el profesor dado,
 * para que el bot pueda responder preguntas sobre los datos de la plataforma.
 */
export async function buildSystemContext(teacherId: string, teacherName: string | null): Promise<string> {
  const studentList = db
    .prepare("SELECT id, full_name, email, phone, created_at FROM users WHERE teacher_id = ?")
    .all(teacherId) as Pick<Profile, "id" | "full_name" | "email" | "phone" | "created_at">[]

  const topics = db
    .prepare("SELECT name, description FROM topics WHERE created_by = ? ORDER BY name")
    .all(teacherId) as Pick<Topic, "name" | "description">[]

  const exams = db
    .prepare("SELECT student_id, num_questions, status FROM exams WHERE teacher_id = ?")
    .all(teacherId) as { student_id: string; num_questions: number; status: string }[]

  const myAttempts = db
    .prepare(
      `SELECT a.student_id, a.score, a.total, a.passed, a.created_at
       FROM attempts a JOIN users u ON u.id = a.student_id
       WHERE u.teacher_id = ?
       ORDER BY a.created_at DESC LIMIT 100`,
    )
    .all(teacherId) as { student_id: string; score: number; total: number; passed: number; created_at: string }[]

  const nameById = new Map(studentList.map((s) => [s.id, s.full_name ?? "Sin nombre"]))

  const lines: string[] = []
  lines.push(`Profesor: ${teacherName ?? "Sin nombre"}`)
  lines.push(`Total de estudiantes: ${studentList.length}`)

  lines.push("", "ESTUDIANTES:")
  if (studentList.length === 0) {
    lines.push("- (ninguno)")
  } else {
    for (const s of studentList) {
      lines.push(`- ${s.full_name ?? "Sin nombre"} (${s.email ?? "sin email"})`)
    }
  }

  lines.push("", "TEMAS:")
  if (!topics || topics.length === 0) {
    lines.push("- (ninguno)")
  } else {
    for (const t of topics) {
      lines.push(`- ${t.name}${t.description ? `: ${t.description}` : ""}`)
    }
  }

  const examList = exams ?? []
  const byStatus = (status: string) => examList.filter((e) => e.status === status).length
  lines.push("", "EXÁMENES:")
  lines.push(`- Pendientes: ${byStatus("pending")}`)
  lines.push(`- En progreso: ${byStatus("in_progress")}`)
  lines.push(`- Aprobados: ${byStatus("passed")}`)

  lines.push("", "INTENTOS RECIENTES (máx 20):")
  if (myAttempts.length === 0) {
    lines.push("- (ninguno)")
  } else {
    for (const a of myAttempts.slice(0, 20)) {
      const fecha = new Date(a.created_at).toLocaleDateString("es")
      lines.push(
        `- ${nameById.get(a.student_id) ?? "Estudiante"}: ${a.score}/${a.total} ${a.passed ? "(aprobado)" : "(reprobado)"} — ${fecha}`,
      )
    }
  }

  return lines.join("\n")
}

const SYSTEM_PROMPT = `Eres el asistente virtual de "Delfín", una plataforma de gestión educativa donde los profesores administran estudiantes, temas, exámenes de práctica y resultados.

Tu trabajo es responder, siempre en español, las preguntas del profesor sobre la información de su sistema: cuántos estudiantes tiene, qué temas existen, el estado de los exámenes, el rendimiento en los intentos, qué estudiantes necesitan refuerzo, etc.

Reglas:
- Responde solo con base en los datos proporcionados en el contexto. Si la información no está disponible, dilo con claridad en lugar de inventar.
- Sé conciso, claro y útil. Usa listas cuando ayude a la legibilidad.
- No reveles datos sensibles más allá de lo que el profesor ya puede ver de sus propios estudiantes.`

/**
 * Envía la conversación a Claude y transmite la respuesta en fragmentos de texto.
 * Llama a onText por cada fragmento generado.
 */
export async function streamChatResponse(
  context: string,
  messages: ChatMessage[],
  onText: (text: string) => void,
): Promise<void> {
  const client = getClient()

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    system: [
      { type: "text", text: SYSTEM_PROMPT },
      { type: "text", text: `Estado actual del sistema:\n\n${context}` },
    ],
    messages,
  })

  stream.on("text", (delta) => onText(delta))
  await stream.finalMessage()
}
