"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import MangaCard from "@/components/MangaCard";
import SectionHeader from "@/components/SectionHeader";
import HScroll from "@/components/HScroll";

type BookItem = {
  id: string;
  title: string;
  author: string;
  cover: string;
  isbn: string;
  genre: string;
  quantity: number;
};

export default function BooksFrontendPage() {
  const sp = useSearchParams();
  const q = (sp.get("q") || "").trim(); // 🔎 read q from URL

  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("Manga");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const url = q
          ? `/api/books?q=${encodeURIComponent(q)}&limit=1000`
          : `/api/books?limit=1000`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (!cancel && data.ok) setBooks(data.items || []);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [q]); // 🔁 refetch when q changes

  // collect all unique genres
  const allTags = useMemo(
    () => Array.from(new Set(books.map((b) => b.genre || "Manga"))).sort(),
    [books]
  );

  // filter books by category
  const filtered = useMemo(
    () => books.filter((b) => (b.genre || "Manga") === cat),
    [books, cat]
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="All English Manga"
        subtitle={q ? `Results for “${q}”` : "Data from MongoDB"}
      />

      {/* ✅ Rectangular category buttons */}
      <div className="flex flex-wrap gap-3">
        {(allTags.length ? allTags : ["Manga"]).map((tag) => (
          <button
            key={tag}
            onClick={() => setCat(tag)}
            className={`px-4 py-2 border rounded-md text-sm transition 
              ${
                cat === tag
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
              }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <img
            src="/Figure-Gif-unscreen.gif"
            alt="Loading"
            className="w-36 h-36 object-contain"
            aria-busy="true"
          />
        </div>
      ) : books.length === 0 ? (
        <p className="text-sm text-white/60">
          No results {q && <>for “{q}”</>}.
        </p>
      ) : (
        <>
          {/* 🔥 Horizontal scroll section */}
          <HScroll>
            {books.slice(0, 12).map((b) => (
              <MangaCard
                key={b.id}
                href={`/books_frontend/${b.isbn || b.id}`}
                title={b.title}
                author={b.author}
                cover={b.cover}
                badge={b.quantity > 0 ? "IN STOCK" : undefined}
                bookId={b.id}
              />
            ))}
          </HScroll>

          {/* 🔥 Grid section */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {filtered.map((b) => (
              <MangaCard
                key={b.id}
                href={`/books_frontend/${b.isbn || b.id}`}
                title={b.title}
                author={b.author}
                cover={b.cover}
                bookId={b.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
