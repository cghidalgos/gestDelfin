import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db } from "./db"
import type { Profile } from "../types"

const JWT_SECRET = process.env.JWT_SECRET || "cambia-esta-clave-en-produccion"
const JWT_EXPIRES_IN = "7d"

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10)
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash)
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    return typeof payload === "object" && payload.sub ? String(payload.sub) : null
  } catch {
    return null
  }
}

/** Fila de la tabla users tal como la devuelve SQLite */
type UserRow = {
  id: string
  role: "teacher" | "student"
  full_name: string | null
  email: string
  phone: string | null
  password_hash: string
  teacher_id: string | null
  created_at: string
}

/** Convierte una fila de users en un Profile público (sin el hash) */
export function toProfile(row: UserRow): Profile {
  return {
    id: row.id,
    role: row.role,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    teacher_id: row.teacher_id,
    created_at: row.created_at,
  }
}

export function getUserById(id: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined
}

export function getUserByEmail(email: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined
}
