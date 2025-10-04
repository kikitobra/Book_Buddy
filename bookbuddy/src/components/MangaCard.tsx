// src/components/MangaCard.tsx
import Link from "next/link";
import WishlistButton from "./WishlistButton";

type Props = {
  href: string;
  title: string;
  author?: string;
  cover?: string | null; // allow empty/null
  badge?: string;
  rank?: number;
  bookId?: string; // Add bookId for wishlist functionality
};

export default function MangaCard({
  href,
  title,
  author,
  cover,
  badge,
  rank,
  bookId,
}: Props) {
  // ✅ never pass empty string to <img src>
  const safeCover = cover && cover.trim() ? cover : "/placeholder-cover.svg";

  return (
    <div className="group w-52 shrink-0 rounded-2xl glass border border-line overflow-hidden">
      <Link href={href} className="block">
        <div className="relative aspect-[3/4]">
          <img
            src={safeCover}
            alt={title || "Book cover"}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {badge && (
            <span className="absolute left-2 top-2 text-[10px] px-2 py-1 rounded-full bg-neon.pink text-bg shadow-glow">
              {badge}
            </span>
          )}
          {rank != null && (
            <span className="absolute right-2 top-2 text-xs px-2 py-1 rounded-full bg-black/60">
              #{rank}
            </span>
          )}
        </div>

        <div className="p-3 space-y-1">
          <h3 className="line-clamp-2 font-semibold">{title}</h3>
          {author && (
            <p className="text-xs text-white/60 line-clamp-1">{author}</p>
          )}
        </div>
      </Link>

      {bookId && (
        <div className="px-3 pb-3">
          <WishlistButton bookId={bookId} className="w-full text-xs" />
        </div>
      )}
    </div>
  );
}
