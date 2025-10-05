"use client";

import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import WishlistButton from "@/components/WishlistButton";
import { useCart } from "@/context/CartContext";
import { getApiPath, getAssetPath } from "@/lib/utils";
import Reviews from "@/components/Reviews";

type BookDoc = {
  _id?: string;
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

export default function BookDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { add } = useCart();
  const [book, setBook] = useState<BookDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        // Search by ISBN or title, which should work for most cases
        const res = await fetch(
          getApiPath(`/api/books?q=${encodeURIComponent(slug)}&limit=1`)
        );
        const data = await res.json();

        if (data.ok && data.items && data.items.length > 0) {
          // Convert MongoDB _id to string for consistency
          const bookData = data.items[0];
          setBook({
            ...bookData,
            _id: bookData._id?.toString() || bookData.id,
            cover_url: bookData.cover || bookData.cover_url, // Map 'cover' to 'cover_url'
          });
        } else {
          setError("Book not found");
        }
      } catch (e) {
        setError("Failed to load book");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <img
          src={getAssetPath("/Figure-Gif-unscreen.gif")}
          alt="Loading"
          className="w-36 h-36 object-contain"
          aria-busy="true"
        />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Book Not Found</h1>
        <p className="text-white/80">
          {error || "The requested book could not be found."}
        </p>
      </div>
    );
  }

  const imageSrc =
    book.cover_url && book.cover_url.trim()
      ? book.cover_url
      : getAssetPath("/placeholder-cover.svg");

  const priceTHB = derivePriceTHB(book);
  const priceText = formatTHB(priceTHB);

  return (
    <div className="space-y-12">
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
              {book.quantity > 0
                ? `${book.quantity} available`
                : "Out of stock"}
            </span>
          </div>

          <div className="text-2xl font-semibold">{priceText}</div>

          <p className="text-white/80 whitespace-pre-wrap">
            {book.summary || "No description."}
          </p>

          <div className="rounded-2xl glass border border-line p-4 space-y-3">
            <button
              onClick={() => {
                add({
                  id: String(book._id),
                  title: book.title,
                  price: priceTHB,
                  qty: 1,
                  cover: imageSrc,
                });
                // Optional: Show a toast notification or feedback
                alert(`Added "${book.title}" to cart!`);
              }}
              className="btn-neon w-full"
              disabled={book.quantity <= 0}
            >
              {book.quantity > 0 ? "Add to cart" : "Out of Stock"}
            </button>

            {/* Wishlist Button */}
            <WishlistButton bookId={String(book._id)} className="w-full" />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <Reviews bookId={String(book._id)} />
      </div>
    </div>
  );
}
