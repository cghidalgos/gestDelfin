import { Router } from "express"
import { z } from "zod"
import { buildSystemContext, streamChatResponse, type ChatMessage } from "../lib/claude"

const router = Router()

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1)
    .max(50),
})

/** POST /api/chat — Bot con Claude que responde preguntas sobre el sistema (streaming) */
router.post("/", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const teacher = req.profile!

  try {
    const context = await buildSystemContext(teacher.id, teacher.full_name)

    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("X-Accel-Buffering", "no")

    await streamChatResponse(context, parsed.data.messages as ChatMessage[], (text) => {
      res.write(text)
    })

    res.end()
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al generar la respuesta"
    // Si ya empezamos a transmitir, no podemos cambiar el status; cerramos.
    if (res.headersSent) {
      res.end()
    } else {
      res.status(500).json({ error: message })
    }
  }
})

export default router
