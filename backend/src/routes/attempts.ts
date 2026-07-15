import { Router } from "express"
import { z } from "zod"
import { db } from "../lib/db"

const router = Router()

const feedbackSchema = z.object({
  feedback: z.string().min(1),
})

/** Fila cruda de attempts en SQLite (columnas JSON como texto, passed como entero) */
type AttemptRow = {
  id: string
  exam_id: string
  student_id: string
  attempt_number: number
  questions: string
  answers: string
  score: number
  total: number
  passed: number
  resources: string
  teacher_feedback: string | null
  created_at: string
}

function mapAttempt(row: AttemptRow) {
  return {
    id: row.id,
    exam_id: row.exam_id,
    student_id: row.student_id,
    attempt_number: row.attempt_number,
    questions: JSON.parse(row.questions),
    answers: JSON.parse(row.answers),
    score: row.score,
    total: row.total,
    passed: row.passed === 1,
    resources: JSON.parse(row.resources),
    teacher_feedback: row.teacher_feedback,
    created_at: row.created_at,
  }
}

/** GET /api/attempts — Lista los intentos de los estudiantes del profesor */
router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT a.* FROM attempts a
       JOIN users u ON u.id = a.student_id
       WHERE u.teacher_id = ?
       ORDER BY a.created_at DESC`,
    )
    .all(req.profile!.id) as AttemptRow[]
  res.json({ attempts: rows.map(mapAttempt) })
})

/** PUT /api/attempts/:id/feedback — Agrega feedback del profesor a un intento */
router.put("/:id/feedback", (req, res) => {
  const parsed = feedbackSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  db.prepare("UPDATE attempts SET teacher_feedback = ? WHERE id = ?").run(
    parsed.data.feedback,
    req.params.id,
  )

  res.json({ success: true })
})

export default router
