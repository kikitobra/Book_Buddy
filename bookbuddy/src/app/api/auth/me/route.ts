import { NextRequest, NextResponse } from "next/server";
import { verifyToken, usersCollection } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ ok: true, authed: false });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ ok: true, authed: false });
    }

    const users = await usersCollection();
    const user = await users.findOne({ _id: new ObjectId(payload.userId) });
    if (!user || user.status !== "active") {
      return NextResponse.json({ ok: true, authed: false });
    }

    return NextResponse.json({ 
      ok: true, 
      authed: true, 
      user: { name: user.name, email: user.email } 
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
