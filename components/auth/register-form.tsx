"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { AlertCircle, Loader2 } from "lucide-react"
import { registerAction, type AuthState } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input, Label, Select } from "@/components/ui/input"

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"]
const COLLEGES = [
  "College of Engineering",
  "College of Science",
  "College of Business",
  "College of Arts and Letters",
  "College of Education",
  "College of Nursing",
  "College of Law",
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Creating account..." : "Create account"}
    </Button>
  )
}

export function RegisterForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(registerAction, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state?.error ? (
        <p className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      ) : null}

      <Section title="Personal Information">
        <div>
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" name="first_name" required />
        </div>
        <div>
          <Label htmlFor="middle_name">Middle name (optional)</Label>
          <Input id="middle_name" name="middle_name" />
        </div>
        <div>
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" name="last_name" required />
        </div>
        <div>
          <Label htmlFor="date_of_birth">Date of birth</Label>
          <Input id="date_of_birth" name="date_of_birth" type="date" required />
        </div>
        <div>
          <Label htmlFor="sex">Sex</Label>
          <Select id="sex" name="sex" defaultValue="" required>
            <option value="" disabled>
              Select…
            </option>
            <option>Male</option>
            <option>Female</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="contact_number">Contact number</Label>
          <Input id="contact_number" name="contact_number" placeholder="09XXXXXXXXX" required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="permanent_address">Permanent address</Label>
          <Input id="permanent_address" name="permanent_address" />
        </div>
      </Section>

      <Section title="Academic Information">
        <div>
          <Label htmlFor="student_id">Student ID</Label>
          <Input id="student_id" name="student_id" placeholder="2024-00000" required />
        </div>
        <div>
          <Label htmlFor="year_level">Year level</Label>
          <Select id="year_level" name="year_level" defaultValue="" required>
            <option value="" disabled>
              Select…
            </option>
            {YEAR_LEVELS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="college">College</Label>
          <Select id="college" name="college" defaultValue="" required>
            <option value="" disabled>
              Select…
            </option>
            {COLLEGES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="degree_program">Degree program</Label>
          <Input id="degree_program" name="degree_program" placeholder="BS Computer Science" required />
        </div>
      </Section>

      <Section title="Account Credentials">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div>
          <Label htmlFor="confirm_password">Confirm password</Label>
          <Input id="confirm_password" name="confirm_password" type="password" required />
        </div>
        <p className="sm:col-span-2 text-xs text-muted-foreground">
          Password must be at least 8 characters and include an uppercase letter, a number, and a special character.
        </p>
      </Section>

      <SubmitButton />
    </form>
  )
}
