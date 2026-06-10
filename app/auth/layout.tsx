import Link from "next/link"
import { Waves } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-center bg-secondary px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2 text-primary">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Waves className="size-5" />
        </span>
        <span className="text-xl font-bold tracking-tight text-foreground">Delfín</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </main>
  )
}
