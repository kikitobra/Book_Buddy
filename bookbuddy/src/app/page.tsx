"use client";

import HeroCyber from "@/components/HeroCyber";
import SectionHeader from "@/components/SectionHeader";
import PillTabs from "@/components/PillTabs";
import HScroll from "@/components/HScroll";
import MangaCard from "@/components/MangaCard";
import { books } from "@/data/books";
import { useMemo, useState } from "react";

const allTags = Array.from(new Set(books.flatMap(b => b.tags))).sort();
const weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function HomePage() {
  const [cat, setCat] = useState(allTags[0] ?? "shonen");
  const [day, setDay] = useState("Mon");

  const trending = books.slice(0, 5);
  const popularByCat = useMemo(() => books.filter(b => b.tags.includes(cat)), [cat]);
  const daily = useMemo(() => books.slice().reverse(), [day]);

  return (
    <div className="space-y-12">
      <HeroCyber />

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { t:"Fast Shipping", s:"2–4 days in TH" },
          { t:"Secure Payments", s:"Cards & wallets" },
          { t:"New Releases Weekly", s:"Fresh English manga" },
        ].map((x) => (
          <div key={x.t} className="glass border border-line rounded-2xl p-4">
            <p className="font-semibold">{x.t}</p>
            <p className="text-sm text-white/60">{x.s}</p>
          </div>
        ))}
      </div>

      <section>
        <SectionHeader title="Trending & Popular" subtitle="Top series this week" />
        <HScroll>
          {trending.map((b, i) => (
            <MangaCard key={b.id} href={`/books/${b.slug}`} title={b.title} author={b.author} cover={b.cover} rank={i+1} />
          ))}
        </HScroll>
      </section>

      <section id="popular" className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Popular by Category" />
          <div className="hidden md:block w-1/2">
            <PillTabs items={allTags} value={cat} onChange={setCat} />
          </div>
        </div>
        <div className="md:hidden">
          <PillTabs items={allTags} value={cat} onChange={setCat} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {popularByCat.slice(0, 10).map((b) => (
            <MangaCard key={b.id} href={`/books/${b.slug}`} title={b.title} author={b.author} cover={b.cover} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Newly Released" />
        <HScroll>
          {books.slice(0, 12).map((b) => (
            <MangaCard key={b.id} href={`/books/${b.slug}`} title={b.title} author={b.author} cover={b.cover} badge="NEW" />
          ))}
        </HScroll>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeader title="Daily" subtitle="Updates by day (demo layout)" />
          <div className="hidden md:block">
            <PillTabs items={weekdays} value={day} onChange={setDay} />
          </div>
        </div>
        <div className="md:hidden">
          <PillTabs items={weekdays} value={day} onChange={setDay} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {daily.slice(0, 12).map((b) => (
            <MangaCard key={b.id} href={`/books/${b.slug}`} title={b.title} author={b.author} cover={b.cover} />
          ))}
        </div>
      </section>
    </div>
  );
}
