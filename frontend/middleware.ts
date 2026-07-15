import { NextResponse, type NextRequest } from "next/server"

const AUTH_COOKIE = "auth_token"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get(AUTH_COOKIE)?.value

  // Protege las rutas de la aplicación: sin cookie de sesión → login
  const isProtected =
    path.startsWith("/dashboard") || path.startsWith("/profesor") || path.startsWith("/estudiante")

  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
