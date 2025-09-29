import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET() {
  const coll = await getCollection();
  const docs = await coll
    .find({}, { projection: { dedup_fallback: 0, author_list: 0 } })
    .limit(50)
    .toArray();
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const body = await req.json(); // { book_name, isbn, summary, author, cover_url, quantity }
  const coll = await getCollection();
  const res = await coll.insertOne({
    ...body,
    created_at: new Date(),
    updated_at: new Date(),
  });
  return NextResponse.json({ insertedId: res.insertedId }, { status: 201 });
}
