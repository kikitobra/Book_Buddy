"use client";
import { useState } from "react";

type Props = {
  bookId: string;
  isInWishlist?: boolean;
  onWishlistChangeAction?: (inWishlist: boolean) => void;
  className?: string;
};

export default function WishlistButton({
  bookId,
  isInWishlist = false,
  onWishlistChangeAction,
  className = "",
}: Props) {
  const [inWishlist, setInWishlist] = useState(isInWishlist);
  const [loading, setLoading] = useState(false);

  const toggleWishlist = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("Please sign in to add items to your wishlist");
      return;
    }

    setLoading(true);
    try {
      if (inWishlist) {
        // Remove from wishlist
        const res = await fetch(`/api/wishlist/${bookId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.ok) {
          setInWishlist(false);
          onWishlistChangeAction?.(false);
        } else {
          alert(data.error || "Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookId }),
        });

        const data = await res.json();
        if (data.ok) {
          setInWishlist(true);
          onWishlistChangeAction?.(true);
        } else {
          alert(data.error || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      alert("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
        inWishlist
          ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
          : "bg-white/5 text-white/80 hover:bg-white/10 border border-white/20"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg
          className="w-4 h-4"
          fill={inWishlist ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      <span className="text-sm">{inWishlist ? "Remove" : "Wishlist"}</span>
    </button>
  );
}
