// lib/auth.ts
import { MongoClient, Collection } from "mongodb";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const uri = process.env.MONGODB_URI || process.env.MONGODB_URI!;
const dbName = process.env.DB_NAME || "booksheet";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-key"
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

// Create JWT token for client-side storage
export async function createToken(payload: {
  userId: string;
  email: string;
  name: string;
}) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  return token;
}

// Verify JWT token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      name: String(payload.name),
    };
  } catch {
    return null;
  }
}

// Placeholder functions for compatibility
export async function setSession(payload: { userId: string; email: string }) {
  return { success: true, userId: payload.userId, email: payload.email };
}

export async function clearSession() {
  return { success: true };
}

export async function getSession(): Promise<{
  userId: string;
  email: string;
} | null> {
  return null;
}
