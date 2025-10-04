"use client";

import HeroCyber from "@/components/HeroCyber";
import SectionHeader from "@/components/SectionHeader";
import HScroll from "@/components/HScroll";
import MangaCard from "@/components/MangaCard";
import SearchBooks from "@/components/SearchBooks";
import { useEffect, useMemo, useState } from "react";
import { getApiPath } from "@/lib/utils";

type BookItem = {
  id: string;
  title: string;
  author: string;
  cover: string;
  isbn: string;
  genre: string;
  quantity: number;
};

export default function HomePage() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("Manga");
  const [day, setDay] = useState("Mon");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(getApiPath("/api/books?limit=1000"), {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && data.ok) setBooks(data.items || []);
      } catch (e) {
        console.error("Failed to load books:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTags = useMemo(
    () => Array.from(new Set(books.map((b) => b.genre || "Manga"))).sort(),
    [books]
  );

  useEffect(() => {
    if (allTags.length && !allTags.includes(cat)) setCat(allTags[0]);
  }, [allTags, cat]);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const trending = useMemo(() => books.slice(0, 5), [books]);
  const popularByCat = useMemo(
    () => books.filter((b) => (b.genre || "Manga") === cat),
    [books, cat]
  );
  const daily = useMemo(() => books.slice().reverse(), [books, day]);

  return (
    <div className="space-y-12">
      <HeroCyber />

      <div className="max-w-2xl mx-auto w-full">
        <SearchBooks />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { t: "Fast Shipping", s: "2–4 days in TH" },
          { t: "Secure Payments", s: "Cards & wallets" },
          { t: "New Releases Weekly", s: "Fresh English manga" },
        ].map((x) => (
          <div key={x.t} className="glass border border-line rounded-2xl p-4">
            <p className="font-semibold">{x.t}</p>
            <p className="text-sm text-white/60">{x.s}</p>
          </div>
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
      ) : (
        <>
          {/* 🔥 Trending Horizontal Scroll */}
          <section>
            <SectionHeader
              title="Trending & Popular"
              subtitle="Top series this week"
            />
            <HScroll>
              {trending.map((b, i) => (
                <MangaCard
                  key={b.id}
                  href={`/books_frontend/${b.isbn || b.id}`}
                  title={b.title}
                  author={b.author}
                  cover={b.cover}
                  rank={i + 1}
                  bookId={b.id}
                />
              ))}
            </HScroll>
          </section>

          {/* ✅ Popular section (no category bar) */}
          <section id="popular" className="space-y-4">
            <SectionHeader title="Popular Picks" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {popularByCat.slice(0, 10).map((b) => (
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
          </section>

          {/* 🔥 Newly Released */}
          <section>
            <SectionHeader title="Newly Released" />
            <HScroll>
              {books.slice(0, 12).map((b) => (
                <MangaCard
                  key={b.id}
                  href={`/books_frontend/${b.isbn || b.id}`}
                  title={b.title}
                  author={b.author}
                  cover={b.cover}
                  badge="NEW"
                  bookId={b.id}
                />
              ))}
            </HScroll>
          </section>

          {/* 🔥 Daily Updates */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Daily"
                subtitle="Updates by day (demo layout)"
              />
              {/* still using PillTabs for weekdays */}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {daily.slice(0, 12).map((b) => (
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
          </section>
        </>
      )}
    </div>
  );
}
