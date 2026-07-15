import { cookies } from "next/headers"
import { AUTH_COOKIE } from "@/lib/api"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001"

/**
 * Proxy del bot de chat: reenvía la conversación al backend adjuntando el JWT
 * desde la cookie httpOnly, y transmite la respuesta (streaming) de vuelta al navegador.
 */
export async function POST(req: Request) {
  const store = await cookies()
  const token = store.get(AUTH_COOKIE)?.value

  if (!token) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const body = await req.text()

  const backendRes = await fetch(`${BACKEND_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body,
  })

  // Reenvía el cuerpo (stream) tal cual al cliente
  return new Response(backendRes.body, {
    status: backendRes.status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
