import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MailCheck } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
          <MailCheck className="size-6 text-primary" />
        </span>
        <CardTitle className="text-2xl">¡Revisa tu correo!</CardTitle>
        <CardDescription>Te enviamos un enlace de confirmación</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">
          Confirma tu cuenta desde el correo que te enviamos y luego inicia sesión para presentar tu examen.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/auth/login">Ir a iniciar sesión</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
