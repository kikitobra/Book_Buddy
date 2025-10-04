import { notFound } from "next/navigation";
import { getCollection } from "@/lib/mongodb";
import type { ObjectId, Filter } from "mongodb";
import { ObjectId as OID } from "mongodb";
import Image from "next/image";

type BookDoc = {
  _id?: ObjectId;
  title: string;
  isbn: string;
  author: string;
  summary: string;
  cover_url: string;
  language: string;
  genre?: string;
  quantity: number;
  text_language?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const dynamic = "force-dynamic";

// ---- helpers ----
function seededRandInt(min: number, max: number, seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  h = Math.abs(h);
  return min + (h % (max - min + 1));
}

function derivePriceTHB(book: Pick<BookDoc, "isbn" | "_id" | "summary">) {
  const seed = book.isbn || String(book._id ?? "");
  const base = seededRandInt(180, 420, seed);
  const contentFactor = Math.min(
    1.25,
    1 + (Math.min(2000, book.summary?.length ?? 0) / 2000) * 0.25
  );
  const raw = Math.round((base * contentFactor) / 10) * 10;
  return raw;
}

function formatTHB(amount: number) {
  try {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `฿${amount.toLocaleString("en-US")}`;
  }
}

async function findBook(slug: string) {
  const col = await getCollection<BookDoc>(
    process.env.COLLECTION_NAME || "book_inventory"
  );

  const byIsbn = await col.findOne({
    isbn: slug,
    language: "en",
  } as Filter<BookDoc>);
  if (byIsbn) return byIsbn;

  if (OID.isValid(slug)) {
    const byId = await col.findOne({ _id: new OID(slug) } as Filter<BookDoc>);
    if (byId) return byId;
  }
  return null;
}

export default async function BookDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await findBook(slug);
  if (!book) return notFound();

  const imageSrc =
    book.cover_url && book.cover_url.trim()
      ? book.cover_url
      : "/placeholder-cover.png";

  const priceTHB = derivePriceTHB(book);
  const priceText = formatTHB(priceTHB);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* ---------- BOOK IMAGE ---------- */}
      <div className="flex justify-center items-center bg-gray-900 rounded-3xl overflow-hidden glass border border-line">
        <Image
          src={imageSrc}
          alt={book.title}
          width={400}
          height={600}
          className="rounded-2xl object-contain transition-transform duration-300 hover:scale-[1.02]"
          priority
        />
      </div>

      {/* ---------- BOOK DETAILS ---------- */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold leading-tight">{book.title}</h1>
        <p className="text-white/70">by {book.author}</p>

        <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
          <span>ISBN: {book.isbn}</span>
          <span>•</span>
          <span>Genre: {book.genre ?? "Manga"}</span>
          <span>•</span>
          <span>
            Stock:{" "}
            {book.quantity > 0 ? `${book.quantity} available` : "Out of stock"}
          </span>
        </div>

        <div className="text-2xl font-semibold">{priceText}</div>

        <p className="text-white/80 whitespace-pre-wrap">
          {book.summary || "No description."}
        </p>

        <div className="rounded-2xl glass border border-line p-4">
          <form action="/cart" method="POST" className="space-y-2">
            <input type="hidden" name="id" value={String(book._id)} />
            <input type="hidden" name="title" value={book.title} />
            <input type="hidden" name="cover" value={book.cover_url} />
            <input type="hidden" name="priceTHB" value={priceTHB} />
            <button className="btn-neon w-full" type="submit">
              Add to cart
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
