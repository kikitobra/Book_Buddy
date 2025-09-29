import { NextRequest, NextResponse } from "next/server";
import { usersCollection, verifyPassword, setSession } from "@/lib/auth";

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

    await setSession({ userId: String(user._id), email: user.email });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Login failed" },
      { status: 500 }
    );
  }
}
