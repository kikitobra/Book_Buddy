// src/app/api/books/route.ts
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import type { Filter } from "mongodb";

type BookDoc = {
  _id?: any;
  title: string;
  isbn: string;
  author: string;
  summary?: string;
  cover_url?: string;
  language?: string;
  genre?: string;
  quantity?: number;
  createdAt?: Date;
};

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const tag = (url.searchParams.get("tag") || "").trim();
    const limit = Math.min(+url.searchParams.get("limit")! || 50, 200);
    const offset = Math.max(+url.searchParams.get("offset")! || 0, 0);

    const col = await getCollection<BookDoc>(
      process.env.COLLECTION_NAME || "book_inventory"
    );

    const filter: Filter<BookDoc> = {
      // keep only English if that’s your data; remove if you store mixed languages
      language: "en",
      ...(tag ? { genre: tag } : {}),
      ...(q
        ? {
            $or: [
              { title: { $regex: q, $options: "i" } },
              { author: { $regex: q, $options: "i" } },
              { isbn: { $regex: q, $options: "i" } },
              { genre: { $regex: q, $options: "i" } },
            ],
          }
        : {}),
    };

    const cursor = col
      .find(filter, {
        projection: {
          title: 1,
          author: 1,
          isbn: 1,
          genre: 1,
          quantity: 1,
          cover_url: 1,
          summary: 1,
        },
      })
      .sort({ createdAt: -1, _id: -1 })
      .skip(offset)
      .limit(limit);

    const docs = await cursor.toArray();

    // Normalize to what your UI expects
    const items = docs.map((d) => ({
      id: String(d._id),
      title: d.title,
      author: d.author,
      isbn: d.isbn,
      genre: d.genre ?? "Manga",
      quantity: d.quantity ?? 0,
      cover: d.cover_url || "", // Return empty string if no cover, let frontend handle placeholder
      summary: d.summary || "",
    }));

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("GET /api/books failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}
