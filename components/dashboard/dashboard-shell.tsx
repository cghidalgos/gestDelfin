import type React from "react"
import Link from "next/link"
import { Waves } from "lucide-react"
import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function initials(name: string | null) {
  if (!name) return "U"
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

export function DashboardShell({
  title,
  roleLabel,
  userName,
  children,
}: {
  title: string
  roleLabel: string
  userName: string | null
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col bg-secondary/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Waves className="size-4" />
            </span>
            <span className="text-base font-bold tracking-tight">Delfín</span>
            <span className="ml-2 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {roleLabel}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(userName)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{userName ?? "Usuario"}</span>
            </div>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>
        {children}
      </main>
    </div>
  )
}
