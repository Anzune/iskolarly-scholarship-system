"use server"

import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { createSession, destroySession } from "@/lib/session"
import { homePathFor } from "@/lib/auth"
import type { UserType } from "@/lib/types"

export type AuthState = { error?: string } | undefined

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, "")
  return digits.length === 11 && digits.startsWith("09")
}

export async function loginAction(
  context: "student" | "admin",
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!username || !password) {
    return { error: "Username and password are required." }
  }

  const rows = await sql<
    { user_id: number; username: string; email: string; user_type: UserType; status: string; password_hash: string }[]
  >`SELECT user_id, username, email, user_type, status, password_hash
      FROM users WHERE username = ${username} OR email = ${username} LIMIT 1`

  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "Invalid username or password." }
  }

  if (user.status === "suspended") {
    return { error: "Your account has been suspended. Please contact support." }
  }
  if (user.status === "pending") {
    return { error: "Your account is pending verification by the scholarship office." }
  }

  const isStaff = user.user_type === "admin" || user.user_type === "super_admin"
  if (context === "admin" && !isStaff) {
    return { error: "This portal is for staff accounts only. Use the student login." }
  }
  if (context === "student" && isStaff) {
    return { error: "Staff accounts must sign in through the admin portal." }
  }

  await sql`UPDATE users SET last_login = NOW() WHERE user_id = ${user.user_id}`

  await createSession({
    userId: user.user_id,
    username: user.username,
    email: user.email,
    userType: user.user_type,
  })

  redirect(homePathFor(user.user_type))
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim()

  const first_name = get("first_name")
  const middle_name = get("middle_name")
  const last_name = get("last_name")
  const email = get("email")
  const username = get("username")
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm_password") ?? "")
  const date_of_birth = get("date_of_birth")
  const sex = get("sex")
  const contact_number = get("contact_number")
  const permanent_address = get("permanent_address")
  const student_id = get("student_id")
  const year_level = get("year_level")
  const college = get("college")
  const degree_program = get("degree_program")

  const required = {
    first_name,
    last_name,
    email,
    username,
    date_of_birth,
    sex,
    contact_number,
    student_id,
    year_level,
    college,
    degree_program,
  }
  for (const [key, value] of Object.entries(required)) {
    if (!value) return { error: `${key.replace(/_/g, " ")} is required.` }
  }

  if (!isValidEmail(email)) return { error: "Please enter a valid email address." }
  if (!isValidPhone(contact_number))
    return { error: "Invalid phone number. Must be 11 digits starting with 09." }
  if (password.length < 8) return { error: "Password must be at least 8 characters." }
  if (!/[A-Z]/.test(password)) return { error: "Password must contain an uppercase letter." }
  if (!/[0-9]/.test(password)) return { error: "Password must contain a number." }
  if (!/[^A-Za-z0-9]/.test(password)) return { error: "Password must contain a special character." }
  if (password !== confirm) return { error: "Passwords do not match." }

  const existing = await sql`
    SELECT 1 FROM users WHERE username = ${username} OR email = ${email}
    UNION ALL
    SELECT 1 FROM student_profiles WHERE student_id = ${student_id}`
  if (existing.length > 0) {
    return { error: "Username, email, or student ID is already registered." }
  }

  const password_hash = await bcrypt.hash(password, 10)

  try {
    await sql.begin(async (tx) => {
      const [user] = await tx<{ user_id: number }[]>`
        INSERT INTO users (username, password_hash, email, user_type, status)
        VALUES (${username}, ${password_hash}, ${email}, 'student', 'pending')
        RETURNING user_id`

      await tx`
        INSERT INTO student_profiles
          (user_id, first_name, middle_name, last_name, date_of_birth, sex, contact_number,
           permanent_address, student_id, year_level, college, degree_program)
        VALUES
          (${user.user_id}, ${first_name}, ${middle_name || null}, ${last_name}, ${date_of_birth},
           ${sex}, ${contact_number}, ${permanent_address || null}, ${student_id}, ${year_level},
           ${college}, ${degree_program})`
    })
  } catch (err) {
    console.log("[v0] Registration error:", err)
    return { error: "Registration failed. The student ID or username may already exist." }
  }

  redirect("/login?registered=1")
}

export async function logoutAction() {
  await destroySession()
  redirect("/")
}
