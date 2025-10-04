"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type WishlistItem = {
  _id: string;
  bookId: string;
  addedAt: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover: string;
    isbn: string;
    genre: string;
    quantity: number;
  };
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const res = await fetch("/api/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("auth_token");
        router.push("/auth/login");
        return;
      }

      const data = await res.json();
      if (data.ok) {
        setWishlist(data.wishlist);
      } else {
        setError(data.error || "Failed to load wishlist");
      }
    } catch (e) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (bookId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const res = await fetch(`/api/wishlist/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.ok) {
        setWishlist((prev) => prev.filter((item) => item.bookId !== bookId));
      } else {
        alert(data.error || "Failed to remove from wishlist");
      }
    } catch (e) {
      alert("Network error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <img
              src="/Figure-Gif-unscreen.gif"
              alt="Loading"
              className="w-36 h-36 object-contain"
              aria-busy="true"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-white/80">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-white/80">
            {wishlist.length === 0
              ? "Your wishlist is empty"
              : `${wishlist.length} book${
                  wishlist.length !== 1 ? "s" : ""
                } in your wishlist`}
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-white/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No books in your wishlist
            </h3>
            <p className="text-white/60 mb-6">
              Start adding books you want to read later!
            </p>
            <Link
              href="/books_frontend"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item._id}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all"
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={item.book.cover || "/placeholder-cover.png"}
                    alt={item.book.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.bookId)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                    title="Remove from wishlist"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-2">
                    {item.book.title}
                  </h3>
                  <p className="text-sm text-white/60 mb-2">
                    {item.book.author}
                  </p>
                  <p className="text-xs text-white/40 mb-3">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      href={`/books_frontend/${item.book.isbn || item.book.id}`}
                      className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-center transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => {
                        // Add to cart logic here if you have a cart system
                        alert("Add to cart functionality would go here!");
                      }}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
                      title="Add to cart"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5 6m0 0h9m-9 0h9"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
