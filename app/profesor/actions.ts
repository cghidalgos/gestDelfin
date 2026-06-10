"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireTeacher } from "@/lib/auth"
import { generateQuestions } from "@/lib/ai"

type ActionResult = { success: boolean; error?: string }

// ---------- STUDENTS CRUD ----------

export async function createStudent(formData: {
  fullName: string
  email: string
  phone: string
  password: string
}): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const admin = createAdminClient()

  // Create the auth user with confirmed email so they can log in right away.
  const { data, error } = await admin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      full_name: formData.fullName,
      phone: formData.phone,
      role: "student",
    },
  })

  if (error) return { success: false, error: error.message }

  // Trigger creates the profile; update teacher_id ownership.
  if (data.user) {
    await admin
      .from("profiles")
      .update({ teacher_id: teacher.id, full_name: formData.fullName, phone: formData.phone })
      .eq("id", data.user.id)
  }

  revalidatePath("/profesor")
  return { success: true }
}

export async function updateStudent(
  studentId: string,
  formData: { fullName: string; phone: string },
): Promise<ActionResult> {
  await requireTeacher()
  const supabase = await createClient()

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: formData.fullName, phone: formData.phone })
    .eq("id", studentId)

  if (error) return { success: false, error: error.message }

  revalidatePath("/profesor")
  return { success: true }
}

export async function deleteStudent(studentId: string): Promise<ActionResult> {
  await requireTeacher()
  const admin = createAdminClient()

  // Deleting the auth user cascades to the profile and related data.
  const { error } = await admin.auth.admin.deleteUser(studentId)

  if (error) return { success: false, error: error.message }

  revalidatePath("/profesor")
  return { success: true }
}

/** Claims an existing (self-registered) student under this teacher. */
export async function claimStudent(studentId: string): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const supabase = await createClient()

  const { error } = await supabase.from("profiles").update({ teacher_id: teacher.id }).eq("id", studentId)

  if (error) return { success: false, error: error.message }

  revalidatePath("/profesor")
  return { success: true }
}

// ---------- TOPICS ----------

export async function createTopic(name: string, description: string): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const supabase = await createClient()

  const { error } = await supabase.from("topics").insert({ name, description, created_by: teacher.id })

  if (error) return { success: false, error: error.message }

  revalidatePath("/profesor")
  return { success: true }
}

export async function deleteTopic(topicId: string): Promise<ActionResult> {
  await requireTeacher()
  const supabase = await createClient()

  const { error } = await supabase.from("topics").delete().eq("id", topicId)

  if (error) return { success: false, error: error.message }

  revalidatePath("/profesor")
  return { success: true }
}

// ---------- EXAM ASSIGNMENT ----------

export async function assignExam(formData: {
  studentId: string
  topicIds: string[]
  numQuestions: number
}): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const supabase = await createClient()

  if (formData.topicIds.length === 0) {
    return { success: false, error: "Selecciona al menos un tema" }
  }

  // Validate the topics generate properly before saving (fail fast).
  const { data: topicRows } = await supabase.from("topics").select("name").in("id", formData.topicIds)
  if (!topicRows || topicRows.length === 0) {
    return { success: false, error: "No se encontraron los temas seleccionados" }
  }

  // Upsert: one active exam per student. Remove previous pending/in_progress exams.
  await supabase.from("exams").delete().eq("student_id", formData.studentId).neq("status", "passed")

  const { data: exam, error: examError } = await supabase
    .from("exams")
    .insert({
      student_id: formData.studentId,
      teacher_id: teacher.id,
      num_questions: formData.numQuestions,
      status: "pending",
    })
    .select()
    .single()

  if (examError || !exam) return { success: false, error: examError?.message ?? "No se pudo crear el examen" }

  const examTopics = formData.topicIds.map((topicId) => ({ exam_id: exam.id, topic_id: topicId }))
  const { error: linkError } = await supabase.from("exam_topics").insert(examTopics)

  if (linkError) return { success: false, error: linkError.message }

  revalidatePath("/profesor")
  return { success: true }
}

// ---------- FEEDBACK & MESSAGES ----------

export async function addAttemptFeedback(attemptId: string, feedback: string): Promise<ActionResult> {
  await requireTeacher()
  const supabase = await createClient()

  const { error } = await supabase.from("attempts").update({ teacher_feedback: feedback }).eq("id", attemptId)

  if (error) return { success: false, error: error.message }

  revalidatePath("/profesor")
  return { success: true }
}

export async function sendMessage(studentId: string, body: string): Promise<ActionResult> {
  const teacher = await requireTeacher()
  const supabase = await createClient()

  const { error } = await supabase.from("messages").insert({
    student_id: studentId,
    teacher_id: teacher.id,
    sender_id: teacher.id,
    body,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath("/profesor")
  return { success: true }
}

// Used to surface AI errors early if needed (kept for potential preview).
export async function previewQuestions(topics: string[], num: number) {
  await requireTeacher()
  return generateQuestions(topics, num)
}
