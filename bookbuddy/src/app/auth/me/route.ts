import { NextResponse } from "next/server";
import { getSession, usersCollection } from "@/lib/auth";

export async function GET() {
  const sess = await getSession();
  if (!sess)
    return NextResponse.json({ ok: false, user: null }, { status: 200 });

  const users = await usersCollection();
  const user = await users.findOne(
    {
      _id: (await import("mongodb")).ObjectId.createFromHexString(sess.userId),
    },
    { projection: { password_hash: 0, failed_login_attempts: 0 } }
  );

  return NextResponse.json({ ok: true, user });
}
