import postgres from "postgres"

const connectionString = process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error("POSTGRES_URL is not set")
}

// Reuse the client across hot reloads in development.
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> }

export const sql =
  globalForDb.sql ??
  postgres(connectionString, {
    ssl: "require",
    max: 5,
    idle_timeout: 20,
  })

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql
}
