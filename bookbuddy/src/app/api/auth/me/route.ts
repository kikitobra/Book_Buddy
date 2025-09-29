import { NextResponse } from "next/server";
import { getSession, usersCollection } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const sess = await getSession();
    if (!sess) return NextResponse.json({ ok: true, authed: false });

    const users = await usersCollection();
    const user = await users.findOne({ _id: new ObjectId(sess.userId) });
    if (!user) return NextResponse.json({ ok: true, authed: false });

    return NextResponse.json({ ok: true, authed: true, user: { name: user.name, email: user.email } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
