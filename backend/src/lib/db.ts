import Database from "better-sqlite3"
import { mkdirSync } from "node:fs"
import { dirname } from "node:path"

const DB_PATH = process.env.SQLITE_PATH || "./data/gestdelfin.db"

// Asegura que exista el directorio del archivo de base de datos
mkdirSync(dirname(DB_PATH), { recursive: true })

export const db = new Database(DB_PATH)
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")

/** Crea las tablas si no existen. Se ejecuta una vez al arrancar el servidor. */
export function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      role          TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
      full_name     TEXT,
      email         TEXT NOT NULL UNIQUE,
      phone         TEXT,
      password_hash TEXT NOT NULL,
      teacher_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS topics (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      created_by  TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exams (
      id            TEXT PRIMARY KEY,
      student_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      teacher_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
      num_questions INTEGER NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed')),
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exam_topics (
      exam_id  TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
      topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      PRIMARY KEY (exam_id, topic_id)
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id               TEXT PRIMARY KEY,
      exam_id          TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
      student_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      attempt_number   INTEGER NOT NULL DEFAULT 1,
      questions        TEXT NOT NULL DEFAULT '[]',
      answers          TEXT NOT NULL DEFAULT '[]',
      score            INTEGER NOT NULL DEFAULT 0,
      total            INTEGER NOT NULL DEFAULT 0,
      passed           INTEGER NOT NULL DEFAULT 0,
      resources        TEXT NOT NULL DEFAULT '[]',
      teacher_feedback TEXT,
      created_at       TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id         TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sender_id  TEXT NOT NULL,
      body       TEXT NOT NULL,
      read       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_teacher ON users(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_exams_student ON exams(student_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_student ON attempts(student_id);
    CREATE INDEX IF NOT EXISTS idx_messages_student ON messages(student_id);
  `)
}

export function now(): string {
  return new Date().toISOString()
}

export function uuid(): string {
  return crypto.randomUUID()
}
