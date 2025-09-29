"use client";
import { useParams, notFound } from "next/navigation";
import { books } from "@/data/books";
import { useCart } from "@/context/CartContext";
import { currency } from "@/lib/utils";

export default function BookDetailPage() {
  const params = useParams<{ slug: string }>();
  const book = books.find(b => b.slug === params.slug);
  const { add, toggle } = useCart();
  if (!book) return notFound();

  const handleAdd = () => {
    add({ id: book.id, title: book.title, price: book.price, qty: 1, cover: book.cover });
    toggle();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="rounded-3xl overflow-hidden glass border border-line">
        <img src={book.cover} alt={book.title} className="w-full object-cover aspect-[3/4]" />
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold leading-tight">{book.title}</h1>
        <p className="text-white/70">by {book.author}</p>
        <div className="text-2xl font-semibold">{currency(book.price)}</div>
        <p className="text-white/80">{book.description}</p>
        <div className="flex gap-2">
          {book.tags.map(t => <span key={t} className="text-xs px-2 py-1 rounded-full bg-white/10 border border-line">{t}</span>)}
        </div>
        <div className="rounded-2xl glass border border-line p-4">
          <button onClick={handleAdd} className="btn-neon w-full">Add to cart</button>
        </div>
      </div>
    </div>
  );
}
