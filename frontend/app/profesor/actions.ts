"use server"

import { revalidatePath } from "next/cache"
import { requireTeacher } from "@/lib/auth"
import { api } from "@/lib/api"
import type { Question } from "@/lib/types"

type ActionResult = { success: boolean; error?: string }

// ---------- STUDENTS CRUD ----------

export async function createStudent(formData: {
  fullName: string
  email: string
  phone: string
  password: string
}): Promise<ActionResult> {
  await requireTeacher()
  try {
    await api.post("/api/students", formData)
    revalidatePath("/profesor")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

export async function updateStudent(
  studentId: string,
  formData: { fullName: string; phone: string },
): Promise<ActionResult> {
  await requireTeacher()
  try {
    await api.put(`/api/students/${studentId}`, formData)
    revalidatePath("/profesor")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

export async function deleteStudent(studentId: string): Promise<ActionResult> {
  await requireTeacher()
  try {
    await api.delete(`/api/students/${studentId}`)
    revalidatePath("/profesor")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

/** Claims an existing (self-registered) student under this teacher. */
export async function claimStudent(studentId: string): Promise<ActionResult> {
  await requireTeacher()
  try {
    await api.put(`/api/students/${studentId}/claim`, {})
    revalidatePath("/profesor")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

// ---------- TOPICS ----------

export async function createTopic(name: string, description: string): Promise<ActionResult> {
  await requireTeacher()
  try {
    await api.post("/api/topics", { name, description })
    revalidatePath("/profesor")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

export async function deleteTopic(topicId: string): Promise<ActionResult> {
  await requireTeacher()
  try {
    await api.delete(`/api/topics/${topicId}`)
    revalidatePath("/profesor")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

// ---------- EXAM ASSIGNMENT ----------

export async function assignExam(formData: {
  studentId: string
  topicIds: string[]
  numQuestions: number
}): Promise<ActionResult> {
  await requireTeacher()
  try {
    await api.post("/api/exams", formData)
    revalidatePath("/profesor")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

// ---------- FEEDBACK & MESSAGES ----------

export async function addAttemptFeedback(attemptId: string, feedback: string): Promise<ActionResult> {
  await requireTeacher()
  try {
    await api.put(`/api/attempts/${attemptId}/feedback`, { feedback })
    revalidatePath("/profesor")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

export async function sendMessage(studentId: string, body: string): Promise<ActionResult> {
  await requireTeacher()
  try {
    await api.post("/api/messages", { studentId, body })
    revalidatePath("/profesor")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

export async function previewQuestions(topics: string[], num: number): Promise<Question[]> {
  await requireTeacher()
  const result = await api.post<{ questions: Question[] }>("/api/exams/preview-questions", {
    topics,
    numQuestions: num,
  })
  return result.questions
}
