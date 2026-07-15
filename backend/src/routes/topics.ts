import { Router } from "express"
import { z } from "zod"
import { db, now, uuid } from "../lib/db"
import type { Topic } from "../types"

const router = Router()

const createTopicSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
})

/** GET /api/topics — Lista los temas */
router.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM topics ORDER BY name").all() as Topic[]
  res.json({ topics: rows })
})

/** POST /api/topics — Crea un tema nuevo */
router.post("/", (req, res) => {
  const parsed = createTopicSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { name, description } = parsed.data
  db.prepare(
    "INSERT INTO topics (id, name, description, created_by, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(uuid(), name, description, req.profile!.id, now())

  res.status(201).json({ success: true })
})

/** DELETE /api/topics/:id — Elimina un tema */
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM topics WHERE id = ?").run(req.params.id)
  res.json({ success: true })
})

export default router
