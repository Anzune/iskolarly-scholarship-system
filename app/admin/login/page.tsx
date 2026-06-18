import Link from "next/link"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { getSession } from "@/lib/session"
import { homePathFor } from "@/lib/auth"

export default async function AdminLoginPage() {
  const session = await getSession()
  if (session) redirect(homePathFor(session.userType))

  return (
    <AuthShell
      title="Staff Portal"
      subtitle="For scholarship administrators and office staff."
      footer={
        <span>
          Are you a student?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Student login
          </Link>
        </span>
      }
    >
      <LoginForm context="admin" />
    </AuthShell>
  )
}
