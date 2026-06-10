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

export type Question = {
  id: string
  topic: string
  prompt: string
  options: string[]
  // index of the correct option
  correct: number
  explanation: string
}

export type StudentAnswer = {
  questionId: string
  selected: number
}

export type Resource = {
  topic: string
  title: string
  description: string
}

export type Attempt = {
  id: string
  exam_id: string
  student_id: string
  attempt_number: number
  questions: Question[]
  answers: StudentAnswer[]
  score: number
  total: number
  passed: boolean
  resources: Resource[]
  teacher_feedback: string | null
  created_at: string
}

export type Message = {
  id: string
  student_id: string
  teacher_id: string
  sender_id: string
  body: string
  read: boolean
  created_at: string
}
