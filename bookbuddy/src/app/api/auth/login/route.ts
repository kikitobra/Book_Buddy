import { NextRequest, NextResponse } from "next/server";
import { usersCollection, verifyPassword, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    const users = await usersCollection();
    const user = await users.findOne({
      email: String(email).toLowerCase().trim(),
    });
    if (!user || user.status !== "active") {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      await users.updateOne(
        { _id: user._id },
        { $inc: { failed_login_attempts: 1 }, $set: { updated_at: new Date() } }
      );
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await users.updateOne(
      { _id: user._id },
      { $set: { failed_login_attempts: 0, updated_at: new Date() } }
    );

    // Create JWT token for client-side storage
    const token = await createToken({ 
      userId: String(user._id), 
      email: user.email,
      name: user.name 
    });

    return NextResponse.json({ 
      ok: true, 
      token,
      user: { name: user.name, email: user.email }
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Login failed" },
      { status: 500 }
    );
  }
}
