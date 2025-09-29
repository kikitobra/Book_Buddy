import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await connectToDatabase();
    const res = await client.db().command({ ping: 1 });
    return NextResponse.json({ ok: true, ping: res.ok === 1 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
