import { NextRequest, NextResponse } from "next/server";
import { verifyToken, hashPassword, usersCollection } from "@/lib/auth";
import { ObjectId } from "mongodb";

/**
 * POST /api/account/update-password
 * Update user password
 */
export async function POST(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const users = await usersCollection();
    const hashedPassword = await hashPassword(newPassword);

    const result = await users.updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Error updating password:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update password" },
      { status: 500 }
    );
  }
}
