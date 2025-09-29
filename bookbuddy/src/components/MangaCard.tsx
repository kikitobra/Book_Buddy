import Link from "next/link";

export default function MangaCard({
  href, title, author, cover, badge, rank,
}: { href: string; title: string; author: string; cover: string; badge?: string; rank?: number; }) {
  return (
    <Link href={href} className="group w-52 shrink-0 rounded-2xl glass border border-line overflow-hidden">
      <div className="relative aspect-[3/4]">
        <img src={cover} alt={title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        {badge && (
          <span className="absolute left-2 top-2 text-[10px] px-2 py-1 rounded-full bg-neon.pink text-bg shadow-glow">{badge}</span>
        )}
        {typeof rank === "number" && (
          <span className="absolute -left-1 -top-1 text-5xl font-extrabold text-white/15">{rank}</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white line-clamp-2">{title}</h3>
        <p className="text-xs text-white/60 mt-1">{author}</p>
      </div>
    </Link>
  );
}
