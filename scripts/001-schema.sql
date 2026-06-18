-- Iskolarly Scholarship System schema (PostgreSQL / Supabase)

CREATE TABLE IF NOT EXISTS users (
  user_id        SERIAL PRIMARY KEY,
  username       VARCHAR(60) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  email          VARCHAR(160) UNIQUE NOT NULL,
  user_type      VARCHAR(20) NOT NULL DEFAULT 'student'
                   CHECK (user_type IN ('student','admin','super_admin')),
  status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','active','suspended')),
  last_login     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_profiles (
  profile_id        SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  first_name        VARCHAR(80) NOT NULL,
  middle_name       VARCHAR(80),
  last_name         VARCHAR(80) NOT NULL,
  date_of_birth     DATE,
  sex               VARCHAR(20),
  contact_number    VARCHAR(20),
  permanent_address TEXT,
  student_id        VARCHAR(40) UNIQUE NOT NULL,
  year_level        VARCHAR(30),
  college           VARCHAR(120),
  degree_program    VARCHAR(160),
  gpa               NUMERIC(4,2),
  scholar_status    VARCHAR(20) NOT NULL DEFAULT 'inactive'
                      CHECK (scholar_status IN ('active','inactive','suspended')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scholarship_programs (
  program_id      SERIAL PRIMARY KEY,
  program_name    VARCHAR(160) NOT NULL,
  program_code    VARCHAR(40) UNIQUE NOT NULL,
  scholarship_type VARCHAR(60) NOT NULL,
  description     TEXT,
  amount_per_term NUMERIC(12,2) NOT NULL DEFAULT 0,
  slots           INTEGER NOT NULL DEFAULT 0,
  deadline_date   DATE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  application_id     SERIAL PRIMARY KEY,
  application_number VARCHAR(40) UNIQUE NOT NULL,
  user_id            INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  program_id         INTEGER NOT NULL REFERENCES scholarship_programs(program_id),
  status             VARCHAR(20) NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','submitted','under_review','approved','rejected','on_hold')),
  school_year        VARCHAR(20) NOT NULL,
  semester           VARCHAR(30) NOT NULL DEFAULT '1st Semester',
  remarks            TEXT,
  submitted_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_documents (
  document_id    SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
  document_type  VARCHAR(40) NOT NULL,
  file_name      VARCHAR(255) NOT NULL,
  file_path      TEXT NOT NULL,
  file_size      INTEGER NOT NULL DEFAULT 0,
  mime_type      VARCHAR(120),
  status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','verified','rejected')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title           VARCHAR(160) NOT NULL,
  message         TEXT NOT NULL,
  type            VARCHAR(30) NOT NULL DEFAULT 'info',
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_documents_application ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON student_profiles(user_id);
