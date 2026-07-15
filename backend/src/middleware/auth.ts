import type { Request, Response, NextFunction } from "express"
import { verifyToken, getUserById, toProfile } from "../lib/auth"

/**
 * Verifica el JWT propio en el header Authorization: Bearer <token>
 * y adjunta el perfil del usuario a req.profile.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autorizado: falta el token de acceso" })
    return
  }

  const userId = verifyToken(authHeader.slice(7))
  if (!userId) {
    res.status(401).json({ error: "No autorizado: token inválido o expirado" })
    return
  }

  const row = getUserById(userId)
  if (!row) {
    res.status(401).json({ error: "No autorizado: usuario no encontrado" })
    return
  }

  req.profile = toProfile(row)
  next()
}

/**
 * Middleware que exige rol de profesor.
 * Debe usarse después de requireAuth.
 */
export function requireTeacher(req: Request, res: Response, next: NextFunction): void {
  if (req.profile?.role !== "teacher") {
    res.status(403).json({ error: "Acceso denegado: solo para profesores" })
    return
  }
  next()
}
