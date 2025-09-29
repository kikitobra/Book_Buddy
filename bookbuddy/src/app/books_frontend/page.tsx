// src/app/books_frontend/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import MangaCard from "@/components/MangaCard";
import PillTabs from "@/components/PillTabs";
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
  const q = (sp.get("q") || "").trim();            // 🔎 read q from URL

  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("Manga");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const url = q ? `/api/books?q=${encodeURIComponent(q)}&limit=1000`
                      : `/api/books?limit=1000`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (!cancel && data.ok) setBooks(data.items || []);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [q]); // 🔁 refetch when q changes

  const allTags = useMemo(
    () => Array.from(new Set(books.map((b) => b.genre || "Manga"))).sort(),
    [books]
  );

  const filtered = useMemo(
    () => books.filter((b) => (b.genre || "Manga") === cat),
    [books, cat]
  );

  return (
    <div className="space-y-8">
      <SectionHeader title="All English Manga" subtitle={q ? `Results for “${q}”` : "Data from MongoDB"} />

      <div className="max-w-xl">
        <PillTabs items={allTags.length ? allTags : ["Manga"]} value={cat} onChange={setCat} />
      </div>

      {loading ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : books.length === 0 ? (
        <p className="text-sm text-white/60">No results {q && <>for “{q}”</>}.</p>
      ) : (
        <>
          <HScroll>
            {books.slice(0, 12).map((b) => (
              <MangaCard
                key={b.id}
                href={`/books_frontend/${b.isbn || b.id}`}
                title={b.title}
                author={b.author}
                cover={b.cover}
                badge={b.quantity > 0 ? "IN STOCK" : undefined}
              />
            ))}
          </HScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {filtered.map((b) => (
              <MangaCard
                key={b.id}
                href={`/books_frontend/${b.isbn || b.id}`}
                title={b.title}
                author={b.author}
                cover={b.cover}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
