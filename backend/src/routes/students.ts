import { Router } from "express"
import { z } from "zod"
import { db, now, uuid } from "../lib/db"
import { hashPassword, getUserByEmail } from "../lib/auth"
import type { Profile } from "../types"

const router = Router()

const createStudentSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  password: z.string().min(6),
})

const updateStudentSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().optional().default(""),
})

/** GET /api/students — Lista todos los estudiantes */
router.get("/", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, role, full_name, email, phone, teacher_id, created_at
       FROM users WHERE role = 'student' ORDER BY created_at DESC`,
    )
    .all() as Profile[]
  res.json({ students: rows })
})

/** POST /api/students — Crea un estudiante nuevo bajo el profesor autenticado */
router.post("/", (req, res) => {
  const parsed = createStudentSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { fullName, email, phone, password } = parsed.data

  if (getUserByEmail(email)) {
    res.status(409).json({ error: "Ya existe una cuenta con ese correo" })
    return
  }

  db.prepare(
    `INSERT INTO users (id, role, full_name, email, phone, password_hash, teacher_id, created_at)
     VALUES (?, 'student', ?, ?, ?, ?, ?, ?)`,
  ).run(uuid(), fullName, email, phone, hashPassword(password), req.profile!.id, now())

  res.status(201).json({ success: true })
})

/** PUT /api/students/:id — Actualiza nombre y teléfono de un estudiante */
router.put("/:id", (req, res) => {
  const parsed = updateStudentSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { fullName, phone } = parsed.data
  db.prepare("UPDATE users SET full_name = ?, phone = ? WHERE id = ? AND role = 'student'").run(
    fullName,
    phone,
    req.params.id,
  )

  res.json({ success: true })
})

/** DELETE /api/students/:id — Elimina un estudiante (cascada de exámenes, intentos y mensajes) */
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ? AND role = 'student'").run(req.params.id)
  res.json({ success: true })
})

/** PUT /api/students/:id/claim — Asigna un estudiante existente al profesor */
router.put("/:id/claim", (req, res) => {
  db.prepare("UPDATE users SET teacher_id = ? WHERE id = ? AND role = 'student'").run(
    req.profile!.id,
    req.params.id,
  )
  res.json({ success: true })
})

export default router
