export type Role = "teacher" | "student"

export type Profile = {
  id: string
  role: Role
  full_name: string | null
  email: string | null
  phone: string | null
  teacher_id: string | null
  created_at: string
}

export type Topic = {
  id: string
  name: string
  description: string | null
  created_by: string | null
  created_at: string
}

export type Question = {
  id: string
  topic: string
  prompt: string
  options: string[]
  correct: number
  explanation: string
}

export type Resource = {
  topic: string
  title: string
  description: string
}

export type ExamStatus = "pending" | "in_progress" | "passed"

export type Exam = {
  id: string
  student_id: string
  teacher_id: string | null
  num_questions: number
  status: ExamStatus
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  student_id: string
  teacher_id: string
  sender_id: string
  body: string
  read: number
  created_at: string
}

// Extiende el Request de Express para incluir el perfil autenticado
declare global {
  namespace Express {
    interface Request {
      profile?: Profile
    }
  }
}
