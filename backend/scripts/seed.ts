import "dotenv/config"
import { db, migrate, now, uuid } from "../src/lib/db"
import { hashPassword } from "../src/lib/auth"

/**
 * Crea (o actualiza) usuarios de prueba. Idempotente: se puede correr varias veces.
 * Uso: pnpm seed
 */
migrate()

type SeedUser = {
  role: "teacher" | "student"
  fullName: string
  email: string
  phone: string
  password: string
  teacherEmail?: string // para asignar el estudiante a un profesor
}

const users: SeedUser[] = [
  { role: "teacher", fullName: "Administrador", email: "admin@admin.com", phone: "", password: "123456" },
  {
    role: "student",
    fullName: "Estudiante Demo",
    email: "estudiante@estudiante.com",
    phone: "",
    password: "123456",
    teacherEmail: "admin@admin.com",
  },
]

function idByEmail(email: string): string | undefined {
  const row = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: string } | undefined
  return row?.id
}

for (const u of users) {
  const teacherId = u.teacherEmail ? idByEmail(u.teacherEmail) ?? null : null
  const existing = idByEmail(u.email)

  if (existing) {
    db.prepare(
      "UPDATE users SET role = ?, full_name = ?, phone = ?, password_hash = ?, teacher_id = ? WHERE email = ?",
    ).run(u.role, u.fullName, u.phone, hashPassword(u.password), teacherId, u.email)
    console.log(`↻ Actualizado ${u.role}: ${u.email} (contraseña: ${u.password})`)
  } else {
    db.prepare(
      `INSERT INTO users (id, role, full_name, email, phone, password_hash, teacher_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(uuid(), u.role, u.fullName, u.email, u.phone, hashPassword(u.password), teacherId, now())
    console.log(`✓ Creado ${u.role}: ${u.email} (contraseña: ${u.password})`)
  }
}

console.log("\nSeed completado.")
