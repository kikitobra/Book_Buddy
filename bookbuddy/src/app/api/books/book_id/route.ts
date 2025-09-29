// bookbuddy/src/app/api/books/book_id/route.tsS
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongodb";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const coll = await getCollection();
  const doc = await coll.findOne({ _id: new ObjectId(params.id) });
  return doc ? NextResponse.json(doc) : NextResponse.json({}, { status: 404 });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { quantity } = await req.json();
  const coll = await getCollection();
  const res = await coll.updateOne(
    { _id: new ObjectId(params.id) },
    { $set: { quantity, updated_at: new Date() } }
  );
  return NextResponse.json({ modifiedCount: res.modifiedCount });
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const coll = await getCollection();
  const res = await coll.deleteOne({ _id: new ObjectId(params.id) });
  return NextResponse.json({ deletedCount: res.deletedCount });
}
