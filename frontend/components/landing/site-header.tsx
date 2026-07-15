import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Waves } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Waves className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Delfín</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#caracteristicas" className="transition-colors hover:text-foreground">
            Características
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-foreground">
            Cómo funciona
          </a>
          <a href="#roles" className="transition-colors hover:text-foreground">
            Roles
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/login">Iniciar sesión</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/sign-up">Registrarme</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
