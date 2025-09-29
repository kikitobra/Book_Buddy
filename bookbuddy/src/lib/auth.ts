// src/lib/auth.ts
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
// don't import server-only mongo helper at module top-level — import it dynamically inside usersCollection

export type UserDoc = {
  _id?: any;
  email: string;
  password_hash: string;
  name: string;
  role: "user" | "admin";
  status: "active" | "disabled";
  email_verified: boolean;
  failed_login_attempts: number;
  created_at: Date;
  updated_at: Date;
};

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "session";
const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me"
);

export async function hashPassword(raw: string) {
  return bcrypt.hash(raw, 12);
}
export async function verifyPassword(raw: string, hash: string) {
  return bcrypt.compare(raw, hash);
}

export async function setSession(payload: { userId: string; email: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(AUTH_SECRET);
  // dynamically import cookies to avoid importing server-only API at module load
  const { cookies: cookiesFn } = await import("next/headers");
  const cookieStore = await cookiesFn();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession() {
  const { cookies: cookiesFn } = await import("next/headers");
  const cookieStore = await cookiesFn();
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
}

export async function getSession(): Promise<{
  userId: string;
  email: string;
} | null> {
  const { cookies: cookiesFn } = await import("next/headers");
  const cookieStore = await cookiesFn();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET);
    return { userId: String(payload.userId), email: String(payload.email) };
  } catch {
    return null;
  }
}

export async function usersCollection() {
  const { getCollection } = await import("@/lib/mongodb");
  return getCollection<UserDoc>(process.env.USERS_COLLECTION || "users");
}
