import "dotenv/config"
import express from "express"
import cors from "cors"
import { migrate } from "./lib/db"
import { requireAuth, requireTeacher } from "./middleware/auth"
import authRouter from "./routes/auth"
import studentsRouter from "./routes/students"
import topicsRouter from "./routes/topics"
import examsRouter from "./routes/exams"
import attemptsRouter from "./routes/attempts"
import messagesRouter from "./routes/messages"
import overviewRouter from "./routes/overview"
import chatRouter from "./routes/chat"

// Crea las tablas de SQLite si no existen
migrate()

const app = express()
const PORT = process.env.PORT || 3001

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// ── Salud ─────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// ── Autenticación (pública: register/login; /me valida el token internamente) ──
app.use("/api/auth", authRouter)

// ── Rutas protegidas (requieren autenticación + rol de profesor) ───────────────
app.use("/api/students", requireAuth, requireTeacher, studentsRouter)
app.use("/api/topics", requireAuth, requireTeacher, topicsRouter)
app.use("/api/exams", requireAuth, requireTeacher, examsRouter)
app.use("/api/attempts", requireAuth, requireTeacher, attemptsRouter)
app.use("/api/messages", requireAuth, requireTeacher, messagesRouter)
app.use("/api/overview", requireAuth, requireTeacher, overviewRouter)
app.use("/api/chat", requireAuth, requireTeacher, chatRouter)

// ── Manejo de errores 404 ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" })
})

// ── Inicio del servidor ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ Backend corriendo en http://localhost:${PORT}`)
})

export default app
