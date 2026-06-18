export type UserType = "student" | "admin" | "super_admin"
export type UserStatus = "pending" | "active" | "suspended"

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "on_hold"

export type DocumentStatus = "pending" | "verified" | "rejected"

export interface SessionUser {
  userId: number
  username: string
  email: string
  userType: UserType
}

export interface StudentProfile {
  profile_id: number
  user_id: number
  first_name: string
  middle_name: string | null
  last_name: string
  date_of_birth: string | null
  sex: string | null
  contact_number: string | null
  permanent_address: string | null
  student_id: string
  year_level: string | null
  college: string | null
  degree_program: string | null
  gpa: number | null
  scholar_status: string
}

export const DOCUMENT_TYPES: { value: string; label: string }[] = [
  { value: "grades", label: "Certificate of Grades" },
  { value: "enrollment", label: "Certificate of Enrollment" },
  { value: "income_proof", label: "Proof of Income" },
  { value: "gov_id", label: "Government ID" },
  { value: "id_photo", label: "ID Photo" },
  { value: "recommendation", label: "Recommendation Letter" },
  { value: "award", label: "Award / Certificate" },
  { value: "other", label: "Other Document" },
]
