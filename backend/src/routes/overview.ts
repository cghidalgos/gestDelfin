import { Router } from "express"
import { db } from "../lib/db"
import type { Profile, Topic, Exam, Message } from "../types"

const router = Router()

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

/**
 * GET /api/overview — Devuelve todo lo que necesita el panel del profesor
 * (estudiantes, temas, exámenes, exam_topics, intentos y mensajes) en una sola llamada.
 */
router.get("/", (req, res) => {
  const teacherId = req.profile!.id

  const students = db
    .prepare(
      `SELECT id, role, full_name, email, phone, teacher_id, created_at
       FROM users WHERE role = 'student' ORDER BY created_at DESC`,
    )
    .all() as Profile[]

  const topics = db.prepare("SELECT * FROM topics ORDER BY name").all() as Topic[]

  const exams = db.prepare("SELECT * FROM exams").all() as Exam[]

  const examTopics = db.prepare("SELECT exam_id, topic_id FROM exam_topics").all() as {
    exam_id: string
    topic_id: string
  }[]

  const attemptRows = db
    .prepare("SELECT * FROM attempts ORDER BY created_at DESC")
    .all() as AttemptRow[]
  const attempts = attemptRows.map((row) => ({
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
  }))

  const messages = db
    .prepare("SELECT * FROM messages WHERE teacher_id = ? ORDER BY created_at ASC")
    .all(teacherId) as Message[]

  res.json({ students, topics, exams, examTopics, attempts, messages })
})

export default router
