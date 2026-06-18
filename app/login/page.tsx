import Link from "next/link"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { getSession } from "@/lib/session"
import { homePathFor } from "@/lib/auth"

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const session = await getSession()
  if (session) redirect(homePathFor(session.userType))

  const { registered } = await searchParams

  return (
    <AuthShell
      title="Student Sign In"
      subtitle="Access your scholarship applications and documents."
      footer={
        <span>
          Are you staff?{" "}
          <Link href="/admin/login" className="font-medium text-accent hover:underline">
            Admin portal
          </Link>
        </span>
      }
    >
      <LoginForm context="student" registered={registered === "1"} />
    </AuthShell>
  )
}
