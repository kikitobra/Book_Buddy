"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBooks({ initialQ = "" }: { initialQ?: string }) {
  const [q, setQ] = useState(initialQ);
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/books_frontend?q=${encodeURIComponent(query)}` : `/books_frontend`);
  };

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search title, author, or tag…"
        className="w-full rounded-xl border border-line bg-panel text-white placeholder:text-white/40 px-3 py-2"
        aria-label="Search books"
      />
      <button
        type="submit"
        className="absolute right-1 top-1 rounded-lg border border-line px-3 py-1.5 text-sm text-white/80 hover:text-white"
      >
        Search
      </button>
    </form>
  );
}
