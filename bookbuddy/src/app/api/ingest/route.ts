// src/app/api/ingest/route.ts
import { NextRequest, NextResponse } from "next/server";
// Use a RELATIVE import to avoid alias issues; adjust if you have "@/lib" alias set.
import { getCollection } from "../../../lib/mongodb";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

/** Prefer ISBN_13, else ISBN_10, else null */
function pickISBN(v: any): string | null {
  const ids = v?.volumeInfo?.industryIdentifiers || [];
  const isbn13 = ids.find((i: any) => i.type === "ISBN_13")?.identifier;
  const isbn10 = ids.find((i: any) => i.type === "ISBN_10")?.identifier;
  const chosen = (isbn13 || isbn10 || "").trim();
  return chosen || null;
}

/** Map Google Books volume -> our schema (quantity set later) */
function mapDoc(v: any) {
  const info = v?.volumeInfo || {};
  return {
    title: (info.title || "(untitled)").trim(),
    isbn: pickISBN(v),
    author:
      Array.isArray(info.authors) && info.authors.length
        ? info.authors[0]
        : "Unknown",
    summary: info.description || "",
    cover_url:
      info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "",
    language: "en", // app field (not used by text index)
    genre:
      Array.isArray(info.categories) && info.categories.length
        ? info.categories[0]
        : "Manga",
    quantity: 0,
    source: "google_books",
    text_language: "english", // used by text index (language_override)
  };
}

/** Set all quantity=0, then set 5 for 20 random docs */
async function assignQuantities(col: any) {
  await col.updateMany({}, { $set: { quantity: 0 } });
  const sample = await col
    .aggregate([{ $sample: { size: 20 } }, { $project: { _id: 1 } }])
    .toArray();
  const ids = sample.map((d: any) => d._id);
  if (ids.length) {
    await col.updateMany({ _id: { $in: ids } }, { $set: { quantity: 5 } });
  }
}

/** GET: quick status */
export async function GET() {
  const col = await getCollection(
    process.env.COLLECTION_NAME || "book_inventory"
  );
  const total = await col.countDocuments({});
  const fives = await col.countDocuments({ quantity: 5 });
  const zeros = await col.countDocuments({ quantity: 0 });
  return NextResponse.json({
    ok: true,
    total,
    quantity_5: fives,
    quantity_0: zeros,
  });
}

/** POST: ingest English Manga until >= target unique docs (default 1000). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const target = Number(body?.target ?? 1000);
    const pageSize = Math.min(40, Number(body?.pageSize ?? 40)); // Google caps 40
    const maxPages = Number(body?.maxPages ?? 500); // safety limit

    const col = await getCollection(
      process.env.COLLECTION_NAME || "book_inventory"
    );

    const totalBefore = await col.countDocuments({});
    let insertedTotal = 0;
    const seenIsbnThisRun = new Set<string>();

    for (let page = 0; page < maxPages; page++) {
      const current = await col.countDocuments({});
      if (current >= target) break;

      const startIndex = page * pageSize;
      const url = new URL("https://www.googleapis.com/books/v1/volumes");
      url.searchParams.set("q", "subject:Manga");
      url.searchParams.set("langRestrict", "en"); // ENGLISH ONLY
      url.searchParams.set("printType", "books");
      url.searchParams.set("maxResults", String(pageSize));
      url.searchParams.set("startIndex", String(startIndex));
      if (GOOGLE_API_KEY) url.searchParams.set("key", GOOGLE_API_KEY);

      const resp = await fetch(url.toString(), { cache: "no-store" });
      if (!resp.ok) {
        const errText = await resp.text();
        return NextResponse.json(
          { ok: false, error: `Google API ${resp.status}: ${errText}` },
          { status: 502 }
        );
      }

      const data = await resp.json();
      const items: any[] = data?.items || [];
      if (!items.length) break;

      // Keep EN volumes defensively (sometimes API ignores langRestrict)
      const enOnly = items.filter((v) => v?.volumeInfo?.language === "en");

      // Map & keep only docs with ISBN
      const mapped = enOnly.map(mapDoc).filter((d) => !!d.isbn);

      // Dedup within this page & this run by ISBN
      const mapByIsbn = new Map<string, ReturnType<typeof mapDoc>>();
      for (const d of mapped) {
        const k = d.isbn!;
        if (!mapByIsbn.has(k) && !seenIsbnThisRun.has(k)) {
          mapByIsbn.set(k, d);
        }
      }
      const docs = Array.from(mapByIsbn.values());
      docs.forEach((d) => seenIsbnThisRun.add(d.isbn!));

      if (!docs.length) continue;

      // Upsert by ISBN; no path conflicts ($set vs $setOnInsert)
      const ops = docs.map((d) => ({
        updateOne: {
          filter: { isbn: d.isbn },
          update: {
            $set: {
              title: d.title,
              author: d.author,
              summary: d.summary,
              cover_url: d.cover_url,
              language: "en",
              genre: d.genre,
              source: d.source,
              text_language: "english",
              updatedAt: new Date(),
            },
            $setOnInsert: {
              isbn: d.isbn,
              quantity: 0,
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      }));

      const res = await col.bulkWrite(ops, { ordered: false });
      const upserts = Object.keys(res.upsertedIds || {}).length;
      insertedTotal += upserts;

      // small delay to be polite to API quotas
      await new Promise((r) => setTimeout(r, 120));
    }

    // Apply quantity rule: 20 random -> 5; others -> 0
    await assignQuantities(col);

    const totalAfter = await col.countDocuments({});
    return NextResponse.json({
      ok: true,
      inserted_this_run: insertedTotal,
      total_before: totalBefore,
      total_after: totalAfter,
      target_reached: totalAfter >= target,
      quantities: { fives: 20, others: 0 },
      tip:
        totalAfter < target
          ? "Not yet at target; call this endpoint again to fetch more pages."
          : undefined,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
