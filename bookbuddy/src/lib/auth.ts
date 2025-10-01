// lib/auth.ts
import { MongoClient, Collection } from "mongodb";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;
const sessionSecret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev_secret_change_me"
);

let client: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
  if (client && (client as any).topology?.isConnected?.()) return client;
  if (!client) client = new MongoClient(uri);
  await client.connect();
  return client!;
}

export async function usersCollection(): Promise<Collection<any>> {
  const c = await getClient();
  return c.db(dbName).collection("users");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Create a HTTP-only cookie session with a small JWT */
export async function setSession(payload: { userId: string; email: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(sessionSecret);

  const c = (await cookies()) as any;
  c.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}
export async function clearSession() {
  const c = (await cookies()) as any;
  c.set("session", "", { httpOnly: true, maxAge: 0, path: "/" });
}
export async function getSession(): Promise<{
  userId: string;
  email: string;
} | null> {
  const cookie = (await cookies()).get("session");
  if (!cookie?.value) return null;
  try {
    const { payload } = await jwtVerify(cookie.value, sessionSecret);
    return { userId: String(payload.userId), email: String(payload.email) };
  } catch {
    return null;
  }
}
