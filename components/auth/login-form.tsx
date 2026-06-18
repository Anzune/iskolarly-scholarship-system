"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { AlertCircle, Loader2 } from "lucide-react"
import { loginAction, type AuthState } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Signing in..." : label}
    </Button>
  )
}

export function LoginForm({
  context,
  registered,
}: {
  context: "student" | "admin"
  registered?: boolean
}) {
  const action = loginAction.bind(null, context)
  const [state, formAction] = useActionState<AuthState, FormData>(action, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {registered ? (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Registration successful! Your account is pending verification.
        </p>
      ) : null}

      {state?.error ? (
        <p className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      ) : null}

      <div>
        <Label htmlFor="username">{context === "admin" ? "Staff username or email" : "Username or email"}</Label>
        <Input id="username" name="username" autoComplete="username" required />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      <SubmitButton label={context === "admin" ? "Sign in to portal" : "Sign in"} />

      {context === "student" ? (
        <p className="text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register here
          </Link>
        </p>
      ) : null}
    </form>
  )
}
