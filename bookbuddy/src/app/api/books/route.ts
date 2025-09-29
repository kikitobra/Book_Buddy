// src/app/api/books/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "../../../lib/mongodb";

type BookDoc = {
  _id: any;
  title: string;
  isbn: string;
  author: string;
  summary: string;
  cover_url: string;
  language: string;
  genre?: string;
  quantity: number;
  updatedAt?: Date;
  createdAt?: Date;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 1000), 2000);
    const skip = Math.max(Number(searchParams.get("skip") ?? 0), 0);
    const q = (searchParams.get("q") || "").trim();
    const genre = (searchParams.get("genre") || "").trim();

    const col = await getCollection<BookDoc>(
      process.env.COLLECTION_NAME || "book_inventory"
    );

    const filter: any = { language: "en" };
    if (genre) filter.genre = { $regex: genre, $options: "i" };
    if (q) filter.$text = { $search: q };

    const cursor = col
      .find(filter, { projection: { summary: 0 } }) // omit heavy field for list
      .sort({ quantity: -1, updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const docs = await cursor.toArray();

    return NextResponse.json({
      ok: true,
      count: docs.length,
      items: docs.map((d) => ({
        id: String(d._id),
        title: d.title,
        author: d.author,
        cover: d.cover_url,
        isbn: d.isbn,
        genre: d.genre ?? "Manga",
        quantity: d.quantity,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
