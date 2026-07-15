import { Router } from "express"
import { z } from "zod"
import { db, now, uuid } from "../lib/db"
import {
  hashPassword,
  verifyPassword,
  signToken,
  toProfile,
  getUserByEmail,
  getUserById,
} from "../lib/auth"
import { requireAuth } from "../middleware/auth"

const router = Router()

const registerSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

/** POST /api/auth/register — Registro público (crea un estudiante) */
router.post("/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { fullName, email, phone, password } = parsed.data

  if (getUserByEmail(email)) {
    res.status(409).json({ error: "Ya existe una cuenta con ese correo" })
    return
  }

  const id = uuid()
  db.prepare(
    `INSERT INTO users (id, role, full_name, email, phone, password_hash, teacher_id, created_at)
     VALUES (?, 'student', ?, ?, ?, ?, NULL, ?)`,
  ).run(id, fullName, email, phone, hashPassword(password), now())

  const token = signToken(id)
  res.status(201).json({ token, profile: toProfile(getUserById(id)!) })
})

/** POST /api/auth/login — Inicia sesión y devuelve un JWT */
router.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { email, password } = parsed.data
  const user = getUserByEmail(email)

  if (!user || !verifyPassword(password, user.password_hash)) {
    res.status(401).json({ error: "Correo o contraseña incorrectos" })
    return
  }

  const token = signToken(user.id)
  res.json({ token, profile: toProfile(user) })
})

/** GET /api/auth/me — Devuelve el perfil del usuario autenticado */
router.get("/me", requireAuth, (req, res) => {
  res.json({ profile: req.profile })
})

export default router
