import Link from "next/link"
import { redirect } from "next/navigation"
import { Brand } from "@/components/brand"
import { Card, CardContent } from "@/components/ui/card"
import { RegisterForm } from "@/components/auth/register-form"
import { getSession } from "@/lib/session"
import { homePathFor } from "@/lib/auth"

export default async function RegisterPage() {
  const session = await getSession()
  if (session) redirect(homePathFor(session.userType))

  return (
    <main className="flex min-h-screen flex-col bg-secondary">
      <header className="border-b border-white/10 px-6 py-4">
        <Brand />
      </header>
      <div className="flex flex-1 justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold text-foreground">Create your student account</h1>
              <p className="mb-8 mt-1 text-sm text-muted-foreground">
                Register to apply for scholarship programs. Your account will be reviewed by the
                scholarship office before activation.
              </p>
              <RegisterForm />
            </CardContent>
          </Card>
          <p className="mt-4 text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
