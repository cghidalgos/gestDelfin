import "dotenv/config"
import { db, migrate } from "../src/lib/db"

/**
 * Promueve un usuario existente a rol de profesor.
 * Uso: pnpm make-teacher correo@ejemplo.com
 */
const email = process.argv[2]

if (!email) {
  console.error("Uso: pnpm make-teacher <correo>")
  process.exit(1)
}

migrate()

const result = db.prepare("UPDATE users SET role = 'teacher' WHERE email = ?").run(email)

if (result.changes === 0) {
  console.error(`✗ No se encontró ningún usuario con el correo "${email}". Regístralo primero en /auth/sign-up.`)
  process.exit(1)
}

console.log(`✓ ${email} ahora es profesor.`)
