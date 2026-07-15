import { Router } from "express"
import { z } from "zod"
import { db, now, uuid } from "../lib/db"
import { generateQuestions } from "../lib/ai"
import type { Exam } from "../types"

const router = Router()

const assignExamSchema = z.object({
  studentId: z.string().min(1),
  topicIds: z.array(z.string().min(1)).min(1, "Selecciona al menos un tema"),
  numQuestions: z.number().int().min(1).max(50),
})

const previewSchema = z.object({
  topics: z.array(z.string()).min(1),
  numQuestions: z.number().int().min(1).max(50),
})

/** GET /api/exams — Lista los exámenes del profesor autenticado */
router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM exams WHERE teacher_id = ? ORDER BY created_at DESC")
    .all(req.profile!.id) as Exam[]
  res.json({ exams: rows })
})

/** POST /api/exams — Asigna un examen a un estudiante */
router.post("/", (req, res) => {
  const parsed = assignExamSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { studentId, topicIds, numQuestions } = parsed.data
  const teacherId = req.profile!.id

  // Validar que los temas existen
  const placeholders = topicIds.map(() => "?").join(", ")
  const existing = db
    .prepare(`SELECT id FROM topics WHERE id IN (${placeholders})`)
    .all(...topicIds) as { id: string }[]

  if (existing.length === 0) {
    res.status(400).json({ error: "No se encontraron los temas seleccionados" })
    return
  }

  const examId = uuid()
  const ts = now()

  // Toda la asignación es atómica
  const assign = db.transaction(() => {
    // Eliminar exámenes anteriores no aprobados del estudiante
    db.prepare("DELETE FROM exams WHERE student_id = ? AND status != 'passed'").run(studentId)

    db.prepare(
      `INSERT INTO exams (id, student_id, teacher_id, num_questions, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
    ).run(examId, studentId, teacherId, numQuestions, ts, ts)

    const linkStmt = db.prepare("INSERT INTO exam_topics (exam_id, topic_id) VALUES (?, ?)")
    for (const topicId of topicIds) {
      linkStmt.run(examId, topicId)
    }
  })

  assign()

  res.status(201).json({ success: true, examId })
})

/** POST /api/exams/preview-questions — Genera preguntas de previsualización con IA */
router.post("/preview-questions", async (req, res) => {
  const parsed = previewSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { topics, numQuestions } = parsed.data
  const questions = await generateQuestions(topics, numQuestions)
  res.json({ questions })
})

export default router
