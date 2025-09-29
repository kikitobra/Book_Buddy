"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("Manga");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/books?limit=1000", { cache: "no-store" });
        const data = await res.json();
        if (!cancel && data.ok) setBooks(data.items || []);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

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
      <SectionHeader title="All English Manga" subtitle="Data from MongoDB" />
      <div className="max-w-xl">
        <PillTabs
          items={allTags.length ? allTags : ["Manga"]}
          value={cat}
          onChange={setCat}
        />
      </div>

      {loading ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : (
        <>
          <HScroll>
            {books.slice(0, 12).map((b) => (
              <MangaCard
                key={b.id}
                href={`/books_frontend/${b.isbn || b.id}`} // <-- detail link here
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
                href={`/books_frontend/${b.isbn || b.id}`} // <-- detail link here
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
