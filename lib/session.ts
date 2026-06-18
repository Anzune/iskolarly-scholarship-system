import "server-only"
import { cookies } from "next/headers"
import crypto from "node:crypto"
import type { SessionUser } from "./types"

const COOKIE_NAME = "iskolarly_session"
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret() {
  return (
    process.env.SUPABASE_JWT_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    "iskolarly-dev-secret-change-me"
  )
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url")
}

function encode(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url")
  return `${payload}.${sign(payload)}`
}

function decode(token: string): SessionUser | null {
  const [payload, signature] = token.split(".")
  if (!payload || !signature) return null
  const expected = sign(payload)
  // constant-time compare
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null
  }
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser
  } catch {
    return null
  }
}

export async function createSession(user: SessionUser) {
  const store = await cookies()
  store.set(COOKIE_NAME, encode(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return decode(token)
}

export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
