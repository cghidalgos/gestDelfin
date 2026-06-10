import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TriangleAlert } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <TriangleAlert className="size-6" />
        </span>
        <CardTitle className="text-2xl">Algo salió mal</CardTitle>
        <CardDescription>No pudimos completar la autenticación</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">El enlace puede haber expirado o ya fue utilizado.</p>
        <Button asChild className="mt-6 w-full">
          <Link href="/auth/login">Volver a iniciar sesión</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
