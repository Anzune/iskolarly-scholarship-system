import "server-only"
import { redirect } from "next/navigation"
import { getSession } from "./session"
import type { SessionUser, UserType } from "./types"

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) redirect("/login")
  return user
}

export async function requireStudent(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.userType !== "student") redirect("/admin")
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) redirect("/admin/login")
  if (user.userType !== "admin" && user.userType !== "super_admin") {
    redirect("/dashboard")
  }
  return user
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) redirect("/admin/login")
  if (user.userType !== "super_admin") redirect("/admin")
  return user
}

export function homePathFor(userType: UserType): string {
  switch (userType) {
    case "super_admin":
      return "/superadmin"
    case "admin":
      return "/admin"
    default:
      return "/dashboard"
  }
}
