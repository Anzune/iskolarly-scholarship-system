import "server-only"
import { sql } from "@/lib/db"
import type { StudentProfile } from "@/lib/types"

export interface PublicStats {
  scholars: number
  funds: number
  approvalRate: number
  institutions: number
  programs: number
}

export async function getPublicStats(): Promise<PublicStats> {
  const [[scholars], [funds], [rates], [institutions], [programs]] = await Promise.all([
    sql<{ total: number }[]>`SELECT COUNT(*)::int AS total FROM student_profiles WHERE scholar_status = 'active'`,
    sql<{ total: number }[]>`SELECT COALESCE(SUM(amount_per_term),0)::int AS total FROM scholarship_programs WHERE is_active = TRUE`,
    sql<{ approved: number; total: number }[]>`
      SELECT COUNT(*) FILTER (WHERE status = 'approved')::int AS approved, COUNT(*)::int AS total FROM applications`,
    sql<{ total: number }[]>`SELECT COUNT(DISTINCT college)::int AS total FROM student_profiles`,
    sql<{ total: number }[]>`SELECT COUNT(*)::int AS total FROM scholarship_programs WHERE is_active = TRUE`,
  ])

  return {
    scholars: scholars.total,
    funds: funds.total,
    approvalRate: rates.total > 0 ? Math.round((rates.approved / rates.total) * 100) : 0,
    institutions: institutions.total,
    programs: programs.total,
  }
}

export async function getStudentProfile(userId: number): Promise<StudentProfile | null> {
  const rows = await sql<StudentProfile[]>`SELECT * FROM student_profiles WHERE user_id = ${userId} LIMIT 1`
  return rows[0] ?? null
}

export interface ProgramRow {
  program_id: number
  program_name: string
  program_code: string
  scholarship_type: string
  description: string | null
  amount_per_term: string
  slots: number
  deadline_date: string | null
  is_active: boolean
}

export async function getActivePrograms(): Promise<ProgramRow[]> {
  return sql<ProgramRow[]>`SELECT * FROM scholarship_programs WHERE is_active = TRUE ORDER BY deadline_date NULLS LAST`
}

export async function getAllPrograms(): Promise<ProgramRow[]> {
  return sql<ProgramRow[]>`SELECT * FROM scholarship_programs ORDER BY created_at DESC`
}

export interface ApplicationRow {
  application_id: number
  application_number: string
  status: string
  school_year: string
  semester: string
  remarks: string | null
  submitted_at: string | null
  created_at: string
  program_id: number
  program_name: string
  program_code: string
  scholarship_type: string
  amount_per_term: string
  deadline_date: string | null
  user_id: number
  username: string
  email: string
  applicant_name: string | null
  student_id: string | null
  year_level: string | null
  college: string | null
  degree_program: string | null
  gpa: number | null
  document_count: number
}

const APP_SELECT = sql`
  SELECT
    a.application_id, a.application_number, a.status, a.school_year, a.semester,
    a.remarks, a.submitted_at, a.created_at,
    sp.program_id, sp.program_name, sp.program_code, sp.scholarship_type,
    sp.amount_per_term, sp.deadline_date,
    u.user_id, u.username, u.email,
    TRIM(CONCAT(s.first_name, ' ', COALESCE(s.middle_name || ' ', ''), s.last_name)) AS applicant_name,
    s.student_id, s.year_level, s.college, s.degree_program, s.gpa,
    (SELECT COUNT(*)::int FROM application_documents d WHERE d.application_id = a.application_id) AS document_count
  FROM applications a
  INNER JOIN scholarship_programs sp ON a.program_id = sp.program_id
  INNER JOIN users u ON a.user_id = u.user_id
  LEFT JOIN student_profiles s ON u.user_id = s.user_id
`

export async function getStudentApplications(userId: number): Promise<ApplicationRow[]> {
  return sql<ApplicationRow[]>`${APP_SELECT} WHERE a.user_id = ${userId} ORDER BY a.created_at DESC`
}

export async function getAllApplications(status?: string): Promise<ApplicationRow[]> {
  if (status && status !== "all") {
    return sql<ApplicationRow[]>`${APP_SELECT} WHERE a.status = ${status} ORDER BY a.created_at DESC`
  }
  return sql<ApplicationRow[]>`${APP_SELECT} ORDER BY a.created_at DESC`
}

export async function getApplicationById(applicationId: number): Promise<ApplicationRow | null> {
  const rows = await sql<ApplicationRow[]>`${APP_SELECT} WHERE a.application_id = ${applicationId} LIMIT 1`
  return rows[0] ?? null
}

export interface DocumentRow {
  document_id: number
  application_id: number
  document_type: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string | null
  status: string
  created_at: string
  application_number: string
}

export async function getStudentDocuments(userId: number): Promise<DocumentRow[]> {
  return sql<DocumentRow[]>`
    SELECT d.*, a.application_number
    FROM application_documents d
    INNER JOIN applications a ON d.application_id = a.application_id
    WHERE a.user_id = ${userId}
    ORDER BY d.created_at DESC`
}

export interface NotificationRow {
  notification_id: number
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

export async function getNotifications(userId: number): Promise<NotificationRow[]> {
  return sql<NotificationRow[]>`
    SELECT notification_id, title, message, type, is_read, created_at
    FROM notifications WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT 50`
}

export async function getUnreadCount(userId: number): Promise<number> {
  const [row] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = ${userId} AND is_read = FALSE`
  return row?.count ?? 0
}

export interface StudentStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export async function getStudentStats(userId: number): Promise<StudentStats> {
  const [row] = await sql<StudentStats[]>`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status IN ('submitted','under_review','on_hold'))::int AS pending,
      COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
      COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
    FROM applications WHERE user_id = ${userId}`
  return row ?? { total: 0, pending: 0, approved: 0, rejected: 0 }
}

export interface AdminStats {
  total: number
  pending: number
  approved: number
  rejected: number
  students: number
  programs: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const [[apps], [students], [programs]] = await Promise.all([
    sql<Omit<AdminStats, "students" | "programs">[]>`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status IN ('submitted','under_review','on_hold'))::int AS pending,
        COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
      FROM applications`,
    sql<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM users WHERE user_type = 'student'`,
    sql<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM scholarship_programs`,
  ])
  return { ...apps, students: students.count, programs: programs.count }
}

export interface AccountRow {
  user_id: number
  username: string
  email: string
  user_type: string
  status: string
  last_login: string | null
  created_at: string
  full_name: string | null
  student_id: string | null
}

export async function getAllAccounts(): Promise<AccountRow[]> {
  return sql<AccountRow[]>`
    SELECT u.user_id, u.username, u.email, u.user_type, u.status, u.last_login, u.created_at,
      TRIM(CONCAT(s.first_name, ' ', s.last_name)) AS full_name, s.student_id
    FROM users u
    LEFT JOIN student_profiles s ON u.user_id = s.user_id
    ORDER BY u.created_at DESC`
}
