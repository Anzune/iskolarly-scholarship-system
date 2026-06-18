import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import postgres from "postgres"
import bcrypt from "bcryptjs"

const __dirname = dirname(fileURLToPath(import.meta.url))

const connectionString = process.env.POSTGRES_URL
if (!connectionString) {
  console.error("POSTGRES_URL is not set")
  process.exit(1)
}

const sql = postgres(connectionString, { ssl: "require", max: 1 })

const DEMO_PASSWORD = "Password123!"

async function main() {
  console.log("[setup] Applying schema...")
  const schema = readFileSync(join(__dirname, "001-schema.sql"), "utf8")
  await sql.unsafe(schema)

  console.log("[setup] Clearing existing demo data...")
  await sql`TRUNCATE notifications, application_documents, applications, student_profiles, scholarship_programs, users RESTART IDENTITY CASCADE`

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10)

  console.log("[setup] Seeding users...")
  const [student] = await sql`
    INSERT INTO users (username, password_hash, email, user_type, status)
    VALUES ('jdela', ${hash}, 'student@iskolarly.edu', 'student', 'active')
    RETURNING user_id`
  const [student2] = await sql`
    INSERT INTO users (username, password_hash, email, user_type, status)
    VALUES ('mreyes', ${hash}, 'maria@iskolarly.edu', 'student', 'active')
    RETURNING user_id`
  const [pending] = await sql`
    INSERT INTO users (username, password_hash, email, user_type, status)
    VALUES ('pcruz', ${hash}, 'pedro@iskolarly.edu', 'student', 'pending')
    RETURNING user_id`
  const [admin] = await sql`
    INSERT INTO users (username, password_hash, email, user_type, status)
    VALUES ('admin', ${hash}, 'admin@iskolarly.edu', 'admin', 'active')
    RETURNING user_id`
  const [superadmin] = await sql`
    INSERT INTO users (username, password_hash, email, user_type, status)
    VALUES ('superadmin', ${hash}, 'superadmin@iskolarly.edu', 'super_admin', 'active')
    RETURNING user_id`

  console.log("[setup] Seeding student profiles...")
  await sql`
    INSERT INTO student_profiles
      (user_id, first_name, middle_name, last_name, date_of_birth, sex, contact_number,
       permanent_address, student_id, year_level, college, degree_program, gpa, scholar_status)
    VALUES
      (${student.user_id}, 'Juan', 'Santos', 'Dela Cruz', '2003-05-12', 'Male', '09171234567',
       '123 Mabini St, Quezon City', '2021-00123', '3rd Year', 'College of Engineering',
       'BS Computer Engineering', 1.75, 'active'),
      (${student2.user_id}, 'Maria', 'Lopez', 'Reyes', '2004-02-08', 'Female', '09181234567',
       '45 Rizal Ave, Manila', '2022-00456', '2nd Year', 'College of Science',
       'BS Biology', 1.50, 'active'),
      (${pending.user_id}, 'Pedro', NULL, 'Cruz', '2003-11-20', 'Male', '09201234567',
       '78 Bonifacio St, Makati', '2021-00789', '3rd Year', 'College of Business',
       'BS Accountancy', 2.00, 'inactive')`

  console.log("[setup] Seeding scholarship programs...")
  const programs = await sql`
    INSERT INTO scholarship_programs
      (program_name, program_code, scholarship_type, description, amount_per_term, slots, deadline_date, is_active)
    VALUES
      ('Academic Excellence Scholarship', 'AES-2025', 'Merit-based',
       'For students maintaining a general weighted average of 1.75 or better.', 25000, 50, '2025-12-15', TRUE),
      ('Financial Assistance Grant', 'FAG-2025', 'Need-based',
       'Supports students from low-income households with full tuition coverage.', 18000, 100, '2025-11-30', TRUE),
      ('Athletic Scholarship', 'ATH-2025', 'Talent-based',
       'For varsity athletes representing the university in regional competitions.', 20000, 30, '2026-01-20', TRUE),
      ('STEM Innovators Grant', 'STEM-2025', 'Merit-based',
       'Encourages research and innovation among science and engineering students.', 30000, 25, '2025-10-31', FALSE)
    RETURNING program_id`

  console.log("[setup] Seeding applications...")
  const apps = await sql`
    INSERT INTO applications
      (application_number, user_id, program_id, status, school_year, semester, remarks, submitted_at)
    VALUES
      ('APP-2025-00001', ${student.user_id}, ${programs[0].program_id}, 'under_review', '2025-2026', '1st Semester', NULL, NOW() - INTERVAL '5 days'),
      ('APP-2025-00002', ${student.user_id}, ${programs[1].program_id}, 'approved', '2025-2026', '1st Semester', 'Congratulations, you have been approved.', NOW() - INTERVAL '20 days'),
      ('APP-2025-00003', ${student2.user_id}, ${programs[0].program_id}, 'submitted', '2025-2026', '1st Semester', NULL, NOW() - INTERVAL '2 days'),
      ('APP-2025-00004', ${student2.user_id}, ${programs[2].program_id}, 'rejected', '2025-2026', '1st Semester', 'Did not meet minimum requirements.', NOW() - INTERVAL '15 days')
    RETURNING application_id`

  console.log("[setup] Seeding documents...")
  await sql`
    INSERT INTO application_documents (application_id, document_type, file_name, file_path, file_size, mime_type, status)
    VALUES
      (${apps[0].application_id}, 'grades', 'grades_sem1.pdf', 'https://example.com/grades_sem1.pdf', 204800, 'application/pdf', 'verified'),
      (${apps[0].application_id}, 'enrollment', 'enrollment_form.pdf', 'https://example.com/enrollment_form.pdf', 153600, 'application/pdf', 'pending'),
      (${apps[1].application_id}, 'income_proof', 'income_certificate.pdf', 'https://example.com/income_certificate.pdf', 102400, 'application/pdf', 'verified')`

  console.log("[setup] Seeding notifications...")
  await sql`
    INSERT INTO notifications (user_id, title, message, type, is_read)
    VALUES
      (${student.user_id}, 'Application Approved', 'Your application APP-2025-00002 for Financial Assistance Grant has been approved.', 'success', FALSE),
      (${student.user_id}, 'Document Verified', 'Your grades document has been verified by the scholarship office.', 'info', FALSE),
      (${student.user_id}, 'Application Under Review', 'Your application APP-2025-00001 is now under review.', 'info', TRUE),
      (${student2.user_id}, 'Application Rejected', 'Your application APP-2025-00004 was not approved.', 'warning', FALSE),
      (${admin.user_id}, 'New Application Submitted', 'A new application APP-2025-00003 requires review.', 'info', FALSE)`

  console.log("[setup] Done. Demo password for all accounts:", DEMO_PASSWORD)
  await sql.end()
}

main().catch(async (err) => {
  console.error("[setup] Failed:", err)
  await sql.end()
  process.exit(1)
})
