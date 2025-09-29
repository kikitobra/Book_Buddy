"use client";
import { useMemo, useState } from "react";
import { books } from "@/data/books";
import MangaCard from "@/components/MangaCard";

const allTags = Array.from(new Set(books.flatMap(b => b.tags))).sort();

export default function CatalogPage() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | "">("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return books.filter(b => {
      const okQ = !qq || [b.title, b.author, ...b.tags].join(" ").toLowerCase().includes(qq);
      const okTag = !tag || b.tags.includes(tag);
      return okQ && okTag;
    });
  }, [q, tag]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Catalog</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          className="flex-1 rounded-xl border border-line bg-panel text-white placeholder:text-white/40 px-3 py-2"
          placeholder="Search title, author, or tag…"
        />
        <select
          value={tag}
          onChange={e => setTag(e.target.value)}
          className="rounded-xl border border-line bg-panel text-white px-3 py-2 w-full sm:w-56">
          <option value="">All genres</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(b => (
          <MangaCard key={b.id} href={`/books/${b.slug}`} title={b.title} author={b.author} cover={b.cover} />
        ))}
      </div>
      {filtered.length === 0 && <p className="text-sm text-white/60">No results.</p>}
    </div>
  );
}
