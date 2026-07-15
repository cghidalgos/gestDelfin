import Link from "next/link"
import { Waves } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Waves className="size-4" />
          </span>
          <span className="text-base font-bold">Delfín</span>
        </Link>
        <p className="text-sm text-sidebar-foreground/70">
          Plataforma de seguimiento académico. Hecho con propósito educativo.
        </p>
      </div>
    </footer>
  )
}
