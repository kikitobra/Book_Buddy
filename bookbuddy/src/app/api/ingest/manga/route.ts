import { NextRequest, NextResponse } from "next/server";
import { usersCollection, verifyPassword, setSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";

const MAX_RESULTS = 40; // Google limit
const PAGES = 25; // ~1,000 items
const LANG = "en";

function pickIsbns(ids: any[] = []) {
  let isbn10 = "",
    isbn13 = "";
  for (const x of ids) {
    const t = (x.type || "").toUpperCase();
    if (t === "ISBN_10" && !isbn10) isbn10 = x.identifier || "";
    if (t === "ISBN_13" && !isbn13) isbn13 = x.identifier || "";
  }
  return { isbn10, isbn13, isbn: isbn13 || isbn10 || "" };
}

function httpsify(url = "") {
  return url.replace(/^http:/, "https:");
}

function toDoc(v: any) {
  const title = (v.title || "").trim();
  const authors = v.authors || [];
  const summary = (v.description || "").trim();
  const { isbn10, isbn13, isbn } = pickIsbns(v.industryIdentifiers || []);
  const cover_url = v.imageLinks?.thumbnail
    ? httpsify(v.imageLinks.thumbnail)
    : "";
  return {
    book_name: title,
    isbn,
    isbn10,
    isbn13,
    summary,
    author: authors.join(", "),
    author_list: authors,
    cover_url,
    lang: LANG,
    source: "google_books",
    quantity: 0, // default
    created_at: new Date(),
    updated_at: new Date(),
  };
}

async function fetchPage(startIndex: number) {
  const params = new URLSearchParams({
    q: "subject:Manga",
    printType: "books",
    langRestrict: LANG,
    maxResults: String(MAX_RESULTS),
    startIndex: String(startIndex),
    fields:
      "totalItems,items(volumeInfo/title,volumeInfo/authors,volumeInfo/description,volumeInfo/industryIdentifiers,volumeInfo/imageLinks/thumbnail)",
  });
  const key = process.env.GOOGLE_BOOKS_KEY;
  if (key) params.set("key", key);
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Google Books HTTP ${res.status}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const users = await usersCollection();
  const user = await users.findOne({ email });

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 401 }
    );
  }

  // check password
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    await users.updateOne(
      { _id: user._id },
      { $inc: { failed_login_attempts: 1 }, $set: { updated_at: new Date() } }
    );
    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }
  // create server-side session cookie
  await setSession({ userId: String(user._id), email: user.email });

  const coll = await getCollection();

  // indexes once (ignore errors if they already exist)
  await coll
    .createIndex({ isbn13: 1 }, { unique: true, sparse: true })
    .catch(() => {});
  await coll.createIndex({ isbn10: 1 }, { sparse: true }).catch(() => {});
  await coll.createIndex({ book_name: 1, author: 1 }).catch(() => {});

  let seen = 0,
    upserts = 0;
  const pages = Array.from({ length: PAGES }, (_, i) => i * MAX_RESULTS);

  for (let i = 0; i < pages.length; i += 5) {
    const slice = pages.slice(i, i + 5);
    const results = await Promise.all(
      slice.map((idx) => fetchPage(idx).catch(() => ({ items: [] })))
    );

    for (const r of results) {
      for (const item of r.items || []) {
        seen++;
        const v = item.volumeInfo || {};
        const doc = toDoc(v);

        const filter = doc.isbn13
          ? { isbn13: doc.isbn13 }
          : doc.isbn10
          ? { isbn10: doc.isbn10 }
          : { book_name: doc.book_name, author: doc.author };

        const res = await coll.updateOne(
          filter,
          { $set: { ...doc, updated_at: new Date() } },
          { upsert: true }
        );
        if (res.upsertedId || res.modifiedCount > 0) upserts++;
      }
    }
  }

  // Reset all quantities to 0, then sample 20 to set to 5
  await coll.updateMany({}, { $set: { quantity: 0 } });
  const sample = await coll
    .aggregate([{ $sample: { size: 20 } }, { $project: { _id: 1 } }])
    .toArray();
  const ids = sample.map((d) => d._id);
  if (ids.length)
    await coll.updateMany({ _id: { $in: ids } }, { $set: { quantity: 5 } });

  return NextResponse.json({
    ok: true,
    seen,
    upserts,
    quantitySetTo5: ids.length,
  });
}
