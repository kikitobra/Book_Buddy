import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await connectToDatabase();
    const admin = client.db().admin();
    const info = await admin.serverStatus();
    return NextResponse.json({
      ok: true,
      info: { host: info.host, version: info.version },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
