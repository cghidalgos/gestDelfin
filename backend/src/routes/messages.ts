import { Router } from "express"
import { z } from "zod"
import { db, now, uuid } from "../lib/db"
import type { Message } from "../types"

const router = Router()

const sendMessageSchema = z.object({
  studentId: z.string().min(1),
  body: z.string().min(1),
})

/** GET /api/messages — Lista los mensajes del profesor autenticado */
router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM messages WHERE teacher_id = ? ORDER BY created_at ASC")
    .all(req.profile!.id) as Message[]
  res.json({ messages: rows })
})

/** POST /api/messages — Envía un mensaje del profesor al estudiante */
router.post("/", (req, res) => {
  const parsed = sendMessageSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { studentId, body } = parsed.data
  const teacherId = req.profile!.id

  db.prepare(
    `INSERT INTO messages (id, student_id, teacher_id, sender_id, body, read, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
  ).run(uuid(), studentId, teacherId, teacherId, body, now())

  res.status(201).json({ success: true })
})

export default router
