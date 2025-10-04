import { NextRequest, NextResponse } from "next/server";
import { usersCollection, hashPassword, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    const users = await usersCollection();
    // unique by email
    await users.createIndex({ email: 1 }, { unique: true }).catch(() => {});

    const existing = await users.findOne({
      email: String(email).toLowerCase().trim(),
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    const password_hash = await hashPassword(password);
    const now = new Date();
    const doc = {
      email: String(email).toLowerCase().trim(),
      password_hash,
      name: name?.trim() || "User",
      role: "user" as const,
      status: "active" as const,
      email_verified: false,
      failed_login_attempts: 0,
      created_at: now,
      updated_at: now,
    };

    const res = await users.insertOne(doc as any);

    // Create JWT token for client-side storage
    const token = await createToken({
      userId: String(res.insertedId),
      email: doc.email,
      name: doc.name,
    });

    return NextResponse.json(
      {
        ok: true,
        id: String(res.insertedId),
        token,
        user: { name: doc.name, email: doc.email },
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Register failed" },
      { status: 500 }
    );
  }
}
